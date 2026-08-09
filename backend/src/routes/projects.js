import express from 'express';
import { getDB } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';
import OpenAI from 'openai';

const router = express.Router();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'sk-test',
    baseURL: process.env.OPENAI_BASE_URL || 'https://apihub.agnes-ai.com/v1'
});

// Middleware to extract user email from header (simulating auth token for this app's pattern)
const requireUser = (req, res, next) => {
    const email = req.headers['x-user-email'];
    if (!email) return res.status(401).json({ error: 'Unauthorized. Email required in x-user-email header.' });
    req.userEmail = email.trim().toLowerCase();
    next();
};

// ==========================================
// GET /api/public/projects
// Fetch all projects (for the global feed)
// ==========================================
router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const { status, category, tag } = req.query;

        let query = {};
        if (status) query.status = status;
        if (category) query.category = category;
        if (tag) query.tags = { $in: [tag] };

        const projects = await db.collection('projects')
            .find(query)
            .sort({ createdAt: -1 })
            .toArray();

        res.json(projects);
    } catch (error) {
        console.error('[PROJECTS] Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// ==========================================
// GET /api/public/projects/:id
// Fetch single project by ID
// ==========================================
router.get('/:id', async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;

        let query;
        if (id.length === 24) {
            query = { $or: [{ id: id }, { _id: new ObjectId(id) }] };
        } else {
            query = { id: id };
        }
        const project = await db.collection('projects').findOne(query);
        if (!project) return res.status(404).json({ error: 'Project not found' });

        res.json(project);
    } catch (error) {
        console.error('[PROJECTS] Error fetching project:', error);
        res.status(500).json({ error: 'Failed to fetch project' });
    }
});

// ==========================================
// POST /api/public/projects
// Create a new project (Authenticated)
// ==========================================
router.post('/', requireUser, async (req, res) => {
    try {
        const db = getDB();
        const userEmail = req.userEmail;
        
        const { 
            title, description, category, tags, startDate, endDate, 
            status, resourceLinks, images, institutionalEndorsement, projectProposalUrl, authorName, currentLevel, updates
        } = req.body;

        if (!title || !description) {
            return res.status(400).json({ error: 'Title and description are required' });
        }

        const newProject = {
            id: uuidv4(),
            userEmail,
            authorName: authorName || userEmail.split('@')[0],
            title,
            description,
            category: category || 'Other',
            tags: tags || [],
            startDate: startDate || null,
            endDate: endDate || null,
            status: status || 'Showcase', // Showcase, Active, Recruiting, Seeking Funding, Archived
            resourceLinks: resourceLinks || [],
            images: images || [],
            institutionalEndorsement: institutionalEndorsement || null,
            projectProposalUrl: projectProposalUrl || '',
            currentLevel: currentLevel || 'Ideation',
            updates: updates || [],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await db.collection('projects').insertOne(newProject);

        res.status(201).json({ message: 'Project created successfully', project: newProject });
    } catch (error) {
        console.error('[PROJECTS] Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

// ==========================================
// PUT /api/public/projects/:id
// Update a project (Authenticated)
// ==========================================
router.put('/:id', requireUser, async (req, res) => {
    try {
        const db = getDB();
        const userEmail = req.userEmail;
        const { id } = req.params;

        // Verify ownership
        const existing = await db.collection('projects').findOne({ id });
        if (!existing) return res.status(404).json({ error: 'Project not found' });
        if (existing.userEmail !== userEmail) return res.status(403).json({ error: 'Unauthorized to edit this project' });

        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };
        // Don't allow changing core identity
        delete updateData._id;
        delete updateData.id;
        delete updateData.userEmail;

        await db.collection('projects').updateOne({ id }, { $set: updateData });

        const updatedProject = await db.collection('projects').findOne({ id });
        res.json({ message: 'Project updated', project: updatedProject });
    } catch (error) {
        console.error('[PROJECTS] Error updating project:', error);
        res.status(500).json({ error: 'Failed to update project' });
    }
});

// ==========================================
// DELETE /api/public/projects/:id
// Delete a project (Authenticated)
// ==========================================
router.delete('/:id', requireUser, async (req, res) => {
    try {
        const db = getDB();
        const userEmail = req.userEmail;
        const { id } = req.params;

        const existing = await db.collection('projects').findOne({ id });
        if (!existing) return res.status(404).json({ error: 'Project not found' });
        if (existing.userEmail !== userEmail) return res.status(403).json({ error: 'Unauthorized to delete this project' });

        await db.collection('projects').deleteOne({ id });
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('[PROJECTS] Error deleting project:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

// ==========================================
// POST /api/public/projects/:id/updates
// Add a project update (Authenticated)
// ==========================================
router.post('/:id/updates', requireUser, async (req, res) => {
    try {
        const db = getDB();
        const userEmail = req.userEmail;
        const { id } = req.params;
        const { title, description } = req.body;

        if (!title || !description) {
            return res.status(400).json({ error: 'Update title and description are required' });
        }

        const existing = await db.collection('projects').findOne({ id });
        if (!existing) return res.status(404).json({ error: 'Project not found' });
        if (existing.userEmail !== userEmail) return res.status(403).json({ error: 'Unauthorized to add updates to this project' });

        const newUpdate = {
            id: uuidv4(),
            title,
            description,
            date: new Date().toISOString()
        };

        await db.collection('projects').updateOne(
            { id }, 
            { 
                $push: { updates: newUpdate },
                $set: { updatedAt: new Date() }
            }
        );

        res.json({ message: 'Project update added', update: newUpdate });
    } catch (error) {
        console.error('[PROJECTS] Error adding project update:', error);
        res.status(500).json({ error: 'Failed to add project update' });
    }
});

// ==========================================
// POST /api/public/projects/:id/ai-assistant
// AI Assistant for Project Updates (Authenticated)
// ==========================================
router.post('/:id/ai-assistant', requireUser, async (req, res) => {
    try {
        const db = getDB();
        const userEmail = req.userEmail;
        const { id } = req.params;
        const { messages, currentContent } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages array is required' });
        }

        const project = await db.collection('projects').findOne({
            $or: [
                { id: id },
                { _id: ObjectId.isValid(id) ? new ObjectId(id) : null }
            ]
        });
        if (!project) return res.status(404).json({ error: 'Project not found' });
        if (project.userEmail !== userEmail) return res.status(403).json({ error: 'Unauthorized to use AI assistant for this project' });

        const systemMessage = {
            role: 'system',
            content: `You are Agnes, an AI assistant helping a user write an update for their project on Learn Opportunities.
The project is titled "${project.title}" and is currently in the "${project.status}" status.
Project Description: ${project.description}

Your goal is to help the user draft, refine, or format their project update. 
You can generate Markdown formatting (Bold, Italic, Tables, Lists, Headings).
CRITICAL RULES:
1. NEVER use conversational filler (e.g., "Hello!", "Here is your draft:", "Sure, I can help").
2. ONLY output the raw, professional text meant for the editor.
3. Keep your responses highly relevant to this specific project.

If the user provides the current editor content, here it is:
---
${currentContent || '(Empty)'}
---
`
        };

        const response = await openai.chat.completions.create({
            model: 'agnes-2.0-flash', // Using Agnes AI model
            messages: [systemMessage, ...messages],
            temperature: 0.7,
        });

        res.json({ 
            message: response.choices[0]?.message?.content || 'I could not generate a response.' 
        });

    } catch (error) {
        console.error('[PROJECTS AI] Error in AI assistant:', error);
        res.status(500).json({ error: 'AI Assistant failed to respond.' });
    }
});

export default router;
