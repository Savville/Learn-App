import { useEffect, useState } from 'react';
import { OTPLoginForm } from '../../components/OTPLoginForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogOut, Briefcase, Users, ChevronDown, ChevronUp, Calendar, ExternalLink, ShieldCheck, Trash2, Mail, AlertCircle, DollarSign, Lock, Clock, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toSlug } from '@/utils/dateUtils';

interface Post {
  _id: string;
  id: string;
  title: string;
  status: string;
  category: string;
  views?: number;
  clicks?: number;
  dateAdded?: string;
  submittedAt?: string;
  opportunity?: any; // for pending posts structure
  originalOpportunity?: any; // tracking history and edits
  applicationForm?: any;
  isLive?: boolean;
  isEscrow?: boolean;
  escrowAmount?: number;
  isEscrowFunded?: boolean;
}

interface Applicant {
  _id: string;
  applicantEmail: string;
  applicantData: Record<string, any>;
  appliedAt: string;
  status: string;
}

export function ManageDashboard() {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem('user_token'));
  const [email, setEmail] = useState(localStorage.getItem('user_email'));
  
  const [livePosts, setLivePosts] = useState<Post[]>([]);
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [escrowMessage, setEscrowMessage] = useState<string | null>(null);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [escrowStatus, setEscrowStatus] = useState<'idle' | 'waiting' | 'success' | 'failed'>('idle');

  const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';

  // Escrow Deposit State
  const [escrowJob, setEscrowJob] = useState<Post | null>(null);
  const [escrowPhone, setEscrowPhone] = useState('');
  const [escrowLoading, setEscrowLoading] = useState(false);

  // Delete State
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const fetchPosts = async (currentToken: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/public/me/posts`, {
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPosts(token);
    }
  }, [token]);

  const handleSuccess = (newToken: string, newEmail: string) => {
    setToken(newToken);
    setEmail(newEmail);
  };

  const handleLogout = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_email');
    setToken(null);
    setEmail(null);
    setLivePosts([]);
    setPendingPosts([]);
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
        body: JSON.stringify({ amount, phone: escrowPhone, opportunityId })
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

  if (!token) {
    return (
      <OTPLoginForm 
        onSuccess={handleSuccess} 
        title="Manage Your Postings" 
        subtitle="Enter your email to view your posts and review applicants."
      />
    );
  }

  const allPosts = [
    ...livePosts.map(p => ({ ...p, isLive: true })), 
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
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner flex-shrink-0">
            <Briefcase className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Postings Dashboard</h2>
            <p className="text-gray-500 mt-1">Logged in as <span className="font-medium text-gray-700">{email}</span></p>
          </div>
        </div>
        <button onClick={handleLogout} className="px-5 py-2.5 rounded-full border border-gray-200 text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-colors font-semibold flex items-center shadow-sm">
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </button>
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
                         <span className={`px-3 py-1 rounded-full text-xs font-bold leading-none ${
                           post.isLive ? 'bg-green-100 text-green-700' : 
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

                    <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                       {(post.isLive || post.status === 'Verified') && (
                         <Button asChild variant="outline" className="w-full sm:w-auto rounded-xl px-5 h-11 font-semibold border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center">
                           <Link to={`/opportunity/${toSlug(post.title)}`} target="_blank">
                             View Live <ExternalLink className="w-4 h-4 ml-2 text-gray-400" />
                           </Link>
                         </Button>
                       )}
                       
                       {/* Deposit Escrow Button — only if not yet funded */}
                       {(post.isEscrow || post.opportunity?.isEscrow) && (
                         (post.isEscrowFunded || post.opportunity?.isEscrowFunded) ? (
                           <span className="w-full sm:w-auto rounded-xl px-5 h-11 font-bold bg-green-50 text-green-700 border border-green-200 flex items-center justify-center gap-1.5 text-sm">
                             <Lock className="w-4 h-4" /> Escrow Active
                           </span>
                         ) : (
                           <Button
                             onClick={() => setEscrowJob(post)}
                             variant="default"
                             className="w-full sm:w-auto rounded-xl px-5 h-11 font-bold bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow"
                           >
                             Deposit KES {post.escrowAmount || post.opportunity?.escrowAmount || 0}
                           </Button>
                         )
                       )}
                       
                       <Button 
                          onClick={() => navigate(`/manage/edit/${post.id || post.opportunity?.id}`, { state: { editPost: post.isLive ? post : post.opportunity || post.originalOpportunity || post } })}
                          variant="outline"
                          className="w-full sm:w-auto rounded-xl px-5 h-11 font-semibold border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          Edit
                        </Button>

                       {!post.isLive && post.status !== 'Verified' && (
                         <Button 
                           onClick={() => { 
                             setPostToDelete(post); 
                             setDeleteError(null); 
                             setTimeout(() => {
                               document.getElementById('delete-modal-dialog')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                             }, 50);
                           }}
                           variant="outline"
                           className="w-full sm:w-auto rounded-xl px-5 h-11 font-semibold border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                         >
                           <Trash2 className="w-4 h-4 mr-2" /> Delete
                         </Button>
                       )}
                    </div>
                  </div>

                  {/* New Inbox Action Area directly below the posting info */}
                  {(post.applicationForm?.isEnabled || post.opportunity?.applicationForm?.isEnabled || true) && (post.isLive || post.status === 'Verified') && (
                    <div className="bg-slate-50/50 border-t border-slate-100 p-4 shrink-0 flex justify-end">
                      <Button 
                        onClick={() => navigate(`/manage/applicants/${post.id || post.opportunity?.id}`)}
                        variant="outline"
                        className="w-full sm:w-auto rounded-xl px-6 h-12 font-medium transition-all bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      >
                        <Users className="w-4 h-4 mr-2 text-slate-500" />
                        <span>View Applicants</span>
                      </Button>
                    </div>
                  )}

                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Escrow Deposit Modal Component */}
      {escrowJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="bg-blue-600 p-4 text-white">
               <h3 className="font-bold text-lg flex items-center gap-2"><ShieldCheck className="w-5 h-5"/> Secure Escrow Deposit</h3>
               <p className="text-blue-100 text-sm mt-1">Fund your job post to automatically publish it.</p>
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
                   <Button variant="outline" onClick={() => setEscrowStatus('idle')} className="text-slate-500">Cancel & Go Back</Button>
                 </div>
               ) : escrowStatus === 'success' ? (
                 <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
                   <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                     <CheckCircle className="w-10 h-10" />
                   </div>
                   <h4 className="text-xl font-bold text-slate-800 mb-2">Escrow Funded!</h4>
                   <p className="text-slate-600 mb-6 font-medium">{escrowMessage}</p>
                   <Button onClick={() => { setEscrowJob(null); setEscrowStatus('idle'); setCheckoutRequestId(null); }} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold">Done</Button>
                 </div>
               ) : escrowStatus === 'failed' ? (
                 <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
                   <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                     <AlertCircle className="w-10 h-10" />
                   </div>
                   <h4 className="text-xl font-bold text-slate-800 mb-2">Payment Failed</h4>
                   <p className="text-slate-600 mb-6 font-medium text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{escrowMessage}</p>
                   <Button onClick={() => setEscrowStatus('idle')} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold mb-2">Try Again</Button>
                   <Button variant="ghost" onClick={() => { setEscrowJob(null); setEscrowStatus('idle'); setCheckoutRequestId(null); }} className="w-full">Cancel</Button>
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
                        <Button type="button" variant="outline" className="flex-1" onClick={() => { setEscrowJob(null); setEscrowMessage(null); setEscrowStatus('idle'); }}>Cancel</Button>
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
                  Are you sure you want to delete <br/><br/><span className="font-bold text-gray-900">"{postToDelete.title}"</span>?<br/><br/>This action cannot be undone.
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

    </div>
    </>
  );
}
