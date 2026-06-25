import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Lock, Unlock, CheckCircle, Send, MessageCircle, AlertTriangle, UploadCloud, Handshake, CheckSquare, FileText, Paperclip, Loader2, LogOut, Search, Settings, MoreVertical, Smile, User } from 'lucide-react';
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
  const [replyingTo, setReplyingTo] = useState<{ _id: string, content: string, senderEmail: string } | null>(null);
  const [editingMessage, setEditingMessage] = useState<{ _id: string, content: string, createdAt: string } | null>(null);
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
      if (editingMessage) {
        // Handle Edit
        const res = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api'}/messages/${editingMessage._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: replyContent,
            senderEmail: email
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to edit');
        
        setEditingMessage(null);
      } else {
        // Handle Send / Reply
        const res = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api'}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId: activeConv._id,
            senderEmail: email,
            receiverEmail,
            content: replyContent,
            isPartnership: activeConv.status === 'partnership',
            replyTo: replyingTo ? replyingTo : undefined
          })
        });

        if (!res.ok) throw new Error('Failed to send');
        setReplyingTo(null);
      }

      setReplyContent('');
      fetchMessages(activeConv._id); // Refresh messages
    } catch (err: any) {
      alert(err.message);
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

  // Custom Colors
  const BLUE = "#1D75DD";
  const LIGHT_BLUE = "#D1E6FF";
  const PALE_BLUE = "#A5CEFF";
  const GRAY = "#555758";
  const MUTED = "#989BA1";
  const BG = "#D1E6FF";

  // Icons
  const IconSearch = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7.333" cy="7.333" r="5" stroke={MUTED} strokeLinecap="round" strokeLinejoin="round" />
      <path d="m14 14-2.867-2.867" stroke={MUTED} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  const IconGear = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2" stroke={MUTED} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.933 8a4.933 4.933 0 0 0-.047-.667l1.44-1.12-1.333-2.307-1.747.707A4.96 4.96 0 0 0 10.1 4.06L9.667 2h-2.4l-.433 2.06a4.96 4.96 0 0 0-1.147.554L4.007 3.906 2.674 6.213 4.113 7.333A4.96 4.96 0 0 0 4.067 8a4.96 4.96 0 0 0 .047.667L2.674 9.787l1.333 2.307 1.747-.707c.353.22.733.4 1.147.554L7.334 14h2.4l.433-2.06a4.96 4.96 0 0 0 1.147-.553l1.747.707 1.333-2.307-1.44-1.12c.033-.22.047-.44.047-.667Z" stroke={MUTED} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  const IconMoreVertical = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="5" r="1" stroke={MUTED} strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1" stroke={MUTED} strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="19" r="1" stroke={MUTED} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
  const IconPaperclip = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M13.8 7.367 8.06 13.107a3.667 3.667 0 0 1-5.18-5.18l5.74-5.74a2.444 2.444 0 0 1 3.453 3.453L6.327 11.38a1.222 1.222 0 0 1-1.727-1.727L9.867 4.38" stroke={MUTED} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  const IconSmile = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.667" stroke={MUTED} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.333 9.333s1 1.334 2.667 1.334c1.667 0 2.667-1.334 2.667-1.334" stroke={MUTED} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 6h.004M10 6h.005" stroke={MUTED} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  );
  const IconSend = () => (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M11.917 1.083 5.958 7.042M11.917 1.083 8.083 11.917l-2.125-4.875-4.875-2.125 10.834-3.834Z" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <div className="w-full min-h-screen p-5 md:p-8" style={{ background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-6xl mx-auto h-[85vh] min-h-[600px] flex gap-5">
        
        {/* Left Panel: Contacts List */}
        <div className="flex flex-col h-full bg-white rounded-[10px] w-[320px] shrink-0 overflow-hidden shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[16px] font-bold" style={{ color: GRAY }}>Inbox</span>
              <span className="bg-[#A5CEFF] text-[#1D75DD] text-[10px] font-bold px-3 py-[3px] rounded-full">
                {conversations.length} New
              </span>
            </div>
            <IconGear />
          </div>

          <div className="px-5 pb-3 shrink-0">
            <p className="text-[12px] text-gray-500 truncate">{email}</p>
          </div>

          {/* Search */}
          <div className="px-3 pb-3 shrink-0">
            <div className="flex items-center gap-2 bg-[#f5f5f5] rounded-full px-4 py-[10px]">
              <IconSearch />
              <input 
                type="text"
                placeholder="Search..." 
                className="bg-transparent border-none outline-none text-[14px] w-full"
                style={{ color: GRAY }}
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto space-y-0">
            {loading ? (
              <p className="text-center text-sm text-gray-500 mt-8">Loading...</p>
            ) : conversations.length === 0 ? (
              <p className="text-center text-sm text-gray-500 mt-8">No conversations yet.</p>
            ) : (
              conversations.map(conv => {
                const isActive = activeConv?._id === conv._id;
                const partnerEmail = conv.participants.find((p: string) => p !== email) || 'Unknown';
                
                // Deterministic color
                const seed = partnerEmail.charCodeAt(0) || 0;
                const colors = ['bg-amber-500', 'bg-green-500', 'bg-red-500', 'bg-purple-500', 'bg-indigo-500'];
                const avatarColor = colors[seed % colors.length];
                const initial = partnerEmail.charAt(0).toUpperCase();

                return (
                  <button
                    key={conv._id}
                    onClick={() => handleSelectConv(conv)}
                    className={`w-full text-left px-5 py-[15px] relative transition-colors border-b border-[#D1E6FF] last:border-b-0 ${isActive ? "" : "bg-white hover:bg-[#f0f7ff]"}`}
                    style={isActive ? { background: "linear-gradient(90deg, #1D75DD 0%, #085EC3 100%)" } : {}}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-[32px] h-[32px] rounded-full flex items-center justify-center shrink-0 text-white font-bold text-sm ${isActive ? 'bg-white/20' : avatarColor}`}>
                          {initial}
                        </div>
                        <div>
                          <div className="text-[14px] font-semibold leading-tight truncate w-[180px]" style={{ color: isActive ? "white" : GRAY }}>
                            {partnerEmail.split('@')[0]}
                          </div>
                          <div className="text-[11px] mt-1 truncate w-[180px]" style={{ color: isActive ? "rgba(255,255,255,0.75)" : MUTED }}>
                            {conv.gigTitle}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                        isActive ? 'bg-white/10 text-white border-white/20' : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}>
                        {conv.status}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
        
        {/* Main Chat Area */}
        <div className="flex flex-col flex-1 min-w-0 h-full gap-5">
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="bg-white rounded-[10px] px-8 py-6 flex items-center justify-between shrink-0 shadow-sm border border-[#D1E6FF]">
                <div className="flex items-center gap-4">
                  {(() => {
                    const partnerEmail = activeConv.participants.find((p: string) => p !== email) || 'Unknown';
                    const seed = partnerEmail.charCodeAt(0) || 0;
                    const colors = ['bg-amber-500', 'bg-green-500', 'bg-red-500', 'bg-purple-500', 'bg-indigo-500'];
                    const avatarColor = colors[seed % colors.length];
                    return (
                      <div className={`w-[40px] h-[40px] rounded-full flex items-center justify-center text-white font-bold text-lg ${avatarColor}`}>
                        {partnerEmail.charAt(0).toUpperCase()}
                      </div>
                    );
                  })()}
                  <div>
                    <div className="text-[18px] font-bold" style={{ color: GRAY }}>
                      {activeConv.gigTitle}
                    </div>
                    <div className="text-[13px]" style={{ color: MUTED }}>
                      Chat with {activeConv.participants.find((p: string) => p !== email)}
                    </div>
                  </div>
                </div>
                <button className="hover:opacity-70 transition-opacity">
                  <IconMoreVertical />
                </button>
              </div>

              {/* Status Banners (Using standard HTML/Tailwind) */}
              {activeConv.status === 'pending' && (
                <div className="bg-amber-50 p-4 text-sm text-amber-800 border border-amber-200 rounded-[10px] flex items-center gap-3">
                  <Lock className="w-5 h-5 text-amber-600 shrink-0" />
                  <span className="font-medium">{isEmployer ? 'Unlock to reply to this pitch.' : 'Waiting for employer to unlock.'}</span>
                </div>
              )}
              {activeConv.status === 'hired' && (
                <div className="bg-green-50 p-4 text-sm text-green-800 border border-green-200 rounded-[10px] flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                  <span className="font-semibold">Escrow Funded! Keep all communication here.</span>
                </div>
              )}
              {activeConv.status === 'completed' && (
                <div className="bg-indigo-50 p-4 text-sm text-indigo-800 border border-indigo-200 rounded-[10px] flex items-center gap-3">
                  <UploadCloud className="w-5 h-5 text-indigo-600 shrink-0" />
                  <span className="font-semibold">Job Delivered! Waiting for Employer to approve.</span>
                </div>
              )}
              {activeConv.status === 'approved' && (
                <div className="bg-teal-50 p-4 text-sm text-teal-800 border border-teal-200 rounded-[10px] flex items-center gap-3">
                  <Handshake className="w-5 h-5 text-teal-600 shrink-0" />
                  <span className="font-semibold">Job Approved! Funds released.</span>
                </div>
              )}
              {activeConv.status === 'disputed' && (
                <div className="bg-red-50 p-4 text-sm text-red-800 border border-red-200 rounded-[10px] flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                  <span className="font-semibold">Dispute Opened. Admin is reviewing.</span>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 bg-white rounded-[10px] overflow-y-auto p-8 flex flex-col gap-6 shadow-sm border border-[#D1E6FF]">
                <div className="flex items-center gap-4 w-full mb-4">
                  <div className="flex-1 h-px bg-[#989BA1] opacity-20 rounded" />
                  <span className="text-[10px] font-bold tracking-widest uppercase shrink-0" style={{ color: MUTED }}>Chat Started</span>
                  <div className="flex-1 h-px bg-[#989BA1] opacity-20 rounded" />
                </div>

                {messages.map((msg, i) => {
                  const isMe = msg.senderEmail === email;
                  const displayContent = (activeConv.status === 'partnership') ? msg.originalContent : msg.content;
                  
                  const senderEmail = msg.senderEmail;
                  const partnerEmail = activeConv.participants.find((p: string) => p !== email) || 'Unknown';
                  const seed = isMe ? email.charCodeAt(0) || 0 : partnerEmail.charCodeAt(0) || 0;
                  const colors = ['bg-amber-500', 'bg-green-500', 'bg-red-500', 'bg-purple-500', 'bg-indigo-500'];
                  const avatarColor = isMe ? 'bg-orange-600' : colors[seed % colors.length];

                  return (
                    <div key={i} className={`flex items-start gap-3 group ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                      <div className={`w-[32px] h-[32px] rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 mt-auto ${avatarColor}`}>
                        {senderEmail.charAt(0).toUpperCase()}
                      </div>
                      <div className={`flex flex-col gap-1 w-full max-w-[80%] ${isMe ? "items-end" : "items-start"}`}>
                        
                        {/* Hover Actions */}
                        <div className="flex gap-2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => setReplyingTo({ _id: msg._id, content: msg.content, senderEmail: msg.senderEmail })} 
                            className="text-[10px] text-[#1D75DD] hover:underline font-bold"
                          >
                            Reply
                          </button>
                          {isMe && (Date.now() - new Date(msg.createdAt).getTime() <= 5 * 60 * 1000) && (
                            <button 
                              onClick={() => { setEditingMessage({ _id: msg._id, content: msg.content, createdAt: msg.createdAt }); setReplyContent(msg.content); }} 
                              className="text-[10px] text-[#1D75DD] hover:underline font-bold"
                            >
                              Edit
                            </button>
                          )}
                        </div>

                        <div
                          className="rounded-[8px] px-5 py-4 text-[14px] leading-relaxed break-words"
                          style={{
                            color: GRAY,
                            background: isMe ? PALE_BLUE : "white",
                            border: isMe ? "none" : `1px solid ${BLUE}`,
                          }}
                        >
                          {/* Reply Quote Block */}
                          {msg.replyTo && (
                            <div className="mb-2 p-2 rounded bg-black/5 border-l-4 border-[#1D75DD] text-[12px] opacity-90">
                              <div className="font-bold mb-0.5 text-[#1D75DD]">{msg.replyTo.senderEmail.split('@')[0]}</div>
                              <div className="truncate text-gray-700">{msg.replyTo.content}</div>
                            </div>
                          )}

                          {(activeConv.status === 'partnership') ? (
                            <span>{displayContent}</span>
                          ) : (
                            displayContent.split(/(\[REDACTED.*?\])/).map((part: string, idx: number) => 
                              part.startsWith('[REDACTED') ? (
                                <span key={idx} className={`font-mono text-[11px] px-1.5 py-0.5 rounded mx-1 ${isMe ? 'bg-blue-800 text-blue-200' : 'bg-red-100 text-red-800 font-bold'}`}>
                                  {part}
                                </span>
                              ) : (
                                <span key={idx}>{part}</span>
                              )
                            )
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1 px-1">
                          <span className="text-[10px]" style={{ color: MUTED }}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {msg.isEdited && (
                            <span className="text-[9px] text-gray-400 italic">(edited)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="bg-white rounded-[10px] border border-[#DDD] px-4 py-4 flex flex-col gap-3 shrink-0 shadow-sm">
                {(replyingTo || editingMessage) && (
                  <div className="flex items-center justify-between bg-blue-50/50 p-2 rounded border border-blue-100">
                    <div className="flex flex-col gap-1 overflow-hidden">
                      <span className="text-[10px] font-bold text-[#1D75DD] uppercase tracking-wider">
                        {editingMessage ? 'Editing Message' : `Replying to ${replyingTo?.senderEmail.split('@')[0]}`}
                      </span>
                      <span className="text-[12px] text-gray-600 truncate max-w-sm">
                        {editingMessage ? editingMessage.content : replyingTo?.content}
                      </span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => { setReplyingTo(null); setEditingMessage(null); setReplyContent(''); }}
                      className="text-gray-400 hover:text-gray-700 font-bold px-2"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <form onSubmit={handleSendReply} className="flex items-center gap-3">
                  <textarea
                    value={replyContent} 
                    onChange={e => {
                      setReplyContent(e.target.value);
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
                    className="flex-1 text-[15px] outline-none bg-transparent resize-none overflow-y-auto"
                    placeholder="Write a message... (Shift+Enter for newline)"
                    rows={1}
                    style={{ color: GRAY, minHeight: '24px', maxHeight: '150px' }}
                  />
                  <div className="flex items-center gap-4 shrink-0">
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="hover:opacity-70 transition-opacity"
                    >
                      {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <IconPaperclip />}
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      className="hidden" 
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip,.ppt,.pptx"
                    />
                    <button type="button" className="hover:opacity-70 transition-opacity"><IconSmile /></button>
                    <button
                      type="submit"
                      disabled={!replyContent.trim() && !isUploading}
                      className="w-[35px] h-[35px] rounded-[5px] flex items-center justify-center transition-opacity hover:opacity-80 disabled:opacity-50"
                      style={{ background: BLUE }}
                    >
                      <IconSend />
                    </button>
                  </div>
                </form>
                {/(mpesa|pay me directly|07\d{8}|\+254\d{9}|send money|off-platform|off platform)/i.test(replyContent) && (
                  <div className="px-3 py-2 bg-red-50 text-red-700 text-[11px] font-bold rounded-lg flex items-center gap-2 border border-red-100">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    Warning: Off-platform payments violate our Terms of Service.
                  </div>
                )}
              </div>

              {/* Action Controls */}
              <div className="flex flex-wrap justify-end gap-3">
                {isEmployer && activeConv.status === 'pending' && (
                  <button onClick={handleUnlock} className="px-5 py-2.5 bg-blue-50 text-blue-700 rounded-[8px] hover:bg-blue-100 transition-colors font-semibold text-sm">
                    Unlock to Reply
                  </button>
                )}
                {isEmployer && activeConv.status === 'active' && (
                  <button onClick={handleHire} className="px-6 py-2.5 bg-green-600 text-white rounded-[8px] hover:bg-green-700 transition-colors font-semibold text-sm">
                    Fund Escrow & Hire
                  </button>
                )}
                {isEmployer && activeConv.status === 'completed' && (
                  <>
                    <button onClick={handleApprove} className="px-6 py-2.5 bg-teal-600 text-white rounded-[8px] hover:bg-teal-700 transition-colors font-semibold text-sm">
                      Approve & Release
                    </button>
                    <button onClick={handleDispute} className="px-5 py-2.5 border border-rose-300 text-rose-600 rounded-[8px] hover:bg-rose-50 transition-colors font-semibold text-sm">
                      Dispute
                    </button>
                  </>
                )}
                {isEmployer && activeConv.status === 'hired' && (
                  <button onClick={handleDispute} className="px-5 py-2.5 border border-rose-300 text-rose-600 rounded-[8px] hover:bg-rose-50 transition-colors font-semibold text-sm">
                    Dispute
                  </button>
                )}
                
                {/* Applicant Controls */}
                {!isEmployer && activeConv.status === 'hired' && (
                  <>
                    <button onClick={handleDeliver} className="px-6 py-2.5 bg-[#1D75DD] text-white rounded-[8px] hover:bg-blue-700 transition-colors font-semibold text-sm">
                      Deliver Job
                    </button>
                    <button onClick={handleDispute} className="px-5 py-2.5 border border-rose-300 text-rose-600 rounded-[8px] hover:bg-rose-50 transition-colors font-semibold text-sm">
                      Dispute
                    </button>
                  </>
                )}
                {!isEmployer && activeConv.status === 'completed' && (
                  <button onClick={handleDispute} className="px-5 py-2.5 border border-rose-300 text-rose-600 rounded-[8px] hover:bg-rose-50 transition-colors font-semibold text-sm">
                    Dispute Employer
                  </button>
                )}
              </div>

              {/* Dispute Form */}
              {showDisputeForm && (
                <div className="p-5 bg-red-50 rounded-[10px] border border-red-100 flex flex-col gap-3">
                  <p className="text-sm font-bold text-red-800">Open a Dispute</p>
                  <textarea 
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    placeholder="Explain what went wrong..."
                    className="w-full p-4 rounded-[8px] border border-red-200 outline-none text-sm h-24 resize-none bg-white"
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setShowDisputeForm(false)} className="px-5 py-2 text-sm font-bold text-red-700 hover:bg-red-100 rounded-[8px]">Cancel</button>
                    <button onClick={handleDispute} className="px-5 py-2 text-sm font-bold bg-red-600 hover:bg-red-700 text-white rounded-[8px]">Submit Dispute</button>
                  </div>
                </div>
              )}

            </>
          ) : (
            <div className="bg-white rounded-[10px] shadow-sm flex flex-col h-full overflow-hidden items-center justify-center border border-[#D1E6FF]">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <MessageCircle className="w-12 h-12 text-[#1D75DD]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Select a Conversation</h3>
              <p className="text-gray-500 text-center max-w-sm">Choose an active chat from the sidebar to continue.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
