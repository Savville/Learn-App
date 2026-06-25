import express from 'express';
import { getDB } from '../config/database.js';
import { ObjectId } from 'mongodb';
import { sendNewMessageNotification } from '../services/emailService.js';
import { initiateSTKPush } from '../services/mpesaService.js';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

// Stage 3: The Radical Anti-Leakage Rule (The Auto-Censor)
const applyAutoCensor = (text) => {
  if (!text) return '';
  let censored = text;
  
  // 1. Censor Email Addresses
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  censored = censored.replace(emailRegex, '[REDACTED BY L-EARN]');
  
  // 2. Censor Phone Numbers (General matching for digits looking like phone numbers, particularly Kenyan ones)
  // Matches: 0712345678, +254712345678, 254712345678, etc.
  const phoneRegex = /\b(?:\+?254|0)[17]\d{8}\b/g;
  censored = censored.replace(phoneRegex, '[REDACTED BY L-EARN]');
  
  // 3. Censor 'WhatsApp' keyword to prevent them asking to move offline
  const whatsappRegex = /whatsapp/ig;
  censored = censored.replace(whatsappRegex, '[REDACTED BY L-EARN]');

  // 4. General link detection (outside links to prevent 'linktr.ee/mycontact' or personal portfolios)
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|(\b[a-zA-Z0-9-]+\.(com|org|net|io|co|me|ee|ke)\b(\/[^\s]*)?)/ig;
  censored = censored.replace(urlRegex, (match) => {
    if (/github\.com|linkedin\.com/i.test(match)) {
      return match;
    }
    return '[REDACTED LINK]';
  });

  return censored;
};

// GET /api/messages/upload-signature
// Generate a secure Cloudinary upload signature for direct frontend uploads
router.get('/upload-signature', async (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ error: 'Cloudinary is not configured on the server.' });
    }

    const signature = cloudinary.utils.api_sign_request(
      { timestamp: timestamp },
      process.env.CLOUDINARY_API_SECRET
    );
    
    res.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY
    });
  } catch (error) {
    console.error('Error generating signature:', error);
    res.status(500).json({ error: 'Failed to generate signature' });
  }
});

