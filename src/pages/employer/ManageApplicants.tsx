import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, ExternalLink, ShieldCheck, Lock, DollarSign, Clock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { OTPLoginForm } from '../../components/OTPLoginForm';

interface Post {
  _id: string;
  id: string;
  title: string;
  status: string;
  category: string;
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

export function ManageApplicants() {
  const { id } = useParams<{ id: string }>();
  const [token, setToken] = useState(localStorage.getItem('user_token'));
  const [post, setPost] = useState<Post | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [releaseLoading, setReleaseLoading] = useState(false);
  const [releaseMessage, setReleaseMessage] = useState<string | null>(null);

  const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (!token || !id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch posts to find the specific post
        const postRes = await fetch(`${API_BASE}/public/me/posts`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const postData = await postRes.json();
        
        let foundPost = postData.live?.find((p: any) => p.id === id);
        if (!foundPost) {
          foundPost = postData.pending?.find((p: any) => p.opportunity?.id === id || p.id === id);
          if (foundPost) {
            foundPost = { ...foundPost, ...foundPost.opportunity, isLive: false };
          }
        } else {
          foundPost.isLive = true;
        }
        
        setPost(foundPost || null);

        // Fetch applicants
        const appRes = await fetch(`${API_BASE}/public/me/posts/${id}/applicants`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const appData = await appRes.json();
        if (appRes.ok) {
          setApplicants(appData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, id]);

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
      
      setApplicants(prev => prev.map(a => a._id === appId ? { ...a, status: newStatus } : a));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReleaseEscrow = async (postItem: Post, app: Applicant) => {
    if (!window.confirm(`Release KES ${postItem.escrowAmount} escrow to ${app.applicantEmail}? This cannot be undone.`)) return;
    setReleaseLoading(true);
    setReleaseMessage(null);
    try {
      const res = await fetch(`${API_BASE}/public/me/posts/${postItem.id}/release-escrow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ applicationId: app._id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to request release');
      setReleaseMessage(`✅ ${data.message} Net payout: KES ${data.netPayable}`);
      setApplicants(prev => prev.map(a => a._id === app._id ? { ...a, escrowReleaseRequested: true } as any : a));
    } catch (err: any) {
      setReleaseMessage(`❌ ${err.message}`);
    } finally {
      setReleaseLoading(false);
    }
  };

  if (!token) {
    return (
      <OTPLoginForm 
        onSuccess={(newToken) => setToken(newToken)} 
        title="Review Applicants" 
        subtitle="Log in to view applications for your post."
      />
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center bg-white rounded-3xl shadow-sm mt-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Opportunity Not Found</h2>
        <p className="text-gray-500 mb-6">We couldn't find this opportunity, or you don't have permission to view it.</p>
        <Link to="/manage" className="text-blue-600 hover:underline">← Back to Dashboard</Link>
      </div>
    );
  }

  const isJobOrGig = post.category === 'Job' || post.category === 'Gig';

  const renderApplicantCard = (app: Applicant, idx: number) => (
    <div key={app._id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative flex flex-col h-full shrink-0 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Applicant {idx + 1}</span>
          {app.status && (
            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
              app.status === 'approved' || app.status === 'paid' ? 'bg-green-100 text-green-700' :
              app.status === 'rejected' ? 'bg-red-100 text-red-700' : 
              app.status === 'disputed' ? 'bg-red-600 text-white' :
              app.status === 'shortlisted' ? 'bg-purple-100 text-purple-700' :
              app.status === 'interviewing' ? 'bg-blue-100 text-blue-700' :
              app.status.startsWith('resolved_') ? 'bg-blue-600 text-white' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {app.status}
            </span>
          )}
        </div>
        <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md">{new Date(app.appliedAt).toLocaleDateString()}</span>
      </div>
      
      <div className="space-y-3 text-sm flex-1">
        <div className="grid grid-cols-[110px_1fr] gap-2 items-start">
          <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider mt-0.5">Email</span>
          <span className="text-slate-900 font-medium break-all">
            <a href={`mailto:${app.applicantEmail}`} className="text-blue-600 hover:text-blue-800 hover:underline transition-colors">{app.applicantEmail}</a>
          </span>
        </div>
        {Object.entries(app.applicantData).map(([key, value]) => {
          if (key === 'email') return null;
          const isUrl = String(value).startsWith('http');
          return (
            <div key={key} className="grid grid-cols-[110px_1fr] gap-2 items-start bg-slate-50/50 p-2 rounded-lg">
              <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider mt-0.5">{key.replace(/_/g, ' ')}</span>
              <span className="text-slate-900 font-medium break-words">
                {isUrl ? <a href={value as string} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center group">View Link <ExternalLink className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"/></a> : value as React.ReactNode}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Actions Container */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-2 justify-end">
        {(app.status === 'pending' || !app.status) && (
          <>
            <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200" onClick={() => handleUpdateApplicantStatus(app._id, 'rejected')}>Reject</Button>
            {isJobOrGig && <Button variant="outline" size="sm" className="text-purple-600 hover:bg-purple-50 border-purple-200" onClick={() => handleUpdateApplicantStatus(app._id, 'shortlisted')}>Shortlist</Button>}
            <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleUpdateApplicantStatus(app._id, 'approved')}>Approve</Button>
          </>
        )}
        {app.status === 'shortlisted' && (
          <>
            <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200" onClick={() => handleUpdateApplicantStatus(app._id, 'rejected')}>Reject</Button>
            <Button variant="outline" size="sm" className="text-blue-600 hover:bg-blue-50 border-blue-200" onClick={() => handleUpdateApplicantStatus(app._id, 'interviewing')}>Interview</Button>
            <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleUpdateApplicantStatus(app._id, 'approved')}>Approve</Button>
          </>
        )}
        {app.status === 'interviewing' && (
          <>
            <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200" onClick={() => handleUpdateApplicantStatus(app._id, 'rejected')}>Reject</Button>
            <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleUpdateApplicantStatus(app._id, 'approved')}>Approve</Button>
          </>
        )}
        {app.status === 'approved' && (
          <>
            {(post.isEscrow || post.escrowAmount! > 0) ? (
              <div className="w-full space-y-3">
                {(() => {
                  const escrow = Number(post.escrowAmount || 0);
                  const platformFee = Math.ceil(escrow * 0.05);
                  const mpesaFee = Math.ceil((escrow - platformFee) * 0.02);
                  const netPayable = escrow - platformFee - mpesaFee;
                  return (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 p-4 text-sm shadow-sm">
                      <p className="font-bold text-green-800 mb-3 flex items-center gap-2 border-b border-green-100 pb-2"><Lock className="w-4 h-4"/>Escrow Release Preview</p>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-slate-600"><span>Escrow Total</span><span className="font-semibold text-slate-900">KES {escrow.toLocaleString()}</span></div>
                        <div className="flex justify-between text-slate-500"><span>Platform Fee (5%)</span><span className="text-red-500">− KES {platformFee}</span></div>
                        <div className="flex justify-between text-slate-500"><span>M-PESA Fee (2%)</span><span className="text-red-500">− KES {mpesaFee}</span></div>
                        <div className="flex justify-between border-t border-green-200 mt-2 pt-2 font-black text-green-700 text-base"><span>They Receive</span><span>KES {netPayable.toLocaleString()}</span></div>
                      </div>
                    </div>
                  );
                })()}
                {(app as any).escrowReleaseRequested ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-col items-center justify-center gap-1">
                    <p className="text-sm text-amber-700 font-bold flex items-center gap-1.5"><Clock className="w-4 h-4" /> Release Processing</p>
                    <span className="text-xs text-amber-600/80 text-center">Admin is reviewing this payout</span>
                  </div>
                ) : (
                  <Button size="lg" variant="default" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 shadow-md hover:shadow-lg transition-all" disabled={releaseLoading} onClick={() => handleReleaseEscrow(post, app)}>
                    <DollarSign className="w-5 h-5 mr-2" />
                    {releaseLoading ? 'Initiating Release...' : 'Authorize Escrow Release'}
                  </Button>
                )}
                {releaseMessage && (
                  <p className={`text-sm font-semibold text-center p-2 rounded-lg ${releaseMessage.includes('✅') || releaseMessage.includes('Net payout') ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                    {releaseMessage.replace('✅ ', '').replace('❌ ', '')}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-green-700 font-bold bg-green-50 px-4 py-2 rounded-lg border border-green-100 my-auto text-right w-full flex items-center justify-end gap-2">
                <CheckCircle className="w-4 h-4" /> Finalized & Approved
              </p>
            )}
          </>
        )}
        {app.status === 'rejected' && (
           <p className="text-sm text-slate-500 font-bold bg-slate-50 px-4 py-2 rounded-lg border border-slate-100 my-auto text-right w-full">Application Rejected</p>
        )}
        {app.status === 'disputed' && (
          <div className="w-full bg-red-50 p-3 rounded-lg border border-red-200 flex flex-col gap-1">
            <p className="text-sm text-red-700 font-bold flex items-center gap-1.5"><AlertCircle className="w-4 h-4"/> Dispute in Progress</p>
            <p className="text-xs text-red-600">The platform administrators are currently reviewing this application's dispute.</p>
          </div>
        )}
        {app.status.startsWith('resolved_') && (
           <p className="text-sm text-blue-700 font-bold bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 my-auto text-right w-full flex items-center justify-end gap-2">
             <ShieldCheck className="w-4 h-4" /> Dispute Resolved ({app.status.split('_')[1].toUpperCase()})
           </p>
        )}
        {app.status === 'paid' && (
           <p className="text-sm text-emerald-700 font-bold bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200 my-auto text-right w-full flex items-center justify-end gap-2">
             <CheckCircle className="w-5 h-5" /> Payment Sent
           </p>
        )}
      </div>
    </div>
  );

  // Kanban setup
  const columns = ['Applied', 'Shortlisted', 'Interviewing', 'Approved', 'Rejected'];
  const getColumnForApp = (app: Applicant) => {
    const s = app.status || 'pending';
    if (s === 'pending') return 'Applied';
    if (s === 'shortlisted') return 'Shortlisted';
    if (s === 'interviewing') return 'Interviewing';
    if (s === 'rejected') return 'Rejected';
    return 'Approved'; // handles approved, paid, disputed, resolved_*
  };

  const grouped = columns.reduce((acc, col) => {
    acc[col] = applicants.filter(a => getColumnForApp(a) === col);
    return acc;
  }, {} as Record<string, Applicant[]>);

  return (
    <div className="bg-slate-50 min-h-screen p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Link to="/manage" className="text-slate-500 hover:text-slate-900 bg-white p-2 rounded-lg shadow-sm border border-slate-200 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900">{post.title}</h1>
            <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${post.isLive ? 'bg-green-500' : 'bg-amber-500'}`}></span>
              {post.isLive ? 'Live on platform' : 'Pending Verification'} • Tracking {applicants.length} Applicants
            </p>
          </div>
        </div>

        {applicants.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">No applications yet</h3>
            <p className="text-slate-500">When candidates apply to this position, they will appear here in your tracking pipeline.</p>
          </div>
        ) : (
          <>
            {isJobOrGig ? (
              <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory">
                {columns.map(col => (
                  <div key={col} className="min-w-[350px] w-[350px] flex-shrink-0 bg-slate-200/50 rounded-2xl border border-slate-200 p-4 snap-start flex flex-col h-[calc(100vh-200px)]">
                    <div className="flex justify-between items-center mb-4 px-2">
                      <h3 className="font-black text-slate-800 uppercase tracking-wider text-sm flex items-center gap-2">
                        {col}
                        <span className="bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded-full">{grouped[col].length}</span>
                      </h3>
                      {col === 'Applied' && grouped[col].length > 0 && (
                        <button 
                          onClick={() => {
                            if(window.confirm('Reject all pending applicants?')) {
                              grouped[col].forEach(a => handleUpdateApplicantStatus(a._id, 'rejected'));
                            }
                          }}
                          className="text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-full transition-colors"
                        >
                          Reject All
                        </button>
                      )}
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-2 custom-scrollbar">
                      {grouped[col].length === 0 ? (
                        <div className="text-center py-10 text-slate-400 text-sm font-medium border-2 border-dashed border-slate-300/50 rounded-xl bg-slate-50/50">
                          Empty
                        </div>
                      ) : (
                        grouped[col].map((app, idx) => renderApplicantCard(app, idx))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {applicants.map((app, idx) => renderApplicantCard(app, idx))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
