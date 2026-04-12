import { useEffect, useState } from 'react';
import { OTPLoginForm } from './OTPLoginForm';
import { Button } from '@/components/ui/button';
import { LogOut, Briefcase, Users, ChevronDown, ChevronUp, Calendar, ExternalLink } from 'lucide-react';
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
    ...pendingPosts.map(p => ({ 
      ...p, 
      id: p.opportunity?.id || p.id, 
      title: p.opportunity?.title || p.title, 
      category: p.opportunity?.category || p.category,
      isLive: false 
    }))
  ];

  return (
    <div className="rounded-2xl bg-white shadow-xl overflow-hidden border border-slate-200">
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-5 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">My Postings Dashboard</h2>
            <p className="text-sm text-slate-500">Logged in as {email}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout} className="text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors">
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
            <p className="text-slate-500">Loading your posts...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100">
            {error}
          </div>
        ) : allPosts.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">No posts found</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">It looks like you haven't posted any opportunities with this email address yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="font-bold text-slate-900 border-b pb-2">Your Opportunities ({allPosts.length})</h3>
            
            <div className="space-y-4">
              {allPosts.map((post) => (
                <div key={post._id} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm transition-all hover:border-blue-200">
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                         <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                           post.isLive ? 'bg-green-100 text-green-700' : 
                           (post.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700')
                         }`}>
                           {post.isLive ? 'Live / Verified' : post.status}
                         </span>
                         <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                           {post.category}
                         </span>
                      </div>
                      <h4 className="text-lg font-bold text-slate-800">{post.title}</h4>
                      <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                         <Calendar className="w-3.5 h-3.5" /> 
                         {post.dateAdded || post.submittedAt ? new Date(post.dateAdded || post.submittedAt || '').toLocaleDateString() : 'N/A'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                       {post.isLive && (
                         <Button asChild variant="outline" size="sm" className="bg-slate-50 border-slate-200">
                           <Link to={`/opportunity/${toSlug(post.title)}`} target="_blank">
                             View Live <ExternalLink className="w-3.5 h-3.5 ml-1" />
                           </Link>
                         </Button>
                       )}
                       
                       {(post.applicationForm?.isEnabled || post.opportunity?.applicationForm?.isEnabled || true) && post.isLive && (
                          <Button 
                            onClick={() => fetchApplicants(post.id)}
                            variant={expandedPostId === post.id ? 'default' : 'secondary'} 
                            size="sm"
                            className={expandedPostId === post.id ? 'bg-blue-600' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}
                          >
                            <Users className="w-4 h-4 mr-2" />
                            Applicants
                            {expandedPostId === post.id ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
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
                               <div key={app._id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm relative">
                                  <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-2">
                                    <span className="font-semibold text-slate-700 text-sm">Applicant {idx + 1}</span>
                                    <span className="text-xs text-slate-400">{new Date(app.appliedAt).toLocaleString()}</span>
                                  </div>
                                  <div className="space-y-2 text-sm">
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
    </div>
  );
}