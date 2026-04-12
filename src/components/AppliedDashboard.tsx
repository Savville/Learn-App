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
}

export function AppliedDashboard() {
  const [token, setToken] = useState(localStorage.getItem('user_token'));
  const [email, setEmail] = useState(localStorage.getItem('user_email'));
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';

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
      <OTPLoginForm 
        onSuccess={handleSuccess} 
        title="Track Your Applications" 
        subtitle="Enter the email address you applied with to securely view your history."
      />
    );
  }

  return (
    <div className="my-8 rounded-2xl bg-white shadow-xl overflow-hidden border border-slate-200">
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
            <FolderHeart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">My Applications</h2>
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
            <p className="text-slate-500">Loading your history...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center justify-center border border-red-100">
            {error}
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 shadow-sm border border-slate-100">
              <FolderHeart className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">No applications yet</h3>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">You haven't submitted any internal applications via Learn Opportunities yet. Browse jobs to get started.</p>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
               <Link to="/opportunities">Browse Opportunities</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app._id} className="flex items-center justify-between p-5 bg-white border border-slate-200 hover:border-blue-300 rounded-xl shadow-sm transition-all group">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">
                    {app.opportunityTitle}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
                    <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded text-slate-600">
                      <Calendar className="w-3.5 h-3.5" /> 
                      {new Date(app.appliedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      app.status === 'Pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                      app.status === 'Reviewed' ? 'bg-green-100 text-green-700 border border-green-200' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {app.status}
                    </span>
                  </div>
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
    </div>
  );
}