import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShieldAlert, CheckCircle2, RefreshCcw } from 'lucide-react';

interface DisputedApplication {
  _id: string;
  opportunityTitle: string;
  opportunityId: string;
  applicantEmail: string;
  posterEmailFallback: string;
  escrowAmount: string;
  disputeReason?: string;
  status: string;
  updatedAt: string;
  applicantData: Record<string, string>;
}

export function AdminDisputes() {
  const [adminKey, setAdminKey] = useState(localStorage.getItem('admin_key') || '');
  const [isAuthorized, setIsAuthorized] = useState(!!adminKey);
  const [disputes, setDisputes] = useState<DisputedApplication[]>([]);
  const [loading, setLoading] = useState(false);

  const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (isAuthorized) fetchDisputes();
  }, [isAuthorized]);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/disputes`, {
        headers: { 'x-api-key': adminKey }
      });
      if (!res.ok) throw new Error('Failed to fetch disputes');
      const data = await res.json();
      setDisputes(data);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (appId: string, resolution: 'resolved_paid' | 'resolved_refunded') => {
    if (!window.confirm(`Are you sure you want to resolve this as ${resolution}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/admin/applications/${appId}/resolve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': adminKey
        },
        body: JSON.stringify({ resolution })
      });
      if (!res.ok) throw new Error('Failed to resolve');
      
      alert(`Success. Application is now ${resolution}.`);
      setDisputes(prev => prev.filter(d => d._id !== appId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">Admin Access</h2>
          <input
            type="password"
            placeholder="Enter Admin API Key"
            className="w-full border p-3 rounded mb-4"
            value={adminKey}
            onChange={e => setAdminKey(e.target.value)}
          />
          <Button 
            className="w-full bg-slate-900"
            onClick={() => {
              localStorage.setItem('admin_key', adminKey);
              setIsAuthorized(true);
            }}
          >
            Authenticate
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-red-500" />
              Escrow Disputes
            </h1>
            <p className="text-slate-600 mt-2">Mediate off-platform, log the resolution here.</p>
          </div>
          <Button onClick={fetchDisputes} variant="outline"><RefreshCcw className="w-4 h-4 mr-2"/> Refresh</Button>
        </div>

        {loading ? (
           <p>Loading...</p>
        ) : disputes.length === 0 ? (
           <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-slate-200">
             <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
             <h3 className="text-xl font-bold text-slate-800">Clear! No active disputes.</h3>
           </div>
        ) : (
          <div className="space-y-6">
            {disputes.map(dispute => (
              <div key={dispute._id} className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
                <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex justify-between items-center">
                  <h3 className="font-bold text-red-900 text-lg">{dispute.opportunityTitle}</h3>
                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold font-mono">
                    KES {dispute.escrowAmount} AT RISK
                  </span>
                </div>
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="font-bold text-slate-800 mb-3 border-b pb-2">Student (Applicant)</h4>
                      <p className="text-sm font-medium text-slate-700">Email: <a href={`mailto:${dispute.applicantEmail}`} className="text-blue-600 font-bold">{dispute.applicantEmail}</a></p>
                      <div className="mt-3 p-3 bg-slate-50 border rounded-lg text-sm text-slate-600 font-mono break-all whitespace-pre-wrap">
                        {JSON.stringify(dispute.applicantData, null, 2)}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 mb-3 border-b pb-2">Employer (Poster)</h4>
                      <p className="text-sm font-medium text-slate-700">Email: <a href={`mailto:${dispute.posterEmailFallback}`} className="text-blue-600 font-bold">{dispute.posterEmailFallback}</a></p>
                      <div className="mt-4 p-4 bg-orange-50 border-l-4 border-orange-400">
                        <p className="text-xs font-bold text-orange-800 mb-1">APPLICANT COMPLAINT:</p>
                        <p className="text-sm text-orange-900 border-t border-orange-200 pt-2">{dispute.disputeReason || 'No reason provided.'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-100 p-4 rounded-lg flex flex-col md:flex-row items-center justify-between">
                     <p className="text-sm text-slate-600 mb-4 md:mb-0 max-w-lg">
                       <strong className="text-slate-800 whitespace-nowrap mb-1 block md:inline md:mb-0">Action Required:</strong> Reply-All to the student and employer to mediate. Once you have manually sent the funds via M-PESA, log the final state below.
                     </p>
                     <div className="flex gap-3">
                       <Button 
                         variant="default" 
                         className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                         onClick={() => handleResolve(dispute._id, 'resolved_paid')}
                       >
                         Log: Student Paid
                       </Button>
                       <Button 
                         variant="outline" 
                         className="text-red-700 hover:bg-red-50 hover:text-red-800"
                         onClick={() => handleResolve(dispute._id, 'resolved_refunded')}
                       >
                         Log: Employer Refunded
                       </Button>
                     </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}