// GET /api/messages/:conversationId
// Get messages for a specific conversation
router.get('/:conversationId', async (req, res) => {
  try {
    const db = getDB();
    const { conversationId } = req.params;

    const messages = await db.collection('messages')
      .find({ conversationId: new ObjectId(conversationId) })
      .sort({ createdAt: 1 })
      .toArray();

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// GET /api/messages/user/:email
// Get all conversations for a specific user
router.get('/user/:email', async (req, res) => {
  try {
    const db = getDB();
    const { email } = req.params;

    const conversations = await db.collection('conversations')
      .find({ participants: email })
      .sort({ updatedAt: -1 })
      .toArray();

    // Fetch basic gig details to display in the inbox list
    const enrichedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const query = (typeof conv.gigId === 'string') 
          ? { id: conv.gigId } 
          : { _id: conv.gigId };
        
        const gig = await db.collection('opportunities').findOne(query);
        
        let status = conv.status;
        if (gig && (gig.category === 'Partnership' || gig.compensationType === 'Equity')) {
          status = 'partnership';
        }

        return {
          ...conv,
          status, // Override status dynamically for equity gigs
          gigTitle: gig ? gig.title : 'Unknown Gig',
          gigCategory: gig ? gig.category : 'Unknown',
          gigCompensationType: gig ? gig.compensationType : 'Unknown'
        };
      })
    );

    res.json(enrichedConversations);
  } catch (error) {
    console.error('Error fetching user conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// POST /api/messages
// Send a new message (The pitch or a reply)
router.post('/', async (req, res) => {
  try {
    const db = getDB();
    const { conversationId, gigId, senderEmail, receiverEmail, content, isPartnership, replyTo } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Look up the gig to double check its type
    const gigQuery = (typeof gigId === 'string' && gigId.length !== 24) ? { id: gigId } : { _id: new ObjectId(gigId) };
    const gig = await db.collection('opportunities').findOne(gigQuery);
    
    // Force partnership mode if gig is Partnership or Equity
    const isActuallyPartnership = isPartnership || (gig && (gig.category === 'Partnership' || gig.compensationType === 'Equity'));

    // Apply the auto-censor! (Skip censorship if it's a partnership)
    const censoredContent = isActuallyPartnership ? content : applyAutoCensor(content);

    let convId = conversationId ? new ObjectId(conversationId) : null;

    // If this is the FIRST message (the pitch), create the conversation
    if (!convId) {
      const newConversation = {
        gigId: gigId.length === 24 ? new ObjectId(gigId) : gigId,
        participants: [senderEmail, receiverEmail],
        createdAt: new Date(),
        updatedAt: new Date(),
        status: isActuallyPartnership ? 'partnership' : 'pending', // 'pending' = locked, 'active' = unlocked, 'hired' = escrow funded, 'partnership' = open collaboration
      };
      const convResult = await db.collection('conversations').insertOne(newConversation);
      convId = convResult.insertedId;
    }

    const newMessage = {
      conversationId: convId,
      senderEmail,
      receiverEmail,
      content: censoredContent,
      originalContent: content, // Keep the original just in case for admin review (optional)
      createdAt: new Date(),
      read: false,
      replyTo: replyTo || null
    };

    await db.collection('messages').insertOne(newMessage);
    
    // Update the conversation's updatedAt
    await db.collection('conversations').updateOne(
      { _id: convId },
      { $set: { updatedAt: new Date() } }
    );

    // Send an email via Resend to `receiverEmail`
    sendNewMessageNotification(receiverEmail).catch(err => {
      console.error('Failed to send new message email:', err);
    });

    res.status(201).json({ success: true, message: 'Message sent successfully', conversationId: convId });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// PUT /api/messages/:id
// Edit a message within 5 minutes
router.put('/:id', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { content, senderEmail } = req.body;

    const message = await db.collection('messages').findOne({ _id: new ObjectId(id) });
    if (!message) return res.status(404).json({ error: 'Message not found' });
    if (message.senderEmail !== senderEmail) return res.status(403).json({ error: 'Not authorized to edit' });

    // Check time window (5 minutes)
    if (Date.now() - new Date(message.createdAt).getTime() > 5 * 60 * 1000) {
      return res.status(403).json({ error: 'Time window to edit has expired. Messages can only be edited within 5 minutes.' });
    }

    const censoredContent = applyAutoCensor(content);

    await db.collection('messages').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          content: censoredContent,
          originalContent: content,
          isEdited: true,
          updatedAt: new Date()
        },
        $push: {
          editHistory: {
            content: message.originalContent || message.content,
            timestamp: new Date()
          }
        }
      }
    );

    res.json({ success: true, message: 'Message edited successfully' });
  } catch (error) {
    console.error('Error editing message:', error);
    res.status(500).json({ error: 'Failed to edit message' });
  }
});

// POST /api/messages/:conversationId/unlock
// Stage 4 prep: Employer unlocks the conversation to reply
router.post('/:conversationId/unlock', async (req, res) => {
  try {
    const db = getDB();
    const { conversationId } = req.params;

    await db.collection('conversations').updateOne(
      { _id: new ObjectId(conversationId) },
      { $set: { status: 'active', updatedAt: new Date() } }
    );

    res.json({ success: true, message: 'Conversation unlocked' });
  } catch (error) {
    console.error('Error unlocking conversation:', error);
    res.status(500).json({ error: 'Failed to unlock conversation' });
  }
});

// POST /api/messages/:conversationId/hire
// Stage 4: The "Hire" Checkpoint (Monetization & Release)
router.post('/:conversationId/hire', async (req, res) => {
  try {
    const db = getDB();
    const { conversationId } = req.params;
    const { employerPhone, amount = 1 } = req.body;
    
    // Integrate with MPesa to fund the escrow.
    if (employerPhone) {
      // Amount is hardcoded or received from body. For now, testing with passing an amount.
      const mpesaResult = await initiateSTKPush(
        employerPhone,
        amount, // KES amount
        `GIG-${conversationId}`, // Reference
        `Fund Escrow for Gig`
      );

      if (!mpesaResult.success) {
        return res.status(400).json({ error: mpesaResult.error || 'M-PESA STK Push Failed' });
      }
    }

    await db.collection('conversations').updateOne(
      { _id: new ObjectId(conversationId) },
      { $set: { status: 'hired', updatedAt: new Date() } }
    );

    res.json({ success: true, message: 'Gig funded and user hired! Chat uncensored.' });
  } catch (error) {
    console.error('Error hiring user:', error);
    res.status(500).json({ error: 'Failed to hire user' });
  }
});

// POST /api/messages/:conversationId/deliver
// Job Doer marks job as delivered
router.post('/:conversationId/deliver', async (req, res) => {
  try {
    const db = getDB();
    const { conversationId } = req.params;
    await db.collection('conversations').updateOne(
      { _id: new ObjectId(conversationId) },
      { $set: { status: 'completed', updatedAt: new Date() } }
    );
    res.json({ success: true, message: 'Job delivered. Waiting for employer approval.' });
  } catch (error) {
    console.error('Error delivering job:', error);
    res.status(500).json({ error: 'Failed to deliver job' });
  }
});

// POST /api/messages/:conversationId/approve
// Employer approves the delivery and releases funds
router.post('/:conversationId/approve', async (req, res) => {
  try {
    const db = getDB();
    const { conversationId } = req.params;
    await db.collection('conversations').updateOne(
      { _id: new ObjectId(conversationId) },
      { $set: { status: 'approved', updatedAt: new Date() } }
    );
    // TODO: In a real system, this triggers actual M-PESA B2C payout
    res.json({ success: true, message: 'Job approved! Funds have been released.' });
  } catch (error) {
    console.error('Error approving job:', error);
    res.status(500).json({ error: 'Failed to approve job' });
  }
});

// POST /api/messages/:conversationId/dispute
// Either party opens a dispute
router.post('/:conversationId/dispute', async (req, res) => {
  try {
    const db = getDB();
    const { conversationId } = req.params;
    const { reason, initiatorEmail } = req.body;
    
    await db.collection('conversations').updateOne(
      { _id: new ObjectId(conversationId) },
      { 
        $set: { 
          status: 'disputed', 
          disputeReason: reason,
          disputeInitiator: initiatorEmail,
          updatedAt: new Date() 
        } 
      }
    );
    res.json({ success: true, message: 'Dispute opened. Admin will review the case.' });
  } catch (error) {
    console.error('Error opening dispute:', error);
    res.status(500).json({ error: 'Failed to open dispute' });
  }
});

export default router;
