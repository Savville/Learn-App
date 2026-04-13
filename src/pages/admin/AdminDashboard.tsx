import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ExternalLink, CheckCircle, XCircle, Eye, Building2, User, Pencil, Trash2, Settings, Flag, AlertTriangle } from 'lucide-react';

const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminDashboard() {
  const [pending, setPending] = useState<any[]>([]);
  const [orgRequests, setOrgRequests] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [allOpps, setAllOpps] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'opps' | 'reports' | 'orgs' | 'manage'>('opps');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [reviewFormById, setReviewFormById] = useState<Record<string, { reviewerName: string; proofLinksText: string }>>({});
  
  // Edit State
  const [editingOpp, setEditingOpp] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [imageFile, setImageFile] = useState<File | null>(null);


  const fetchPending = async () => {
    try {
      const token = sessionStorage.getItem('adminToken');
      if (!token) return;
      
      const [oppsRes, reportsRes, orgsRes, allOppsRes] = await Promise.all([
        fetch(`${API_BASE}/admin/pending`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/admin/reports`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/admin/organization-requests`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/admin/opportunities`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (oppsRes.ok) setPending(await oppsRes.json());
      if (reportsRes.ok) setReports(await reportsRes.json());
      if (orgsRes.ok) setOrgRequests(await orgsRes.json());
      if (allOppsRes.ok) setAllOpps(await allOppsRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (opp: any) => {
    setEditingOpp(opp);
    setEditForm({ ...opp });
    setImageFile(null);
  };

  const handleSaveEdit = async () => {
    if (!editingOpp) return;
    setActionLoading('saving');
    try {
      const token = sessionStorage.getItem('adminToken');
      let finalLogoUrl = editForm.logoUrl;

      // Upload new image if selected
      if (imageFile) {
        const formData = new FormData();
        formData.append('coverImage', imageFile);
        const uploadRes = await fetch(`${API_BASE}/admin/upload-image`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (uploadRes.ok) {
          const ud = await uploadRes.json();
          finalLogoUrl = ud.imageUrl;
        }
      }

      const updatedData = { ...editForm, logoUrl: finalLogoUrl };

      const res = await fetch(`${API_BASE}/admin/opportunities/${editingOpp.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });

      if (res.ok) {
        setAllOpps(prev => prev.map(o => o.id === editingOpp.id ? updatedData : o));
        setEditingOpp(null);
        alert('Opportunity updated successfully');
      } else {
        const errorData = await res.json();
        alert('Error updating: ' + errorData.error);
      }
    } catch (error: any) {
      alert('Error updating: ' + error.message);
    }
    setActionLoading(null);
  };

  const handleDeleteOpp = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to completely delete "${title}"?`)) return;
    setActionLoading(`delete_${id}`);
    try {
      const token = sessionStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE}/admin/opportunities/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setAllOpps(prev => prev.filter(o => o.id !== id));
      } else {
        const errorData = await res.json();
        alert('Error deleting: ' + errorData.error);
      }
    } catch (error: any) {
      alert('Error deleting: ' + error.message);
    }
    setActionLoading(null);
  };

  useEffect(() => {
    fetchPending();
  }, []);

  useEffect(() => {
    setReviewFormById(prev => {
      const next = { ...prev };
      pending.forEach(item => {
        if (!next[item._id]) {
          next[item._id] = {
            reviewerName: item.reviewedBy || 'Opportunities Kenya Admin',
            proofLinksText: Array.isArray(item.proofLinks) ? item.proofLinks.join('\n') : '',
          };
        }
      });
      return next;
    });
  }, [pending]);

  const handleApproveOrg = async (objId: string) => {
    setActionLoading(objId);
    try {
      const token = sessionStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE}/admin/organization-requests/approve/${objId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setOrgRequests(prev => prev.filter(o => o._id !== objId));
        alert('Organization Verified & Notified!');
      }
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
    setActionLoading(null);
  };

  const handleRejectOrg = async (objId: string) => {
    if (!window.confirm('Reject this request?')) return;
    setActionLoading(objId);
    try {
      const token = sessionStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE}/admin/organization-requests/reject/${objId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setOrgRequests(prev => prev.filter(o => o._id !== objId));
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
    setActionLoading(null);
  };

  const handleApprove = async (objId: string) => {
    const reviewForm = reviewFormById[objId] || { reviewerName: '', proofLinksText: '' };
    const reviewerName = reviewForm.reviewerName.trim();
    if (!reviewerName) {
      alert('Reviewer name is required before approval.');
      return;
    }
    const proofLinks = reviewForm.proofLinksText
      .split(/\r?\n|,/) 
      .map((link: string) => link.trim())
      .filter((link: string) => !!link);

    setActionLoading(objId);
    try {
      const token = sessionStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE}/admin/approve/${objId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reviewerName, proofLinks }),
      });
      if (res.ok) {
        setPending(prev => prev.filter(p => p._id !== objId));
        setReviewFormById(prev => {
          const next = { ...prev };
          delete next[objId];
          return next;
        });
        alert('Opportunity Approved & Published!');
      } else {
        const data = await res.json();
        alert('Failed to approve: ' + data.error);
      }
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
    setActionLoading(null);
  };

  const handleReject = async (objId: string) => {
    if (!window.confirm('Are you sure you want to reject and delete this submission?')) return;
    setActionLoading(objId);
    try {
      const token = sessionStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE}/admin/reject/${objId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setPending(prev => prev.filter(p => p._id !== objId));
      } else {
        const data = await res.json();
        alert('Failed to reject: ' + data.error);
      }
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
    setActionLoading(null);
  };

  const handleResolveReport = async (objId: string) => {
    setActionLoading(`resolve_${objId}`);
    try {
      const token = sessionStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE}/admin/reports/${objId}/resolve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setReports(prev => prev.filter(r => r._id !== objId));
      }
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
    setActionLoading(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
        <header className="flex flex-col items-start justify-between gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage website submissions and verified organizations.
            </p>
          </div>
          <div className="rounded-full bg-primary/5 px-4 py-1 text-xs font-medium text-primary">
            Admin tools · {activeTab === 'opps' ? 'Verification Inbox' : activeTab === 'reports' ? 'Reports Inbox' : activeTab === 'manage' ? 'Manage Content' : 'Organization Management'}
          </div>
        </header>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('opps')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'opps' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <User className="w-4 h-4" />
            Unverified Opportunities ({pending.length})
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'reports' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <Flag className="w-4 h-4" />
            Reports ({reports.length})
          </button>
          <button 
            onClick={() => setActiveTab('orgs')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'orgs' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <Building2 className="w-4 h-4" />
            Organization Requests ({orgRequests.length})
          </button>
          <button 
            onClick={() => setActiveTab('manage')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'manage' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <Settings className="w-4 h-4" />
            Manage Content ({allOpps.length})
          </button>
        </div>

        {loading ? (
          <p className="text-slate-500 py-10 text-center">Loading data...</p>
        ) : activeTab === 'opps' ? (
          /* Opportunities Tab */
          pending.length === 0 ? (
            <Card className="border-slate-200 shadow-sm">
               <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <CheckCircle className="h-12 w-12 text-slate-300 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900">You're all caught up!</h3>
                  <p className="text-sm text-slate-500 max-w-sm mt-1">There are no pending opportunities waiting for your verification right now.</p>
               </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
               {pending.map(item => (
                 <Card key={item._id} className="border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
                    <div className="md:w-1/4 bg-slate-100 p-6 flex flex-col justify-between border-r border-slate-200">
                       <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Submitted By</p>
                          <p className="font-medium text-slate-900 line-clamp-1">{item.reporter?.name}</p>
                          <p className="text-sm text-slate-600 line-clamp-1">{item.reporter?.organization}</p>
                          <p className="text-sm text-slate-600 line-clamp-1">{item.reporter?.role}</p>
                          <p className="text-sm text-slate-600 line-clamp-1 italic">{item.reporter?.email}</p>
                          <p className="text-sm text-slate-600 line-clamp-1">{item.reporter?.telephone}</p>
                          <p className="text-xs text-slate-500 break-all">{item.reporter?.websiteOrSocial}</p>
                          {item.riskFlags?.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {item.riskFlags.map((flag: string, index: number) => (
                                <Badge key={index} className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
                                  {flag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {item.isOrganizationPost && (
                            <Badge className="mt-2 bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">
                              Verified Org Post
                            </Badge>
                          )}
                          {item.opportunity.editOf && (
                            <Badge className="mt-2 bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
                              Edit Update Request
                            </Badge>
                          )}
                          <p className="text-xs text-slate-400 mt-2 mb-4">{new Date(item.submittedAt).toLocaleDateString()}</p>
                          
                          {/* Uploaded Image Thumbnail (Large & Prominent) */}
                          <div className="mt-6 w-full aspect-square max-w-[220px] mx-auto overflow-hidden border-4 border-dashed border-slate-300 rounded-xl bg-white shadow-sm flex items-center justify-center">
                            <img 
                              src={item.opportunity.logoUrl?.startsWith('/images/') 
                                ? (API_BASE.replace('/api', '') + item.opportunity.logoUrl) 
                                : (item.opportunity.logoUrl || "/Opportunities Kenya Logo 2.png")} 
                              alt="Poster Preview" 
                              className="w-full h-full object-contain p-2"
                              onError={(e: any) => {
                                e.target.src = "/Opportunities Kenya Logo 2.png";
                              }}
                            />
                          </div>
                       </div>
                       <div className="mt-6 flex flex-col gap-2">
                          <div className="rounded-md border border-slate-200 bg-white p-3 space-y-2">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Verification Audit</p>
                            <Input
                              placeholder="Reviewer name"
                              value={reviewFormById[item._id]?.reviewerName || ''}
                              onChange={(e) => setReviewFormById(prev => ({
                                ...prev,
                                [item._id]: {
                                  reviewerName: e.target.value,
                                  proofLinksText: prev[item._id]?.proofLinksText || '',
                                }
                              }))}
                            />
                            <Textarea
                              placeholder="Proof links (one per line or comma-separated)"
                              className="min-h-[72px] text-xs"
                              value={reviewFormById[item._id]?.proofLinksText || ''}
                              onChange={(e) => setReviewFormById(prev => ({
                                ...prev,
                                [item._id]: {
                                  reviewerName: prev[item._id]?.reviewerName || 'Opportunities Kenya Admin',
                                  proofLinksText: e.target.value,
                                }
                              }))}
                            />
                          </div>
                          <Button 
                             className="w-full bg-green-600 hover:bg-green-700 text-white" 
                             disabled={actionLoading === item._id || !(reviewFormById[item._id]?.reviewerName || '').trim()}
                             onClick={() => handleApprove(item._id)}
                          >
                             <CheckCircle className="mr-2 h-4 w-4" /> Approve & Publish
                          </Button>

                          <Button 
                             variant="outline" 
                             className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                             disabled={actionLoading === item._id}
                             onClick={() => handleReject(item._id)}
                          >
                             <XCircle className="mr-2 h-4 w-4" /> Reject
                          </Button>
                       </div>
                    </div>
                    <div className="p-6 md:w-3/4 flex flex-col">
                       <div className="flex justify-between items-start mb-4">
                          <div>
                             <Badge variant="outline" className="mb-2 bg-blue-50 text-blue-700 border-blue-200">
                                {item.opportunity.category}
                             </Badge>
                             <h3 className="text-xl font-bold text-slate-900">{item.opportunity.title}</h3>
                             <p className="text-sm font-medium text-slate-700">{item.opportunity.provider}</p>
                          </div>
                          {item.opportunity.applicationLink && item.opportunity.applicationLink.length > 5 && item.opportunity.applicationLink.startsWith('http') && (
                             <a href={item.opportunity.applicationLink} target="_blank" rel="noreferrer" className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-2 py-1 rounded border border-blue-100">
                                View Apply Link <ExternalLink className="ml-1 w-3 h-3" />
                             </a>
                          )}
                       </div>
                       
                       <p className="text-sm text-slate-600 mb-4 italic">
                         "{item.opportunity.description}"
                       </p>
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 bg-slate-50 p-4 rounded-md border border-slate-100 mb-4">
                           <div><p className="text-xs text-slate-500 uppercase">Funding</p><p className="text-sm font-medium">{item.opportunity.fundingType || 'N/A'}</p></div>
                           <div><p className="text-xs text-slate-500 uppercase">Comp</p><p className="text-sm font-medium">{item.opportunity.compensationType || 'N/A'}</p></div>
                           <div><p className="text-xs text-slate-500 uppercase">Upfront</p><Badge className={`text-[10px] font-bold ${item.opportunity.upfrontCost === 'Has Upfront Cost' ? 'text-amber-600' : 'text-green-600'}`}>{item.opportunity.upfrontCost || 'No'}</Badge></div>
                           <div><p className="text-xs text-slate-500 uppercase">Deadline</p><p className="text-sm font-medium truncate">{item.opportunity.deadline || 'N/A'}</p></div>
                           <div><p className="text-xs text-slate-500 uppercase">Location</p><p className="text-sm font-medium truncate">{item.opportunity.location || 'N/A'}</p></div>
                        </div>

                       {/* Intelligent Auto-Expanding Section */}
                       <details className="mt-auto text-sm text-slate-700 bg-white border border-slate-200 rounded-md overflow-hidden group">
                          <summary className="p-4 font-semibold cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between">
                             <span>View Full Intelligent Extraction</span>
                             <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                          </summary>
                          <div className="p-6 border-t border-slate-200 space-y-6">
                             
                             {/* Full Description */}
                             <div>
                               <h4 className="font-semibold text-slate-900 mb-2 uppercase text-xs tracking-wider">About This Opportunity</h4>
                               <div className="bg-slate-50 p-4 rounded-md border border-slate-100 whitespace-pre-wrap">
                                 {item.opportunity.fullDescription || item.opportunity.description || 'N/A'}
                               </div>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               {/* Benefits */}
                               <div>
                                 <h4 className="font-semibold text-slate-900 mb-2 uppercase text-xs tracking-wider">Benefits & Rewards</h4>
                                 <ul className="list-disc pl-5 space-y-1">
                                   {item.opportunity.benefits?.length > 0 ? (
                                     item.opportunity.benefits.map((b: string, i: number) => <li key={i}>{b}</li>)
                                   ) : (
                                     <li className="text-slate-400 list-none italic">None extracted</li>
                                   )}
                                 </ul>
                               </div>
                               
                               {/* Eligibility */}
                               <div>
                                 <h4 className="font-semibold text-slate-900 mb-2 uppercase text-xs tracking-wider">Eligibility Requirements</h4>
                                 <ul className="list-disc pl-5 space-y-1">
                                   {item.opportunity.eligibility?.requirements?.length > 0 ? (
                                     item.opportunity.eligibility.requirements.map((r: string, i: number) => <li key={i}>{r}</li>)
                                   ) : (
                                     <li className="text-slate-400 list-none italic">None extracted</li>
                                   )}
                                 </ul>
                               </div>
                             </div>

                             {/* Thematic Areas */}
                             {item.opportunity.thematicAreas?.length > 0 && (
                               <div>
                                 <h4 className="font-semibold text-slate-900 mb-2 uppercase text-xs tracking-wider">Thematic Areas</h4>
                                 <div className="flex flex-wrap gap-2">
                                   {item.opportunity.thematicAreas.map((t: any, i: number) => (
                                     <Badge key={i} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                       {typeof t === 'string' ? t : (t.heading || t)}
                                     </Badge>
                                   ))}
                                 </div>
                               </div>
                             )}

                             {/* Raw Features Table */}
                             {item.opportunity.extractedFeatures && (
                                <div className="pt-4 border-t border-slate-100">
                                   <h4 className="font-semibold text-slate-900 mb-2 uppercase text-xs tracking-wider">Raw Extracted Features</h4>
                                   <ul className="space-y-2">
                                       {item.opportunity.extractedFeatures.map((f: any, i: number) => (
                                           <li key={i} className="flex border-b border-slate-50 pb-2">
                                               <span className="w-1/3 font-semibold text-slate-600 truncate">{f.feature}:</span>
                                               <span className="w-2/3">{f.value || <em className="text-slate-400">Empty</em>}</span>
                                           </li>
                                       ))}
                                   </ul>
                                </div>
                             )}
                          </div>
                       </details>
                    </div>
                 </Card>
               ))}
            </div>
          )
        ) : activeTab === 'reports' ? (
          /* Reports Tab */
          reports.length === 0 ? (
            <Card className="border-slate-200 shadow-sm">
               <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <AlertTriangle className="h-12 w-12 text-slate-300 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900">No open reports</h3>
                  <p className="text-sm text-slate-500 max-w-sm mt-1">Suspicious posts reported by users will appear here.</p>
               </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reports.map((report: any) => (
                <Card key={report._id} className="border-slate-200 shadow-sm overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">Open Report</Badge>
                          <span className="text-xs text-slate-400">{new Date(report.submittedAt).toLocaleString()}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">{report.reason}</h3>
                        <p className="text-sm text-slate-600">Opportunity ID: {report.opportunityId}</p>
                        {report.reporterName && <p className="text-sm text-slate-600">Reporter: {report.reporterName}</p>}
                        {report.reporterEmail && <p className="text-sm text-slate-600">Email: {report.reporterEmail}</p>}
                        {report.details && <p className="text-sm text-slate-700 whitespace-pre-wrap">{report.details}</p>}
                      </div>
                      <div className="flex flex-col gap-2 shrink-0 lg:items-end">
                        <Button
                          variant="outline"
                          className="border-slate-200"
                          onClick={() => window.open(`/opportunity/${report.opportunityId}`, '_blank')}
                        >
                          <Eye className="w-4 h-4 mr-2" /> Open Post
                        </Button>
                        <Button
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleResolveReport(report._id)}
                          disabled={actionLoading === `resolve_${report._id}`}
                        >
                          Mark Resolved
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={async () => {
                            if (report.opportunityId) {
                              await handleDeleteOpp(report.opportunityId, report.reason);
                            }
                            await handleResolveReport(report._id);
                          }}
                          disabled={actionLoading === `delete_${report.opportunityId}`}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete Opportunity
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        ) : activeTab === 'orgs' ? (
          /* Organization Requests Tab */
          orgRequests.length === 0 ? (
            <Card className="border-slate-200 shadow-sm">
               <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <Building2 className="h-12 w-12 text-slate-300 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900">No pending org requests</h3>
                  <p className="text-sm text-slate-500 max-w-sm mt-1">When an organization fills the request form, it will appear here for your verification.</p>
               </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {orgRequests.map((req: any) => (
                 <Card key={req._id} className="border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <CardHeader className="bg-slate-50 border-b pb-4">
                      <div className="flex justify-between items-start">
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Org Request</Badge>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(req.requestedAt).toLocaleDateString()}</span>
                      </div>
                      <CardTitle className="mt-2 text-lg">{req.organization}</CardTitle>
                      <CardDescription className="text-xs">{req.email}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-5 flex-1">
                      <div className="space-y-3 mb-6">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact Person</p>
                          <p className="text-sm font-medium">{req.name}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone</p>
                          <p className="text-sm">{req.telephone || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">About Organization</p>
                          <p className="text-sm text-slate-600 line-clamp-3 italic">"{req.description || 'No description provided'}"</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                          disabled={actionLoading === req._id}
                          onClick={() => handleApproveOrg(req._id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" /> Verify
                        </Button>
                        <Button 
                          variant="outline"
                          className="text-red-600 border-red-100 hover:bg-red-50"
                          disabled={actionLoading === req._id}
                          onClick={() => handleRejectOrg(req._id)}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                 </Card>
               ))}
            </div>
          )
        ) : (
          /* Manage Content Tab */
          allOpps.length === 0 ? (
            <Card className="border-slate-200 shadow-sm">
               <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <Settings className="h-12 w-12 text-slate-300 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900">No content available</h3>
                  <p className="text-sm text-slate-500 max-w-sm mt-1">There are no published opportunities to manage yet.</p>
               </CardContent>
            </Card>
          ) : editingOpp ? (
            <Card className="border-slate-200 shadow-sm p-6 max-w-3xl mx-auto w-full">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                 <h3 className="text-xl font-bold">Edit Opportunity</h3>
                 <Button variant="ghost" className="text-slate-500" onClick={() => setEditingOpp(null)}>
                   Cancel
                 </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold mb-1 block">Title</label>
                  <Input 
                    value={editForm.title || ''} 
                    onChange={e => setEditForm({...editForm, title: e.target.value})} 
                  />
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-semibold mb-1 block">Provider</label>
                    <Input 
                      value={editForm.provider || ''} 
                      onChange={e => setEditForm({...editForm, provider: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-1 block">Category</label>
                    <Input 
                      value={editForm.category || ''} 
                      onChange={e => setEditForm({...editForm, category: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-1 block">Funding Type</label>
                    <Input 
                      value={editForm.fundingType || ''} 
                      onChange={e => setEditForm({...editForm, fundingType: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-1 block">Compensation</label>
                    <select 
                      className="w-full h-10 px-3 py-2 text-sm bg-white border rounded-md border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={editForm.compensationType || 'N/A'}
                      onChange={e => setEditForm({...editForm, compensationType: e.target.value})} 
                    >
                      <option value="Paid">Paid</option>
                      <option value="Stipend">Stipend</option>
                      <option value="Unpaid">Unpaid</option>
                      <option value="N/A">N/A</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-1 block">Upfront Cost</label>
                    <select 
                      className="w-full h-10 px-3 py-2 text-sm bg-white border rounded-md border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={editForm.upfrontCost || 'No Upfront Cost'}
                      onChange={e => setEditForm({...editForm, upfrontCost: e.target.value})} 
                    >
                      <option value="No Upfront Cost">No Upfront Cost</option>
                      <option value="Has Upfront Cost">Has Upfront Cost</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-1 block">Deadline</label>
                    <Input 
                      value={editForm.deadline || ''} 
                      onChange={e => setEditForm({...editForm, deadline: e.target.value})} 
                    />
                  </div>
                  <div className="lg:col-span-3">
                    <label className="text-sm font-semibold mb-1 block">Location</label>
                    <Input 
                      value={editForm.location || ''} 
                      onChange={e => setEditForm({...editForm, location: e.target.value})} 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1 block">Application Link</label>
                  <Input 
                    value={editForm.applicationLink || ''} 
                    onChange={e => setEditForm({...editForm, applicationLink: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1 block">Short Description</label>
                  <Textarea 
                    rows={3}
                    value={editForm.description || ''} 
                    onChange={e => setEditForm({...editForm, description: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1 block">Full Description</label>
                  <Textarea 
                    rows={6}
                    value={editForm.fullDescription || ''} 
                    onChange={e => setEditForm({...editForm, fullDescription: e.target.value})} 
                  />
                </div>
                <div className="bg-slate-50 p-4 border rounded-md">
                  <label className="text-sm font-semibold mb-2 block">Update Logo (Optional)</label>
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={e => setImageFile(e.target.files?.[0] || null)}
                    className="mb-2 bg-white"
                  />
                  {editForm.logoUrl && !imageFile && (
                    <div className="flex items-center gap-3 mt-2">
                       <img 
                          src={editForm.logoUrl?.startsWith('/images/') ? (API_BASE.replace('/api', '') + editForm.logoUrl) : editForm.logoUrl} 
                          alt="Current Logo" 
                          className="w-12 h-12 object-contain bg-white border p-1 rounded" 
                       />
                       <p className="text-xs text-slate-500">Current logo remains unchanged.</p>
                    </div>
                  )}
                </div>
                <div className="pt-4 flex gap-4">
                   <Button 
                     onClick={handleSaveEdit} 
                     disabled={actionLoading === 'saving'}
                     className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                   >
                     {actionLoading === 'saving' ? 'Saving...' : 'Save Changes'}
                   </Button>
                   <Button 
                     onClick={() => handleDeleteOpp(editingOpp.id, editingOpp.title)}
                     disabled={actionLoading === `delete_${editingOpp.id}`}
                     className="flex-1 font-semibold flex items-center justify-center border-none hover:opacity-90 transition-opacity whitespace-nowrap"
                     style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
                   >
                     <Trash2 className="w-4 h-4 mr-2" /> Delete Opportunity
                   </Button>
                </div>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
               {allOpps.map(opp => (
                 <Card key={opp.id} className="border-slate-200 shadow-sm overflow-hidden flex flex-col sm:flex-row items-center p-4 gap-4">
                    <div className="w-16 h-16 shrink-0 bg-slate-100 rounded-md border border-slate-200 relative">
                       <img 
                          src={opp.logoUrl?.startsWith('/images/') 
                            ? (API_BASE.replace('/api', '') + opp.logoUrl) 
                            : (opp.logoUrl || "/Opportunities Kenya Logo 2.png")} 
                          alt="Logo" 
                          className="absolute inset-0 w-full h-full object-contain p-1"
                          onError={(e: any) => { e.target.src = "/Opportunities Kenya Logo 2.png"; }}
                       />
                    </div>
                     <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-semibold text-slate-900 truncate">{opp.title}</h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <p className="text-sm text-slate-600 truncate">{opp.provider} · {opp.category}</p>
                          <Badge variant="outline" className="text-[10px] h-5 bg-blue-50 text-blue-700 border-blue-100">{opp.compensationType || 'N/A'}</Badge>
                          <Badge variant="outline" className={`text-[10px] h-5 ${opp.upfrontCost === 'Has Upfront Cost' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-green-50 text-green-700 border-green-100'}`}>{opp.upfrontCost || 'No Upfront Cost'}</Badge>
                        </div>
                     </div>
                    <div className="flex gap-2 shrink-0">
                       <Button variant="outline" size="sm" onClick={() => handleEditClick(opp)}>
                         <Pencil className="w-4 h-4 mr-2" /> Edit
                       </Button>
                       <Button 
                         variant="destructive"
                         size="sm" 
                         disabled={actionLoading === `delete_${opp.id}`}
                         onClick={() => handleDeleteOpp(opp.id, opp.title)}
                         className="font-semibold flex items-center justify-center"
                       >
                         <Trash2 className="w-4 h-4 mr-2 py-0 my-0" /> Delete
                       </Button>
                    </div>
                 </Card>
               ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
