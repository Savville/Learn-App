import { useState, useEffect } from 'react';
import { OTPLoginForm } from '../components/OTPLoginForm';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { FolderHeart, LogOut, UploadCloud, Github, Linkedin, Globe, Link as LinkIcon, DollarSign, CheckCircle, Save, Loader2, User } from 'lucide-react';

export function Portfolio() {
  const [token, setToken] = useState(localStorage.getItem('user_token'));
  const [email, setEmail] = useState(localStorage.getItem('user_email'));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    avatar: '',
    links: { github: '', linkedin: '', website: '', other1: '', other2: '' }
  });

  const [stats, setStats] = useState({
    totalEarnings: 0,
    completedGigsCount: 0,
    completedGigs: []
  });

  const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchPortfolio = async (userEmail: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/portfolio/${userEmail}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch portfolio');
      
      setProfile({
        name: data.profile.name || '',
        bio: data.profile.bio || '',
        avatar: data.profile.avatar || '',
        links: data.profile.links || { github: '', linkedin: '', website: '', other1: '', other2: '' }
      });
      setStats(data.stats);
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/portfolio`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': email || ''
        },
        body: JSON.stringify(profile)
      });
      if (!res.ok) throw new Error('Failed to save profile');
      alert('Profile saved successfully!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large. Max size is 2MB.");
      return;
    }

    try {
      // Use existing public upload route
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
      alert("Failed to upload image: " + err.message);
    }
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
      <div className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="text-slate-500 hover:text-[#131ADF]">
              <Link to="/opportunities">← Back</Link>
            </Button>
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">My Profile & Earnings</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleSave} disabled={saving} className="bg-[#131ADF] hover:bg-blue-800 text-white rounded-xl shadow-sm">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Profile
            </Button>
            <Button variant="outline" size="icon" onClick={handleLogout} className="text-slate-500 hover:text-red-600 rounded-xl">
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
            
            {/* Left Column: Editor */}
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
            </div>

            {/* Right Column: Earnings & Gigs */}
            <div className="flex flex-col gap-6">
              
              {/* Earnings Card */}
              <div className="bg-gradient-to-br from-[#131ADF] to-indigo-800 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2 opacity-80">
                    <DollarSign className="w-5 h-5" />
                    <span className="font-semibold text-sm uppercase tracking-wider">Total Earnings</span>
                  </div>
                  <h2 className="text-4xl font-extrabold mb-1">
                    <span className="text-xl opacity-80 mr-1">KES</span>
                    {stats.totalEarnings.toLocaleString()}
                  </h2>
                  <p className="text-xs opacity-70">From {stats.completedGigsCount} completed gigs</p>
                </div>
              </div>

              {/* History */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex-1 flex flex-col overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800">Job History</h3>
                </div>
                <div className="p-5 flex-1 overflow-y-auto max-h-[400px]">
                  {stats.completedGigs.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-sm">
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

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
