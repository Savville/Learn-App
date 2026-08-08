import { useAlert } from '@/contexts/AlertContext';
import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, Mail, CheckCircle, Lock, Clock, DollarSign, ArrowLeft, X } from 'lucide-react';
import { ProfileView } from './ProfileView';
import { ChatDrawer } from '../components/ChatDrawer';

export function ApplicantsViewer() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [token] = useState(localStorage.getItem('user_token') || localStorage.getItem('adminToken'));
  
  // The post can be passed via router state or we fetch it
  const [post, setPost] = useState<any>(location.state?.post || null);
  
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(!location.state?.post);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'shortlisted' | 'rejected' | 'approved' | 'hired'>('all');

  const [slidingApplicant, setSlidingApplicant] = useState<any | null>(null);
  const [chatApplicantEmail, setChatApplicantEmail] = useState<string | null>(null);

  const [releaseLoading, setReleaseLoading] = useState(false);
  const [releaseMessage, setReleaseMessage] = useState<string | null>(null);




  const [selectedAppIds, setSelectedAppIds] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

  const [approvalModal, setApprovalModal] = useState<{ isOpen: boolean, appIds: string[], message: string }>({ isOpen: false, appIds: [], message: 'Welcome aboard! Here are your next steps...' });
  const [isApproving, setIsApproving] = useState(false);

  const [bulkMessageModal, setBulkMessageModal] = useState<{ isOpen: boolean, appIds: string[], message: string }>({ isOpen: false, appIds: [], message: '' });
  const [isSendingBulk, setIsSendingBulk] = useState(false);
  const { showConfirm, showAlert } = useAlert();

  const handleSelectApplicant = (id: string) => {
    const newSet = new Set(selectedAppIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedAppIds(newSet);
  };

  const handleSelectAll = () => {
    if (selectedAppIds.size === filteredApplicants.length) {
      setSelectedAppIds(new Set());
    } else {
      setSelectedAppIds(new Set(filteredApplicants.map(a => a._id)));
    }
  };

  const handleConfirmApproval = async () => {
    setIsApproving(true);
    try {
      for (const appId of approvalModal.appIds) {
         await handleUpdateApplicantStatus(appId, 'approved');
         // We can integrate actual message sending later using the message field
      }
      setApprovalModal({ isOpen: false, appIds: [], message: '' });
      setSelectedAppIds(new Set());
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsApproving(false);
    }
  };

  const handleSendBulkMessage = async () => {
    setIsSendingBulk(true);
    try {
      const receiverEmails = bulkMessageModal.appIds.map(id => {
        const app = applicants.find(a => a._id === id);
        return app ? app.applicantEmail : null;
      }).filter(Boolean);

      const res = await fetch(`${API_BASE}/messages/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          gigId: id,
          receiverEmails,
          content: bulkMessageModal.message
        })
      });
      if (!res.ok) throw new Error('Failed to send messages');
      
      setBulkMessageModal({ isOpen: false, appIds: [], message: '' });
      setSelectedAppIds(new Set());
      alert('Messages sent successfully!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSendingBulk(false);
    }
  };

  const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (!token || !id) return;

    const loadData = async () => {
      // If we didn't get the post from state, we should ideally fetch it.
      // For now, if we only need it for the title and escrow amounts, we can just fetch applicants.
      setLoadingApplicants(true);
      try {
        const res = await fetch(`${API_BASE}/public/me/posts/${id}/applicants`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setApplicants(data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingApplicants(false);
        setLoading(false);
      }
    };
    loadData();
  }, [id, token]);

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

  const handleReleaseEscrow = async (app: any) => {
    if (!post) return;
    const escrowAmount = post.escrowAmount || post.opportunity?.escrowAmount;
    if (!await showConfirm({ title: 'Confirm Action', message: `Release KES ${escrowAmount} escrow to ${app.applicantEmail}? This cannot be undone.` })) return;
    setReleaseLoading(true);
    setReleaseMessage(null);
    try {
      const res = await fetch(`${API_BASE}/public/me/posts/${id}/release-escrow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ applicationId: app._id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to request release');
      setReleaseMessage(`✅ ${data.message} Net payout: KES ${data.netPayable}`);
      setApplicants(prev => prev.map(a => a._id === app._id ? { ...a, escrowReleaseRequested: true } : a));
    } catch (err: any) {
      setReleaseMessage(`❌ ${err.message}`);
    } finally {
      setReleaseLoading(false);
    }
  };

  const filteredApplicants = applicants.filter(app => {
    if (activeTab === 'all') return true;
    if (activeTab === 'shortlisted' && app.status === 'shortlisted') return true;
    if (activeTab === 'rejected' && app.status === 'rejected') return true;
    if (activeTab === 'approved' && app.status === 'approved') return true;
    if (activeTab === 'hired' && (app.status === 'paid' || app.status === 'disputed')) return true;
    return false;
  });

  const renderApplicantCard = (app: any, idx: number) => {
    const isJobOrGig = post?.category === 'Job' || post?.category === 'Gig' || post?.opportunity?.category === 'Job' || post?.opportunity?.category === 'Gig';
    
    return (
      <div key={app._id} className={`bg-white p-4 rounded-lg border shadow-sm relative flex flex-col h-full shrink-0 ${selectedAppIds.has(app._id) ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200'}`}>
        {selectionMode && (
          <div className="absolute top-4 right-4 z-10">
            <input type="checkbox" checked={selectedAppIds.has(app._id)} onChange={() => handleSelectApplicant(app._id)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
          </div>
        )}
        <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 text-sm">Applicant {idx + 1}</span>
            {app.status && !['pending'].includes(app.status) && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${app.status === 'approved' || app.status === 'paid' ? 'bg-green-100 text-green-700' :
                  app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    app.status === 'disputed' ? 'bg-red-600 text-white' :
                      app.status === 'shortlisted' ? 'bg-purple-100 text-purple-700' :
                        app.status.startsWith('resolved_') ? 'bg-blue-600 text-white' :
                          'bg-yellow-100 text-yellow-700'
                }`}>
                {app.status === 'shortlisted' ? 'MARKED' : app.status === 'rejected' ? 'DENIED' : app.status.toUpperCase()}
              </span>
            )}
          </div>
          <span className="text-xs text-slate-400">{new Date(app.appliedAt).toLocaleString()}</span>
        </div>
        <div className="py-3 flex-1 flex flex-col justify-center">
          {(() => {
            const nameEntry = Object.entries(app.applicantData || {}).find(([key]) => key.toLowerCase() === 'name' || key.toLowerCase() === 'full name');
            const name = nameEntry ? String(nameEntry[1]) : app.applicantEmail.split('@')[0];
            
            const title = app.applicantData?.title || app.title;
            const skillsStr = app.applicantData?.skills || app.skills;
            const skills = skillsStr ? (typeof skillsStr === 'string' ? skillsStr.split(',').map(s => s.trim()) : skillsStr) : [];

            return (
              <div className="text-center mb-3">
                <div className="font-bold text-lg text-slate-800">{name}</div>
                {title && <div className="text-sm text-blue-600 font-medium mt-0.5">{title}</div>}
                {skills.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                    {skills.slice(0, 3).map((skill: string, i: number) => (
                      <span key={i} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-medium border border-slate-200">
                        {skill}
                      </span>
                    ))}
                    {skills.length > 3 && (
                      <span className="bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded text-[10px] font-medium border border-slate-200">
                        +{skills.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
          
          <div className="flex items-center justify-center gap-6 mt-3">
            <div className="text-center">
              <div className="font-bold text-slate-700">{app.stats?.projects || 0}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Projects</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-slate-700">{app.stats?.jobs || 0}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Jobs</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-slate-700">{app.stats?.postings || 0}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Postings</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2 w-full">
          {/* Row 1 */}
          <div className="grid grid-cols-3 gap-2 w-full">
            <div className="w-full h-full">
              {(app.status === 'pending' || !app.status) && (
                <Button variant="outline" size="sm" className="w-full h-full text-purple-700 border-purple-200 hover:bg-purple-50 shadow-sm" onClick={() => handleUpdateApplicantStatus(app._id, 'shortlisted')}>
                  Mark
                </Button>
              )}
              {app.status === 'shortlisted' && (
                <Button variant="outline" size="sm" className="w-full h-full text-slate-600 border-slate-300 hover:bg-slate-100 shadow-sm" onClick={() => handleUpdateApplicantStatus(app._id, 'pending')}>
                  Unmark
                </Button>
              )}
              {(app.status === 'rejected' || app.status === 'approved' || app.status === 'paid' || app.status === 'disputed') && (
                <Button variant="outline" size="sm" disabled className="w-full h-full text-slate-400 border-slate-200 shadow-sm opacity-50 cursor-not-allowed">
                  Mark
                </Button>
              )}
            </div>
            <Button variant="outline" size="sm" className="w-full text-slate-700 bg-slate-50 hover:bg-slate-100 border-slate-200 shadow-sm" onClick={() => setChatApplicantEmail(app.applicantEmail)}>
              <Mail className="w-4 h-4 mr-1.5" /> Chat
            </Button>
            <Button variant="outline" size="sm" className="w-full text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200 shadow-sm" onClick={() => setSlidingApplicant({ email: app.applicantEmail, app, post })}>
              View Profile
            </Button>
          </div>
          
          {/* Row 2: Approve / Decline */}
          {(app.status === 'pending' || app.status === 'shortlisted' || app.status === 'rejected') && (
            <div className="grid grid-cols-2 gap-2 w-full mt-1">
              <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm" onClick={() => setApprovalModal({ isOpen: true, appIds: [app._id], message: 'Welcome aboard! Here are your next steps...' })}>
                Approve
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className={`w-full shadow-sm ${app.status === 'rejected' ? 'text-slate-600 border-slate-300 hover:bg-slate-50' : 'text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300'}`} 
                onClick={() => handleUpdateApplicantStatus(app._id, app.status === 'rejected' ? 'pending' : 'rejected')}
              >
                {app.status === 'rejected' ? 'Undecline' : 'Decline'}
              </Button>
            </div>
          )}
          {app.status === 'approved' && (
            <div className="grid grid-cols-1 gap-2 w-full mt-1">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full shadow-sm text-slate-600 border-slate-300 hover:bg-slate-50" 
                onClick={() => handleUpdateApplicantStatus(app._id, 'pending')}
              >
                Revert to Pending
              </Button>
            </div>
          )}
        </div>
        
        {app.status === 'approved' && post && (post.isEscrow || post.opportunity?.isEscrow || (post.escrowAmount ?? 0) > 0 || (post.opportunity?.escrowAmount ?? 0) > 0) && (
          <div className="mt-3 pt-3 border-t border-slate-100 w-full space-y-2">
            {(() => {
              const escrow = Number(post.escrowAmount || post.opportunity?.escrowAmount || 0);
              const platformFee = Math.ceil(escrow * 0.05);
              const mpesaFee = Math.ceil((escrow - platformFee) * 0.02);
              const netPayable = escrow - platformFee - mpesaFee;
              return (
                <div className="bg-green-50 rounded-lg border border-green-100 p-3 text-xs space-y-1">
                  <p className="font-bold text-green-800 mb-2 flex items-center gap-1"><Lock className="w-3 h-3" />Escrow Release Preview</p>
                  <div className="flex justify-between text-slate-600"><span>Escrow Total</span><span className="font-semibold">KES {escrow.toLocaleString()}</span></div>
                  <div className="flex justify-between text-slate-500"><span>Platform Fee (5%)</span><span className="text-red-500">− KES {platformFee}</span></div>
                  <div className="flex justify-between text-slate-500"><span>M-PESA Fee (2%)</span><span className="text-red-500">− KES {mpesaFee}</span></div>
                  <div className="flex justify-between border-t border-green-200 pt-1 font-bold text-green-700"><span>They Receive</span><span>KES {netPayable.toLocaleString()}</span></div>
                </div>
              );
            })()}
            {app.escrowReleaseRequested ? (
              <p className="text-xs text-amber-600 font-medium text-center bg-amber-50 border border-amber-100 rounded-lg p-2 flex items-center justify-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Release requested
              </p>
            ) : (
              <Button size="sm" variant="default" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium" disabled={releaseLoading} onClick={() => handleReleaseEscrow(app)}>
                <DollarSign className="w-3.5 h-3.5 mr-1" />
                {releaseLoading ? 'Processing...' : 'Release Payment'}
              </Button>
            )}
            {releaseMessage && (
              <p className={`text-xs font-medium text-center ${releaseMessage.includes('✅') || releaseMessage.includes('Net payout') ? 'text-green-600' : 'text-red-500'}`}>
                {releaseMessage.replace('✅ ', '').replace('❌ ', '')}
              </p>
            )}
          </div>
        )}

        {app.status === 'disputed' && (
          <div className="mt-3 w-full flex items-center justify-between bg-red-50 p-2 rounded border border-red-100">
            <p className="text-xs text-red-700 font-bold">Dispute in Progress</p>
            <p className="text-[10px] text-red-600 text-right max-w-[150px]">Admins are reviewing.</p>
          </div>
        )}
        {app.status.startsWith('resolved_') && (
          <p className="mt-3 text-xs text-blue-600 font-medium text-right w-full">Dispute Resolved ({app.status.split('_')[1]})</p>
        )}
        {app.status === 'paid' && (
          <p className="mt-3 text-xs text-green-600 font-medium text-right w-full flex items-center justify-end gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Paid
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="bg-[#131ADF] rounded-b-3xl shadow-md mb-8 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-10">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2 -ml-2 text-white/80 hover:text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
              </Button>
              <h1 className="text-3xl font-bold text-white">
                {post ? (post.title || post.opportunity?.title) : 'Applicants'}
              </h1>
              <p className="text-blue-50 mt-1">Review and manage candidates for this position</p>
            </div>
            
            <div className="flex items-center gap-2 bg-white/10 p-1 rounded-lg border border-white/20 backdrop-blur-sm">
              <Button 
                variant={activeTab === 'all' ? 'default' : 'ghost'} 
                onClick={() => setActiveTab('all')}
                className={activeTab === 'all' ? 'bg-white text-blue-900 shadow-md scale-105' : 'text-white hover:bg-white/20'}
              >
                All ({applicants.length})
              </Button>
              <Button 
                variant={activeTab === 'shortlisted' ? 'default' : 'ghost'} 
                onClick={() => setActiveTab('shortlisted')}
                className={activeTab === 'shortlisted' ? 'bg-white text-blue-900 shadow-md scale-105' : 'text-white hover:bg-white/20'}
              >
                Marked ({applicants.filter(a => a.status === 'shortlisted').length})
              </Button>
              <Button 
                variant={activeTab === 'approved' ? 'default' : 'ghost'} 
                onClick={() => setActiveTab('approved')}
                className={activeTab === 'approved' ? 'bg-white text-blue-900 shadow-md scale-105' : 'text-white hover:bg-white/20'}
              >
                Approved ({applicants.filter(a => a.status === 'approved').length})
              </Button>
              <Button 
                variant={activeTab === 'hired' ? 'default' : 'ghost'} 
                onClick={() => setActiveTab('hired')}
                className={activeTab === 'hired' ? 'bg-white text-blue-900 shadow-md scale-105' : 'text-white hover:bg-white/20'}
              >
                Hired ({applicants.filter(a => a.status === 'paid' || a.status === 'disputed').length})
              </Button>
              <Button 
                variant={activeTab === 'rejected' ? 'default' : 'ghost'} 
                onClick={() => setActiveTab('rejected')}
                className={activeTab === 'rejected' ? 'bg-white text-blue-900 shadow-md scale-105' : 'text-white hover:bg-white/20'}
              >
                Denied ({applicants.filter(a => a.status === 'rejected').length})
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        
        {/* Bulk Actions */}
        {filteredApplicants.length > 0 && activeTab !== 'rejected' && activeTab !== 'hired' && (
          <div className="bg-white border border-blue-200 rounded-lg p-3 mb-6 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4">
            {!selectionMode ? (
              <div className="flex items-center gap-3 ml-2 w-full justify-between">
                <span className="text-sm text-slate-500 font-medium">Select applicants to perform bulk actions</span>
                <Button size="sm" variant="outline" className="text-blue-700 border-blue-200 hover:bg-blue-50" onClick={() => setSelectionMode(true)}>
                  Select
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 ml-2">
                  <Button size="sm" variant="outline" className="text-blue-700 border-blue-200 hover:bg-blue-50" onClick={handleSelectAll}>
                    {selectedAppIds.size === filteredApplicants.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <span className="text-sm font-medium text-slate-700">
                    <span className="font-bold text-blue-600">{selectedAppIds.size}</span> selected
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-slate-600" onClick={() => {
                    setSelectionMode(false);
                    setSelectedAppIds(new Set());
                  }}>Cancel</Button>
                  <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50" disabled={selectedAppIds.size === 0} onClick={() => setBulkMessageModal({ isOpen: true, appIds: Array.from(selectedAppIds), message: '' })}>Bulk Message</Button>
                  
                  {activeTab !== 'approved' && (
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" disabled={selectedAppIds.size === 0} onClick={() => {
                      Array.from(selectedAppIds).forEach(id => handleUpdateApplicantStatus(id, 'rejected'));
                      setSelectedAppIds(new Set());
                      setSelectionMode(false);
                    }}>Bulk Decline</Button>
                  )}
                  
                  {activeTab === 'approved' && (
                    <Button size="sm" variant="outline" className="text-slate-600 border-slate-300 hover:bg-slate-50" disabled={selectedAppIds.size === 0} onClick={() => {
                      Array.from(selectedAppIds).forEach(id => handleUpdateApplicantStatus(id, 'pending'));
                      setSelectedAppIds(new Set());
                      setSelectionMode(false);
                    }}>Revert to Pending</Button>
                  )}

                  {activeTab !== 'approved' ? (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" disabled={selectedAppIds.size === 0} onClick={() => setApprovalModal({ isOpen: true, appIds: Array.from(selectedAppIds), message: 'Welcome aboard! Here are your next steps...' })}>
                      Bulk Approve
                    </Button>
                  ) : (
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={selectedAppIds.size === 0} onClick={() => {
                      Array.from(selectedAppIds).forEach(id => handleUpdateApplicantStatus(id, 'paid'));
                      setSelectedAppIds(new Set());
                      setSelectionMode(false);
                      alert('Bulk Hire & Escrow initiated! (Simulation)');
                    }}>
                      <DollarSign className="w-4 h-4 mr-1" />
                      Bulk Hire & Escrow
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        )}



        {loadingApplicants ? (
          <div className="flex items-center justify-center py-20 text-blue-600">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3" /> 
            <span className="font-semibold text-lg">Loading applicants...</span>
          </div>
        ) : filteredApplicants.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">No applicants found</h3>
            <p className="text-slate-500">There are no applications in this category.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredApplicants.map((app, idx) => renderApplicantCard(app, idx))}
          </div>
        )}

      </div>

      {slidingApplicant && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-3xl bg-white shadow-2xl h-full flex flex-col transform transition-transform duration-300">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white shrink-0">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" /> Applicant Profile
              </h2>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100" onClick={() => setSlidingApplicant(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ProfileView 
                emailProp={slidingApplicant.email} 
                fallbackProfile={{
                  email: slidingApplicant.email,
                  name: Object.entries(slidingApplicant.app.applicantData || {}).find(([k]) => k.toLowerCase() === 'name' || k.toLowerCase() === 'full name')?.[1] || slidingApplicant.email.split('@')[0],
                  title: slidingApplicant.app.applicantData?.title || 'Applicant Details',
                  bio: slidingApplicant.app.applicantData?.bio || "*(This user hasn't set up a public portfolio yet.)*\n\n" + (Object.entries(slidingApplicant.app.applicantData || {})
                        .filter(([k]) => !['name', 'full name', 'phone', 'email', 'contact', 'bio', 'title', 'skills'].includes(k.toLowerCase()))
                        .map(([k, v]) => `**${k.charAt(0).toUpperCase() + k.slice(1)}**: ${v}`)
                        .join('\n\n') || 'No additional details provided.'),
                  skills: slidingApplicant.app.applicantData?.skills ? (typeof slidingApplicant.app.applicantData.skills === 'string' ? slidingApplicant.app.applicantData.skills.split(',').map((s: string) => s.trim()) : slidingApplicant.app.applicantData.skills) : [],
                  projects: [],
                }}
              />
            </div>
          </div>
        </div>
      )}

      {chatApplicantEmail && (
        <ChatDrawer 
          applicantEmail={chatApplicantEmail}
          posterEmail={localStorage.getItem('user_email') || ''}
          onClose={() => setChatApplicantEmail(null)} 
        />
      )}

      {/* Approval Modal */}
      {approvalModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">Confirm Approval</h3>
              <Button variant="ghost" size="icon" onClick={() => setApprovalModal({ ...approvalModal, isOpen: false })} className="h-8 w-8 rounded-full">
                <X className="w-4 h-4 text-slate-500" />
              </Button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-4">
                You are about to approve <strong>{approvalModal.appIds.length}</strong> applicant{approvalModal.appIds.length > 1 ? 's' : ''}. 
                Send them an automated onboarding message:
              </p>
              <textarea 
                className="w-full h-32 p-3 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                value={approvalModal.message}
                onChange={e => setApprovalModal({ ...approvalModal, message: e.target.value })}
                placeholder="Write your onboarding instructions here..."
              ></textarea>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setApprovalModal({ ...approvalModal, isOpen: false })}>Cancel</Button>
              <Button onClick={handleConfirmApproval} disabled={isApproving} className="bg-green-600 hover:bg-green-700 text-white font-medium">
                {isApproving ? 'Approving...' : `Approve & Send Message`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Message Modal */}
      {bulkMessageModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">Bulk Send Information</h3>
              <Button variant="ghost" size="icon" onClick={() => setBulkMessageModal({ ...bulkMessageModal, isOpen: false })} className="h-8 w-8 rounded-full">
                <X className="w-4 h-4 text-slate-500" />
              </Button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-4">
                Send a general informational message to <strong>{bulkMessageModal.appIds.length}</strong> selected applicant{bulkMessageModal.appIds.length > 1 ? 's' : ''}:
              </p>
              <textarea 
                className="w-full h-32 p-3 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                value={bulkMessageModal.message}
                onChange={e => setBulkMessageModal({ ...bulkMessageModal, message: e.target.value })}
                placeholder="Type your message here..."
              ></textarea>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setBulkMessageModal({ ...bulkMessageModal, isOpen: false })}>Cancel</Button>
              <Button onClick={handleSendBulkMessage} disabled={isSendingBulk || !bulkMessageModal.message.trim()} className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                {isSendingBulk ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
