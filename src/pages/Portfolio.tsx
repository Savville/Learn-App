import { useState, useEffect, useRef } from 'react';
import { OTPLoginForm } from '../components/OTPLoginForm';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { LogOut, UploadCloud, Github, Linkedin, Globe, Link as LinkIcon, DollarSign, CheckCircle, Save, Loader2, User, Plus, X, ChevronDown, ChevronUp, Check, FolderHeart, Briefcase, MapPin } from 'lucide-react';
import { useAlert } from '../contexts/AlertContext';
import ReactMarkdown from 'react-markdown';

interface Project {
  _id?: string;
  title: string;
  description: string;
  images?: string[];
  proofLink?: string;
  status?: string;
  createdAt?: string;
}

interface Profile {
  name: string;
  bio: string;
  avatar: string;
  links: { github: string; linkedin: string; website: string; other1: string; other2: string; };
  projects: Project[];
  skills: string[];
  location?: string;
}

export function Portfolio() {
  const [token, setToken] = useState(localStorage.getItem('user_token'));
  const [email, setEmail] = useState(localStorage.getItem('user_email'));
  const [loading, setLoading] = useState(false);
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [error, setError] = useState<string | null>(null);
  const { showAlert } = useAlert();

  const [profile, setProfile] = useState<Profile>({
    name: '',
    bio: '',
    avatar: '',
    links: { github: '', linkedin: '', website: '', other1: '', other2: '' },
    projects: [],
    skills: [],
    location: ''
  });

  const [stats, setStats] = useState({
    totalEarnings: 0,
    completedGigsCount: 0,
    postedGigsCount: 0,
    completedGigs: []
  });

  // Projects UI State
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProject, setNewProject] = useState<Project>({ title: '', description: '', proofLink: '' });
  const [expandedProjects, setExpandedProjects] = useState<Record<number, boolean>>({});

  // Skills UI State
  const [newSkill, setNewSkill] = useState('');

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

  const handleLogout = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_email');
    setToken(null);
    setEmail(null);
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

  // --- Projects Handlers ---
  const handleSaveProject = () => {
    if (!newProject.title.trim() || !newProject.description.trim()) {
      showAlert({ title: 'Validation', message: 'Title and description are required', type: 'warning' });
      return;
    }
    const updatedProfile = { 
      ...profile, 
      projects: [...profile.projects, { ...newProject, createdAt: new Date().toISOString() }] 
    };
    setProfile(updatedProfile);
    saveProfileToBackend(updatedProfile); // Save immediately for projects
    setIsAddingProject(false);
    setNewProject({ title: '', description: '', proofLink: '' });
  };

  const handleRemoveProject = (index: number) => {
    const updatedProfile = {
      ...profile,
      projects: profile.projects.filter((_, i) => i !== index)
    };
    setProfile(updatedProfile);
    saveProfileToBackend(updatedProfile);
  };

  const toggleProjectExpand = (index: number) => {
    setExpandedProjects(prev => ({ ...prev, [index]: !prev[index] }));
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
    return (
      <div className="py-8">
        <OTPLoginForm 
          onSuccess={handleSuccess} 
          title="Your Professional Portfolio" 
          subtitle="Enter your email to manage your profile and view your earnings."
        />
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-12">
      {/* Header */}
      <div className="bg-[#131ADF] rounded-b-3xl shadow-md mb-8">
        <div className="max-w-6xl mx-auto px-4 py-8 pb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="text-white/80 hover:text-white hover:bg-white/10">
              ← Back
            </Button>
            <h1 className="text-3xl font-bold text-white hidden sm:block">My Profile & Earnings</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Autosave Indicator */}
            <div className="flex items-center text-sm font-medium text-white/80 mr-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20 backdrop-blur-sm">
              {savingStatus === 'saving' && <><Loader2 className="w-4 h-4 mr-1.5 animate-spin text-white" /> Saving...</>}
              {savingStatus === 'saved' && <><Check className="w-4 h-4 mr-1.5 text-green-300" /> Saved</>}
              {savingStatus === 'idle' && <span className="text-white/60">Auto-saving</span>}
            </div>
            <Button variant="outline" size="icon" onClick={handleLogout} className="text-white/80 hover:text-red-400 bg-white/10 border-white/20 hover:bg-white/20 rounded-xl backdrop-blur-sm shadow-sm">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#131ADF]" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center font-semibold">{error}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Editor & Projects */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Basic Info */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-6">
                <div className="flex flex-col items-center gap-3 shrink-0">
                  <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative group">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-slate-400" />
                    )}
                    <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                      <UploadCloud className="w-5 h-5 mb-1" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider">Upload</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{email}</span>
                </div>
                
                <div className="flex-1 flex flex-col gap-4">
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
                              setProfile({ ...profile, location: ' ' }); // Trigger 'Other' state
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
                  <div>
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
                  <div className="mb-6 p-4 border border-[#131ADF]/20 bg-blue-50/50 rounded-xl flex flex-col gap-4">
                    <input 
                      type="text" 
                      placeholder="Project Title" 
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:border-[#131ADF] text-sm"
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    />
                    <textarea 
                      placeholder="Description (Markdown supported, ~200 words max)" 
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-[#131ADF] text-sm h-32 resize-none"
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    />
                    <input 
                      type="url" 
                      placeholder="Proof Link (GitHub, DOI, Google Drive, etc.)" 
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:border-[#131ADF] text-sm"
                      value={newProject.proofLink}
                      onChange={(e) => setNewProject({ ...newProject, proofLink: e.target.value })}
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <Button variant="ghost" size="sm" onClick={() => setIsAddingProject(false)}>Cancel</Button>
                      <Button size="sm" onClick={handleSaveProject} className="bg-[#131ADF] hover:bg-blue-800 text-white rounded-lg">Save Project</Button>
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
                            <h4 className="font-bold text-slate-800">{project.title}</h4>
                          </div>

                          <div className={`text-sm text-slate-600 prose prose-sm max-w-none ${!isExpanded ? 'line-clamp-3' : ''}`}>
                            <ReactMarkdown>{project.description}</ReactMarkdown>
                          </div>

                          {isExpanded && project.proofLink && (
                            <div className="mt-4 pt-4 border-t border-slate-200">
                              <a href={project.proofLink} target="_blank" rel="noopener noreferrer" className="text-[#131ADF] text-sm hover:underline inline-flex items-center break-all">
                                <LinkIcon className="w-3 h-3 mr-1 shrink-0" /> {project.proofLink}
                              </a>
                            </div>
                          )}

                          <button 
                            onClick={() => toggleProjectExpand(index)}
                            className="mt-3 text-xs font-semibold text-slate-500 hover:text-[#131ADF] flex items-center"
                          >
                            {isExpanded ? (
                              <><ChevronUp className="w-3 h-3 mr-1" /> Show Less</>
                            ) : (
                              <><ChevronDown className="w-3 h-3 mr-1" /> Read More</>
                            )}
                          </button>
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
                    <span className="font-semibold text-sm uppercase tracking-wider">Jobs & Postings</span>
                  </div>
                  <div className="flex gap-6 mt-4">
                    <div>
                      <p className="text-xs opacity-70 mb-1">Completed Jobs</p>
                      <h2 className="text-3xl font-extrabold">
                        {stats.completedGigsCount}
                      </h2>
                    </div>
                    <div className="w-px bg-white/20"></div>
                    <div>
                      <p className="text-xs opacity-70 mb-1">Opportunities Posted</p>
                      <h2 className="text-3xl font-extrabold">
                        {stats.postedGigsCount || 0}
                      </h2>
                    </div>
                  </div>
                </div>
              </div>

              {/* History */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden max-h-[350px]">
                <div className="p-5 border-b border-slate-100 shrink-0">
                  <h3 className="font-bold text-slate-800">Job History</h3>
                </div>
                <div className="p-5 flex-1 overflow-y-auto">
                  {stats.completedGigs.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-sm">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No completed gigs yet.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {stats.completedGigs.map((gig: any, i: number) => (
                        <div key={i} className="flex flex-col border border-slate-100 rounded-xl p-3 hover:border-blue-100 transition-colors">
                          <span className="text-sm font-bold text-slate-800 mb-1">{gig.opportunityTitle}</span>
                          <div className="flex items-center justify-between mt-auto">
                            <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">Paid KES {gig.amount}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(gig.completedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
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
