import { useEffect, useState } from 'react';
import { OTPLoginForm } from './OTPLoginForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogOut, Briefcase, Users, ChevronDown, ChevronUp, Calendar, ExternalLink, ShieldCheck, Trash2, Mail, AlertCircle, DollarSign, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
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

export function PosterDashboard() {
  const [token, setToken] = useState(localStorage.getItem('user_token'));
  const [email, setEmail] = useState(localStorage.getItem('user_email'));
  
  const [livePosts, setLivePosts] = useState<Post[]>([]);
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  // Escrow Deposit State
  const [escrowJob, setEscrowJob] = useState<Post | null>(null);
  const [escrowPhone, setEscrowPhone] = useState('');
  const [escrowLoading, setEscrowLoading] = useState(false);
  const [escrowMessage, setEscrowMessage] = useState<string | null>(null);

  // Escrow Release State
  const [releaseJob, setReleaseJob] = useState<{ post: Post; app: Applicant } | null>(null);
  const [releaseLoading, setReleaseLoading] = useState(false);
  const [releaseMessage, setReleaseMessage] = useState<string | null>(null);

  // Delete State
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchPosts = async (currentToken: string) => {
    setLoading(true);
    setError(null);
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
      alert(err.message);
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
      setPostToDelete(null);
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
      
      setEscrowMessage(data.message || 'Check your phone for the M-PESA prompt.');
      
      // Auto close after 5 seconds if successful
      setTimeout(() => {
         setEscrowJob(null);
         setEscrowMessage(null);
         setEscrowPhone('');
      }, 5000);
      
    } catch (err: any) {
      setEscrowMessage(err.message);
    } finally {
      setEscrowLoading(false);
    }
  };


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
      setReleaseMessage(`âœ… ${data.message} Net payout: KES ${data.netPayable}`);
      // Update local state
      setApplicants(prev => prev.map(a => a._id === app._id ? { ...a, escrowReleaseRequested: true } as any : a));
    } catch (err: any) {
      setReleaseMessage(`âŒ ${err.message}`);
    } finally {
      setReleaseLoading(false);
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
    <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm relative overflow-hidden">
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
            
            <div className="space-y-5">
              {allPosts.map((post) => (
                <div key={post._id} className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-blue-100 group space-y-0">
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
                         
                         {/* Escrow Label */}
                           {(post.isEscrow || post.opportunity?.isEscrow || (post.escrowAmount ?? 0) > 0 || (post.opportunity?.escrowAmount ?? 0) > 0) && (
                            <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold leading-none border border-blue-200">
                              <ShieldCheck className="w-3 h-3" /> Escrow
                            </span>
                         )}
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{post.title}</h4>
                      <p className="text-sm text-gray-500 mt-2 flex items-center gap-1.5 font-medium">
                         <Calendar className="w-4 h-4" /> 
                         {post.dateAdded || post.submittedAt ? new Date(post.dateAdded || post.submittedAt || '').toLocaleDateString() : 'N/A'}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                       {post.isLive && (
                         <Button asChild variant="outline" className="w-full sm:w-auto rounded-xl px-5 h-11 font-semibold border-gray-200 text-gray-700 hover:bg-gray-50">
                           <Link to={`/opportunity/${toSlug(post.title)}`} target="_blank">
                             View Live <ExternalLink className="w-4 h-4 ml-2 text-gray-400" />
                           </Link>
                         </Button>
                       )}
                       
                       {/* Deposit Escrow Button (for pending jobs that requested escrow) */}
                       {((post.isEscrow || post.opportunity?.isEscrow) && !(post.isEscrowFunded || post.opportunity?.isEscrowFunded)) && (
                         <Button 
                           onClick={() => setEscrowJob(post)}
                           variant="default"
                           className="w-full sm:w-auto rounded-xl px-5 h-11 font-bold bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow"
                         >
                           Deposit KES {post.escrowAmount || post.opportunity?.escrowAmount || 0}
                         </Button>
                       )}
                       
                       {!post.isLive && (
                         <Button 
                           onClick={() => { setPostToDelete(post); setDeleteError(null); }}
                           variant="outline"
                           className="w-full sm:w-auto rounded-xl px-5 h-11 font-semibold border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200"
                         >
                           <Trash2 className="w-4 h-4 mr-2" /> Delete
                         </Button>
                       )}

                       {(post.applicationForm?.isEnabled || post.opportunity?.applicationForm?.isEnabled || true) && post.isLive && (
                          <Button 
                            onClick={() => fetchApplicants(post.id)}
                            variant={expandedPostId === post.id ? 'default' : 'outline'} 
                            className={`w-full sm:w-auto rounded-xl px-5 h-11 font-semibold transition-all ${expandedPostId === post.id ? 'bg-blue-600 text-white shadow hover:bg-blue-700' : 'border-blue-100 text-blue-600 bg-blue-50/50 hover:bg-blue-100 hover:border-blue-200'}`}
                          >
                            <Users className="w-4 h-4 mr-2 opacity-80" />
                            Applicants
                            {expandedPostId === post.id ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                          </Button>
                       )}
                    </div>
                  </div>

                  {/* Applicants Expansion Area */}
                  {expandedPostId === post.id && (
                    <div className="bg-slate-50 border-t border-slate-200 p-5">
                       {loadingApplicants ? (
                         <div className="flex items-center justify-center py-8 text-blue-600">
                           <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2" /> Loading applicants...
                         </div>
                       ) : applicants.length === 0 ? (
                         <div className="text-center py-6 text-slate-500">
                           No applications received yet for this position.
                         </div>
                       ) : (
                         <div className="space-y-4">
                           <h5 className="font-bold text-slate-800 flex items-center gap-2">
                             <Users className="w-4 h-4" /> Received Applications ({applicants.length})
                           </h5>
                           <div className="grid gap-4 md:grid-cols-2">
                             {applicants.map((app, idx) => (
                               <div key={app._id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm relative flex flex-col h-full">
                                  <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-slate-700 text-sm">Applicant {idx + 1}</span>
                                      {app.status && (
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                          app.status === 'approved' || app.status === 'paid' ? 'bg-green-100 text-green-700' :
                                          app.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                                          app.status === 'disputed' ? 'bg-red-600 text-white' :
                                          app.status.startsWith('resolved_') ? 'bg-blue-600 text-white' :
                                          'bg-yellow-100 text-yellow-700'
                                        }`}>
                                          {app.status.toUpperCase()}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-xs text-slate-400">{new Date(app.appliedAt).toLocaleString()}</span>
                                  </div>
                                  <div className="space-y-2 text-sm flex-1">
                                     <div className="grid grid-cols-[100px_1fr] gap-2">
                                       <span className="text-slate-500 font-medium">Email:</span>
                                       <span className="text-slate-900 break-all">
                                          <a href={`mailto:${app.applicantEmail}`} className="text-blue-600 hover:underline">{app.applicantEmail}</a>
                                       </span>
                                     </div>
                                     {Object.entries(app.applicantData).map(([key, value]) => {
                                        if (key === 'email') return null; // skip redundant email
                                        const isUrl = String(value).startsWith('http');
                                        return (
                                          <div key={key} className="grid grid-cols-[100px_1fr] gap-2">
                                            <span className="text-slate-500 font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
                                            <span className="text-slate-900 break-words">
                                              {isUrl ? <a href={value as string} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center">View Link <ExternalLink className="w-3 h-3 ml-1"/></a> : value as React.ReactNode}
                                            </span>
                                          </div>
                                        );
                                     })}
                                  </div>
                                  
                                  {/* Actions */}
                                  <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2 justify-end">
                                    {(app.status === 'pending' || !app.status) && (
                                      <>
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                          onClick={() => handleUpdateApplicantStatus(app._id, 'rejected')}
                                        >
                                          Reject
                                        </Button>
                                        <Button 
                                          variant="default" 
                                          size="sm" 
                                          className="bg-green-600 hover:bg-green-700"
                                          onClick={() => handleUpdateApplicantStatus(app._id, 'approved')}
                                        >
                                          Approve for Work
                                        </Button>
                                      </>
                                    )}
                                    {app.status === 'approved' && (
                                      <p className="text-xs text-green-600 font-medium my-auto text-right w-full">
                                        Approved! Candidate can now see your contact info.
                                      </p>
                                    )}
                                    {app.status === 'rejected' && (
                                      <p className="text-xs text-red-500 font-medium my-auto text-right w-full">
                                        Rejected.
                                      </p>
                                    )}
                                    {app.status === 'disputed' && (
                                      <div className="w-full flex items-center justify-between bg-red-50 p-2 rounded border border-red-100">
                                        <p className="text-xs text-red-700 font-bold">Dispute in Progress</p>
                                        <p className="text-[10px] text-red-600 text-right max-w-[150px]">Admins are reviewing this offline. Check your email.</p>
                                      </div>
                                    )}
                                    {app.status.startsWith('resolved_') && (
                                      <p className="text-xs text-blue-600 font-medium my-auto text-right w-full">
                                        Dispute Resolved ({app.status.split('_')[1]})
                                      </p>
                                    )}
                                  </div>
                               </div>
                             ))}
                           </div>
                         </div>
                       )}
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
                    <Button type="button" variant="outline" className="flex-1" onClick={() => { setEscrowJob(null); setEscrowMessage(null); }}>Cancel</Button>
                    <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white" disabled={escrowLoading || !escrowPhone}>
                      {escrowLoading ? 'Initiating...' : 'Send M-PESA Prompt'}
                    </Button>
                  </div>
               </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Component */}
      {postToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col scale-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Opportunity?</h3>
              <p className="text-slate-500 text-sm mb-6">
                Are you sure you want to delete <span className="font-semibold text-slate-800">"{postToDelete.title}"</span>? This action cannot be undone.
              </p>

              {deleteError && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 border border-red-100 text-left flex items-start gap-2">
                  <div className="mt-0.5"><AlertCircle className="w-4 h-4" /></div>
                  <div className="flex-1">{deleteError}</div>
                </div>
              )}

              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 border-slate-200 hover:bg-slate-50 hover:text-slate-700" 
                  onClick={() => { setPostToDelete(null); setDeleteError(null); }}
                  disabled={deleteLoading}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  className="flex-1 border-red-200 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 font-medium shadow-sm transition-colors" 
                  onClick={handleDeletePending}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <span className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin mr-2" />
                      Deleting...
                    </span>
                  ) : 'Yes, Delete'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
