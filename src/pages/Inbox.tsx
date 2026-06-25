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
    <div className="min-h-screen bg-[#E3F2FD] p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Chat</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[85vh] min-h-[600px]">
          
          {/* Sidebar */}
          <div className="md:col-span-4 flex flex-col h-full bg-transparent">
            {/* Inbox Header */}
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-3">
                <h2 className="text-gray-600 font-semibold text-lg">Inbox</h2>
                <span className="bg-blue-200 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-full">
                  {conversations.length} New
                </span>
              </div>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
            
            {/* Search */}
            <div className="relative mb-6">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-11 pr-4 py-3 rounded-full bg-white border-none shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0B5CFF] text-sm"
              />
            </div>
            
            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {loading ? (
                <p className="text-center text-sm text-gray-500 mt-8">Loading...</p>
              ) : conversations.length === 0 ? (
                <p className="text-center text-sm text-gray-500 mt-8">No conversations yet.</p>
              ) : (
                conversations.map(conv => {
                  const isActive = activeConv?._id === conv._id;
                  const partnerEmail = conv.participants.find((p: string) => p !== email) || 'Unknown';
                  
                  // Generate deterministic color/initials
                  const seed = partnerEmail.charCodeAt(0) || 0;
                  const colors = ['bg-amber-500', 'bg-green-500', 'bg-red-500', 'bg-purple-500', 'bg-indigo-500'];
                  const avatarColor = colors[seed % colors.length];
                  const initial = partnerEmail.charAt(0).toUpperCase();

                  return (
                    <button
                      key={conv._id}
                      onClick={() => handleSelectConv(conv)}
                      className={`w-full text-left p-4 rounded-2xl transition-all flex items-center gap-4 ${
                        isActive 
                          ? 'bg-[#0B5CFF] text-white shadow-md' 
                          : 'bg-white hover:bg-gray-50 shadow-sm border border-transparent'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-lg ${isActive ? 'bg-white/20' : avatarColor}`}>
                        {initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <p className={`font-bold text-base truncate ${isActive ? 'text-white' : 'text-gray-900'}`}>
                            {partnerEmail.split('@')[0]}
                          </p>
                          <span className={`text-[10px] font-semibold ${isActive ? 'text-blue-100' : 'text-gray-400'}`}>
                            5m
                          </span>
                        </div>
                        <p className={`text-xs font-medium truncate ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                          {conv.gigTitle}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
          
          {/* Main Chat Area */}
          <div className="md:col-span-8 h-full">
            {activeConv ? (
              <div className="bg-white rounded-[2rem] shadow-sm flex flex-col h-full overflow-hidden border border-gray-100">
                
                {/* Chat Header */}
                <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-4">
                    {(() => {
                      const partnerEmail = activeConv.participants.find((p: string) => p !== email) || 'Unknown';
                      const seed = partnerEmail.charCodeAt(0) || 0;
                      const colors = ['bg-amber-500', 'bg-green-500', 'bg-red-500', 'bg-purple-500', 'bg-indigo-500'];
                      const avatarColor = colors[seed % colors.length];
                      return (
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${avatarColor}`}>
                          {partnerEmail.charAt(0).toUpperCase()}
                        </div>
                      );
                    })()}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 leading-tight">
                        {activeConv.participants.find((p: string) => p !== email)?.split('@')[0]}
                      </h3>
                      <p className="text-sm text-gray-500">{activeConv.gigTitle}</p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <MoreVertical className="w-6 h-6" />
                  </button>
                </div>

                {/* Status Banners (Original Logic Retained) */}
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
                      Escrow Funded! Keep all communication here.
                    </span>
                  </div>
                )}
                {activeConv.status === 'completed' && (
                  <div className="bg-indigo-50/50 p-4 text-sm text-indigo-800 border-b border-indigo-100/50 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <UploadCloud className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="font-semibold text-center sm:text-left">Job Delivered! Waiting for Employer to approve.</span>
                  </div>
                )}
                {activeConv.status === 'approved' && (
                  <div className="bg-teal-50/50 p-4 text-sm text-teal-800 border-b border-teal-100/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                        <Handshake className="w-4 h-4 text-teal-600" />
                      </div>
                      <span className="font-semibold text-center sm:text-left">Job Approved! Funds released.</span>
                    </div>
                  </div>
                )}
                {activeConv.status === 'disputed' && (
                  <div className="bg-red-50/50 p-4 text-sm text-red-800 border-b border-red-100/50 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="font-semibold text-center sm:text-left">Dispute Opened. Admin is reviewing.</span>
                  </div>
                )}
                
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-white scroll-smooth">
                  <div className="flex items-center justify-center mb-8">
                    <div className="h-[1px] bg-gray-100 flex-1"></div>
                    <span className="text-[10px] text-gray-400 mx-4 font-bold uppercase tracking-widest">Today</span>
                    <div className="h-[1px] bg-gray-100 flex-1"></div>
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
                      <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} gap-4 w-full`}>
                        {/* Received Avatar */}
                        {!isMe && (
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 mt-auto ${avatarColor}`}>
                            {senderEmail.charAt(0).toUpperCase()}
                          </div>
                        )}
                        
                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                          <div className={`px-6 py-4 rounded-2xl whitespace-pre-wrap break-words text-[15px] leading-relaxed ${
                            isMe 
                              ? 'bg-[#E3F2FD] text-[#0A2540] border border-blue-100' 
                              : 'bg-white border border-[#E5E7EB] text-gray-800 shadow-sm'
                          }`}>
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
                          <span className="text-[10px] text-gray-400 mt-2 font-medium px-1">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* Sent Avatar */}
                        {isMe && (
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 mt-auto ${avatarColor}`}>
                            {email.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
                
                {/* Input Area */}
                <div className="px-8 py-6 bg-white">
                  {(activeConv.status === 'approved' || activeConv.status === 'disputed') ? (
                    <p className="text-sm text-center text-gray-500 italic py-4 bg-gray-50 rounded-xl border border-gray-100">Conversation is closed.</p>
                  ) : activeConv.status === 'pending' && !isEmployer ? (
                    <p className="text-sm text-center text-gray-500 italic py-4 bg-gray-50 rounded-xl border border-gray-100">Waiting for the employer to unlock this conversation before you can reply.</p>
                  ) : (
                    <form onSubmit={handleSendReply} className="flex flex-col gap-3 relative">
                      {/* The textarea itself */}
                      <div className="relative border border-gray-200 rounded-[1.5rem] overflow-hidden focus-within:border-[#0B5CFF] focus-within:ring-2 focus-within:ring-blue-100 transition-all bg-white flex items-end shadow-sm">
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
                          placeholder="Write a message..." 
                          className="flex-1 px-6 py-4 outline-none resize-none overflow-y-auto text-[15px] text-gray-800 bg-transparent"
                          rows={1}
                          style={{ minHeight: '56px', maxHeight: '150px' }}
                        />
                        
                        {/* Icons Container inside input */}
                        <div className="flex items-center gap-2 pr-2 pb-2 pl-2">
                          <button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="text-gray-400 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-100"
                          >
                            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
                          </button>
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileUpload} 
                            className="hidden" 
                            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip,.ppt,.pptx"
                          />
                          
                          <button type="button" className="text-gray-400 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-100">
                            <Smile className="w-5 h-5" />
                          </button>
                          
                          <button type="submit" disabled={!replyContent.trim() && !isUploading} className="bg-[#0B5CFF] text-white p-2.5 rounded-full hover:bg-blue-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center shrink-0 ml-1">
                            <Send className="w-5 h-5 ml-0.5" />
                          </button>
                        </div>
                      </div>
                      
                      {/(mpesa|pay me directly|07\d{8}|\+254\d{9}|send money|off-platform|off platform)/i.test(replyContent) && (
                        <div className="px-3 py-2 bg-red-50 text-red-700 text-[11px] font-bold rounded-lg flex items-center gap-2 animate-in slide-in-from-top-1 border border-red-100">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          Warning: Off-platform payments violate our Terms of Service and void Escrow protection.
                        </div>
                      )}
                    </form>
                  )}

                  {/* Action Controls Moved Below Input */}
                  <div className="flex flex-wrap justify-center gap-3 mt-4">
                    {isEmployer && activeConv.status === 'pending' && (
                      <button onClick={handleUnlock} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors font-semibold text-sm w-full sm:w-auto shadow-sm">
                        <Unlock className="w-4 h-4" /> Unlock to Reply
                      </button>
                    )}
                    {isEmployer && activeConv.status === 'active' && (
                      <button onClick={handleHire} className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold text-sm animate-pulse w-full sm:w-auto">
                        <CheckCircle className="w-5 h-5" /> Fund Escrow & Hire
                      </button>
                    )}
                    {isEmployer && activeConv.status === 'completed' && (
                      <>
                        <button onClick={handleApprove} className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold text-sm w-full sm:w-auto">
                          <Handshake className="w-5 h-5" /> Approve & Release
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
                        <button onClick={handleDeliver} className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0B5CFF] text-white rounded-xl hover:bg-blue-700 hover:shadow-lg transition-all font-bold text-sm w-full sm:w-auto">
                          <CheckSquare className="w-5 h-5" /> Deliver Job
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
                    <div className="mt-4 p-5 bg-red-50 rounded-2xl border border-red-100 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-300 shadow-inner">
                      <p className="text-sm font-bold text-red-800">Open a Dispute</p>
                      <p className="text-xs text-red-600">Please provide a clear reason for the dispute. An admin will review the chat history.</p>
                      <textarea 
                        value={disputeReason}
                        onChange={(e) => setDisputeReason(e.target.value)}
                        placeholder="Explain what went wrong..."
                        className="w-full p-4 rounded-xl border border-red-200 outline-none focus:border-red-500 text-sm h-24 resize-none bg-white shadow-sm"
                      />
                      <div className="flex gap-2 justify-end mt-2">
                        <button onClick={() => setShowDisputeForm(false)} className="px-5 py-2.5 text-sm font-bold text-red-700 hover:bg-red-100 rounded-xl transition-colors">Cancel</button>
                        <button onClick={handleDispute} className="px-5 py-2.5 text-sm font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition-colors">Submit Dispute</button>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            ) : (
              <div className="bg-white rounded-[2rem] shadow-sm flex flex-col h-full overflow-hidden border border-gray-100 items-center justify-center">
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <MessageCircle className="w-12 h-12 text-[#0B5CFF]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Select a Conversation</h3>
                <p className="text-gray-500 text-center max-w-sm">Choose an active chat from the sidebar to continue your negotiation or collaboration.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
