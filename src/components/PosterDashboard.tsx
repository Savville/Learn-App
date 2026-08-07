import { useEffect, useState } from 'react';
import { OTPLoginForm } from './OTPLoginForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogOut, Briefcase, Users, ChevronDown, ChevronUp, Calendar, ExternalLink, ShieldCheck, Trash2, Mail, AlertCircle, DollarSign, Lock, Clock, CheckCircle, X, EyeOff, RefreshCcw, History } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ProfileView } from '../pages/ProfileView';
import { toSlug } from '@/utils/dateUtils';
import { useAlert } from '@/contexts/AlertContext';

interface Post {
  _id: string;
  id: string;
  title: string;
  status: string;
  category: string;
  description?: string;
  fullDescription?: string;
  deadline?: string;
  location?: string;
  applicationLink?: string;
  contactEmail?: string;
  reporter?: { name?: string; email?: string; organization?: string; role?: string; telephone?: string; websiteOrSocial?: string };
  views?: number;
  clicks?: number;
  applicantCount?: number;
  dateAdded?: string;
  submittedAt?: string;
  opportunity?: any; // for pending posts structure
  originalOpportunity?: any; // tracking history and edits
  applicationForm?: any;
  isLive?: boolean;
  isEscrow?: boolean;
  escrowAmount?: number;
  isEscrowFunded?: boolean;
  payoutRequests?: any[];
  unpublishedBy?: string | null;
}

interface Applicant {
  _id: string;
  applicantEmail: string;
  applicantData: Record<string, any>;
  appliedAt: string;
  status: string;
  opportunityId?: string;
  tracks?: any[];
}

