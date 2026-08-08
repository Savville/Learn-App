import { useState, useEffect, useRef } from 'react';
import { AuthForm } from '../components/AuthForm';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { LogOut, UploadCloud, Github, Linkedin, Globe, Link as LinkIcon, DollarSign, CheckCircle, Save, Loader2, ExternalLink, User, Plus, X, ChevronDown, ChevronUp, Check, FolderHeart, Briefcase, MapPin, Copy, ShieldCheck, ArrowRight } from 'lucide-react';
import { toSlug } from '../utils/dateUtils';
import { useAlert } from '../contexts/AlertContext';
import ReactMarkdown from 'react-markdown';
import { Tracker } from './Tracker';
import { ProfileProject, ResourceLink } from '../services/profilesAPI';

interface Profile {
  name: string;
  bio: string;
  avatar: string;
  links: { github: string; linkedin: string; website: string; other1: string; other2: string; };
  projects: ProfileProject[];
  skills: string[];
  location?: string;
  institution?: string;
  institutionalEmail?: string;
  mpesaPhone?: string;
}

function EmailCopyButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <span 
      onClick={handleCopy}
      className="inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold cursor-pointer hover:bg-blue-200 transition-colors"
      title="Click to copy"
    >
      {email}
      {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-blue-600" />}
    </span>
  );
}

