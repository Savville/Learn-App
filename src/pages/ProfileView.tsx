import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    MapPin, Star, Users, Globe, Github, Linkedin, ExternalLink,
    ArrowLeft, MessageSquare, Briefcase, CheckCircle, Loader2,
    ShieldCheck
} from 'lucide-react';
import { getProfileByEmail } from '../services/profilesAPI';
import type { Profile, ProfileProject } from '../services/profilesAPI';
import { useSEO } from '../hooks/useSEO';

export function ProfileView() {
    const { email } = useParams<{ email: string }>();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!email) return;
        setLoading(true);
        setError(null);

        getProfileByEmail(email)
            .then((res) => {
                setProfile(res.profile);
            })
            .catch((err) => {
                setError(err.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [email]);

    // Breadcrumbs for structured data
    const breadcrumbs = profile
        ? [
            { name: 'Home', url: 'https://opportunitieskenya.live' },
            { name: 'Profiles', url: 'https://opportunitieskenya.live/profiles' },
            { name: profile.name },
        ]
        : [];

    useSEO({
        title: profile ? `${profile.name} — ${profile.title || 'Professional'} | Profiles` : 'Loading...',
        description: profile?.bio || 'Discover talented professionals on Opportunities Kenya.',
        url: `/profiles/${email}`,
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-900 rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="text-red-400 mb-4">
                        <ShieldCheck className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-xl text-gray-900 mb-2 font-semibold">Profile Not Found</h3>
                    <p className="text-gray-600 mb-6">{error || 'The profile you\'re looking for doesn\'t exist.'}</p>
                    <button onClick={() => navigate('/profiles')} className="px-6 py-3 bg-blue-900 text-white rounded-xl hover:bg-blue-800 transition-colors font-medium">
                        Browse All Profiles
                    </button>
                </div>
            </div>
        );
    }

    const gradientIdx = Math.abs(
        profile.email.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
    ) % 8;

    const gradients = [
        'from-blue-600 to-indigo-700',
        'from-purple-600 to-pink-700',
        'from-emerald-600 to-teal-700',
        'from-orange-600 to-red-700',
        'from-cyan-600 to-blue-700',
        'from-rose-600 to-purple-700',
        'from-violet-600 to-indigo-700',
        'from-amber-600 to-orange-700',
    ];

    function getInitials(name: string): string {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }

    const links = (profile.links || { github: '', linkedin: '', website: '', other1: '', other2: '' }) as any;

    return (
        <>
            {/* Breadcrumb Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "BreadcrumbList",
                    "itemListElement": breadcrumbs.map((b, i) => ({
                        "@type": "ListItem",
                        "position": i + 1,
                        "name": b.name,
                        ...(b.url ? { "item": b.url } : {}),
                    })),
                })}
            </script>

            <div className="min-h-screen bg-gray-50">
                {/* Back Button */}
                <div className="bg-white border-b border-slate-200">
                    <div className="max-w-6xl mx-auto px-4 py-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-700 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Profiles
                        </button>
                    </div>
                </div>

                {/* Hero Banner */}
                <div className={`bg-gradient-to-r ${gradients[gradientIdx]}`}>
                    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
                        <div className="flex flex-col sm:flex-row items-start gap-6">
                            {/* Avatar */}
                            {profile.avatar ? (
                                <img
                                    src={profile.avatar}
                                    alt={profile.name}
                                    className="w-28 h-28 rounded-full border-4 border-white shadow-lg object-cover shrink-0"
                                />
                            ) : (
                                <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg bg-white flex items-center justify-center shrink-0">
                                    <span className={`text-3xl font-bold bg-gradient-to-r ${gradients[gradientIdx]} bg-clip-text text-transparent`}>
                                        {getInitials(profile.name)}
                                    </span>
                                </div>
                            )}

                            {/* Info */}
                            <div className="flex-1 text-white">
                                <div className="flex items-center gap-2 mb-1">
                                    <h1 className="text-2xl sm:text-3xl font-bold">{profile.name}</h1>
                                    {profile.isFeatured && (
                                        <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                            Featured
                                        </span>
                                    )}
                                </div>
                                <p className="text-lg text-white/90 font-medium mb-2">{profile.title || 'Professional'}</p>
                                {profile.location && (
                                    <div className="flex items-center gap-1.5 text-white/80 text-sm mb-3">
                                        <MapPin className="w-4 h-4" />
                                        {profile.location}
                                    </div>
                                )}
                                <div className="flex items-center gap-4 text-sm">
                                    {profile.rating && (
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                            <span className="font-bold">{profile.rating}</span>
                                            <span className="text-white/70">({profile.totalClients || 0} clients)</span>
                                        </div>
                                    )}
                                    {profile.rate && (
                                        <div className="text-white/90 font-semibold">
                                            KES {profile.rate}/hr
                                        </div>
                                    )}
                                    {profile.totalClients && (
                                        <div className="flex items-center gap-1 text-white/80">
                                            <Users className="w-4 h-4" />
                                            {profile.totalClients} completed
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 shrink-0">
                                <Link
                                    to={`/inbox`}
                                    state={{ toEmail: profile.email, introText: `Hi ${profile.name.split(' ')[0]}, I'd like to discuss a project...` }}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl hover:bg-white/30 transition-colors font-medium text-sm"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    Message
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Bio */}
                            {profile.bio && (
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                    <h2 className="font-bold text-slate-800 text-lg mb-3">About</h2>
                                    <p className="text-slate-600 text-sm leading-relaxed">{profile.bio}</p>
                                </div>
                            )}

                            {/* Skills */}
                            {profile.skills && profile.skills.length > 0 && (
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                    <h2 className="font-bold text-slate-800 text-lg mb-3">Skills & Expertise</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.skills.map((skill) => (
                                            <span
                                                key={skill}
                                                className="text-sm font-medium bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Interest Areas */}
                            {profile.interestAreas && profile.interestAreas.length > 0 && (
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                    <h2 className="font-bold text-slate-800 text-lg mb-3">Interest Areas</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.interestAreas.map((area) => (
                                            <span
                                                key={area}
                                                className="text-sm font-medium bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full"
                                            >
                                                {area}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Projects */}
                            {profile.projects && profile.projects.length > 0 && (
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                    <h2 className="font-bold text-slate-800 text-lg mb-4">Projects & Portfolio</h2>
                                    <div className="space-y-5">
                                        {profile.projects.map((project: ProfileProject, idx: number) => (
                                            <div key={idx} className="border border-slate-100 rounded-xl p-4 hover:border-blue-100 transition-colors">
                                                <div className="flex items-start justify-between gap-3 mb-2">
                                                    <h3 className="font-bold text-slate-800">{project.title}</h3>
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${project.status === 'completed'
                                                        ? 'bg-green-50 text-green-700'
                                                        : 'bg-blue-50 text-blue-700'
                                                        }`}>
                                                        {project.status === 'completed' ? 'Completed' : 'In Progress'}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-600 mb-3 leading-relaxed">{project.description}</p>
                                                {project.proofLink && (
                                                    <a
                                                        href={project.proofLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium"
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                        View Proof
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column - Sidebar */}
                        <div className="space-y-6">
                            {/* Contact & Links */}
                            {(links.github || links.linkedin || links.website || links.other1 || links.other2) && (
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                    <h2 className="font-bold text-slate-800 text-lg mb-4">Connect</h2>
                                    <div className="space-y-3">
                                        {links.linkedin && (
                                            <a href={links.linkedin} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-blue-50 hover:border-blue-200 border border-slate-100 transition-colors text-sm text-slate-700">
                                                <Linkedin className="w-5 h-5 text-[#0077B5]" />
                                                LinkedIn
                                            </a>
                                        )}
                                        {links.github && (
                                            <a href={links.github} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 border border-slate-100 transition-colors text-sm text-slate-700">
                                                <Github className="w-5 h-5 text-slate-700" />
                                                GitHub
                                            </a>
                                        )}
                                        {links.website && (
                                            <a href={links.website} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 border border-slate-100 transition-colors text-sm text-slate-700">
                                                <Globe className="w-5 h-5 text-slate-500" />
                                                Website
                                            </a>
                                        )}
                                        {links.other1 && (
                                            <a href={links.other1} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 border border-slate-100 transition-colors text-sm text-slate-700">
                                                <ExternalLink className="w-5 h-5 text-slate-400" />
                                                {links.other1.includes('dribbble') ? 'Dribbble' : links.other1.includes('behance') ? 'Behance' : 'Link'}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Quick Actions */}
                            <div className="bg-gradient-to-br from-blue-900 to-indigo-800 rounded-2xl p-6 text-white">
                                <Briefcase className="w-8 h-8 mb-3 opacity-80" />
                                <h3 className="font-bold text-lg mb-2">Work with {profile.name.split(' ')[0]}</h3>
                                <p className="text-sm text-white/70 mb-4">
                                    Send a message to discuss your project needs.
                                </p>
                                <Link
                                    to={`/inbox`}
                                    state={{ toEmail: profile.email }}
                                    className="block w-full text-center px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white/30 transition-colors font-semibold text-sm"
                                >
                                    Get In Touch
                                </Link>
                            </div>

                            {/* Email */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                <h3 className="font-bold text-slate-800 mb-2 text-sm">Contact Email</h3>
                                <a href={`mailto:${profile.email}`} className="text-sm text-blue-600 hover:text-blue-800 break-all">
                                    {profile.email}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}