export function PosterDashboard({ isAdminMode, adminDashboardMode }: { isAdminMode?: boolean; adminDashboardMode?: boolean }) {
  const navigate = useNavigate();
  const { id: urlPostId } = useParams<{ id: string }>();
  const { showAlert } = useAlert();
  const isPlatformAdmin = isAdminMode || adminDashboardMode;
  const [token, setToken] = useState(isPlatformAdmin ? localStorage.getItem('adminToken') : localStorage.getItem('user_token'));
  const [email, setEmail] = useState(isPlatformAdmin ? 'ochiwilliamotieno@gmail.com' : localStorage.getItem('user_email'));

  const [livePosts, setLivePosts] = useState<Post[]>([]);
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [escrowMessage, setEscrowMessage] = useState<string | null>(null);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [escrowStatus, setEscrowStatus] = useState<'idle' | 'waiting' | 'success' | 'failed'>('idle');
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);

  // Expanded post for applicants
  const [expandedPostId, setExpandedPostId] = useState<string | null>(urlPostId || null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Sliding Profile State
  const [slidingApplicant, setSlidingApplicant] = useState<{ email: string; app: Applicant; post: Post } | null>(null);

  // Auto-fetch applicants if we arrived via direct URL
  useEffect(() => {
    if (urlPostId && token && !applicants.length && expandedPostId === urlPostId) {
      const loadInitialApplicants = async () => {
        setLoadingApplicants(true);
        try {
          const res = await fetch(`${API_BASE}/public/me/posts/${urlPostId}/applicants`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (res.ok) setApplicants(data || []);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingApplicants(false);
        }
      };
      loadInitialApplicants();
    }
  }, [urlPostId, token]);

  // Escrow Deposit State
  const [escrowJob, setEscrowJob] = useState<Post | null>(null);
  const [escrowApplicant, setEscrowApplicant] = useState<Applicant | null>(null);
  const [escrowPhone, setEscrowPhone] = useState('');
  const [escrowLoading, setEscrowLoading] = useState(false);

  // Escrow Release State
  const [releaseJob, setReleaseJob] = useState<{ post: Post; app: Applicant } | null>(null);
  const [releaseLoading, setReleaseLoading] = useState(false);
  const [releaseMessage, setReleaseMessage] = useState<string | null>(null);

  // Edit Request State
  const [editRequestPost, setEditRequestPost] = useState<Post | null>(null);
  const [editRequestForm, setEditRequestForm] = useState<{
    title: string;
    description: string;
    fullDescription: string;
    deadline: string;
    location: string;
    applicationLink: string;
    changeReason: string;
  }>({ title: '', description: '', fullDescription: '', deadline: '', location: '', applicationLink: '', changeReason: '' });
  const [editRequestLoading, setEditRequestLoading] = useState(false);
  const [editRequestError, setEditRequestError] = useState<string | null>(null);
  const [editRequestSuccess, setEditRequestSuccess] = useState(false);

  // Delete State
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

  // Unpublish State
  const [postToUnpublish, setPostToUnpublish] = useState<Post | null>(null);
  const [unpublishError, setUnpublishError] = useState<string | null>(null);
  const [showUnpublishSuccess, setShowUnpublishSuccess] = useState(false);
  const [unpublishingId, setUnpublishingId] = useState<string | null>(null);
  const [republishingId, setRepublishingId] = useState<string | null>(null);

  // Payout Request State
  const [payoutJob, setPayoutJob] = useState<Post | null>(null);
  const [payoutForm, setPayoutForm] = useState({
    expenseType: 'vendor', // 'vendor' or 'contingency'
    vendorName: '',
    reason: '',
    amount: '',
    paybillNumber: '',
  });
  const [payoutReceipt, setPayoutReceipt] = useState<File | null>(null);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutMessage, setPayoutMessage] = useState<string | null>(null);
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchPosts = async (currentToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = isAdminMode && !adminDashboardMode ? `${API_BASE}/public/me/posts?filterMode=admin` : `${API_BASE}/public/me/posts?filterMode=normal`;
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      if (res.status === 401) {
        handleLogout();
        throw new Error('Session expired');
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setLivePosts(data.live || []);
      setPendingPosts(data.pending || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicants = async (postId: string) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
      return;
    }

    setExpandedPostId(postId);
    setLoadingApplicants(true);
    try {
      const res = await fetch(`${API_BASE}/public/me/posts/${postId}/applicants`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setApplicants(data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleUpdateApplicantStatus = async (appId: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE}/public/applications/${appId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      // Update local state
      setApplicants(prev => prev.map(a => a._id === appId ? { ...a, status: newStatus } : a));
    } catch (err: any) {
      showAlert({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  useEffect(() => {
    if (token) {
      fetchPosts(token);
    }
  }, [token]);

  useEffect(() => {
    if (editRequestPost) {
      setEditRequestForm({
        title: editRequestPost.title || '',
        description: editRequestPost.description || '',
        fullDescription: editRequestPost.fullDescription || editRequestPost.opportunity?.fullDescription || '',
        deadline: editRequestPost.deadline || '',
        location: editRequestPost.location || '',
        applicationLink: editRequestPost.applicationLink || '',
        changeReason: '',
      });
      setEditRequestError(null);
      setEditRequestSuccess(false);
    }
  }, [editRequestPost]);

  const handleSuccess = (newToken: string, newEmail: string) => {
    setToken(newToken);
    setEmail(newEmail);
  };

  const handleLogout = () => {
    if (isAdminMode) return; // Admins cannot logout from here
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem('user_token');
      localStorage.removeItem('user_email');
      setToken(null);
      setEmail(null);
      setLivePosts([]);
      setPendingPosts([]);
    }
  };

  const handleDeletePending = async () => {
    if (!postToDelete) return;

    // Sometimes 'id' comes back nested from parsed data vs database directly mapping
    const exactId = postToDelete.opportunity?.id || postToDelete.id;
    if (!exactId) {
      setDeleteError("Cannot find correct ID for this post.");
      return;
    }

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const res = await fetch(`${API_BASE}/public/me/posts/${exactId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (!isJson) {
        throw new Error("Server returned an invalid HTML page instead of JSON. Ensure your Backend API is running properly on :5000");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Update local state
      setPendingPosts(prev => prev.filter(p => (p.opportunity?.id || p.id) !== exactId));
      setShowDeleteSuccess(true);
    } catch (err: any) {
      setDeleteError(`Failed to delete: ${err.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleUnpublish = async () => {
    if (!postToUnpublish) return;

    setUnpublishingId(postToUnpublish.id);
    setUnpublishError(null);
    try {
      const res = await fetch(`${API_BASE}/public/me/posts/${postToUnpublish.id}/unpublish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to unpublish');

      setLivePosts(prev => prev.map(p => p.id === postToUnpublish.id ? { ...p, status: 'Unpublished' } : p));
      setShowUnpublishSuccess(true);
    } catch (err: any) {
      setUnpublishError(err.message);
    } finally {
      setUnpublishingId(null);
    }
  };

  const handleRepublishPost = async (postId: string) => {
    setRepublishingId(postId);
    try {
      const res = await fetch(`${API_BASE}/public/me/posts/${postId}/republish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to republish');

      // Move back to live
      setLivePosts(prev => prev.map(p => p.id === postId ? { ...p, status: 'Verified', isLive: true } : p));
      showAlert({ title: 'Republished', message: data.message, type: 'success' });
    } catch (err: any) {
      showAlert({ title: 'Error', message: err.message, type: 'error' });
    } finally {
      setRepublishingId(null);
    }
  };


  const handleEscrowDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!escrowJob || !escrowPhone) return;

    // The backend wants opportunity.id which we mapped to id for pending posts
    const opportunityId = escrowJob.id;
    // Get the amount
    const amount = escrowJob.escrowAmount || escrowJob.opportunity?.escrowAmount || 1000;

    setEscrowLoading(true);
    setEscrowMessage(null);

    try {
      const res = await fetch(`${API_BASE}/public/payments/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount,
          phone: escrowPhone,
          opportunityId,
          applicationId: escrowApplicant?._id || undefined
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initiate deposit');

      if (data.checkoutRequestId) {
        setCheckoutRequestId(data.checkoutRequestId);
        setEscrowStatus('waiting');
      } else {
        setEscrowMessage(data.message || 'Check your phone for the M-PESA prompt.');
      }

    } catch (err: any) {
      setEscrowMessage(err.message);
      setEscrowStatus('failed');
    } finally {
      setEscrowLoading(false);
    }
  };

  const handleCheckEscrowPayment = async () => {
    if (!checkoutRequestId) return;
    setIsCheckingPayment(true);
    setEscrowMessage(null);
    try {
      const res = await fetch(`${API_BASE}/public/payments/status/${checkoutRequestId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        if (data.status === 'completed') {
          setEscrowStatus('success');
          setEscrowMessage(`Escrow funded! KES ${data.amountPaid} is securely held. Receipt: ${data.receiptNo}`);
          // Update post locally to reflect funded
          setPendingPosts(prev => prev.map(p =>
            (p.opportunity?.id || p.id) === escrowJob?.id ? { ...p, isEscrowFunded: true } : p
          ));
          setLivePosts(prev => prev.map(p =>
            p.id === escrowJob?.id ? { ...p, isEscrowFunded: true } : p
          ));
          if (escrowApplicant) {
            setApplicants(prev => prev.map(a => a._id === escrowApplicant._id ? { ...a, status: 'approved' } : a));
          }
        } else if (data.status === 'failed' || data.status === 'cancelled') {
          setEscrowStatus('failed');
          setEscrowMessage(`Payment failed or cancelled: ${data.resultDesc || 'User cancelled'}`);
        } else {
          setEscrowMessage('Payment not received yet. Please try again in a few seconds.');
        }
      } else {
        setEscrowMessage(data.error || 'Failed to check status');
      }
    } catch (e: any) {
      setEscrowMessage(e.message || 'Error checking payment status.');
    } finally {
      setIsCheckingPayment(false);
    }
  };

  useEffect(() => {
    let interval: any;
    if (checkoutRequestId && escrowStatus === 'waiting') {
      let attempts = 0;
      interval = setInterval(async () => {
        attempts++;
        if (attempts > 12) { // 60 seconds (5s interval)
          setEscrowStatus('failed');
          setEscrowMessage('Request timed out. Please try again.');
          clearInterval(interval);
          return;
        }
        try {
          const res = await fetch(`${API_BASE}/public/payments/status/${checkoutRequestId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok) {
            if (data.status === 'completed') {
              setEscrowStatus('success');
              setEscrowMessage(`Escrow funded! KES ${data.amountPaid} is securely held. Receipt: ${data.receiptNo}`);
              clearInterval(interval);
              // Update post locally to reflect funded
              setPendingPosts(prev => prev.map(p =>
                (p.opportunity?.id || p.id) === escrowJob?.id ? { ...p, isEscrowFunded: true } : p
              ));
              setLivePosts(prev => prev.map(p =>
                p.id === escrowJob?.id ? { ...p, isEscrowFunded: true } : p
              ));
              // Update applicant locally if this was an applicant hire
              if (escrowApplicant) {
                setApplicants(prev => prev.map(a => a._id === escrowApplicant._id ? { ...a, status: 'approved' } : a));
              }
            } else if (data.status === 'failed' || data.status === 'cancelled') {
              setEscrowStatus('failed');
              setEscrowMessage(`Payment failed or cancelled: ${data.resultDesc || 'User cancelled'}`);
              clearInterval(interval);
            }
          }
        } catch (e) {
          // Keep polling unless network completely fails
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [checkoutRequestId, escrowStatus, escrowJob, token]);


  const handleReleaseEscrow = async (post: Post, app: Applicant) => {
    if (!window.confirm(`Release KES ${post.escrowAmount} escrow to ${app.applicantEmail}? This cannot be undone.`)) return;
    setReleaseLoading(true);
    setReleaseMessage(null);
    try {
      const res = await fetch(`${API_BASE}/public/me/posts/${post.id}/release-escrow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ applicationId: app._id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to request release');
      setReleaseMessage(`✅ ${data.message} Net payout: KES ${data.netPayable}`);
      // Update local state
      setApplicants(prev => prev.map(a => a._id === app._id ? { ...a, escrowReleaseRequested: true } as any : a));
    } catch (err: any) {
      setReleaseMessage(`❌ ${err.message}`);
    } finally {
      setReleaseLoading(false);
    }
  };

  const handleReleaseDeliverable = async (applicationId: string, trackId: string, deliverableId: string, qualityLevel?: string) => {
    const application = applicants.find(a => a._id === applicationId);
    const track = application?.tracks?.find((t: any) => t.trackId === trackId);
    const deliverable = track?.deliverables?.find((d: any) => d.id === deliverableId);
    if (!deliverable) return;

    if (!window.confirm(`Release payment for "${deliverable.title}" (${qualityLevel || 'satisfactory'}) to ${application?.applicantEmail}?`)) return;

    try {
      const res = await fetch(`${API_BASE}/public/me/posts/${urlPostId || application?.opportunityId}/release-deliverable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ applicationId, trackId, deliverableId, qualityLevel: qualityLevel || 'satisfactory' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to release payment');

      // Update local state
      setApplicants(prev => prev.map(a => {
        if (a._id !== applicationId) return a;
        return {
          ...a,
          tracks: a.tracks?.map((t: any) => {
            if (t.trackId !== trackId) return t;
            return {
              ...t,
              deliverables: t.deliverables?.map((d: any) => {
                if (d.id !== deliverableId) return d;
                return { ...d, status: 'paid', qualityLevel: qualityLevel || 'satisfactory', paidAmount: data.netPayable };
              })
            };
          })
        };
      }));

      alert(`✅ Payment released! Net payout: KES ${data.netPayable} (${data.percentage}% of KES ${deliverable.amount})`);
    } catch (err: any) {
      alert(`❌ ${err.message}`);
    }
  };

  const handleRejectDeliverable = async (applicationId: string, trackId: string, deliverableId: string) => {
    const reason = window.prompt('Reason for rejection (freelancer can resubmit):');
    if (!reason) return;

    const application = applicants.find(a => a._id === applicationId);
    try {
      const res = await fetch(`${API_BASE}/public/me/posts/${urlPostId || application?.opportunityId}/reject-deliverable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ applicationId, trackId, deliverableId, reason })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reject deliverable');

      // Update local state
      setApplicants(prev => prev.map(a => {
        if (a._id !== applicationId) return a;
        return {
          ...a,
          tracks: a.tracks?.map((t: any) => {
            if (t.trackId !== trackId) return t;
            return {
              ...t,
              deliverables: t.deliverables?.map((d: any) => {
                if (d.id !== deliverableId) return d;
                return { ...d, status: 'rejected', adminNote: reason };
              })
            };
          })
        };
      }));
    } catch (err: any) {
      alert(`❌ ${err.message}`);
    }
  };

  const handleDisputeDeliverable = async (applicationId: string, trackId: string, deliverableId: string, initiatedBy: 'poster' | 'freelancer') => {
    const reason = window.prompt('Reason for dispute:');
    if (!reason) return;

    const application = applicants.find(a => a._id === applicationId);
    try {
      const res = await fetch(`${API_BASE}/public/me/applications/${applicationId}/dispute-deliverable`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ trackId, deliverableId, reason })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispute deliverable');

      // Update local state
      setApplicants(prev => prev.map(a => {
        if (a._id !== applicationId) return a;
        return {
          ...a,
          tracks: a.tracks?.map((t: any) => {
            if (t.trackId !== trackId) return t;
            return {
              ...t,
              deliverables: t.deliverables?.map((d: any) => {
                if (d.id !== deliverableId) return d;
                return { ...d, status: 'disputed', disputeReason: reason, disputeInitiatedBy: initiatedBy };
              })
            };
          })
        };
      }));

      alert('Dispute raised. Main admin notified.');
    } catch (err: any) {
      alert(`❌ ${err.message}`);
    }
  };

  const handlePayoutRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutJob) return;

    setPayoutLoading(true);
    setPayoutMessage(null);

    try {
      let receiptBase64 = null;
      if (payoutReceipt) {
        receiptBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(payoutReceipt);
        });
      }

      const res = await fetch(`${API_BASE}/public/me/posts/${payoutJob.id}/payout-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...payoutForm,
          receiptUrl: receiptBase64
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit payout request');

      setPayoutSuccess(true);

      // Update local state to reflect the new request
      setLivePosts(prev => prev.map(p =>
        p.id === payoutJob.id
          ? { ...p, payoutRequests: [...(p.payoutRequests || []), data.request] }
          : p
      ));

    } catch (err: any) {
      setPayoutMessage(err.message);
    } finally {
      setPayoutLoading(false);
    }
  };

  const handleSubmitEditRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRequestPost || !editRequestForm.changeReason.trim()) return;

    setEditRequestLoading(true);
    setEditRequestError(null);

    try {
      const original = editRequestPost;
      const res = await fetch(`${API_BASE}/public/submit-opportunity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunity: {
            ...original,
            ...(editRequestForm.title && { title: editRequestForm.title }),
            ...(editRequestForm.description && { description: editRequestForm.description }),
            ...(editRequestForm.fullDescription && { fullDescription: editRequestForm.fullDescription }),
            ...(editRequestForm.deadline && { deadline: editRequestForm.deadline }),
            ...(editRequestForm.location && { location: editRequestForm.location }),
            ...(editRequestForm.applicationLink && { applicationLink: editRequestForm.applicationLink }),
            editOf: original.id,
          },
          reporter: {
            name: 'System',
            organization: 'Opportunities Kenya',
            role: 'Poster Edit Request',
            telephone: '+254700000000',
            email: original.contactEmail || original.reporter?.email || '',
            websiteOrSocial: 'https://opportunities.ke',
          },
          changeReason: editRequestForm.changeReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit edit request');

      setEditRequestSuccess(true);
    } catch (err: any) {
      setEditRequestError(err.message);
    } finally {
      setEditRequestLoading(false);
    }
  };

  if (!token) {
    return (
      <OTPLoginForm
        onSuccess={handleSuccess}
        title="Manage Your Postings"
        subtitle="Enter your email to view your posts and review applicants."
      />
    );
  }

  // Separate unpublished and expired posts for their own sections
  const unpublishedPosts = livePosts.filter(p => p.status === 'Unpublished');
  const expiredPosts = livePosts.filter(p => p.status === 'Verified' && p.deadline && new Date(p.deadline) < new Date());

  const allPosts = [
    ...livePosts
      .filter(p => p.status !== 'Unpublished' && !(p.status === 'Verified' && p.deadline && new Date(p.deadline) < new Date()))
      .map(p => ({ ...p, isLive: true })),
    ...pendingPosts
      .filter(p => !livePosts.some(live => live.id === (p.opportunity?.id || p.id)))
      .map(p => ({
        ...p,
        id: p.opportunity?.id || p.id,
        title: p.opportunity?.title || p.title,
        category: p.opportunity?.category || p.category,
        isLive: false
      }))
  ];

  return (
    <>
      <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm relative">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-100 pb-6 mb-8">
          <div className="flex flex-col gap-1 w-full md:w-auto">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner flex-shrink-0">
                <Briefcase className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 truncate pr-4">
                  {adminDashboardMode ? 'Opportunities Kenya Admin' : isAdminMode ? 'All Platform Posts' : 'My Posts Dashboard'}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto mt-2 md:mt-0 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl shrink-0 border border-gray-200">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 truncate max-w-[150px] md:max-w-xs" title={email || ''}>{email}</span>
              </div>
              
              {!isAdminMode && (
                <Button 
                  onClick={handleLogout} 
                  variant="outline" 
                  className="gap-2 shrink-0 border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="">
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
              <p className="text-gray-500">Loading your posts...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-medium">
              {error}
            </div>
          ) : allPosts.length === 0 ? (
            <div className="text-center py-24 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
                <Briefcase className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No posts found</h3>
              <p className="text-gray-500 text-center max-w-md mx-auto">It looks like you haven't posted any opportunities with this email address yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">Your Opportunities ({allPosts.length})</h3>

              <div className="space-y-8 mt-6">
                {allPosts.map((post) => (
                  <div key={post._id} className="rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm transition-all hover:shadow-md hover:border-blue-100 group space-y-0">
                    <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5 relative group-hover:bg-gray-50/30 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-2 mb-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold leading-none ${post.isLive ? 'bg-green-100 text-green-700' :
                              (post.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700')
                            }`}>
                            {post.isLive ? 'Live / Verified' : post.status}
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-bold leading-none border border-gray-200">
                            {post.category}
                          </span>

                          {/* Escrow Label + Funded Badge */}
                          {(post.isEscrow || post.opportunity?.isEscrow || (post.escrowAmount ?? 0) > 0 || (post.opportunity?.escrowAmount ?? 0) > 0) && (
                            <>
                              {(post.isEscrowFunded || post.opportunity?.isEscrowFunded) ? (
                                <span className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold leading-none border border-green-200">
                                  <Lock className="w-3 h-3" /> Escrow Funded — KES {(post.escrowAmount || post.opportunity?.escrowAmount || 0).toLocaleString()}
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 bg-slate-50 text-slate-700 px-3 py-1 rounded-full text-xs font-bold leading-none border border-slate-200">
                                  <ShieldCheck className="w-3 h-3" /> Escrow Required
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{post.title}</h4>
                        <p className="text-sm text-gray-500 mt-2 flex items-center gap-1.5 font-medium">
                          <Calendar className="w-4 h-4" />
                          {post.dateAdded || post.submittedAt ? new Date(post.dateAdded || post.submittedAt || '').toLocaleDateString() : 'N/A'}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 shrink-0 items-start md:items-end w-full md:w-auto mt-4 md:mt-0">
                         {/* Single Row: Core Actions */}
                         <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
                           {(post.isLive || post.status === 'Verified') && (
                             <>
                               <Button asChild variant="outline" className="h-9 rounded-lg px-4 text-sm font-medium border-gray-200 text-gray-700 hover:bg-gray-50">
                                 <Link to={`/opportunity/${toSlug(post.title)}`} target="_blank" className="flex items-center gap-1.5">
                                   <ExternalLink className="w-3.5 h-3.5" /> View Live
                                 </Link>
                               </Button>
                               <Button
                                 onClick={() => setEditRequestPost(post)}
                                 variant="outline"
                                 className="h-9 rounded-lg px-4 text-sm font-medium border-amber-200 text-amber-700 hover:bg-amber-50 flex items-center gap-1.5"
                               >
                                 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                 Request Edit
                               </Button>
                               <Link
                                 to={`/manage/applicants/${post.id || post.opportunity?.id}`}
                                 state={{ post }}
                                 className="h-9 rounded-lg px-4 text-sm font-medium bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex items-center gap-1.5"
                               >
                                 <Users className="w-3.5 h-3.5 text-slate-500" />
                                 Applications ({post.applicantCount || 0})
                               </Link>
                               <Button
                                 onClick={() => { setPostToUnpublish(post); setUnpublishError(null); }}
                                 variant="outline"
                                 className="h-9 rounded-lg px-4 text-sm font-medium border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 flex items-center gap-1.5"
                               >
                                 <EyeOff className="w-3.5 h-3.5" />
                                 Unpublish
                               </Button>
                             </>
                           )}
                           {!post.isLive && post.status !== 'Verified' && (
                             <>
                               <Button
                                 onClick={() => navigate('/post-with-us', { state: { editPost: post.isLive ? post : post.opportunity || post.originalOpportunity || post } })}
                                 variant="outline"
                                 className="h-9 rounded-lg px-4 text-sm font-medium border-blue-200 text-blue-700 hover:bg-blue-50 flex items-center gap-1.5"
                               >
                                 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                 Edit
                               </Button>
                               <Button
                                 onClick={() => {
                                   setPostToDelete(post);
                                   setDeleteError(null);
                                   setTimeout(() => {
                                     document.getElementById('delete-modal-dialog')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                   }, 50);
                                 }}
                                 variant="outline"
                                 className="h-9 rounded-lg px-4 text-sm font-medium border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 flex items-center gap-1.5"
                               >
                                 <Trash2 className="w-3.5 h-3.5" /> Delete Draft
                               </Button>
                             </>
                           )}
                         </div>

                         {/* Escrow Row */}
                         {(post.isEscrow || post.opportunity?.isEscrow) && (
                           <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
                             {(post.isEscrowFunded || post.opportunity?.isEscrowFunded) ? (
                               <>
                                 <span className="h-9 rounded-lg px-4 text-sm font-bold bg-green-50 text-green-700 border border-green-200 flex items-center gap-1.5">
                                   <Lock className="w-3.5 h-3.5" /> Escrow Active
                                 </span>
                                 <Button
                                   onClick={() => setPayoutJob(post)}
                                   variant="outline"
                                   className="h-9 rounded-lg px-4 text-sm font-bold border-purple-200 text-purple-700 hover:bg-purple-50 flex items-center gap-1.5"
                                 >
                                   <DollarSign className="w-3.5 h-3.5" /> Request Payout
                                 </Button>
                               </>
                             ) : (
                               <Button
                                 onClick={() => setEscrowJob(post)}
                                 variant="default"
                                 className="h-9 rounded-lg px-4 text-sm font-bold bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow"
                               >
                                 Deposit KES {post.escrowAmount || post.opportunity?.escrowAmount || 0}
                               </Button>
                             )}
                           </div>
                         )}
                       </div>
                    </div>





                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Unpublished Posts Section ─────────────────────────── */}
        {unpublishedPosts.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <EyeOff className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Unpublished Posts ({unpublishedPosts.length})</h3>
            </div>
            <div className="space-y-3">
              {unpublishedPosts.map(post => {
                const adminTookDown = post.unpublishedBy && post.unpublishedBy !== email;
                return (
                  <div key={post.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="inline-flex items-center gap-1 text-xs font-medium bg-slate-200 text-slate-600 rounded-full px-2 py-0.5">
                          <EyeOff className="w-3 h-3" /> Unpublished
                        </span>
                        {adminTookDown && (
                          <span className="text-xs text-red-500 font-medium">Taken down by admin</span>
                        )}
                      </div>
                      <p className="font-semibold text-slate-800 truncate">{post.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{post.category}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {adminTookDown ? (
                        <span
                          title="This post was taken down by an admin. Contact support to republish."
                          className="h-9 rounded-lg px-4 text-sm font-medium border border-slate-200 text-slate-400 flex items-center gap-1.5 cursor-not-allowed select-none"
                        >
                          <RefreshCcw className="w-3.5 h-3.5" /> Republish
                        </span>
                      ) : (
                        <Button
                          variant="outline"
                          className="h-9 rounded-lg px-4 text-sm font-medium border-green-200 text-green-700 hover:bg-green-50 flex items-center gap-1.5"
                          disabled={republishingId === post.id}
                          onClick={() => handleRepublishPost(post.id)}
                        >
                          <RefreshCcw className="w-3.5 h-3.5" />
                          {republishingId === post.id ? 'Publishing...' : 'Republish'}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        className="h-9 rounded-lg px-4 text-sm font-medium border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 flex items-center gap-1.5"
                        onClick={() => { setPostToDelete(post); setDeleteError(null); }}
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Expired Posts Section ─────────────────────────── */}
        {expiredPosts.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Expired Posts ({expiredPosts.length})</h3>
            </div>
            <div className="space-y-3">
              {expiredPosts.map(post => (
                <div key={post.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-50/50 border border-amber-200 rounded-xl p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full px-2 py-0.5">
                        <Clock className="w-3 h-3" /> Expired
                      </span>
                    </div>
                    <p className="font-semibold text-slate-800 truncate">{post.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{post.category}</p>
                  </div>
                  <div className="flex gap-2 shrink-0 flex-wrap">
                    <Link
                      to={`/manage/applicants/${post.id || post.opportunity?.id}`}
                      state={{ post }}
                      className="h-9 rounded-lg px-4 text-sm font-medium bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex items-center gap-1.5"
                    >
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      Applications ({post.applicantCount || 0})
                    </Link>
                    <Button
                      variant="outline"
                      className="h-9 rounded-lg px-4 text-sm font-medium border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 flex items-center gap-1.5"
                      onClick={() => { setPostToDelete(post); setDeleteError(null); }}
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Escrow Deposit Modal Component */}
        {escrowJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
              <div className="bg-blue-600 p-4 text-white">
                <h3 className="font-bold text-lg flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> Secure Escrow Deposit</h3>
                <p className="text-blue-100 text-sm mt-1">
                  {escrowApplicant ? `Fund the escrow to officially hire ${escrowApplicant.applicantEmail}.` : 'Fund your job post to automatically publish it.'}
                </p>
              </div>

              <div className="p-6">
                {escrowStatus === 'waiting' ? (
                  <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
                    <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6 relative">
                      <div className="absolute inset-0 rounded-full border-4 border-green-500 opacity-20 animate-ping"></div>
                      <Lock className="w-8 h-8 text-green-600 relative z-10" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-800 mb-2">Waiting for PIN...</h4>
                    <p className="text-slate-600 mb-6">Check your phone. Enter your M-PESA PIN to complete the KES {escrowJob.opportunity?.escrowAmount || 1000} deposit.</p>
                    {escrowMessage && (
                      <p className="text-amber-600 text-sm mb-4 font-medium bg-amber-50 p-2 rounded-lg text-center w-full">{escrowMessage}</p>
                    )}
                    <Button
                      className="w-full bg-[#131ADF] hover:bg-blue-700 font-bold mb-3"
                      onClick={handleCheckEscrowPayment}
                      disabled={isCheckingPayment}
                    >
                      {isCheckingPayment ? 'Checking...' : 'I Have Paid'}
                    </Button>
                    <Button variant="outline" onClick={() => setEscrowStatus('idle')} className="w-full text-slate-500">Cancel & Go Back</Button>
                  </div>
                ) : escrowStatus === 'success' ? (
                  <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-800 mb-2">Escrow Funded!</h4>
                    <p className="text-slate-600 mb-6 font-medium">{escrowMessage}</p>
                    <Button onClick={() => { setEscrowJob(null); setEscrowApplicant(null); setEscrowStatus('idle'); setCheckoutRequestId(null); }} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold">Done</Button>
                  </div>
                ) : escrowStatus === 'failed' ? (
                  <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <AlertCircle className="w-10 h-10" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-800 mb-2">Payment Failed</h4>
                    <p className="text-slate-600 mb-6 font-medium text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{escrowMessage}</p>
                    <Button onClick={() => setEscrowStatus('idle')} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold mb-2">Try Again</Button>
                    <Button variant="ghost" onClick={() => { setEscrowJob(null); setEscrowApplicant(null); setEscrowStatus('idle'); setCheckoutRequestId(null); }} className="w-full">Cancel</Button>
                  </div>
                ) : (
                  <>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 text-center">
                      <p className="text-sm text-slate-500 mb-1">Amount to deposit</p>
                      <p className="text-3xl font-bold text-slate-800">KES {escrowJob.opportunity?.escrowAmount || 1000}</p>
                      <p className="text-xs text-slate-500 mt-2 font-medium">via M-PESA STK Push (Sandbox)</p>
                    </div>

                    {escrowMessage && (
                      <div className={`p-3 rounded-lg text-sm mb-4 border ${escrowMessage.includes('Check your phone') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {escrowMessage}
                      </div>
                    )}

                    <form onSubmit={handleEscrowDeposit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">M-PESA Phone Number</label>
                        <Input
                          type="text"
                          placeholder="e.g. 254712345678"
                          required
                          value={escrowPhone}
                          onChange={(e) => setEscrowPhone(e.target.value)}
                          className="border-slate-300"
                        />
                        <p className="text-xs text-slate-500 mt-1">Use the format 2547... Note this is a Sandbox simulation.</p>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" className="flex-1" onClick={() => { setEscrowJob(null); setEscrowApplicant(null); setEscrowMessage(null); setEscrowStatus('idle'); }}>Cancel</Button>
                        <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white" disabled={escrowLoading || !escrowPhone}>
                          {escrowLoading ? 'Initiating...' : 'Send M-PESA Prompt'}
                        </Button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation & Success Modal Component */}
        {postToDelete && (
          <div
            id="delete-modal-dialog"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={(e) => {
              if (e.target === e.currentTarget && !deleteLoading) {
                setPostToDelete(null);
                setDeleteError(null);
                setShowDeleteSuccess(false);
              }
            }}
          >
            <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl relative flex flex-col scale-100 animate-in zoom-in-95 duration-200 transition-all">
              {showDeleteSuccess ? (
                <div className="text-center animate-in fade-in zoom-in duration-300">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Deleted Successfully!</h3>
                  <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                    The opportunity has been completely removed and will no longer appear on your dashboard.
                  </p>
                  <button
                    onClick={() => {
                      setShowDeleteSuccess(false);
                      setPostToDelete(null);
                    }}
                    className="w-full py-4 text-xl font-bold text-white rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                    style={{ backgroundColor: '#0933ed', borderRadius: '10px' }}
                  >
                    Got it, thanks!
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-6">
                    <Trash2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Delete Opportunity?</h3>
                  <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                    Are you sure you want to delete <br /><br /><span className="font-bold text-gray-900">"{postToDelete.title}"</span>?<br /><br />This action cannot be undone.
                  </p>

                  {deleteError && (
                    <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl mb-6 border border-red-200 text-left flex items-start gap-2">
                      <div className="mt-0.5"><AlertCircle className="w-5 h-5" /></div>
                      <div className="flex-1 font-medium">{deleteError}</div>
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      className="w-full py-3.5 rounded-xl font-medium text-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                      onClick={handleDeletePending}
                      disabled={deleteLoading}
                    >
                      {deleteLoading ? (
                        <span className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin mr-3" />
                          Deleting...
                        </span>
                      ) : 'Yes, Delete it'}
                    </button>
                    <button
                      type="button"
                      className="w-full py-3.5 rounded-xl font-medium text-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                      onClick={() => { setPostToDelete(null); setDeleteError(null); }}
                      disabled={deleteLoading}
                    >
                      Cancel, keep it
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payout Request Modal Component */}
        {payoutJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
              <div className="bg-purple-600 p-4 text-white">
                <h3 className="font-bold text-lg flex items-center gap-2"><DollarSign className="w-5 h-5" /> Request Payout</h3>
                <p className="text-purple-100 text-sm mt-1">Submit an expense request to draw funds from your project pool.</p>
              </div>

              <div className="bg-amber-50 p-3 border-b border-amber-100 text-center">
                <p className="text-xs text-amber-700 font-medium">
                  <span className="font-bold uppercase tracking-wider">Urgent Payment?</span> Submit this form first, then call/WhatsApp <strong>+254 707 801 868</strong> to expedite processing.
                </p>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {payoutSuccess ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">Request Submitted!</h4>
                    <p className="text-slate-600 mb-6">Our admins will review your receipt and process the payment directly to the provided Paybill/Account.</p>
                    <Button onClick={() => { setPayoutJob(null); setPayoutSuccess(false); setPayoutMessage(null); }} className="w-full font-bold">Close</Button>
                  </div>
                ) : (
                  <form onSubmit={handlePayoutRequestSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Expense Type</label>
                      <select
                        required
                        value={payoutForm.expenseType}
                        onChange={(e) => setPayoutForm({ ...payoutForm, expenseType: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-purple-500 bg-slate-50"
                      >
                        <option value="vendor">Direct Vendor/Supplier Payment</option>
                        <option value="contingency">Transport / Contingency</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Business / Recipient Name</label>
                      <Input
                        required placeholder="e.g. Davis & Shirtliff Ltd"
                        value={payoutForm.vendorName} onChange={e => setPayoutForm({ ...payoutForm, vendorName: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Reason / Item Bought</label>
                      <Input
                        required placeholder="e.g. 1 Water Pump, 50m Pipe"
                        value={payoutForm.reason} onChange={e => setPayoutForm({ ...payoutForm, reason: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Amount (KES)</label>
                        <Input
                          required type="number" min="1" placeholder="50000"
                          value={payoutForm.amount} onChange={e => setPayoutForm({ ...payoutForm, amount: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Paybill / BuyGoods / Till</label>
                        <Input
                          required placeholder="e.g. 123456"
                          value={payoutForm.paybillNumber} onChange={e => setPayoutForm({ ...payoutForm, paybillNumber: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Upload Receipt / Invoice</label>
                      <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:bg-slate-50 transition-colors">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          required
                          onChange={(e) => setPayoutReceipt(e.target.files ? e.target.files[0] : null)}
                          className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                        />
                      </div>
                    </div>

                    {payoutMessage && (
                      <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">{payoutMessage}</div>
                    )}

                    <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                      <Button type="button" variant="outline" className="flex-1 font-semibold" onClick={() => setPayoutJob(null)} disabled={payoutLoading}>Cancel</Button>
                      <Button type="submit" className="flex-1 font-bold bg-purple-600 hover:bg-purple-700 text-white" disabled={payoutLoading}>
                        {payoutLoading ? 'Submitting...' : 'Submit Request'}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Sliding Profile Drawer */}
      {slidingApplicant && (
        <div className="fixed inset-0 z-[60] flex justify-end bg-black/40 backdrop-blur-sm transition-opacity" onClick={(e) => { if(e.target === e.currentTarget) setSlidingApplicant(null); }}>
          <div className="w-full max-w-3xl bg-white shadow-2xl h-full flex flex-col transform transition-transform duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white shadow-sm z-10">
              <h3 className="font-semibold text-slate-800">Applicant Profile</h3>
              <Button variant="ghost" size="icon" onClick={() => setSlidingApplicant(null)} className="rounded-full hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </Button>
            </div>
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto bg-slate-50 relative">
              <ProfileView
                emailProp={slidingApplicant.email}
                isSlider={true}
                bottomActions={
                  (slidingApplicant.app.status === 'pending' || !slidingApplicant.app.status || slidingApplicant.app.status === 'shortlisted') ? (
                    <>
                      <Button variant="outline" className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 shadow-sm" onClick={() => { handleUpdateApplicantStatus(slidingApplicant.app._id, 'rejected'); setSlidingApplicant(null); }}>Deny</Button>
                      {slidingApplicant.post.category === 'Job' || slidingApplicant.post.category === 'Gig' || slidingApplicant.post.opportunity?.category === 'Job' || slidingApplicant.post.opportunity?.category === 'Gig' ? (
                        <Button variant="default" className="flex-[2] bg-green-600 hover:bg-green-700 text-white shadow-sm font-bold" onClick={() => { setSlidingApplicant(null); setEscrowJob(slidingApplicant.post); setEscrowApplicant(slidingApplicant.app); }}>Hire & Deposit Escrow</Button>
                      ) : (
                        <Button variant="default" className="flex-[2] bg-green-600 hover:bg-green-700 text-white shadow-sm font-bold" onClick={() => { handleUpdateApplicantStatus(slidingApplicant.app._id, 'approved'); setSlidingApplicant(null); }}>Approve</Button>
                      )}
                    </>
                  ) : null
                }
              />

               {/* Deliverable Tracking Panel */}
               {slidingApplicant.app.tracks && slidingApplicant.app.tracks.length > 0 && slidingApplicant.app.tracks.some((t: any) => t.deliverables && t.deliverables.length > 0) && (
                 <div className="border-t border-slate-200 bg-white p-4">
                   <h4 className="text-sm font-bold text-slate-800 mb-3">Deliverables</h4>
                   {slidingApplicant.app.tracks.filter((t: any) => t.deliverables && t.deliverables.length > 0).map((track: any) => {
                     // Get quality rules from the opportunity's track definition
                     const oppTrack = slidingApplicant.post?.opportunity?.applicationForm?.tracks?.find((t: any) => t.id === track.trackId)
                                     || slidingApplicant.post?.applicationForm?.tracks?.find((t: any) => t.id === track.trackId);
                     const qualityRules = oppTrack?.qualityRules || [];

                     return (
                       <div key={track.trackId} className="mb-4">
                         <p className="text-xs font-semibold text-slate-600 mb-2">{track.trackLabel}</p>
                         <div className="space-y-2">
                           {track.deliverables.map((del: any) => (
                             <div key={del.id} className="rounded border border-slate-100 p-2 bg-slate-50 space-y-1">
                               <div className="flex items-center justify-between gap-2">
                                 <div className="flex-1 min-w-0">
                                   <p className="text-xs font-medium text-slate-700 truncate">{del.title}</p>
                                   <p className="text-xs text-slate-500">KES {del.amount?.toLocaleString()}</p>
                                   {del.submittedUrl && (
                                     <a href={del.submittedUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline truncate block">
                                       View Submission
                                     </a>
                                   )}
                                 </div>
                                 <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                                   del.status === 'paid' ? 'bg-green-100 text-green-700' :
                                   del.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                                   del.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                   del.status === 'disputed' ? 'bg-amber-100 text-amber-700' :
                                   'bg-gray-100 text-gray-600'
                                 }`}>
                                   {del.status}
                                 </span>
                               </div>

                               {/* Action buttons for submitted deliverables */}
                               {del.status === 'submitted' && (
                                 <div className="flex items-center gap-1 pt-1">
                                   {qualityRules.length > 0 ? (
                                     <select
                                       onChange={(e) => {
                                         if (e.target.value) {
                                           handleReleaseDeliverable(slidingApplicant.app._id, track.trackId, del.id, e.target.value);
                                           e.target.value = '';
                                         }
                                       }}
                                       className="text-xs px-2 py-1 rounded border border-gray-200 bg-white"
                                       defaultValue=""
                                     >
                                       <option value="" disabled>Mark Complete...</option>
                                       {qualityRules.map((rule: any, ri: number) => (
                                         <option key={ri} value={rule.level}>
                                           {rule.label || rule.level} ({rule.percentage}%)
                                         </option>
                                       ))}
                                     </select>
                                   ) : (
                                     <Button
                                       size="sm"
                                       className="h-6 px-2 text-xs bg-green-600 hover:bg-green-700 text-white"
                                       onClick={() => handleReleaseDeliverable(slidingApplicant.app._id, track.trackId, del.id, 'satisfactory')}
                                     >
                                       Pay Full
                                     </Button>
                                   )}
                                   <Button
                                     size="sm"
                                     variant="outline"
                                     className="h-6 px-2 text-xs text-red-600 border-red-200 hover:bg-red-50"
                                     onClick={() => handleRejectDeliverable(slidingApplicant.app._id, track.trackId, del.id)}
                                   >
                                     Reject
                                   </Button>
                                   <Button
                                     size="sm"
                                     variant="ghost"
                                     className="h-6 px-2 text-xs text-amber-600"
                                     onClick={() => handleDisputeDeliverable(slidingApplicant.app._id, track.trackId, del.id, 'poster')}
                                   >
                                     Dispute
                                   </Button>
                                 </div>
                               )}

                               {/* Resubmit button for rejected deliverables */}
                               {del.status === 'rejected' && del.adminNote && (
                                 <p className="text-xs text-red-600 mt-1">Reason: {del.adminNote}</p>
                               )}

                               {/* Dispute info */}
                               {del.status === 'disputed' && del.disputeReason && (
                                 <div className="text-xs text-amber-700 mt-1 bg-amber-50 rounded p-1">
                                   Dispute: {del.disputeReason}
                                 </div>
                               )}
                             </div>
                           ))}
                         </div>
                         <div className="mt-2 text-xs text-slate-500">
                           {track.deliverables.filter((d: any) => d.status === 'paid').length}/{track.deliverables.length} complete
                           {' '}(KES {track.deliverables.filter((d: any) => d.status === 'paid').reduce((s: number, d: any) => s + (d.paidAmount || d.amount || 0), 0).toLocaleString()} paid of {track.deliverables.reduce((s: number, d: any) => s + (d.amount || 0), 0).toLocaleString()})
                         </div>
                       </div>
                     );
                   })}
                 </div>
               )}
             </div>
           </div>
         </div>
       )}

      {/* Edit Request Modal */}
      {editRequestPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-amber-500 p-4 text-white">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                Request Edit
              </h3>
              <p className="text-amber-100 text-sm mt-1">
                Submit changes for "{editRequestPost.title}" — admin will review.
              </p>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {editRequestSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Edit Request Submitted!</h4>
                  <p className="text-slate-600 mb-6">Our admins will review your changes and approve or request adjustments.</p>
                  <Button onClick={() => { setEditRequestPost(null); setEditRequestSuccess(false); setEditRequestForm({ title: '', description: '', fullDescription: '', deadline: '', location: '', applicationLink: '', changeReason: '' }); }} className="w-full font-bold bg-green-600 hover:bg-green-700 text-white">Done</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmitEditRequest} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Title</label>
                    <Input value={editRequestForm.title} onChange={e => setEditRequestForm({ ...editRequestForm, title: e.target.value })} placeholder={editRequestPost.title} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Short Description</label>
                    <textarea value={editRequestForm.description} onChange={e => setEditRequestForm({ ...editRequestForm, description: e.target.value })} placeholder={editRequestPost.description} rows={2} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-blue-500 bg-slate-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Full Description</label>
                    <textarea value={editRequestForm.fullDescription} onChange={e => setEditRequestForm({ ...editRequestForm, fullDescription: e.target.value })} placeholder={editRequestPost.fullDescription || editRequestPost.opportunity?.fullDescription || ''} rows={4} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-blue-500 bg-slate-50" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Deadline</label>
                      <Input value={editRequestForm.deadline} onChange={e => setEditRequestForm({ ...editRequestForm, deadline: e.target.value })} placeholder={editRequestPost.deadline || 'Rolling'} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Location</label>
                      <Input value={editRequestForm.location} onChange={e => setEditRequestForm({ ...editRequestForm, location: e.target.value })} placeholder={editRequestPost.location || 'N/A'} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Application Link</label>
                    <Input value={editRequestForm.applicationLink} onChange={e => setEditRequestForm({ ...editRequestForm, applicationLink: e.target.value })} placeholder={editRequestPost.applicationLink || 'https://...'} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Reason for Changes <span className="text-red-500">*</span></label>
                    <textarea
                      required
                      value={editRequestForm.changeReason}
                      onChange={e => setEditRequestForm({ ...editRequestForm, changeReason: e.target.value })}
                      placeholder="Explain why you need these changes..."
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-blue-500 bg-slate-50"
                    />
                  </div>

                  {editRequestError && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">{editRequestError}</div>
                  )}

                  <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                    <Button type="button" variant="outline" className="flex-1 font-semibold" onClick={() => { setEditRequestPost(null); setEditRequestError(null); }} disabled={editRequestLoading}>Cancel</Button>
                    <Button type="submit" className="flex-1 font-bold bg-amber-500 hover:bg-amber-600 text-white" disabled={editRequestLoading || !editRequestForm.changeReason.trim()}>
                      {editRequestLoading ? 'Submitting...' : 'Submit Edit Request'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