export function Portfolio() {
  const [token, setToken] = useState(localStorage.getItem('user_token'));
  const [email, setEmail] = useState(localStorage.getItem('user_email'));
  const [loading, setLoading] = useState(false);
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [error, setError] = useState<string | null>(null);
  const { showAlert , showConfirm } = useAlert();

  const [profile, setProfile] = useState<Profile>({
    name: '',
    bio: '',
    avatar: '',
    links: { github: '', linkedin: '', website: '', other1: '', other2: '' },
    projects: [],
    skills: [],
    location: ''
  });

  const [stats, setStats] = useState<{
    totalEarnings: number;
    completedGigsCount: number;
    postedGigsCount: number;
    completedGigs: any[];
    postedOpportunities: any[];
  }>({
    totalEarnings: 0,
    completedGigsCount: 0,
    postedGigsCount: 0,
    completedGigs: [],
    postedOpportunities: []
  });

  // Projects UI State
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProject, setNewProject] = useState<Partial<ProfileProject>>({ 
    title: '', 
    description: '', 
    status: 'Showcase', 
    category: '', 
    tags: [], 
    resourceLinks: [] 
  });
  const [initialUpdate, setInitialUpdate] = useState("");
  const [endorsementFile, setEndorsementFile] = useState<File | null>(null);
  const [projectProposalFile, setProjectProposalFile] = useState<File | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<Record<number, boolean>>({});

  // Skills UI State
  const [newSkill, setNewSkill] = useState('');

  // Tabs State
  const [activeTab, setActiveTab] = useState<'profile' | 'applications'>('profile');

  const initialLoadRef = useRef(true);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchPortfolio = async (userEmail: string) => {
    setLoading(true);
    initialLoadRef.current = true; // Prevent autosave during fetch
    try {
      const res = await fetch(`${API_BASE}/portfolio/${userEmail}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch portfolio');
      
      setProfile({
        name: data.profile.name || '',
        bio: data.profile.bio || '',
        avatar: data.profile.avatar || '',
        location: data.profile.location || '',
        links: data.profile.links || { github: '', linkedin: '', website: '', other1: '', other2: '' },
        projects: data.profile.projects || [],
        skills: data.profile.skills || []
      });
      setStats(data.stats);
      
      // Delay enabling autosave slightly so the initial setProfile doesn't trigger it
      setTimeout(() => { initialLoadRef.current = false; }, 500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && email) {
      fetchPortfolio(email);
    }
  }, [token, email]);

  const handleSuccess = (newToken: string, newEmail: string) => {
    setToken(newToken);
    setEmail(newEmail);
  };

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to log out?")) return;
    if (await showConfirm({ title: 'Confirm Action', message: "Are you sure you want to log out?" })) {
      localStorage.removeItem('user_token');
      localStorage.removeItem('user_email');
      setToken(null);
      setEmail(null);
    }
  };

  const saveProfileToBackend = async (dataToSave: Profile) => {
    setSavingStatus('saving');
    try {
      const res = await fetch(`${API_BASE}/portfolio`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': email || ''
        },
        body: JSON.stringify(dataToSave)
      });
      if (!res.ok) throw new Error('Failed to save profile');
      setSavingStatus('saved');
      setTimeout(() => setSavingStatus('idle'), 2000);
    } catch (err: any) {
      showAlert({ title: 'Error', message: err.message, type: 'error' });
      setSavingStatus('idle');
    }
  };

  // Debounced Autosave Effect
  useEffect(() => {
    if (initialLoadRef.current) return;
    
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    
    setSavingStatus('saving');
    debounceTimerRef.current = setTimeout(() => {
      saveProfileToBackend(profile);
    }, 1500);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [
    profile.name, profile.bio, profile.avatar, 
    profile.links.github, profile.links.linkedin, profile.links.website, profile.links.other1, profile.links.other2,
    profile.skills // also autosave on skills change
  ]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      showAlert({ title: 'File Too Large', message: 'Image is too large. Max size is 2MB.', type: 'warning' });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('coverImage', file);
      
      const res = await fetch(`${API_BASE}/public/upload-image`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setProfile(prev => ({ ...prev, avatar: data.imageUrl }));
    } catch (err: any) {
      showAlert({ title: 'Upload Failed', message: "Failed to upload image: " + err.message, type: 'error' });
    }
  };

  const handleAdditionalImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    let newImages = [...(newProject.images || [])];
    
    if (newImages.length + files.length > 5) {
      showAlert({ title: 'Upload Limit Reached', message: 'You can only upload up to 5 images for the slider.', type: 'warning' });
      return;
    }
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) {
        showAlert({ title: 'File Too Large', message: `Image ${file.name} is too large. Max size is 5MB.`, type: 'warning' });
        continue;
      }
      try {
        const formData = new FormData();
        formData.append('coverImage', file);
        
        const res = await fetch(`${API_BASE}/public/upload-image`, {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        
        newImages.push(data.imageUrl);
      } catch (err: any) {
        showAlert({ title: 'Upload Failed', message: `Failed to upload ${file.name}: ` + err.message, type: 'error' });
      }
    }
    
    setNewProject(prev => ({ ...prev, images: newImages }));
  };

  // --- Projects Handlers ---
  const handleSaveProject = async () => {
    if (!newProject.title?.trim() || !newProject.description?.trim()) {
      showAlert({ title: 'Validation', message: 'Title and description are required', type: 'warning' });
      return;
    }
    
    setSavingStatus('saving');
    try {
      let finalEndorsementUrl = newProject.institutionalEndorsement?.evidenceUrl || "";
      let finalProposalUrl = newProject.projectProposalUrl || "";

      const needsUpload = endorsementFile || projectProposalFile;
      if (needsUpload) {
        try {
          const sigRes = await fetch(`${API_BASE}/messages/upload-signature`);
          if (sigRes.ok) {
            const { signature, timestamp, cloudName, apiKey } = await sigRes.json();
            
            const uploadFileToCloudinary = async (file: File) => {
              const formData = new FormData();
              formData.append("file", file);
              formData.append("api_key", apiKey);
              formData.append("timestamp", timestamp.toString());
              formData.append("signature", signature);
              const uploadRes = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
                { method: "POST", body: formData }
              );
              if (uploadRes.ok) {
                const data = await uploadRes.json();
                return data.secure_url;
              }
              return null;
            };

            if (endorsementFile) {
               finalEndorsementUrl = await uploadFileToCloudinary(endorsementFile) || finalEndorsementUrl;
            }
            if (projectProposalFile) {
               finalProposalUrl = await uploadFileToCloudinary(projectProposalFile) || finalProposalUrl;
            }
          }
        } catch (err) {
          console.warn("Upload process failed:", err);
          showAlert({ title: 'Upload Failed', message: 'Could not upload PDF files.', type: 'warning' });
        }
      }

      const payload = {
        ...newProject,
        institutionalEndorsement: finalEndorsementUrl ? {
          ...newProject.institutionalEndorsement,
          evidenceUrl: finalEndorsementUrl
        } : undefined,
        projectProposalUrl: finalProposalUrl || undefined,
        updates: initialUpdate.trim() ? [{
          id: Math.random().toString(36).substr(2, 9),
          title: "Project Launched",
          description: initialUpdate.trim(),
          date: new Date().toISOString()
        }] : []
      };

      const res = await fetch(`${API_BASE}/public/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': email || ''
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create project');
      
      setProfile(prev => ({
        ...prev,
        projects: [data.project, ...prev.projects]
      }));
      
      setIsAddingProject(false);
      setNewProject({ 
        title: '', description: '', status: 'Showcase', 
        category: '', tags: [], resourceLinks: []
      });
      setInitialUpdate("");
      setEndorsementFile(null);
      setProjectProposalFile(null);
      setSavingStatus('saved');
      setTimeout(() => setSavingStatus('idle'), 2000);
      showAlert({ title: 'Success', message: 'Project created successfully', type: 'success' });
    } catch (err: any) {
      showAlert({ title: 'Error', message: err.message, type: 'error' });
      setSavingStatus('idle');
    }
  };

  const handleRemoveProject = async (index: number) => {
    const project = profile.projects[index];
    if (!project.id) {
      // If it doesn't have an ID, it's an old embedded project
      const updatedProfile = {
        ...profile,
        projects: profile.projects.filter((_, i) => i !== index)
      };
      setProfile(updatedProfile);
      saveProfileToBackend(updatedProfile);
      return;
    }

    if (await showConfirm({ title: 'Delete Project', message: 'Are you sure you want to delete this project?' })) {
      try {
        const res = await fetch(`${API_BASE}/public/projects/${project.id}`, {
          method: 'DELETE',
          headers: { 'x-user-email': email || '' }
        });
        if (!res.ok) throw new Error('Failed to delete project');
        
        setProfile(prev => ({
          ...prev,
          projects: prev.projects.filter((_, i) => i !== index)
        }));
        showAlert({ title: 'Deleted', message: 'Project removed successfully', type: 'success' });
      } catch (err: any) {
        showAlert({ title: 'Error', message: err.message, type: 'error' });
      }
    }
  };

  const toggleProjectExpand = (index: number) => {
    setExpandedProjects(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleAddResourceLink = () => {
    setNewProject(prev => ({
      ...prev,
      resourceLinks: [...(prev.resourceLinks || []), { label: 'GitHub', url: '' }]
    }));
  };

  const handleResourceLinkChange = (index: number, field: 'label' | 'url', value: string) => {
    const updatedLinks = [...(newProject.resourceLinks || [])];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    setNewProject(prev => ({ ...prev, resourceLinks: updatedLinks }));
  };

  const handleRemoveResourceLink = (index: number) => {
    setNewProject(prev => ({
      ...prev,
      resourceLinks: (prev.resourceLinks || []).filter((_, i) => i !== index)
    }));
  };

  // --- Skills Handlers ---
  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      e.preventDefault();
      const skillToAdd = newSkill.trim();
      if (!profile.skills.includes(skillToAdd)) {
        setProfile({ ...profile, skills: [...profile.skills, skillToAdd] });
      }
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfile({ ...profile, skills: profile.skills.filter(s => s !== skillToRemove) });
  };

  if (!token) {
    return null; // AuthGuard handles login
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-12">
      {/* Header */}
      <div className="bg-[#131ADF] rounded-b-3xl shadow-md mb-8">
        <div className="max-w-6xl mx-auto px-4 py-8 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="text-white/80 hover:text-white hover:bg-white/10">
                ← Back
              </Button>
              <h1 className="text-3xl font-bold text-white hidden sm:block">My Portfolio</h1>
            </div>
            
            <div className="flex gap-4 mt-2">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2 font-bold transition-colors border-b-4 ${activeTab === 'profile' ? 'text-white border-white' : 'text-white/60 border-transparent hover:text-white/80'}`}
              >
                Profile & Projects
              </button>
              <button 
                onClick={() => setActiveTab('applications')}
                className={`px-4 py-2 font-bold transition-colors border-b-4 ${activeTab === 'applications' ? 'text-white border-white' : 'text-white/60 border-transparent hover:text-white/80'}`}
              >
                My Applications
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3 self-start mt-2 sm:mt-0">
            {/* Autosave Indicator */}
            {activeTab === 'profile' && (
              <div className="flex items-center text-sm font-medium text-white/80 mr-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20 backdrop-blur-sm">
                {savingStatus === 'saving' && <><Loader2 className="w-4 h-4 mr-1.5 animate-spin text-white" /> Saving...</>}
                {savingStatus === 'saved' && <><Check className="w-4 h-4 mr-1.5 text-green-300" /> Saved</>}
                {savingStatus === 'idle' && <span className="text-white/60">Auto-saving</span>}
              </div>
            )}
            <Button variant="outline" size="icon" onClick={handleLogout} className="text-white/80 hover:text-red-400 bg-white/10 border-white/20 hover:bg-white/20 rounded-xl backdrop-blur-sm shadow-sm">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'applications' ? (
          <Tracker />
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#131ADF]" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center font-semibold">{error}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Editor & Projects */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Identity & Verification */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-6">
                <div className="flex flex-col items-center gap-3 shrink-0">
                  <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative group">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" loading="eager" decoding="async" />
                    ) : (
                      <User className="w-10 h-10 text-slate-400" />
                    )}
                    <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                      <UploadCloud className="w-5 h-5 mb-1" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider">Upload</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col gap-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Full Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Jane Doe" 
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#131ADF] focus:ring-1 focus:ring-[#131ADF] text-sm"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">Login Email <span title="Verified Email"><ShieldCheck className="w-3.5 h-3.5 text-green-500" /></span></label>
                      <input 
                        type="email" 
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
                        value={email || ''}
                        disabled
                        title="Verified login email cannot be changed here."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">MPESA Phone Number</label>
                      <input 
                        type="tel" 
                        placeholder="e.g. 0712345678" 
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#131ADF] focus:ring-1 focus:ring-[#131ADF] text-sm"
                        value={profile.mpesaPhone || ''}
                        onChange={(e) => setProfile({ ...profile, mpesaPhone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Location</label>
                      <div className="flex gap-2">
                        <select
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#131ADF] focus:ring-1 focus:ring-[#131ADF] text-sm bg-white"
                          value={
                            ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', ''].includes(profile.location || '')
                              ? (profile.location || '')
                              : 'Other'
                          }
                          onChange={(e) => {
                            if (e.target.value !== 'Other') {
                              setProfile({ ...profile, location: e.target.value });
                            } else {
                              setProfile({ ...profile, location: ' ' });
                            }
                          }}
                        >
                          <option value="">Select Location</option>
                          <option value="Nairobi">Nairobi</option>
                          <option value="Mombasa">Mombasa</option>
                          <option value="Kisumu">Kisumu</option>
                          <option value="Nakuru">Nakuru</option>
                          <option value="Eldoret">Eldoret</option>
                          <option value="Other">Other (Specify)</option>
                        </select>
                        {profile.location !== undefined && profile.location !== '' && !['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'].includes(profile.location) && (
                          <input
                            type="text"
                            placeholder="Specify"
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#131ADF] focus:ring-1 focus:ring-[#131ADF] text-sm"
                            value={profile.location.trim() === '' ? '' : profile.location}
                            onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                            autoFocus
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-100 pt-4 mt-2">
                    <h4 className="text-sm font-semibold text-slate-800 mb-3">Academic Affiliation</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Institution</label>
                        <select
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#131ADF] focus:ring-1 focus:ring-[#131ADF] text-sm bg-white"
                          value={
                            ['University of Nairobi', 'Kenyatta University', 'JKUAT', 'Strathmore University', 'Moi University', 'Egerton University', 'Maseno University', 'Daystar University', ''].includes(profile.institution || '')
                              ? (profile.institution || '')
                              : 'Other'
                          }
                          onChange={(e) => {
                            if (e.target.value !== 'Other') {
                              setProfile({ ...profile, institution: e.target.value });
                            } else {
                              setProfile({ ...profile, institution: ' ' });
                            }
                          }}
                        >
                          <option value="">Select Institution</option>
                          <option value="University of Nairobi">University of Nairobi</option>
                          <option value="Kenyatta University">Kenyatta University</option>
                          <option value="JKUAT">JKUAT</option>
                          <option value="Strathmore University">Strathmore University</option>
                          <option value="Moi University">Moi University</option>
                          <option value="Egerton University">Egerton University</option>
                          <option value="Maseno University">Maseno University</option>
                          <option value="Daystar University">Daystar University</option>
                          <option value="Other">Other (Specify)</option>
                        </select>
                        {profile.institution !== undefined && profile.institution !== '' && !['University of Nairobi', 'Kenyatta University', 'JKUAT', 'Strathmore University', 'Moi University', 'Egerton University', 'Maseno University', 'Daystar University'].includes(profile.institution) && (
                          <input
                            type="text"
                            placeholder="Specify Institution"
                            className="w-full px-3 py-2.5 mt-2 rounded-xl border border-slate-200 outline-none focus:border-[#131ADF] focus:ring-1 focus:ring-[#131ADF] text-sm"
                            value={profile.institution.trim() === '' ? '' : profile.institution}
                            onChange={(e) => setProfile({ ...profile, institution: e.target.value })}
                          />
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Institutional Email</label>
                        <input 
                          type="email" 
                          placeholder="e.g. student@students.uonbi.ac.ke" 
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#131ADF] focus:ring-1 focus:ring-[#131ADF] text-sm"
                          value={profile.institutionalEmail || ''}
                          onChange={(e) => setProfile({ ...profile, institutionalEmail: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 mt-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Professional Bio</label>
                    <textarea 
                      placeholder="I am a software engineer specializing in React and Node.js..." 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#131ADF] focus:ring-1 focus:ring-[#131ADF] text-sm h-28 resize-none"
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Links Section */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-[#131ADF]" /> Social & Links
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 bg-slate-50 px-3 rounded-xl border border-slate-200 focus-within:border-[#131ADF] focus-within:bg-white transition-colors">
                    <Github className="w-5 h-5 text-slate-400 shrink-0" />
                    <input 
                      type="url" placeholder="GitHub URL" 
                      className="w-full py-2.5 bg-transparent outline-none text-sm"
                      value={profile.links.github} onChange={(e) => setProfile({ ...profile, links: { ...profile.links, github: e.target.value } })}
                    />
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 px-3 rounded-xl border border-slate-200 focus-within:border-[#131ADF] focus-within:bg-white transition-colors">
                    <Linkedin className="w-5 h-5 text-slate-400 shrink-0" />
                    <input 
                      type="url" placeholder="LinkedIn URL" 
                      className="w-full py-2.5 bg-transparent outline-none text-sm"
                      value={profile.links.linkedin} onChange={(e) => setProfile({ ...profile, links: { ...profile.links, linkedin: e.target.value } })}
                    />
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 px-3 rounded-xl border border-slate-200 focus-within:border-[#131ADF] focus-within:bg-white transition-colors">
                    <Globe className="w-5 h-5 text-slate-400 shrink-0" />
                    <input 
                      type="url" placeholder="Personal Website" 
                      className="w-full py-2.5 bg-transparent outline-none text-sm"
                      value={profile.links.website} onChange={(e) => setProfile({ ...profile, links: { ...profile.links, website: e.target.value } })}
                    />
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 px-3 rounded-xl border border-slate-200 focus-within:border-[#131ADF] focus-within:bg-white transition-colors">
                    <LinkIcon className="w-5 h-5 text-slate-400 shrink-0" />
                    <input 
                      type="url" placeholder="Other Link (e.g. Dribbble)" 
                      className="w-full py-2.5 bg-transparent outline-none text-sm"
                      value={profile.links.other1} onChange={(e) => setProfile({ ...profile, links: { ...profile.links, other1: e.target.value } })}
                    />
                  </div>
                </div>
              </div>

              {/* Projects & Works Section */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <FolderHeart className="w-4 h-4 text-[#131ADF]" /> Projects & Works
                  </h3>
                  {!isAddingProject && (
                    <Button onClick={() => setIsAddingProject(true)} size="sm" variant="outline" className="text-[#131ADF] border-[#131ADF]/20 hover:bg-blue-50 h-8 rounded-full">
                      <Plus className="w-4 h-4 mr-1" /> Add Project
                    </Button>
                  )}
                </div>

                {isAddingProject && (
                  <div className="mb-6 p-5 border border-[#131ADF]/20 bg-blue-50/50 rounded-xl flex flex-col gap-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        placeholder="Project Title" 
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:border-[#131ADF] text-sm"
                        value={newProject.title}
                        onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                      />
                      <select 
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:border-[#131ADF] text-sm bg-white"
                        value={newProject.status || 'Showcase'}
                        onChange={(e) => setNewProject({ ...newProject, status: e.target.value as any })}
                      >
                        <option value="Showcase">Showcase (Finished)</option>
                        <option value="Active">Active (Development)</option>
                        <option value="Recruiting">Recruiting / Hiring</option>
                        <option value="Seeking Funding">Seeking Funding</option>
                        <option value="Archived">Archived / Inactive</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        placeholder="Category (e.g., Tech Startup, Research)" 
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:border-[#131ADF] text-sm"
                        value={newProject.category || ''}
                        onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                      />
                      <select
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:border-[#131ADF] text-sm bg-white"
                        value={newProject.currentLevel || 'Ideation'}
                        onChange={(e) => setNewProject({ ...newProject, currentLevel: e.target.value })}
                      >
                        <option value="Ideation">Ideation / Brainstorming</option>
                        <option value="Prototyping">Prototyping / Development</option>
                        <option value="Live">Live / Launched</option>
                        <option value="Scaling">Scaling / Growth</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5 mt-2">
                      <label className="text-sm font-semibold text-slate-700">Initial Project Report / Update (Optional)</label>
                      <p className="text-xs text-slate-500 mb-1">Add an initial update so viewers can see where you're at right from the start. You can format it with Markdown.</p>
                      <textarea 
                        placeholder="e.g., We've just finished our MVP and are currently looking for initial user feedback! ..." 
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-[#131ADF] text-sm h-24 resize-none"
                        value={initialUpdate}
                        onChange={(e) => setInitialUpdate(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        placeholder="Tags (comma separated)" 
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:border-[#131ADF] text-sm"
                        value={newProject.tags?.join(', ') || ''}
                        onChange={(e) => setNewProject({ ...newProject, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
                      />
                    </div>

                    <textarea 
                      placeholder="Description (Markdown supported). Explain the problem, your solution, and impact." 
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-[#131ADF] text-sm h-32 resize-none"
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    />

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-slate-700">Project Links (GitHub, LinkedIn, etc.)</span>
                        <Button variant="outline" size="sm" onClick={handleAddResourceLink} className="h-7 text-xs px-2 py-1">
                          <Plus className="w-3 h-3 mr-1" /> Add Link
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {newProject.resourceLinks?.map((link, idx) => (
                          <div key={idx} className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Title (e.g. GitHub)"
                              className="w-1/3 px-3 py-1.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-[#131ADF]"
                              value={link.label}
                              onChange={(e) => handleResourceLinkChange(idx, 'label', e.target.value)}
                            />
                            <input
                              type="url"
                              placeholder="https://..."
                              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-[#131ADF]"
                              value={link.url}
                              onChange={(e) => handleResourceLinkChange(idx, 'url', e.target.value)}
                            />
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => handleRemoveResourceLink(idx)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4 mt-2">
                      <h4 className="text-sm font-semibold text-slate-800 mb-4">Verification & Funding Documents</h4>
                      <div className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-sm font-semibold text-slate-700">Institutional Endorsement Letter (PDF)</label>
                          <p className="text-xs text-slate-500 mb-2 leading-relaxed">
                            Please forward the entire endorsement email thread from your institution to 
                            <EmailCopyButton email="opportunitieskenyalive@gmail.com" /> 
                            AND upload a printed PDF version of that forwarded thread here.
                          </p>
                          <input 
                            type="file" 
                            accept="application/pdf"
                            className="w-full text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setEndorsementFile(e.target.files[0]);
                              } else {
                                setEndorsementFile(null);
                              }
                            }}
                          />
                          {endorsementFile && <p className="text-xs text-green-600">✓ {endorsementFile.name} selected</p>}
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-sm font-semibold text-slate-700">Proposal to Funders / Pitch Deck (PDF)</label>
                          <p className="text-xs text-slate-500 mb-1">Upload a single PDF document containing both the project proposal and the funder benefits/recognitions.</p>
                          <input 
                            type="file" 
                            accept="application/pdf"
                            className="w-full text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setProjectProposalFile(e.target.files[0]);
                              } else {
                                setProjectProposalFile(null);
                              }
                            }}
                          />
                          {projectProposalFile && <p className="text-xs text-green-600">✓ {projectProposalFile.name} selected</p>}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-[#131ADF]/10">
                      <Button variant="ghost" size="sm" onClick={() => setIsAddingProject(false)}>Cancel</Button>
                      <Button size="sm" onClick={handleSaveProject} disabled={savingStatus === 'saving'} className="bg-[#131ADF] hover:bg-blue-800 text-white rounded-lg">
                        {savingStatus === 'saving' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Save Project
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  {profile.projects.length === 0 && !isAddingProject ? (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      No projects added yet. Showcase your work!
                    </div>
                  ) : (
                    profile.projects.map((project, index) => {
                      const isExpanded = expandedProjects[index];
                      return (
                        <div key={index} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 group relative">
                          <button 
                            onClick={() => handleRemoveProject(index)}
                            className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove project"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          
                          <div className="flex justify-between items-start mb-2 pr-6">
                            <div>
                              <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                {project.title}
                                {project.status && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#131ADF]/10 text-[#131ADF] font-semibold">
                                    {project.status}
                                  </span>
                                )}
                              </h4>
                              {project.category && (
                                <p className="text-xs text-slate-500 mt-1">{project.category}</p>
                              )}
                            </div>
                          </div>

                          <div className={`text-sm text-slate-600 prose prose-sm max-w-none ${!isExpanded ? 'line-clamp-3' : ''}`}>
                            <ReactMarkdown>{project.description}</ReactMarkdown>
                          </div>

                          {project.tags && project.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {project.tags.map((tag, i) => (
                                <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-600 rounded-md">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap gap-3">
                              {/* Fallback for legacy proofLink */}
                              {/* @ts-ignore */}
                              {project.proofLink && (
                                <a href={(project as any).proofLink} target="_blank" rel="noopener noreferrer" className="text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs hover:border-[#131ADF] hover:text-[#131ADF] transition-colors flex items-center">
                                  <LinkIcon className="w-3 h-3 mr-1" /> Original Link
                                </a>
                              )}
                              
                              {/* New resourceLinks array */}
                              {project.resourceLinks?.map((link, idx) => (
                                <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs hover:border-[#131ADF] hover:text-[#131ADF] transition-colors flex items-center shadow-sm">
                                  <LinkIcon className="w-3 h-3 mr-1.5" /> {link.label}
                                </a>
                              ))}
                            </div>
                          )}

                          <Link 
                            to={`/projects/${project.id || (project as any)._id}`}
                            className="mt-3 text-xs font-semibold text-slate-500 hover:text-[#131ADF] flex items-center"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" /> View Details
                          </Link>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

            {/* Right Column: Earnings, Gigs & Skills */}
            <div className="flex flex-col gap-6">
              
              {/* Jobs & Postings Card */}
              <div className="bg-gradient-to-br from-[#131ADF] to-indigo-800 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2 opacity-80">
                    <Briefcase className="w-5 h-5" />
                    <span className="font-semibold text-sm uppercase tracking-wider">Projects, Jobs & Postings</span>
                  </div>
                  <div className="flex gap-6 mt-4 w-full">
                    <div className="flex-1">
                      <p className="text-xs opacity-70 mb-1 uppercase tracking-wider font-semibold">Projects</p>
                      <h2 className="text-3xl font-extrabold">
                        {profile.projects?.length || 0}
                      </h2>
                    </div>
                    <div className="w-px bg-white/20"></div>
                    <div className="flex-1">
                      <p className="text-xs opacity-70 mb-1 uppercase tracking-wider font-semibold">Jobs</p>
                      <h2 className="text-3xl font-extrabold">
                        {stats.completedGigsCount}
                      </h2>
                    </div>
                    <div className="w-px bg-white/20"></div>
                    <div className="flex-1">
                      <p className="text-xs opacity-70 mb-1 uppercase tracking-wider font-semibold">Postings</p>
                      <h2 className="text-3xl font-extrabold">
                        {stats.postedGigsCount || 0}
                      </h2>
                    </div>
                  </div>
                </div>
              </div>

              {/* Platform Activity */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden max-h-[500px]">
                <div className="p-5 border-b border-slate-100 shrink-0">
                  <h3 className="font-bold text-slate-800">Platform Activity</h3>
                </div>
                <div className="p-5 flex-1 overflow-y-auto">
                  {stats.completedGigs.length === 0 && (!stats.postedOpportunities || stats.postedOpportunities.length === 0) ? (
                    <div className="text-center py-6 text-slate-400 text-sm">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No platform activity yet.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-6">
                      {/* Completed Jobs */}
                      {stats.completedGigs.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Completed Jobs</h4>
                          <div className="flex flex-col gap-3">
                            {stats.completedGigs.map((gig: any, i: number) => (
                              <div key={`gig-${i}`} className="flex flex-col border border-slate-100 rounded-xl p-3 hover:border-green-200 transition-colors bg-green-50/30">
                                <span className="text-sm font-bold text-slate-800 mb-1">{gig.title || gig.opportunityTitle}</span>
                                <div className="flex items-center justify-between mt-auto">
                                  <span className="text-xs text-green-700 font-bold">Paid KES {gig.amount}</span>
                                  <span className="text-[10px] text-slate-400">
                                    {new Date(gig.completedAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Posted Opportunities */}
                      {stats.postedOpportunities && stats.postedOpportunities.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Posted Opportunities</h4>
                          <div className="flex flex-col gap-3">
                            {stats.postedOpportunities.map((opp: any, i: number) => (
                              <Link 
                                to={`/opportunity/${toSlug(opp.title)}`} 
                                key={`opp-${i}`} 
                                className="flex flex-col border border-slate-100 rounded-xl p-3 hover:border-[#131ADF] hover:shadow-sm transition-all bg-white relative group"
                              >
                                <span className="text-sm font-bold text-slate-800 mb-1 group-hover:text-[#131ADF] pr-4">{opp.title}</span>
                                <ArrowRight className="w-3 h-3 text-[#131ADF] absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center justify-between mt-auto">
                                  <span className="text-xs text-blue-700 font-semibold">{opp.category}</span>
                                  <span className="text-[10px] text-slate-400">
                                    {new Date(opp.dateAdded).toLocaleDateString()}
                                  </span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Skills Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
                <div className="p-5 border-b border-slate-100 shrink-0 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800">Skills & Expertise</h3>
                </div>
                <div className="p-5">
                  <input 
                    type="text" 
                    placeholder="Type a skill & press Enter..." 
                    className="w-full px-4 py-2 mb-4 rounded-xl border border-slate-200 outline-none focus:border-[#131ADF] focus:ring-1 focus:ring-[#131ADF] text-sm"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={handleAddSkill}
                  />
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, i) => (
                      <div key={i} className="flex items-center gap-1.5 bg-blue-50 text-[#131ADF] text-xs font-semibold px-3 py-1.5 rounded-full group transition-colors hover:bg-blue-100">
                        {skill}
                        <button onClick={() => handleRemoveSkill(skill)} className="text-blue-300 hover:text-[#131ADF] transition-colors focus:outline-none">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {profile.skills.length === 0 && (
                      <span className="text-sm text-slate-400 italic">No skills added yet.</span>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
