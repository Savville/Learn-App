import { useState, useEffect, type FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Lock, Unlock, CheckCircle, Send, MessageCircle, AlertTriangle, UploadCloud, Handshake, CheckSquare } from 'lucide-react';

export function Inbox() {
  const [email, setEmail] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setLoggedIn(true);
      fetchConversations(email.trim());
    }
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
    const reason = prompt("Please provide a reason for the dispute. An admin will review the chat history.");
    if (!reason) return;
    try {
      await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api'}/messages/${activeConv._id}/dispute`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, initiatorEmail: email })
      });
      activeConv.status = 'disputed';
      setActiveConv({ ...activeConv });
    } catch (err) {
      console.error(err);
    }
  };

  if (!loggedIn) {
    return (
      <div className="py-16 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Inbox Login</h2>
          <p className="text-gray-600 mb-8 text-sm leading-relaxed">Enter your email to view your conversations and pitches.</p>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="your.email@example.com" 
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <button type="submit" className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold">
              Access Inbox
            </button>
          </form>
        </div>
      </div>
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
                {/* Controls */}
                <div className="flex flex-wrap gap-2">
                  {isEmployer && activeConv.status === 'pending' && (
                    <button onClick={handleUnlock} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors font-semibold text-sm">
                      <Unlock className="w-4 h-4" /> Unlock to Reply
                    </button>
                  )}
                  {isEmployer && activeConv.status === 'active' && (
                    <button onClick={handleHire} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold text-sm animate-pulse">
                      <CheckCircle className="w-4 h-4" /> Fund Escrow & Hire
                    </button>
                  )}
                  {isEmployer && activeConv.status === 'completed' && (
                    <>
                      <button onClick={handleApprove} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold text-sm">
                        <Handshake className="w-4 h-4" /> Approve & Release
                      </button>
                      <button onClick={handleDispute} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-colors font-semibold text-sm">
                        <AlertTriangle className="w-4 h-4" /> Dispute
                      </button>
                    </>
                  )}
                  {isEmployer && activeConv.status === 'hired' && (
                    <button onClick={handleDispute} className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-colors font-semibold text-sm">
                      <AlertTriangle className="w-4 h-4" /> Dispute
                    </button>
                  )}
                  
                  {/* Applicant Controls */}
                  {!isEmployer && activeConv.status === 'hired' && (
                    <>
                      <button onClick={handleDeliver} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 hover:shadow-lg transition-all font-semibold text-sm">
                        <CheckSquare className="w-4 h-4" /> Deliver Job
                      </button>
                      <button onClick={handleDispute} className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-colors font-semibold text-sm">
                        <AlertTriangle className="w-4 h-4" /> Dispute
                      </button>
                    </>
                  )}
                  {!isEmployer && activeConv.status === 'completed' && (
                    <button onClick={handleDispute} className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-colors font-semibold text-sm">
                      <AlertTriangle className="w-4 h-4" /> Dispute Employer
                    </button>
                  )}
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
                  <span className="font-semibold text-center sm:text-left">Escrow Funded! The job is now officially active. Communication remains strictly on-platform for your protection.</span>
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
                <div className="bg-teal-50/50 p-4 text-sm text-teal-800 border-b border-teal-100/50 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                    <Handshake className="w-4 h-4 text-teal-600" />
                  </div>
                  <span className="font-semibold text-center sm:text-left">Job Approved! Funds released. This project is now closed.</span>
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
                  <form onSubmit={handleSendReply} className="flex gap-3">
                    <input 
                      type="text"
                      value={replyContent} 
                      onChange={e => setReplyContent(e.target.value)} 
                      placeholder="Type a message..." 
                      className="flex-1 px-5 py-3 rounded-full border border-gray-200 outline-none focus:border-blue-500 bg-gray-50/50 transition-colors"
                    />
                    <button type="submit" disabled={!replyContent.trim()} className="rounded-full w-12 h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-700 hover:shadow-md transition-all text-white shrink-0 disabled:opacity-50 disabled:cursor-not-allowed">
                      <Send className="w-5 h-5 ml-1" />
                    </button>
                  </form>
                 )}
                {activeConv.status !== 'partnership' && (
                  <div className="mt-2 text-center p-2 bg-red-50 border border-red-100 rounded-lg">
                    <p className="text-xs text-red-600 font-bold mb-1">⚠️ Safety & Payment Protection</p>
                    <p className="text-[10px] text-red-500 font-medium leading-tight">
                      For your security and to guarantee arbitration, keep all communication and files on this platform. Sharing external contact details or moving offline violates our terms and voids your Escrow protection. GitHub and LinkedIn links are allowed.
                    </p>
                  </div>
                )}
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
