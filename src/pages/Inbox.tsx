import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Lock, Unlock, CheckCircle, Send, MessageCircle, AlertTriangle, UploadCloud, Handshake, CheckSquare, FileText, Paperclip, Loader2, LogOut } from 'lucide-react';
import { OTPLoginForm } from '../components/OTPLoginForm';

export function Inbox() {
  const [email, setEmail] = useState<string>(localStorage.getItem('user_email') || '');
  const [token, setToken] = useState<string | null>(localStorage.getItem('user_token'));
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async (userEmail: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api'}/messages/user/${userEmail}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch conversations');
      setConversations(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File is too large. Max 10MB allowed.");
      return;
    }

    setIsUploading(true);
    try {
      // 1. Get signature from backend
      const sigRes = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api'}/messages/upload-signature`);
      if (!sigRes.ok) throw new Error("Could not get upload signature.");
      const { signature, timestamp, cloudName, apiKey } = await sigRes.json();

      // 2. Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed.");
      const data = await uploadRes.json();

      // 3. Send message with the file URL
      const newContent = `[Attachment]: ${data.secure_url}`;
      const payload = {
        conversationId: activeConv._id,
        gigId: activeConv.gigId,
        senderEmail: email,
        receiverEmail: activeConv.participants.find((p: string) => p !== email) || '',
        content: newContent,
        isPartnership: activeConv.status === 'partnership'
      };

      const msgRes = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api'}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (msgRes.ok) {
        await fetchMessages(activeConv._id);
      }
    } catch (err: any) {
      alert("File upload error: " + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const res = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api'}/messages/${convId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token && email) {
      fetchConversations(email.trim().toLowerCase());
    }
  }, [token, email]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleLoginSuccess = (newToken: string, newEmail: string) => {
    setToken(newToken);
    setEmail(newEmail);
  };

  const handleLogout = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_email');
    setToken(null);
    setEmail('');
    setConversations([]);
    setActiveConv(null);
  };

  const handleSelectConv = (conv: any) => {
    setActiveConv(conv);
    fetchMessages(conv._id);
  };

  const handleSendReply = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeConv || !replyContent.trim()) return;

    const receiverEmail = activeConv.participants.find((p: string) => p !== email) || email;

    try {
      const res = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api'}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConv._id,
          senderEmail: email,
          receiverEmail,
          content: replyContent,
          isPartnership: activeConv.status === 'partnership'
        })
      });

      if (!res.ok) throw new Error('Failed to send');
      setReplyContent('');
      fetchMessages(activeConv._id); // Refresh messages
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnlock = async () => {
    if (!activeConv) return;
    try {
      await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api'}/messages/${activeConv._id}/unlock`, { method: 'POST' });
      activeConv.status = 'active';
      setActiveConv({ ...activeConv });
    } catch (err) {
      console.error(err);
    }
  };

  const handleHire = async () => {
    if (!activeConv) return;
    try {
      await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api'}/messages/${activeConv._id}/hire`, { method: 'POST' });
      activeConv.status = 'hired';
      setActiveConv({ ...activeConv });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeliver = async () => {
    if (!activeConv) return;
    try {
      await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api'}/messages/${activeConv._id}/deliver`, { method: 'POST' });
      activeConv.status = 'completed';
      setActiveConv({ ...activeConv });
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async () => {
    if (!activeConv) return;
    try {
      await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api'}/messages/${activeConv._id}/approve`, { method: 'POST' });
      activeConv.status = 'approved';
      setActiveConv({ ...activeConv });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDispute = async () => {
    if (!activeConv) return;
    if (!showDisputeForm) {
      setShowDisputeForm(true);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      return;
    }
    
    if (!disputeReason.trim()) {
      alert("Please provide a reason for the dispute.");
      return;
    }
    
    try {
      await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api'}/messages/${activeConv._id}/dispute`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: disputeReason, initiatorEmail: email })
      });
      activeConv.status = 'disputed';
      setShowDisputeForm(false);
      setDisputeReason('');
      setActiveConv({ ...activeConv });
    } catch (err) {
      console.error(err);
    }
  };

  if (!token) {
    return (
      <OTPLoginForm 
        onSuccess={handleLoginSuccess} 
        title="Inbox Login" 
        subtitle="Enter your email to receive an access code and view your conversations."
      />
    );
  }

  const isEmployer = activeConv && activeConv.participants[1] === email;

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 min-h-[600px]">
        
        {/* Conversations List */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-50 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Your Conversations</h2>
            <p className="text-sm text-gray-500 truncate">{email}</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <p className="text-center text-sm text-gray-500 mt-8">Loading...</p>
            ) : conversations.length === 0 ? (
              <p className="text-center text-sm text-gray-500 mt-8">No conversations yet.</p>
            ) : (
              conversations.map(conv => (
                <button
                  key={conv._id}
                  onClick={() => handleSelectConv(conv)}
                  className={`w-full text-left p-5 rounded-2xl mb-3 transition-all ${
                    activeConv?._id === conv._id 
                      ? 'bg-blue-50/50 shadow-sm border-transparent' 
                      : 'hover:bg-gray-50 border border-gray-100/50'
                  }`}
                >
                  <p className="font-bold text-gray-900 text-base truncate mb-1">{conv.gigTitle}</p>
                  <p className="text-sm text-gray-500 truncate mb-3">
                    With: <span className="text-gray-700">{conv.participants.find((p: string) => p !== email)}</span>
                  </p>
                  <div className="flex items-center gap-1">
                    {conv.status === 'pending' && <span className="px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100">Locked</span>}
                    {conv.status === 'active' && <span className="px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">Active</span>}
                    {conv.status === 'hired' && <span className="px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider bg-green-50 text-green-700 border border-green-100">Hired</span>}
                    {conv.status === 'partnership' && <span className="px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-100">Open</span>}
                    {conv.status === 'completed' && <span className="px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">Review</span>}
                    {conv.status === 'approved' && <span className="px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-100">Closed</span>}
                    {conv.status === 'disputed' && <span className="px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider bg-red-50 text-red-700 border border-red-100">Dispute</span>}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden">
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="p-6 border-b border-gray-50 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{activeConv.gigTitle}</h3>
                  <p className="text-sm text-gray-500">Chat with <span className="text-gray-700 font-medium">{activeConv.participants.find((p: string) => p !== email)}</span></p>
                </div>
              </div>

              {/* Status Banner */}
              {activeConv.status === 'pending' && (
                <div className="bg-amber-50/50 p-4 text-sm text-amber-800 border-b border-amber-100/50 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="font-medium text-center sm:text-left">{isEmployer ? 'Unlock to reply to this pitch.' : 'Waiting for employer to unlock.'}</span>
                </div>
              )}
              {activeConv.status === 'hired' && (
                <div className="bg-green-50/50 p-4 text-sm text-green-800 border-b border-green-100/50 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="font-semibold text-center sm:text-left">
                    Escrow Funded! The job is now officially active. For your security and to guarantee arbitration, keep all communication and files on this platform. Sharing external contact details or moving offline violates our terms and voids your Escrow protection. GitHub and LinkedIn links are allowed.
                  </span>
                </div>
              )}
              {activeConv.status === 'partnership' && (
                <div className="bg-purple-50/50 p-4 text-sm text-purple-800 border-b border-purple-100/50 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="font-semibold text-center sm:text-left">Partnership Collaboration: Chat is fully unlocked and unredacted. Escrow is not required.</span>
                </div>
              )}

              {activeConv.status === 'completed' && (
                <div className="bg-indigo-50/50 p-4 text-sm text-indigo-800 border-b border-indigo-100/50 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <UploadCloud className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="font-semibold text-center sm:text-left">Job Delivered! Waiting for Employer to approve and release funds.</span>
                </div>
              )}
              {activeConv.status === 'approved' && (
                <div className="bg-teal-50/50 p-4 text-sm text-teal-800 border-b border-teal-100/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <Handshake className="w-4 h-4 text-teal-600" />
                    </div>
                    <span className="font-semibold text-center sm:text-left">Job Approved! Funds released. This project is now closed.</span>
                  </div>
                  <button 
                    onClick={() => {
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        printWindow.document.write(`
                          <html>
                            <head>
                              <title>Receipt - Learn Opportunities</title>
                              <style>
                                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #111827; }
                                .header { display: flex; justify-content: space-between; border-bottom: 2px solid #E5E7EB; padding-bottom: 20px; margin-bottom: 30px; }
                                .logo { font-size: 24px; font-weight: 900; color: #2563EB; }
                                .title { font-size: 20px; font-weight: bold; color: #374151; text-transform: uppercase; }
                                .details { display: flex; justify-content: space-between; margin-bottom: 40px; }
                                .col { display: flex; flex-direction: column; gap: 8px; }
                                .label { font-size: 12px; color: #6B7280; text-transform: uppercase; font-weight: bold; }
                                .value { font-size: 16px; font-weight: 500; }
                                .table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                                .table th { text-align: left; padding: 12px; border-bottom: 2px solid #E5E7EB; color: #6B7280; font-size: 12px; text-transform: uppercase; }
                                .table td { padding: 16px 12px; border-bottom: 1px solid #E5E7EB; }
                                .total { text-align: right; font-size: 20px; font-weight: bold; margin-top: 20px; color: #059669; }
                                .footer { text-align: center; color: #6B7280; font-size: 14px; margin-top: 60px; border-top: 1px solid #E5E7EB; padding-top: 20px; }
                              </style>
                            </head>
                            <body>
                              <div class="header">
                                <div class="logo">Learn Opportunities</div>
                                <div class="title">Official Receipt</div>
                              </div>
                              <div class="details">
                                <div class="col">
                                  <span class="label">Date</span>
                                  <span class="value">${new Date().toLocaleDateString()}</span>
                                </div>
                                <div class="col">
                                  <span class="label">Reference ID</span>
                                  <span class="value">ESC-${activeConv._id.substring(0,8).toUpperCase()}</span>
                                </div>
                                <div class="col">
                                  <span class="label">Status</span>
                                  <span class="value" style="color: #059669; font-weight: bold;">PAID (ESCROW CLEARED)</span>
                                </div>
                              </div>
                              <table class="table">
                                <thead>
                                  <tr>
                                    <th>Description</th>
                                    <th>Applicant Name</th>
                                    <th>Amount</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td>Contract Payment for ${activeConv.opportunityTitle || 'Job/Gig'}</td>
                                    <td>${activeConv.applicantName || 'Freelancer'}</td>
                                    <td>KES 10,000</td>
                                  </tr>
                                </tbody>
                              </table>
                              <div class="total">Total Paid: KES 10,000</div>
                              <div class="footer">Thank you for using Learn Opportunities Secure Escrow. This is a computer-generated receipt.</div>
                              <script>window.print();</script>
                            </body>
                          </html>
                        `);
                        printWindow.document.close();
                      }
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-teal-200 text-teal-700 rounded-lg hover:bg-teal-50 font-bold text-sm shadow-sm transition-colors mt-3 sm:mt-0"
                  >
                    <FileText className="w-4 h-4" /> Download Receipt
                  </button>
                </div>
              )}
              {activeConv.status === 'disputed' && (
                <div className="bg-red-50/50 p-4 text-sm text-red-800 border-b border-red-100/50 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  </div>
                  <span className="font-semibold text-center sm:text-left">Dispute Opened. An admin is reviewing the chat history to arbitrate.</span>
                </div>
              )}

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
                {messages.map((msg, i) => {
                  const isMe = msg.senderEmail === email;
                  const displayContent = (activeConv.status === 'partnership') ? msg.originalContent : msg.content;
                  
                  return (
                    <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`px-4 py-3 rounded-2xl max-w-[80%] whitespace-pre-wrap break-words ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'}`}>
                        {/* Render content. If it's uncensored, show original. Else style redacted parts differently. */}
                        {(activeConv.status === 'partnership') ? (
                          <span>{displayContent}</span>
                        ) : (
                          displayContent.split(/(\[REDACTED.*?\])/).map((part: string, idx: number) => 
                            part.startsWith('[REDACTED') ? (
                              <span key={idx} className={`font-mono text-xs px-1.5 py-0.5 rounded mx-1 ${isMe ? 'bg-blue-800 text-blue-200' : 'bg-red-100 text-red-800 font-bold'}`}>
                                {part}
                              </span>
                            ) : (
                              <span key={idx}>{part}</span>
                            )
                          )
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1 mx-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Reply Box */}
              <div className="p-6 bg-white border-t border-gray-50 flex flex-col gap-3">
                {(activeConv.status === 'approved' || activeConv.status === 'disputed') ? (
                  <p className="text-sm text-center text-gray-500 italic py-2">Conversation is closed.</p>
                ) : activeConv.status === 'pending' && !isEmployer ? (
                  <p className="text-sm text-center text-gray-500 italic py-2">Waiting for the employer to unlock this conversation before you can reply.</p>
                ) : (
                  <form onSubmit={handleSendReply} className="flex flex-col gap-2">
                    <div className="flex gap-3 items-end">
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="rounded-full w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 shrink-0 transition-colors"
                      >
                        {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        className="hidden" 
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
                      />
                      <textarea 
                        value={replyContent} 
                        onChange={e => {
                          setReplyContent(e.target.value);
                          // Auto-adjust height logic
                          e.target.style.height = 'auto';
                          e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
                        }} 
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            if (replyContent.trim()) {
                              handleSendReply(e as any);
                            }
                          }
                        }}
                        placeholder="Type a message... (Shift+Enter for new line)" 
                        className="flex-1 px-5 py-3 rounded-2xl border border-gray-200 outline-none focus:border-blue-500 bg-gray-50/50 transition-colors resize-none overflow-y-auto"
                        rows={1}
                        style={{ minHeight: '48px', maxHeight: '150px' }}
                      />
                      <button type="submit" disabled={!replyContent.trim()} className="rounded-full w-12 h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-700 hover:shadow-md transition-all text-white shrink-0 disabled:opacity-50 disabled:cursor-not-allowed">
                        <Send className="w-5 h-5 ml-1" />
                      </button>
                    </div>
                    {/(mpesa|pay me directly|07\d{8}|\+254\d{9}|send money|off-platform|off platform)/i.test(replyContent) && (
                      <div className="px-3 py-2 bg-red-50 text-red-700 text-[11px] font-bold rounded-lg flex items-center gap-2 animate-in slide-in-from-top-1">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        Warning: Asking for off-platform payments or sharing M-PESA numbers violates our Terms of Service. You will lose Escrow protection and risk an account ban.
                      </div>
                    )}
                  </form>
                 )}

                
                {/* Action Controls Moved to Bottom */}
                <div className="flex flex-wrap justify-center gap-3 mt-4 border-t border-gray-100 pt-4">
                  {isEmployer && activeConv.status === 'pending' && (
                    <button onClick={handleUnlock} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors font-semibold text-sm w-full sm:w-auto">
                      <Unlock className="w-4 h-4" /> Unlock to Reply
                    </button>
                  )}
                  {isEmployer && activeConv.status === 'active' && (
                    <button onClick={handleHire} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold text-sm animate-pulse w-full sm:w-auto">
                      <CheckCircle className="w-4 h-4" /> Fund Escrow & Hire
                    </button>
                  )}
                  {isEmployer && activeConv.status === 'completed' && (
                    <>
                      <button onClick={handleApprove} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold text-sm w-full sm:w-auto">
                        <Handshake className="w-4 h-4" /> Approve & Release
                      </button>
                      <button onClick={handleDispute} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-rose-300 text-rose-600 rounded-xl hover:bg-rose-50 hover:border-rose-400 transition-colors font-bold text-sm w-full sm:w-auto shadow-sm">
                        <AlertTriangle className="w-4 h-4" /> Dispute
                      </button>
                    </>
                  )}
                  {isEmployer && activeConv.status === 'hired' && (
                    <button onClick={handleDispute} className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-rose-300 text-rose-600 rounded-xl hover:bg-rose-50 hover:border-rose-400 transition-colors font-bold text-sm w-full sm:w-auto shadow-sm">
                      <AlertTriangle className="w-4 h-4" /> Dispute
                    </button>
                  )}
                  
                  {/* Applicant Controls */}
                  {!isEmployer && activeConv.status === 'hired' && (
                    <>
                      <button onClick={handleDeliver} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 hover:shadow-lg transition-all font-semibold text-sm w-full sm:w-auto">
                        <CheckSquare className="w-4 h-4" /> Deliver Job
                      </button>
                      <button onClick={handleDispute} className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-rose-300 text-rose-600 rounded-xl hover:bg-rose-50 hover:border-rose-400 transition-colors font-bold text-sm w-full sm:w-auto shadow-sm">
                        <AlertTriangle className="w-4 h-4" /> Dispute
                      </button>
                    </>
                  )}
                  {!isEmployer && activeConv.status === 'completed' && (
                    <button onClick={handleDispute} className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-rose-300 text-rose-600 rounded-xl hover:bg-rose-50 hover:border-rose-400 transition-colors font-bold text-sm w-full sm:w-auto shadow-sm">
                      <AlertTriangle className="w-4 h-4" /> Dispute Employer
                    </button>
                  )}
                </div>

                {/* Sliding Dispute Form */}
                {showDisputeForm && (
                  <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-300">
                    <p className="text-sm font-bold text-red-800">Open a Dispute</p>
                    <p className="text-xs text-red-600">Please provide a clear reason for the dispute. An admin will review the chat history.</p>
                    <textarea 
                      value={disputeReason}
                      onChange={(e) => setDisputeReason(e.target.value)}
                      placeholder="Explain what went wrong..."
                      className="w-full p-3 rounded-lg border border-red-200 outline-none focus:border-red-500 text-sm h-24 resize-none bg-white"
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setShowDisputeForm(false)} className="px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 rounded-lg">Cancel</button>
                      <button onClick={handleDispute} className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm">Submit Dispute</button>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <MessageCircle className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No conversation selected</h3>
              <p className="text-gray-500 text-center max-w-sm">Select a conversation from the list to view messages or continue a negotiation.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
