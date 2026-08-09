import { useState, useEffect, useRef, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Send, Paperclip, Loader2, Mail } from 'lucide-react';
import { useAlert } from '@/contexts/AlertContext';

interface ChatDrawerProps {
  applicantEmail: string;
  posterEmail: string;
  gigId?: string; // used when initiating a new conversation
  onClose: () => void;
}

export function ChatDrawer({ applicantEmail, posterEmail, gigId, onClose }: ChatDrawerProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const { showAlert } = useAlert();

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('user_token');

  useEffect(() => {
    fetchConversations();
  }, [applicantEmail, posterEmail]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/messages/user/${posterEmail}`);
      const data = await res.json();
      if (res.ok && data.data) {
        // Find the conversation that includes the applicant
        const conv = data.data.find((c: any) => 
          c.participants?.includes(applicantEmail) && 
          (!gigId || c.gigId === gigId) // Optionally match gigId if provided
        );
        
        if (conv) {
          setActiveConv(conv);
          fetchMessages(conv._id);
        } else {
          setLoading(false);
        }
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const res = await fetch(`${API_BASE}/messages/${convId}`);
      const data = await res.json();
      if (res.ok) {
        setMessages(data.data || data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setSending(true);
    try {
      const payload = {
        conversationId: activeConv?._id,
        gigId: gigId || activeConv?.gigId,
        senderEmail: posterEmail,
        receiverEmail: applicantEmail,
        content: replyContent
      };

      const res = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send message');

      setReplyContent('');
      
      if (!activeConv) {
        // If it was the first message, it created a conversation. Fetch it.
        fetchConversations();
      } else {
        // Just refresh messages
        fetchMessages(activeConv._id);
      }
    } catch (err: any) {
      showAlert({ title: 'Error', message: err.message, type: 'error' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-3xl bg-slate-50 shadow-2xl h-full flex flex-col transform transition-transform duration-300 relative">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-slate-200 shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
              {applicantEmail?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 leading-tight">
                {applicantEmail?.split('@')[0]}
              </h2>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-2 text-blue-500" />
              <p>Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Mail className="w-12 h-12 mb-3 text-slate-300" />
              <p className="text-center font-medium">No messages yet.</p>
              <p className="text-sm text-center">Start the conversation by saying hello!</p>
            </div>
          ) : (
            messages.map((msg: any) => {
              const isMine = msg.senderEmail === posterEmail;
              const contentStr = msg.content || '';
              return (
                <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl p-3 ${isMine ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'}`}>
                    {contentStr.startsWith('[Attachment]:') ? (
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium">Attachment</span>
                        <a href={contentStr.replace('[Attachment]: ', '').trim()} target="_blank" rel="noopener noreferrer" className={`text-xs underline ${isMine ? 'text-blue-200' : 'text-blue-600'}`}>
                          View File
                        </a>
                      </div>
                    ) : (
                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{contentStr}</p>
                    )}
                    <div className={`text-[10px] mt-1 text-right ${isMine ? 'text-blue-200' : 'text-slate-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200 shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 shrink-0" onClick={() => alert('Attachments can be sent from the full Inbox page')}>
              <Paperclip className="w-5 h-5" />
            </Button>
            <Input 
              placeholder="Type a message..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="flex-1 rounded-full bg-slate-50 border-slate-200 focus-visible:ring-blue-500 h-11 px-4"
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={sending || !replyContent.trim()}
              className="rounded-full bg-blue-600 hover:bg-blue-700 h-11 w-11 shrink-0 shadow-sm"
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-1" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
