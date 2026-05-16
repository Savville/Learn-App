import { useEffect, useState } from 'react';
import { OTPLoginForm } from './OTPLoginForm';
import { Button } from '@/components/ui/button';
import { LogOut, FolderHeart, Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toSlug } from '@/utils/dateUtils';

interface Application {
  _id: string;
  opportunityId: string;
  opportunityTitle: string;
  status: string;
  appliedAt: string;
  applicantData: Record<string, string>;
  posterContactEmail?: string;
  isEscrowFunded?: boolean;
}

export function AppliedDashboard() {
  const [token, setToken] = useState(localStorage.getItem('user_token'));
  const [email, setEmail] = useState(localStorage.getItem('user_email'));
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dispute Modal State
  const [disputeAppId, setDisputeAppId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);

  const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';

  const handleRaiseDispute = async () => {
    if (!disputeAppId || !disputeReason) return;
    setSubmittingDispute(true);
    try {
      const res = await fetch(`${API_BASE}/public/applications/${disputeAppId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'disputed', reason: disputeReason })
      });

      if (!res.ok) throw new Error('Failed to raise dispute');

      setApplications(apps => apps.map(app => 
        app._id === disputeAppId ? { ...app, status: 'disputed' } : app
      ));
      
      setDisputeAppId(null);
      setDisputeReason('');
    } catch (err: any) {
      alert(err.message || 'Error communicating with server');
    } finally {
      setSubmittingDispute(false);
    }
  };

  const fetchApplications = async (currentToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/public/me/applications`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      if (res.status === 401) {
        handleLogout();
        throw new Error('Session expired');
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setApplications(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchApplications(token);
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
    setApplications([]);
  };

  if (!token) {
    return (
      <div className="py-8">
        <OTPLoginForm 
          onSuccess={handleSuccess} 
          title="Track Your Applications" 
          subtitle="Enter the email address you applied with to securely view your history."
        />
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-2xl overflow-hidden mb-8">
      <div className="px-8 py-6 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shadow-sm flex-shrink-0">
            <FolderHeart className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">My Applications</h2>
            <p className="text-sm text-gray-600">Logged in as {email}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout} className="text-gray-600 border-gray-200 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-colors h-10 px-4 rounded-xl">
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </div>

      <div className="p-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
            <p className="text-gray-500">Loading your history...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex items-center justify-center shadow-sm">
            {error}
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-2xl">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400 shadow-sm">
              <FolderHeart className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">You haven't submitted any internal applications via Learn Opportunities yet. Browse jobs to get started.</p>
            <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg transition-all text-white rounded-xl px-8 py-6 h-auto text-base">
               <Link to="/opportunities">Browse Opportunities</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((app) => (
              <div key={app._id} className="flex flex-col p-6 bg-white border border-transparent shadow-sm hover:shadow-md hover:border-blue-100 rounded-2xl transition-all group">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors mb-3">
                      {app.opportunityTitle}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                        <Calendar className="w-4 h-4 text-gray-400" /> 
                        {new Date(app.appliedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide border ${
                        app.status === 'pending' || app.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        app.status === 'approved' || app.status === 'paid' ? 'bg-green-50 text-green-700 border-green-100' :
                        app.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                        app.status === 'disputed' ? 'bg-red-600 text-white border-red-700' :
                        app.status.startsWith('resolved_') ? 'bg-blue-600 text-white border-blue-700' :
                        'bg-gray-50 text-gray-600 border-gray-200'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                  
                  {/* Phase 2: Contact Unmasking for Approved Applicants */}
                  {(app.status === 'approved' || app.status === 'paid' || app.status === 'disputed') && app.posterContactEmail && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-100 flex flex-col sm:flex-row sm:items-center gap-2">
                       <span className="text-xs font-semibold text-green-800">You've been approved for work!</span>
                       <span className="text-sm text-green-900 border-l border-green-200 pl-3">
                         Employer email: <a href={`mailto:${app.posterContactEmail}`} className="font-bold underline text-blue-700">{app.posterContactEmail}</a>
                       </span>
                    </div>
                  )}

                  {/* Phase 4: Raise a Dispute for Approved Escrow Apps */}
                  {app.status === 'approved' && app.isEscrowFunded && (
                     <div className="mt-4 border-t border-slate-100 pt-3 flex flex-col md:flex-row md:items-center justify-between">
                        <p className="text-xs text-slate-500">Is this employer unresponsive or refusing to pay via Escrow?</p>
                        <Button 
                          onClick={() => setDisputeAppId(app._id)}
                          variant="destructive" size="sm" className="mt-2 md:mt-0 text-xs">
                          Raise a Dispute
                        </Button>
                     </div>
                  )}
                  {app.status === 'disputed' && (
                    <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm border border-red-100 rounded-md font-medium">
                      Dispute Active: Admins have been notified and will email you directly to mediate this transaction.
                    </div>
                  )}
                  {app.status.startsWith('resolved_') && (
                    <div className="mt-4 p-3 bg-blue-50 text-blue-700 text-sm border border-blue-100 rounded-md font-medium">
                      Dispute Resolved: {app.status === 'resolved_paid' ? 'Funds released to you.' : 'Funds refunded to poster.'}
                    </div>
                  )}
                </div>
                <div className="flex items-center">
                  <Link 
                    to={`/opportunity/${toSlug(app.opportunityTitle)}`}
                    className="flex items-center text-sm font-semibold text-blue-600 px-4 py-2 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    View Post <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DISPUTE MODAL */}
      {disputeAppId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Raise a Dispute</h3>
            <p className="text-sm text-slate-600 mb-4">
              If you have finished the digital work but the employer is unresponsive or refusing to pay the escrowed amount, please explain the situation below. Admins will mediate over email.
            </p>
            <textarea
              className="w-full border border-slate-200 rounded-lg p-3 text-sm min-h-[120px] focus:ring-2 focus:ring-blue-500 outline-none mb-4"
              placeholder="E.g., I mailed the final Google Drive link on Tuesday, but they haven't replied or released funds."
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDisputeAppId(null)} disabled={submittingDispute}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleRaiseDispute} disabled={submittingDispute || !disputeReason.trim()}>
                {submittingDispute ? 'Submitting...' : 'Submit Dispute'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
