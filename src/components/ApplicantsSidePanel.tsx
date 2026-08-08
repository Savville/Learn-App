import React, { useEffect, useState } from 'react';
import { X, CheckCircle, XCircle, DollarSign, Download, ExternalLink, ShieldCheck } from 'lucide-react';
import { Button } from './ui/button';
import { opportunitiesAPI } from '../services/api';
import { toast } from 'sonner';

interface Track {
  trackId: string;
  trackLabel: string;
  price: string;
}

interface Application {
  _id: string;
  applicantName: string;
  applicantEmail: string;
  appliedAt: string;
  status: string;
  tracks?: Track[];
  pitch?: string;
}

interface ApplicantsSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  opportunityId: string;
  isEscrowFunded?: boolean;
}

export function ApplicantsSidePanel({ isOpen, onClose, opportunityId, isEscrowFunded }: ApplicantsSidePanelProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && opportunityId) {
      fetchApplicants();
    }
  }, [isOpen, opportunityId]);

  const fetchApplicants = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await opportunitiesAPI.getJobApplicants(opportunityId);
      setApplications(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch applicants.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appId: string, status: string, trackId?: string) => {
    try {
      if (trackId) {
        // Track-specific status update logic if the backend supports it, otherwise generic fallback
        await opportunitiesAPI.updateApplicationStatus(appId, status, trackId);
      } else {
        await opportunitiesAPI.updateApplicationStatus(appId, status);
      }
      toast.success(`Applicant marked as ${status}`);
      fetchApplicants();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update applicant status');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 z-50 transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 overflow-y-auto border-l border-gray-200 animate-in slide-in-from-right duration-300">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 z-10 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Manage Applicants</h2>
            <p className="text-sm text-gray-500 mt-1">Review candidates and manage escrow payments</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#131ADF]"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 bg-red-50 p-4 rounded-lg text-sm">{error}</div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-500 text-sm">No applicants yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {applications.map(app => (
                <div key={app._id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900">{app.applicantName}</h3>
                      <p className="text-sm text-gray-600">{app.applicantEmail}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Applied: {new Date(app.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        app.status === 'Approved' ? 'bg-green-100 text-green-700' :
                        app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  </div>

                  {app.pitch && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm text-gray-700">
                      <p className="font-semibold text-xs text-gray-500 mb-1">Pitch / Motivation:</p>
                      {app.pitch}
                    </div>
                  )}

                  {app.tracks && app.tracks.length > 0 && (
                    <div className="mb-4">
                      <p className="font-semibold text-xs text-gray-500 mb-2">Applied Tracks:</p>
                      <ul className="space-y-2">
                        {app.tracks.map(t => (
                          <li key={t.trackId} className="flex justify-between text-sm items-center bg-gray-50 px-3 py-2 rounded">
                            <span>{t.trackLabel}</span>
                            <span className="font-medium text-gray-900">{t.price}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      disabled={app.status === 'Approved'}
                      onClick={() => updateStatus(app._id, 'Approved')}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      disabled={app.status === 'Rejected'}
                      onClick={() => updateStatus(app._id, 'Rejected')}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>

                  {app.status === 'Approved' && isEscrowFunded && (
                    <div className="mt-4 flex flex-col gap-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                       <p className="text-xs text-blue-800 font-medium flex items-center gap-1.5">
                         <ShieldCheck className="w-4 h-4" />
                         Escrow is funded. You can release payment after deliverables are verified.
                       </p>
                       <Button 
                         size="sm"
                         className="w-full bg-[#131ADF] hover:bg-blue-800 text-white shadow-sm mt-1"
                         onClick={async () => {
                           try {
                             await opportunitiesAPI.releaseEscrow(opportunityId, app._id);
                             toast.success('Escrow payment released successfully!');
                           } catch (err: any) {
                             toast.error(err.message || 'Failed to release escrow payment.');
                           }
                         }}
                       >
                         <DollarSign className="w-4 h-4 mr-2" />
                         Release Escrow Payment
                       </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
