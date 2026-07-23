import { useState, useEffect, useRef, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Lock, Unlock, CheckCircle, Send, MessageCircle, AlertTriangle, UploadCloud, Handshake, CheckSquare, FileText, Paperclip, Loader2, LogOut, Search, Settings, MoreVertical, Smile, User, Github, Linkedin, Globe, ArrowLeft } from 'lucide-react';
import { OTPLoginForm } from '../components/OTPLoginForm';
import { useAlert } from '../contexts/AlertContext';

export function Inbox() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const [activeTab, setActiveTab] = useState<'chats' | 'notifications'>(
    (queryParams.get('tab') as 'chats' | 'notifications') || 'chats'
  );

  const [email, setEmail] = useState<string>(localStorage.getItem('user_email') || '');
  const [token, setToken] = useState<string | null>(localStorage.getItem('user_token'));
  const [conversations, setConversations] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportModal, setReportModal] = useState<{ isOpen: boolean; type: 'report' | 'dispute'; reason: string; details: string }>({
    isOpen: false,
    type: 'report',
    reason: 'Scam/Fraud',
    details: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, message: any } | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ _id: string, content: string, senderEmail: string } | null>(null);
  const [editingMessage, setEditingMessage] = useState<{ _id: string, content: string, createdAt: string } | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<any | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [showPortfolioPane, setShowPortfolioPane] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const cachedSenderName = useRef<string>('');
  const { showAlert } = useAlert();
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = (e: React.TouchEvent, msg: any) => {
    const touch = e.touches[0];
    longPressTimer.current = setTimeout(() => {
      setContextMenu({ x: touch.clientX, y: touch.clientY, message: msg });
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

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

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api'}/public/me/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markNotificationAsRead = async (id: string, link?: string) => {
    if (!token) return;
    try {
      await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api'}/public/me/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      if (link) {
        window.location.href = link;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showAlert({ title: 'File Too Large', message: 'File is too large. Max 10MB allowed.', type: 'warning' });
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

      // Resolve sender name from portfolio (fallback to email prefix)
      try {
        const profileRes = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api'}/portfolio/${email}`);
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          const name = profileData.profile?.name || email.split('@')[0];
          cachedSenderName.current = name;
          (payload as any).senderName = name;
        }
      } catch (_) { /* best-effort */ }

      // Ensure payload has senderName
      const messagePayload: Record<string, any> = payload;
      if (!messagePayload.senderName && cachedSenderName.current) {
        messagePayload.senderName = cachedSenderName.current;
      }

      const msgRes = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api'}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messagePayload)
      });
      if (msgRes.ok) {
        await fetchMessages(activeConv._id);
      }
    } catch (err: any) {
      showAlert({ title: 'Upload Failed', message: "File upload error: " + err.message, type: 'error' });
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
      fetchNotifications();
    }
  }, [token, email]);

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get('tab');
    if (tab === 'notifications' || tab === 'chats') {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    if (activeConv) {
      const partnerEmail = activeConv.participants.find((p: string) => p !== email);
      if (partnerEmail) {
        setLoadingProfile(true);
        fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api'}/portfolio/${partnerEmail}`)
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setPartnerProfile(data);
            }
          })
          .catch(err => console.error(err))
          .finally(() => setLoadingProfile(false));
      }
    } else {
      setPartnerProfile(null);
    }
  }, [activeConv, email]);

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
        // Use cached sender name or derive from email
        const senderName = cachedSenderName.current || email.split('@')[0];

        const res = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api'}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId: activeConv._id,
            senderEmail: email,
            senderName,
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
      showAlert({ title: 'Error', message: err.message, type: 'error' });
      console.error(err);
    }
  };

  const handleDeleteMessage = async () => {
    if (!activeConv || !messageToDelete) return;
    try {
      const res = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api'}/messages/${messageToDelete}`, {
        method: 'DELETE',
        headers: {
          'x-user-email': email
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete message');

      // Update local state immediately for better UX
      setMessages(messages.filter(m => m._id !== messageToDelete));
      setMessageToDelete(null);
    } catch (err: any) {
      showAlert({ title: 'Delete Failed', message: err.message, type: 'error' });
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

  const handleDisputeSubmit = async () => {
    if (!activeConv) return;

    if (!reportModal.details.trim()) {
      showAlert({ title: 'Missing Information', message: 'Please provide details for the dispute.', type: 'warning' });
      return;
    }

    try {
      await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api'}/messages/${activeConv._id}/dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reportModal.details, initiatorEmail: email })
      });
      activeConv.status = 'disputed';
      setReportModal(prev => ({ ...prev, isOpen: false }));
      setActiveConv({ ...activeConv });
      showAlert({ title: 'Dispute Opened', message: 'Your dispute has been sent to administration.', type: 'success' });
    } catch (err) {
      console.error(err);
      showAlert({ title: 'Error', message: 'Failed to open dispute.', type: 'error' });
    }
  };

  const handleReportSubmit = async () => {
    if (!activeConv) return;

    if (!reportModal.details.trim()) {
      showAlert({ title: 'Missing Information', message: 'Please provide details for the report.', type: 'warning' });
      return;
    }

    try {
      const res = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api'}/messages/${activeConv._id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: reportModal.reason,
          details: reportModal.details,
          reporterEmail: email
        })
      });

      if (!res.ok) throw new Error('Failed to submit report');

      setReportModal(prev => ({ ...prev, isOpen: false }));
      showAlert({ title: 'User Reported', message: 'This user has been reported to administration.', type: 'success' });
    } catch (err) {
      console.error(err);
      showAlert({ title: 'Error', message: 'Failed to report user.', type: 'error' });
    }
  };

  const handleMute = async () => {
    if (!activeConv) return;
    try {
      await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api'}/messages/${activeConv._id}/mute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      showAlert({ title: 'Muted', message: 'Notifications muted for this conversation.', type: 'info' });
      setShowChatMenu(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleModalSubmit = () => {
    if (reportModal.type === 'dispute') {
      handleDisputeSubmit();
    } else {
      handleReportSubmit();
    }
  };

  const handleDispute = () => {
    if (!activeConv) return;
    setReportModal({ isOpen: true, type: 'dispute', reason: 'Non-delivery of work', details: '' });
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
  const BLUE = "#131ADF";
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
    <div className="w-full min-h-screen p-4 md:p-8 relative" style={{ background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }} onClick={() => setContextMenu(null)}>
      {contextMenu && createPortal(
        <div
          className="fixed z-50 bg-[#131ADF] text-white rounded-lg shadow-2xl border border-blue-400 py-1.5 min-w-[140px] overflow-hidden"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-blue-600 transition-colors"
            onClick={() => { setReplyingTo({ _id: contextMenu.message._id, content: contextMenu.message.content, senderEmail: contextMenu.message.senderEmail }); setContextMenu(null); }}
          >
            Reply
          </button>
          <button
            className="w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-blue-600 transition-colors"
            onClick={() => { navigator.clipboard.writeText(contextMenu.message.content); setContextMenu(null); }}
          >
            Copy Text
          </button>
          {contextMenu.message.senderEmail?.toLowerCase() === email?.toLowerCase() && (
            <>
              {Date.now() - new Date(contextMenu.message.createdAt).getTime() <= 5 * 60 * 1000 && (
                <button
                  className="w-full text-left px-4 py-2.5 text-sm font-bold text-blue-200 hover:bg-blue-600 hover:text-white transition-colors"
                  onClick={() => {
                    setEditingMessage({ _id: contextMenu.message._id, content: contextMenu.message.content, createdAt: contextMenu.message.createdAt });
                    setReplyContent(contextMenu.message.content);
                    setContextMenu(null);
                  }}
                >
                  Edit Message
                </button>
              )}
              <button
                className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-300 hover:bg-red-600 hover:text-white transition-colors"
                onClick={() => {
                  setMessageToDelete(contextMenu.message._id);
                  setContextMenu(null);
                }}
              >
                Delete Message
              </button>
            </>
          )}
        </div>,
        document.body
      )}

      <div className="max-w-6xl mx-auto h-[85vh] min-h-[600px] flex gap-5 md:gap-8">

        {/* Left Panel: Contacts List */}
        <div className={`flex-col h-full bg-white rounded-xl w-full md:w-80 shrink-0 overflow-hidden shadow-sm ${activeConv ? 'hidden md:flex' : 'flex'}`}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
            <div className="flex bg-gray-100 p-1 rounded-lg w-full relative">
              <button
                onClick={() => setActiveTab('chats')}
                className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${activeTab === 'chats' ? 'bg-white text-[#131ADF] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Chats
                {conversations.length > 0 && <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">{conversations.length}</span>}
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${activeTab === 'notifications' ? 'bg-white text-[#131ADF] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Alerts
                {notifications.filter(n => !n.isRead).length > 0 && <span className="ml-2 text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">{notifications.filter(n => !n.isRead).length}</span>}
              </button>
            </div>
          </div>

          <div className="px-5 pb-3 shrink-0 flex justify-between items-center">
            <p className="text-xs text-gray-500 truncate text-left">{email}</p>
            <IconGear />
          </div>

          {/* Search */}
          {activeTab === 'chats' && (
            <div className="px-3 pb-3 shrink-0">
              <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                <IconSearch />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent border-none outline-none text-sm w-full"
                  style={{ color: GRAY }}
                />
              </div>
            </div>
          )}

          {/* List */}
          <div className="flex-1 overflow-y-auto space-y-0">
            {activeTab === 'notifications' ? (
              notifications.length === 0 ? (
                <p className="text-center text-sm text-gray-500 mt-8">No notifications yet.</p>
              ) : (
                notifications.map(notif => (
                  <button
                    key={notif._id}
                    onClick={() => markNotificationAsRead(notif._id, notif.link)}
                    className={`w-full text-left px-5 py-4 border-b border-[#D1E6FF] last:border-b-0 hover:bg-[#f0f7ff] transition-colors ${notif.isRead ? 'opacity-70' : 'bg-blue-50/30'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 w-2 h-2 rounded-full shrink-0 bg-blue-600" style={{ opacity: notif.isRead ? 0 : 1 }} />
                      <div>
                        <h4 className={`text-sm font-semibold mb-1 ${notif.isRead ? 'text-gray-700' : 'text-gray-900'}`}>{notif.title}</h4>
                        <p className="text-xs text-gray-600 line-clamp-2">{notif.message}</p>
                        <span className="text-[10px] text-gray-400 mt-2 block">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              )
            ) : (
              loading ? (
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
                      className={`w-full text-left px-5 py-4 relative transition-colors border-b border-[#D1E6FF] last:border-b-0 ${isActive ? "" : "bg-white hover:bg-[#f0f7ff]"}`}
                      style={isActive ? { background: "linear-gradient(90deg, #131ADF 0%, #085EC3 100%)" } : {}}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-sm ${isActive ? 'bg-white/20' : avatarColor}`}>
                            {initial}
                          </div>
                          <div className="flex flex-col text-left">
                            <div className="text-sm font-semibold leading-tight truncate w-40 md:w-48" style={{ color: isActive ? "white" : GRAY }}>
                              {partnerEmail.split('@')[0]}
                            </div>
                            <div className="text-xs mt-1 truncate w-40 md:w-48" style={{ color: isActive ? "rgba(255,255,255,0.75)" : MUTED }}>
                              {conv.gigTitle}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-left">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${isActive ? 'bg-white/10 text-white border-white/20' : 'bg-gray-50 text-gray-600 border-gray-200'
                          }`}>
                          {conv.status}
                        </span>
                      </div>
                    </button>
                  );
                })
              )
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className={`flex-col flex-1 min-w-0 h-full gap-5 ${!activeConv ? 'hidden md:flex' : 'flex'}`}>
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="bg-white rounded-xl px-4 md:px-8 py-4 md:py-5 flex items-center justify-between shrink-0 shadow-sm border border-[#D1E6FF]">
                <div className="flex items-center gap-3 md:gap-4">
                  <button
                    onClick={() => setActiveConv(null)}
                    className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  {(() => {
                    const partnerEmail = activeConv.participants.find((p: string) => p !== email) || 'Unknown';
                    const seed = partnerEmail.charCodeAt(0) || 0;
                    const colors = ['bg-amber-500', 'bg-green-500', 'bg-red-500', 'bg-purple-500', 'bg-indigo-500'];
                    const avatarColor = colors[seed % colors.length];
                    return (
                      <button
                        onClick={() => setShowPortfolioPane(!showPortfolioPane)}
                        onContextMenu={(e) => { e.preventDefault(); setShowPortfolioPane(!showPortfolioPane); }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg cursor-pointer hover:scale-105 transition-transform shadow-sm ${avatarColor}`}
                        title="View Portfolio"
                      >
                        {partnerEmail.charAt(0).toUpperCase()}
                      </button>
                    );
                  })()}
                  <div className="text-left">
                    <div className="text-lg font-bold" style={{ color: GRAY }}>
                      {activeConv.gigTitle}
                    </div>
                    <div className="text-sm" style={{ color: MUTED }}>
                      {activeConv.participants.find((p: string) => p !== email)?.split('@')[0]}
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowChatMenu(!showChatMenu)}
                    className="hover:bg-slate-100 p-2 rounded-full transition-colors"
                  >
                    <IconMoreVertical />
                  </button>
                  {showChatMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowChatMenu(false)} />
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 py-2 animate-in fade-in zoom-in duration-100">
                        <button
                          onClick={() => { setShowPortfolioPane(true); setShowChatMenu(false); }}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-semibold"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={handleMute}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-semibold"
                        >
                          Mute Notifications
                        </button>
                        <button
                          onClick={() => { setReportModal({ isOpen: true, type: 'dispute', reason: 'Non-delivery of work', details: '' }); setShowChatMenu(false); }}
                          className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 font-semibold"
                        >
                          Open Dispute
                        </button>
                        <button
                          onClick={() => { setReportModal({ isOpen: true, type: 'report', reason: 'Scam/Fraud', details: '' }); setShowChatMenu(false); }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-semibold border-t border-slate-100"
                        >
                          Report User
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Status Banners */}
              {activeConv.status === 'pending' && (
                <div className="bg-amber-50 p-4 text-sm text-amber-800 border border-amber-200 rounded-xl flex items-center gap-3">
                  <Lock className="w-5 h-5 text-amber-600 shrink-0" />
                  <span className="font-medium">{isEmployer ? 'Unlock to reply to this pitch.' : 'Waiting for employer to unlock.'}</span>
                </div>
              )}
              {activeConv.status === 'hired' && (
                <div className="bg-green-50 p-4 text-sm text-green-800 border border-green-200 rounded-xl flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                  <span className="font-semibold">Escrow Funded! Keep all communication here.</span>
                </div>
              )}
              {activeConv.status === 'completed' && (
                <div className="bg-indigo-50 p-4 text-sm text-indigo-800 border border-indigo-200 rounded-xl flex items-center gap-3">
                  <UploadCloud className="w-5 h-5 text-indigo-600 shrink-0" />
                  <span className="font-semibold">Job Delivered! Waiting for Employer to approve.</span>
                </div>
              )}
              {activeConv.status === 'approved' && (
                <div className="bg-teal-50 p-4 text-sm text-teal-800 border border-teal-200 rounded-xl flex items-center gap-3">
                  <Handshake className="w-5 h-5 text-teal-600 shrink-0" />
                  <span className="font-semibold">Job Approved! Funds released.</span>
                </div>
              )}
              {activeConv.status === 'disputed' && (
                <div className="bg-red-50 p-4 text-sm text-red-800 border border-red-200 rounded-xl flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                  <span className="font-semibold">Dispute Opened. Admin is reviewing.</span>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 bg-white rounded-xl overflow-y-auto p-6 md:p-8 flex flex-col gap-6 shadow-sm border border-[#D1E6FF]">
                <div className="flex items-center gap-4 w-full mb-6">
                  <div className="flex-1 h-px bg-[#989BA1] opacity-20 rounded" />
                  <span className="text-xs font-bold tracking-widest uppercase shrink-0" style={{ color: MUTED }}>Chat Started</span>
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
                    <div
                      key={i}
                      className={`flex items-start gap-4 group ${isMe ? "flex-row-reverse" : "flex-row"}`}
                      onTouchStart={(e) => handleTouchStart(e, msg)}
                      onTouchEnd={handleTouchEnd}
                      onTouchMove={handleTouchEnd}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        let x = e.clientX;
                        let y = e.clientY;

                        // Prevent menu from going off-screen on the right
                        if (x + 160 > window.innerWidth) {
                          x = window.innerWidth - 170;
                        }
                        // Prevent menu from going off-screen on the bottom
                        if (y + 160 > window.innerHeight) {
                          y = window.innerHeight - 170;
                        }

                        setContextMenu({ x, y, message: msg });
                      }}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 mt-auto shadow-sm ${avatarColor}`}>
                        {senderEmail.charAt(0).toUpperCase()}
                      </div>

                      <div className={`flex flex-col gap-1.5 w-full max-w-xl ${isMe ? "items-end" : "items-start"}`}>
                        <div
                          className="rounded-xl px-5 py-4 text-sm leading-relaxed break-words shadow-sm relative group cursor-context-menu"
                          style={{
                            color: GRAY,
                            background: isMe ? PALE_BLUE : "white",
                            border: isMe ? "none" : `1px solid ${BLUE}`,
                          }}
                        >
                          {/* Reply Quote Block */}
                          {msg.replyTo && (
                            <div className="mb-3 p-3 rounded-lg bg-black/5 border-l-4 border-[#131ADF] text-xs opacity-90 text-left">
                              <div className="font-bold mb-1 text-[#131ADF]">{msg.replyTo.senderEmail.split('@')[0]}</div>
                              <div className="truncate text-gray-700 italic">"{msg.replyTo.content}"</div>
                            </div>
                          )}

                          <div className="text-left">
                            {(activeConv.status === 'partnership') ? (
                              <span>{displayContent}</span>
                            ) : (
                              displayContent.split(/(\[REDACTED.*?\])/).map((part: string, idx: number) =>
                                part.startsWith('[REDACTED') ? (
                                  <span key={idx} className={`font-mono text-xs px-2 py-0.5 rounded mx-1 ${isMe ? 'bg-blue-800 text-blue-200' : 'bg-red-100 text-red-800 font-bold'}`}>
                                    {part}
                                  </span>
                                ) : (
                                  <span key={idx}>{part}</span>
                                )
                              )
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 px-2">
                          <span className="text-xs" style={{ color: MUTED }}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {msg.isEdited && (
                            <span className="text-[10px] italic" style={{ color: MUTED }}>(edited)</span>
                          )}
                          {isMe && (
                            <div className="flex items-center gap-1 ml-1">
                              <span className="text-[10px] font-bold text-blue-600">Seen</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="bg-white rounded-xl border border-[#DDD] px-5 py-4 flex flex-col gap-3 shrink-0 shadow-sm">
                {(replyingTo || editingMessage) && (
                  <div className="flex items-center justify-between bg-blue-50/50 p-3 rounded-lg border border-blue-100 mb-2 text-left">
                    <div className="flex flex-col gap-1 overflow-hidden">
                      <span className="text-xs font-bold text-[#131ADF] uppercase tracking-wider">
                        {editingMessage ? 'Editing Message' : `Replying to ${replyingTo?.senderEmail.split('@')[0]}`}
                      </span>
                      <span className="text-sm text-gray-600 truncate max-w-xl italic">
                        "{editingMessage ? editingMessage.content : replyingTo?.content}"
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setReplyingTo(null); setEditingMessage(null); setReplyContent(''); }}
                      className="text-gray-400 hover:text-gray-800 font-bold px-3 py-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <form onSubmit={handleSendReply} className="flex items-center gap-4">
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
                    className="flex-1 text-base outline-none bg-transparent resize-none overflow-y-auto"
                    placeholder="Write a message... (Shift+Enter for newline, Right-Click messages to reply/edit)"
                    rows={1}
                    style={{ color: GRAY, minHeight: '24px', maxHeight: '150px' }}
                  />
                  <div className="flex items-center gap-4 shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="hover:opacity-70 transition-opacity p-2"
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
                    <button type="button" className="hover:opacity-70 transition-opacity p-2"><IconSmile /></button>
                    <button
                      type="submit"
                      disabled={!replyContent.trim() && !isUploading}
                      className="w-10 h-10 rounded-lg flex items-center justify-center transition-opacity hover:opacity-80 disabled:opacity-50"
                      style={{ background: BLUE }}
                    >
                      <IconSend />
                    </button>
                  </div>
                </form>
                {/(mpesa|pay me directly|07\d{8}|\+254\d{9}|send money|off-platform|off platform)/i.test(replyContent) && (
                  <div className="px-4 py-3 bg-blue-50 text-[#131ADF] text-xs font-bold rounded-lg flex items-center gap-2 border border-blue-100">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    Tip: L-Earn cannot protect payments made off-platform. For guaranteed safety, use the Escrow system.
                  </div>
                )}
              </div>

              {/* Action Controls */}
              <div className="flex flex-wrap justify-end gap-3 mt-2">
                {isEmployer && activeConv.status === 'pending' && (
                  <button onClick={handleUnlock} className="px-5 py-2.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-semibold text-sm shadow-sm border border-blue-200">
                    Unlock to Reply
                  </button>
                )}
                {isEmployer && activeConv.status === 'active' &&
                  activeConv.gigCompensationType !== 'Equity' &&
                  activeConv.gigCategory !== 'Partnership' &&
                  !activeConv.gigTitle?.toLowerCase().includes('equity') && (
                    <button onClick={handleHire} className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm shadow-sm">
                      Fund Escrow & Hire
                    </button>
                  )}
                {isEmployer && activeConv.status === 'completed' && (
                  <>
                    <button onClick={handleApprove} className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold text-sm shadow-sm">
                      Approve & Release
                    </button>
                    <button onClick={handleDispute} className="px-5 py-2.5 border border-rose-300 text-rose-600 rounded-lg hover:bg-rose-50 transition-colors font-semibold text-sm shadow-sm bg-white">
                      Dispute
                    </button>
                  </>
                )}
                {isEmployer && activeConv.status === 'hired' && (
                  <button onClick={handleDispute} className="px-5 py-2.5 border border-rose-300 text-rose-600 rounded-lg hover:bg-rose-50 transition-colors font-semibold text-sm shadow-sm bg-white">
                    Dispute
                  </button>
                )}

                {/* Applicant Controls */}
                {!isEmployer && activeConv.status === 'hired' && (
                  <>
                    <button onClick={handleDeliver} className="px-6 py-2.5 bg-[#131ADF] text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm shadow-sm">
                      Deliver Job
                    </button>
                    <button onClick={handleDispute} className="px-5 py-2.5 border border-rose-300 text-rose-600 rounded-lg hover:bg-rose-50 transition-colors font-semibold text-sm shadow-sm bg-white">
                      Dispute
                    </button>
                  </>
                )}
                {!isEmployer && activeConv.status === 'completed' && (
                  <button onClick={handleDispute} className="px-5 py-2.5 border border-rose-300 text-rose-600 rounded-lg hover:bg-rose-50 transition-colors font-semibold text-sm shadow-sm bg-white">
                    Dispute Employer
                  </button>
                )}
              </div>


            </>
          ) : (
            <div className="bg-white rounded-xl shadow-sm flex flex-col h-full overflow-hidden items-center justify-center border border-[#D1E6FF]">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <MessageCircle className="w-12 h-12 text-[#131ADF]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Select a Conversation</h3>
              <p className="text-gray-500 text-center max-w-sm">Choose an active chat from the sidebar to continue.</p>
            </div>
          )}
        </div>

        {/* Right Panel: Portfolio Viewer */}
        {activeConv && showPortfolioPane && (
          <div className="absolute inset-0 z-40 lg:relative lg:inset-auto lg:z-auto lg:flex flex-col h-full bg-white lg:rounded-xl w-full lg:w-72 shrink-0 overflow-hidden shadow-2xl lg:shadow-sm border-l lg:border border-[#D1E6FF]">
            {loadingProfile ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#131ADF]" />
              </div>
            ) : partnerProfile ? (
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 flex flex-col items-center border-b border-slate-100">
                  <div className="w-24 h-24 rounded-full bg-slate-100 mb-4 overflow-hidden shadow-sm border border-slate-200">
                    {partnerProfile.profile?.avatar ? (
                      <img src={partnerProfile.profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-300">
                        <User className="w-10 h-10" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 text-center">{partnerProfile.profile?.name || partnerProfile.profile?.email.split('@')[0]}</h3>
                  <p className="text-xs text-slate-400 mt-1">{partnerProfile.profile?.email}</p>
                </div>

                {partnerProfile.profile?.bio && (
                  <div className="p-5 border-b border-slate-100">
                    <p className="text-sm text-gray-600 leading-relaxed text-center">{partnerProfile.profile.bio}</p>
                  </div>
                )}

                <div className="p-5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Links</h4>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {partnerProfile.profile?.links?.github && (
                      <a href={partnerProfile.profile.links.github} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:text-[#131ADF] hover:bg-blue-50 transition-colors">
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    {partnerProfile.profile?.links?.linkedin && (
                      <a href={partnerProfile.profile.links.linkedin} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:text-[#131ADF] hover:bg-blue-50 transition-colors">
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                    {partnerProfile.profile?.links?.website && (
                      <a href={partnerProfile.profile.links.website} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:text-[#131ADF] hover:bg-blue-50 transition-colors">
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="p-5 bg-slate-50 min-h-[200px] flex-1">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Completed Gigs</h4>
                  {partnerProfile.stats?.completedGigsCount > 0 ? (
                    <div className="flex flex-col gap-3">
                      {partnerProfile.stats.completedGigs.slice(0, 5).map((gig: any, i: number) => (
                        <div key={i} className="bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                          <p className="text-xs font-bold text-slate-800 line-clamp-1">{gig.opportunityTitle}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{new Date(gig.completedAt).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-xs text-slate-400">No completed gigs yet.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                Profile not available
              </div>
            )}
          </div>
        )}
      </div>
      {messageToDelete && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Delete Message</h3>
              <p className="text-gray-500 text-sm">
                Are you sure you want to permanently delete this message? This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full mt-4">
                <button
                  className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                  onClick={() => setMessageToDelete(null)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-sm shadow-red-200"
                  onClick={handleDeleteMessage}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
      {/* Universal Report/Dispute Modal */}
      {reportModal.isOpen && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col text-left gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${reportModal.type === 'report' ? 'bg-red-100 text-red-600' : 'bg-rose-100 text-rose-600'}`}>
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {reportModal.type === 'report' ? 'Report User' : 'Open a Dispute'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {reportModal.type === 'report' ? 'This will be sent directly to administration for review.' : 'Escalate this escrow transaction to administration.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <label className="text-sm font-bold text-gray-700">Reason</label>
                <select
                  className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-[#131ADF] focus:ring-1 focus:ring-[#131ADF]"
                  value={reportModal.reason}
                  onChange={(e) => setReportModal({ ...reportModal, reason: e.target.value })}
                >
                  {reportModal.type === 'report' ? (
                    <>
                      <option value="Scam/Fraud">Scam / Fraud</option>
                      <option value="Spam">Spam / Unsolicited Advertising</option>
                      <option value="Inappropriate Behavior">Inappropriate / Offensive Behavior</option>
                      <option value="Other">Other</option>
                    </>
                  ) : (
                    <>
                      <option value="Non-delivery of work">Non-delivery of work</option>
                      <option value="Poor quality of work">Poor quality of work</option>
                      <option value="Unresponsive">User is unresponsive</option>
                      <option value="Other">Other</option>
                    </>
                  )}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">Provide Details</label>
                <textarea
                  className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-[#131ADF] focus:ring-1 focus:ring-[#131ADF] h-32 resize-none"
                  placeholder="Please provide specific details about what happened..."
                  value={reportModal.details}
                  onChange={(e) => setReportModal({ ...reportModal, details: e.target.value })}
                />
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <button
                  onClick={() => setReportModal({ ...reportModal, isOpen: false })}
                  className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleModalSubmit}
                  className={`px-6 py-2.5 rounded-xl font-bold text-white transition-colors shadow-sm ${reportModal.type === 'report' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                    }`}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
