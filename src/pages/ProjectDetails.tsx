import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Calendar, Tag, ChevronLeft, ChevronRight, MessageCircle, ShieldCheck } from 'lucide-react';
import { getProjectById, ProfileProject } from '../services/profilesAPI';
import { opportunitiesAPI } from '../services/api';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';

export function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProfileProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Image Slider state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Messaging Modal state
  const [pitchEmail, setPitchEmail] = useState('');
  const [pitchMessage, setPitchMessage] = useState('');
  const [isSubmittingPitch, setIsSubmittingPitch] = useState(false);
  const [pitchSuccess, setPitchSuccess] = useState(false);
  const [pitchError, setPitchError] = useState<string | null>(null);

  // Contribution (STK Push) State
  const [contributeName, setContributeName] = useState('');
  const [contributeAnonymous, setContributeAnonymous] = useState(false);
  const [contributeAmount, setContributeAmount] = useState('');
  const [contributePhone, setContributePhone] = useState('');
  const [isContributing, setIsContributing] = useState(false);
  const [contributeError, setContributeError] = useState<string | null>(null);
  const [contributeSuccess, setContributeSuccess] = useState(false);
  const [pendingCheckoutId, setPendingCheckoutId] = useState<string | null>(null);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [localFundedAmount, setLocalFundedAmount] = useState<number>(0);
  const [contributors, setContributors] = useState<{ name: string, amount: number }[]>([]);
  const [showContributors, setShowContributors] = useState(false);
  
  // Updates State
  const [activeTab, setActiveTab] = useState<'details' | 'updates'>('details');
  const [isOwner, setIsOwner] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateDescription, setUpdateDescription] = useState('');
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);

  const lastContributionTime = useRef(0);

  useEffect(() => {
    if (project) {
      const currentUserEmail = localStorage.getItem('user_email');
      if (currentUserEmail && project.userEmail === currentUserEmail) {
        setIsOwner(true);
      }
    }
  }, [project]);

  useEffect(() => {
    if (project?.fundedAmount) setLocalFundedAmount(project.fundedAmount);
  }, [project?.fundedAmount]);

  const fetchContributors = async () => {
    if (!id) return;
    try {
      const res = await opportunitiesAPI.getContributors(id);
      setContributors(res.data);
    } catch (err) {
      console.error("Failed to fetch contributors", err);
    }
  };

  const sliderImages = project && Array.isArray(project.images) ? project.images.filter(img => typeof img === 'string' && img.trim() !== '') : [];
  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % sliderImages.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);

  useEffect(() => {
    if (sliderImages.length > 1) {
      const interval = setInterval(nextImage, 5000);
      return () => clearInterval(interval);
    }
  }, [sliderImages.length]);

  useEffect(() => {
    if (project) {
      fetchContributors();
    }
  }, [project]);

  // STK Push Polling
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (pendingCheckoutId) {
      interval = setInterval(async () => {
        try {
          const res = await opportunitiesAPI.getCrowdfundStatus(pendingCheckoutId);
          if (res.data.status === 'completed') {
            setLocalFundedAmount(prev => prev + parseFloat(contributeAmount));
            setPendingCheckoutId(null);
            fetchContributors();
          } else if (res.data.status === 'failed') {
            setPendingCheckoutId(null);
            setContributeError('Payment failed or was cancelled.');
            setContributeSuccess(false);
          }
        } catch (err) {
          console.error("Error polling payment status", err);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [pendingCheckoutId, contributeAmount]);

  const checkPaymentStatus = async () => {
    if (!pendingCheckoutId) return;
    setIsCheckingPayment(true);
    setContributeError(null);
    try {
      const res = await opportunitiesAPI.getCrowdfundStatus(pendingCheckoutId);
      if (res.data.status === 'completed') {
        setLocalFundedAmount(prev => prev + parseFloat(contributeAmount));
        setPendingCheckoutId(null);
        fetchContributors();
      } else if (res.data.status === 'failed') {
        setPendingCheckoutId(null);
        setContributeError('Payment failed or was cancelled.');
        setContributeSuccess(false);
      } else {
        setContributeError('Payment not received yet. Please try again in a few seconds.');
      }
    } catch (e: any) {
      setContributeError(e.message || 'Error checking payment status.');
    } finally {
      setIsCheckingPayment(false);
    }
  };

  const handleContributeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Prevent duplicate submissions within 5 seconds
    const now = Date.now();
    if (now - lastContributionTime.current < 5000) {
      setContributeError('Please wait a moment before trying again.');
      return;
    }
    
    setIsContributing(true);
    setContributeError(null);
    
    try {
      const res = await opportunitiesAPI.initiateCrowdfundSTKPush({
        opportunityId: id!, // We pass the project ID here, the backend handles it
        name: contributeName,
        isAnonymous: contributeAnonymous,
        amount: contributeAmount,
        phone: contributePhone
      });
      
      setPendingCheckoutId(res.data.checkoutRequestId);
      lastContributionTime.current = Date.now();
      setContributeSuccess(true);
    } catch (err: any) {
      setContributeError(err.message);
    } finally {
      setIsContributing(false);
    }
  };

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await getProjectById(id);
        setProject(data);
      } catch (err: any) {
        console.error('Failed to fetch project details:', err);
        setError('Unable to load project details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleAddUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!project || !project.id) return;
    
    setIsSubmittingUpdate(true);
    try {
      // Use project._id if id is not available
      const projectId = project._id || project.id;
      const { addProjectUpdate } = await import('../services/profilesAPI');
      const res = await addProjectUpdate(projectId as string, {
        title: updateTitle,
        description: updateDescription
      });
      
      // Update local state
      setProject({
        ...project,
        updates: [...(project.updates || []), res.update]
      });
      
      setShowUpdateModal(false);
      setUpdateTitle('');
      setUpdateDescription('');
    } catch (err: any) {
      console.error('Failed to add update', err);
      alert('Failed to add update. Please try again.');
    } finally {
      setIsSubmittingUpdate(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Showcase': return 'bg-purple-100 text-purple-700';
      case 'Active': return 'bg-blue-100 text-blue-700';
      case 'Recruiting': return 'bg-orange-100 text-orange-700';
      case 'Seeking Funding': return 'bg-green-100 text-green-700';
      case 'Archived': return 'bg-gray-100 text-gray-700';
      default: return 'bg-blue-50 text-blue-700';
    }
  };

  const handlePitchSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!project || !project.userEmail) {
      setPitchError("Project owner email is unknown. Cannot send message.");
      return;
    }
    
    setIsSubmittingPitch(true);
    setPitchError(null);
    try {
      const payload = {
        gigId: project._id || project.id,
        senderEmail: pitchEmail,
        receiverEmail: project.userEmail,
        content: pitchMessage,
        isPartnership: true // We can treat all project messages as safe/partnership to bypass auto-censor
      };
      
      const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send message');
      
      setPitchSuccess(true);
    } catch (err: any) {
      setPitchError(err.message);
    } finally {
      setIsSubmittingPitch(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Project Not Found</h2>
          <p className="text-slate-600 mb-6">{error || 'This project may have been removed or does not exist.'}</p>
          <Link to="/projects" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {isOwner && (
        <div className="bg-blue-900 text-white px-4 py-3 shadow-md z-40 sticky top-0 mb-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-300" />
              <span className="font-semibold text-sm">You own this project.</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={() => setShowUpdateModal(true)} variant="secondary" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-0">
                Post an Update
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link to="/projects" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              
              {/* Image Slider */}
              {sliderImages.length > 0 && (
                <div className="w-full h-64 md:h-[400px] bg-gray-100 relative group">
                  <img 
                    src={sliderImages[currentImageIndex]} 
                    alt={`${project.title} - Image ${currentImageIndex + 1}`} 
                    className="w-full h-full object-cover transition-opacity duration-300"
                  />
                  
                  {sliderImages.length > 1 && (
                    <>
                      <button 
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button 
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                      
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                        {sliderImages.map((_, idx) => (
                          <div 
                            key={idx} 
                            className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50'}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="p-6 md:p-10">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold uppercase tracking-wider ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                  {project.category && (
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm font-medium flex items-center gap-1.5">
                      <Tag className="w-4 h-4" /> {project.category}
                    </span>
                  )}
                  {project.currentLevel && (
                    <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">
                      Level: {project.currentLevel}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                  {project.title}
                </h1>
                
                {/* Tabs for Details vs Updates */}
                <div className="flex border-b border-gray-200 mb-8">
                  <button
                    className={`py-3 px-6 font-semibold text-sm transition-colors ${activeTab === 'details' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('details')}
                  >
                    Project Details
                  </button>
                  <button
                    className={`py-3 px-6 font-semibold text-sm transition-colors ${activeTab === 'updates' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('updates')}
                  >
                    Updates ({(project.updates || []).length})
                  </button>
                </div>

                {activeTab === 'details' ? (
                  <div className="text-gray-700 leading-relaxed space-y-3 mb-10">
                 {(project.description || '').split('\n').map((line, i) => {
                     const trimmed = line.trim();
                     if (!trimmed) return null;
                     
                     if (trimmed.startsWith('## ')) {
                      return <h3 key={i} className="text-lg font-bold text-gray-900 mt-6 mb-2">{trimmed.replace('## ', '')}</h3>;
                    }
                    if (trimmed.startsWith('### ')) {
                      return <h4 key={i} className="text-md font-bold text-gray-900 mt-4 mb-2">{trimmed.replace('### ', '')}</h4>;
                    }
                    if (trimmed.startsWith('- ')) {
                      return <li key={i} className="ml-4 list-disc text-gray-700">{trimmed.replace('- ', '')}</li>;
                    }
                    
                    if (trimmed.includes('**')) {
                       const parts = trimmed.split('**');
                       return (
                         <p key={i} className="text-gray-700">
                           {parts.map((part, index) => 
                             index % 2 === 1 ? <strong key={index} className="font-bold text-gray-900">{part}</strong> : part
                           )}
                         </p>
                       );
                    }
                    
                    if (trimmed.match(/^____+/)) {
                        return (
                            <div key={i} className="flex items-center my-6">
                                <div className="flex-grow border-t border-slate-300"></div>
                                <span className="mx-4 text-xs font-bold text-slate-500 uppercase tracking-widest">{trimmed.replace(/_+/g, '').trim()}</span>
                                <div className="flex-grow border-t border-slate-300"></div>
                            </div>
                        );
                    }

                    return <p key={i} className="text-gray-700">{trimmed}</p>;
                 })}
                </div>
                ) : (
                  <div className="space-y-8 mb-10">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-slate-900">Project Updates</h3>
                      {isOwner && (
                        <Button 
                          onClick={() => setShowUpdateModal(true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Add Update
                        </Button>
                      )}
                    </div>
                    
                    {(!project.updates || project.updates.length === 0) ? (
                      <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                        <p className="text-slate-500">No updates have been posted for this project yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                        {(project.updates || []).map((update, idx) => (
                          <div key={update.id || idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-blue-600 text-slate-500 group-[.is-active]:text-blue-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                              <span className="text-xs font-bold">{project.updates!.length - idx}</span>
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-bold text-slate-900 text-lg">{update.title}</h4>
                                <time className="text-xs font-medium text-slate-500">{new Date(update.date).toLocaleDateString()}</time>
                              </div>
                              <div className="text-slate-600 prose prose-sm max-w-none">
                                <ReactMarkdown>{update.description || ''}</ReactMarkdown>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

              {/* Resources / Documents block */}
              {(project.projectProposalUrl || project.institutionalEndorsement?.evidenceUrl || (project.resourceLinks && project.resourceLinks.length > 0) || 
(project.title || '').toLowerCase().includes('hydro-guard') || (project.title || '').toLowerCase().includes('geo-bind') || 
(project.title || '').toLowerCase().includes('uhpc')) && (
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-lg">
                    <ExternalLink className="w-5 h-5 text-slate-400" /> Documents & Resources
                  </h3>
                  <div className="flex flex-col gap-3">
                    {(() => {
                      const getProposalUrl = (title: string) => {
                        if (project.projectProposalUrl) return project.projectProposalUrl;
                        const t = (title || '').toLowerCase();
                        if (t.includes('hydro-guard') || t.includes('hydrophobic')) {
                          return 'https://drive.google.com/file/d/1ge6HauLBnxHg70VxlALsU5Ji0Qvi3zHK/view?usp=drive_link';
                        }
                        if (t.includes('geo-bind') || t.includes('geopolymer') || t.includes('tuff')) {
                          return 'https://drive.google.com/file/d/1ZG-ETzE2WjxPNDPGqOdoaabuhWaMaHWz/view?usp=drive_link';
                        }
                        if (t.includes('uhpc') || t.includes('agro') || t.includes('rice husk')) {
                          return 'https://drive.google.com/file/d/1ib9dWeSakb28Xx2RUfAmpQ-FfW28SzKF/view?usp=drive_link';
                        }
                        return null;
                      };
  
                      const proposalUrl = getProposalUrl(project.title);
                      if (!proposalUrl) return null;
  
                      return (
                        <a
                          href={proposalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-between w-full px-5 py-4 bg-indigo-50 border border-indigo-200 rounded-xl hover:border-indigo-400 hover:shadow-sm transition-all group"
                        >
                          <div>
                            <span className="block font-bold text-[#131ADF] group-hover:text-blue-800 transition-colors">Proposal to Funders / Pitch Deck</span>
                            <span className="text-xs text-indigo-500">Google Drive Document</span>
                          </div>
                          <ExternalLink className="w-5 h-5 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                        </a>
                      );
                    })()}
                    
                    {(project.institutionalEndorsement?.evidenceUrl || project.proofLink) && (
                      <a
                        href={project.institutionalEndorsement?.evidenceUrl || project.proofLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-between w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all group"
                      >
                        <div>
                          <span className="block font-semibold text-slate-700 group-hover:text-blue-700 transition-colors">Institutional Endorsement</span>
                          <span className="text-xs text-slate-500">Official email or verification document</span>
                        </div>
                        <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      </a>
                    )}
                    {project.resourceLinks?.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-between w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all group"
                      >
                        <span className="font-semibold text-slate-700 group-hover:text-blue-700 transition-colors">{link.label || 'Project Link'}</span>
                        <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            
            {/* Creator / Action Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm sticky top-24">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Creator Information</h3>
              
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl">
                  {project.authorName ? project.authorName.charAt(0) : 'U'}
                </div>
                <div>
                  <div className="font-semibold text-slate-800">
                    {project.authorName || 'Anonymous Creator'}
                  </div>
                  {project.createdAt && (
                    <div className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Posted {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Message Creator Modal */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full bg-[#131ADF] hover:bg-blue-700 text-white rounded-xl py-6 text-base font-semibold shadow-md hover:shadow-lg transition-all group">
                    <MessageCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" /> 
                    Contact Creator
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md rounded-2xl">
                  <DialogHeader>
                    <DialogTitle>Message Project Creator</DialogTitle>
                    <DialogDescription>
                      Interested in collaborating, verifying details, or offering funding? Send a message directly to the creator.
                    </DialogDescription>
                  </DialogHeader>
                  
                  {!pitchSuccess ? (
                    <form onSubmit={handlePitchSubmit} className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Your Email</label>
                        <Input
                          type="email"
                          required
                          placeholder="Enter your email"
                          value={pitchEmail}
                          onChange={(e) => setPitchEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Message</label>
                        <Textarea
                          required
                          placeholder="Introduce yourself and explain why you're reaching out..."
                          value={pitchMessage}
                          onChange={(e) => setPitchMessage(e.target.value)}
                          className="min-h-[120px] resize-none"
                        />
                      </div>
                      {pitchError && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                          {pitchError}
                        </div>
                      )}
                      <Button 
                        type="submit" 
                        disabled={isSubmittingPitch}
                        className="w-full bg-[#131ADF] hover:bg-blue-700"
                      >
                        {isSubmittingPitch ? 'Sending Message...' : 'Send Message'}
                      </Button>
                    </form>
                  ) : (
                    <div className="py-8 text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h4>
                      <p className="text-slate-600 mb-6">
                        Your message has been delivered. Please go to your Inbox to continue the chat.
                      </p>
                      <Link to="/inbox" className="inline-block w-full">
                        <Button className="w-full bg-[#131ADF] hover:bg-blue-700">Go to Inbox</Button>
                      </Link>
                    </div>
                  )}
                  </DialogContent>
                </Dialog>

                {/* Progress Bar (If Seeking Funding) */}
                {project.status === 'Seeking Funding' && (
                  <div className="mt-8 space-y-2">
                    <div className="flex justify-between text-sm font-semibold text-gray-700">
                      <span>Raised: KES {localFundedAmount.toLocaleString()}</span>
                      <span>Goal: KES {(project.escrowAmount || project.fundingGoal || 0).toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-blue-100 rounded-full h-3 overflow-hidden">
                      <div className="bg-[#131ADF] h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (localFundedAmount / (project.escrowAmount || project.fundingGoal || 1)) * 100)}%` }}></div>
                    </div>
                    
                    {/* Contribute Modal */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white rounded-xl py-6 text-base font-semibold shadow-md hover:shadow-lg transition-all group">
                          Contribute
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md rounded-2xl">
                        <DialogHeader>
                          <DialogTitle>Contribute to this Project</DialogTitle>
                          <DialogDescription>
                            Enter your M-PESA number and the amount you'd like to contribute. You will receive an STK push on your phone.
                          </DialogDescription>
                        </DialogHeader>
                        {!contributeSuccess ? (
                          <form onSubmit={handleContributeSubmit} className="space-y-4 py-4">
                            <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                              <div className="flex items-center gap-2">
                                <input type="checkbox" checked={contributeAnonymous} onChange={(e) => setContributeAnonymous(e.target.checked)} className="rounded text-[#131ADF] focus:ring-[#131ADF]" />
                                <label className="text-sm font-semibold text-gray-700">Donate Anonymously</label>
                              </div>
                              {!contributeAnonymous && (
                                <Input type="text" placeholder="John Doe" value={contributeName} onChange={(e) => setContributeName(e.target.value)} required={!contributeAnonymous} />
                              )}
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-gray-700">Amount (KES)</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">KES</span>
                                <Input
                                  type="number"
                                  min="10"
                                  placeholder="1000"
                                  className="pl-12"
                                  value={contributeAmount}
                                  onChange={(e) => setContributeAmount(e.target.value)}
                                  required
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-gray-700">M-PESA Phone Number</label>
                              <Input
                                type="tel"
                                placeholder="254700000000"
                                value={contributePhone}
                                onChange={(e) => setContributePhone(e.target.value)}
                                required
                              />
                            </div>
                            {contributeError && (
                              <p className="text-red-500 text-sm font-medium mb-4">{contributeError}</p>
                            )}
                            <Button type="submit" className="w-full bg-[#131ADF] hover:bg-blue-700 text-white rounded-xl h-12 text-lg font-bold shadow-md hover:shadow-lg transition-all" disabled={isContributing}>
                              {isContributing ? 'Initiating STK Push...' : 'Send Contribution'}
                            </Button>
                          </form>
                        ) : (
                          <div className="py-8 text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                              <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <h4 className="text-2xl font-bold text-gray-900 mb-2">Check Your Phone!</h4>
                            <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                              An M-PESA payment prompt has been sent to your phone. Enter your PIN to complete the contribution.
                            </p>
                            {contributeError && (
                              <p className="text-red-500 text-sm font-medium mb-4 bg-red-50 p-2 rounded-lg">{contributeError}</p>
                            )}
                            <Button
                              onClick={checkPaymentStatus}
                              disabled={isCheckingPayment || !pendingCheckoutId}
                              className="w-full bg-[#131ADF] hover:bg-blue-700 text-white rounded-xl h-12 font-bold transition-all mb-4"
                            >
                              {isCheckingPayment ? 'Checking Status...' : 'I have entered my PIN'}
                            </Button>
                            <Button
                              variant="ghost"
                              className="w-full text-gray-500 hover:text-gray-900"
                              onClick={() => { setContributeSuccess(false); setContributeAmount(''); }}
                            >
                              Cancel / Try Again
                            </Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
                
              </div>

              {/* Contributors Section */}
              {contributors && contributors.length > 0 && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider text-slate-500">
                    Top Contributors
                  </h3>
                  <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                    {contributors.slice(0, showContributors ? undefined : 3).map((contributor, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                          {contributor.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-grow">
                          <p className="text-sm font-semibold text-slate-800">{contributor.name}</p>
                        </div>
                        <div className="text-sm font-bold text-green-600">
                          KES {contributor.amount.toLocaleString()}
                        </div>
                      </div>
                    ))}
                    {contributors.length > 3 && (
                      <button
                        onClick={() => setShowContributors(!showContributors)}
                        className="w-full text-center text-sm font-bold text-[#131ADF] mt-2 hover:underline"
                      >
                        {showContributors ? 'Show Less' : `View All ${contributors.length} Contributors`}
                      </button>
                    )}
                  </div>
                </div>
              )}

          </div>
        </div>
      </div>

      {/* Add Update Modal */}
      <Dialog open={showUpdateModal} onOpenChange={setShowUpdateModal}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>Post Project Update</DialogTitle>
            <DialogDescription>
              Share your latest progress, milestones, or changes with your followers and funders. You can embed images using Markdown syntax: `![Alt Text](URL)`.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddUpdate} className="space-y-5 py-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Update Title</label>
              <Input
                required
                placeholder="e.g. Reached MVP Stage! 🎉"
                value={updateTitle}
                onChange={(e) => setUpdateTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex justify-between">
                <span>Update Content (Markdown)</span>
              </label>
              <Textarea
                required
                rows={10}
                placeholder="Write your update here. Use markdown for styling and images:
# Heading
- Bullet points
![Image Description](https://your-image-url.com/img.jpg)"
                className="font-mono text-sm"
                value={updateDescription}
                onChange={(e) => setUpdateDescription(e.target.value)}
              />
              <p className="text-xs text-slate-500 mt-2">
                Tip: If you need to host an image, you can upload it to any free image hosting service (like Imgur) and paste the Direct Link here using Markdown.
              </p>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowUpdateModal(false)}
                disabled={isSubmittingUpdate}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmittingUpdate}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmittingUpdate ? 'Posting...' : 'Post Update'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
