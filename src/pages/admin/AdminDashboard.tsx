import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ExternalLink, CheckCircle, XCircle, Eye } from 'lucide-react';

const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminDashboard() {
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPending = async () => {
    try {
      const token = sessionStorage.getItem('adminToken');
      if (!token) return;
      const res = await fetch(`${API_BASE}/admin/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setPending(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id: string, objId: string) => {
    setActionLoading(objId);
    try {
      const token = sessionStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE}/admin/approve/${objId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setPending(prev => prev.filter(p => p._id !== objId));
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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
        <header className="flex flex-col items-start justify-between gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
              Verification Inbox
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Review, approve or reject opportunities submitted by the public.
            </p>
          </div>
          <div className="rounded-full bg-primary/5 px-4 py-1 text-xs font-medium text-primary">
            Admin tools · Main Dashboard
          </div>
        </header>

        {loading ? (
          <p className="text-slate-500">Loading pending submissions...</p>
        ) : pending.length === 0 ? (
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
                         <p className="font-medium text-slate-900">{item.reporter?.name}</p>
                         <p className="text-sm text-slate-600">{item.reporter?.email}</p>
                         <p className="text-xs text-slate-400 mt-2 mb-4">{new Date(item.submittedAt).toLocaleDateString()}</p>
                         
                         {/* Optional Image Thumbnail */}
                         <div className="relative w-full aspect-video rounded-md overflow-hidden border border-slate-200 bg-white">
                           <img 
                             src={item.opportunity.logoUrl || "/Opportunities Kenya Logo 2.png"} 
                             alt="Poster Preview" 
                             className="absolute inset-0 w-full h-full object-contain p-2"
                           />
                         </div>
                      </div>
                      <div className="mt-6 flex flex-col gap-2">
                         <Button 
                            className="w-full bg-green-600 hover:bg-green-700 text-white" 
                            disabled={actionLoading === item._id}
                            onClick={() => handleApprove(item.opportunity.id, item._id)}
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
                         {item.opportunity.applicationLink && (
                            <a href={item.opportunity.applicationLink} target="_blank" rel="noreferrer" className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                               Link <ExternalLink className="ml-1 w-3 h-3" />
                            </a>
                         )}
                      </div>
                      
                      <p className="text-sm text-slate-600 mb-4">
                         {item.opportunity.description}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-md border border-slate-100 mb-4">
                         <div><p className="text-xs text-slate-500 uppercase">Funding</p><p className="text-sm font-medium">{item.opportunity.fundingType || 'N/A'}</p></div>
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
        )}
      </div>
    </div>
  );
}
