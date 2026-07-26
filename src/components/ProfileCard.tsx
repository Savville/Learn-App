import { Link } from 'react-router-dom';
import { MapPin, Users, Briefcase, Layers } from 'lucide-react';
import type { Profile } from '../services/profilesAPI';

interface ProfileCardProps {
    profile: Profile;
}

// Shared banner images — same pool used in ProfileView
const BANNER_IMAGES = [
    '/images/community.jpg',
    '/images/tech.avif',
    '/images/internship.avif',
    '/images/conference.jpeg',
    '/images/gig_1.png',
];

function getBannerIndex(email: string): number {
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
        hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % BANNER_IMAGES.length;
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export function ProfileCard({ profile }: ProfileCardProps) {
    const bannerIdx = getBannerIndex(profile.email);
    const initials = getInitials(profile.name);

    // Display stats — fallback to 0 if none
    const jobsLabel = (profile.totalClients || 0) > 0 ? `${profile.totalClients} jobs` : '0 jobs';
    const projectCount = profile.projects ? profile.projects.length : 0;
    const postingsLabel = projectCount > 0 ? `${projectCount} postings` : '0 postings';

    return (
        <div className="group bg-white rounded-[7px] border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 relative">
            {/* Banner Image Area — framed with border */}
            <div className="h-28 bg-gray-100 overflow-hidden">
                <img
                    src={BANNER_IMAGES[bannerIdx]}
                    alt={`${profile.name} banner`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
            </div>

            {/* Avatar — positioned exactly at banner boundary, half in banner half in white space */}
            {/* h-28 is 112px. Avatar is h-16 (64px). 112 - 32 = 80px. top-20 is 80px. */}
            <div className="absolute top-20 left-4 z-10">
                {profile.avatar ? (
                    <img
                        src={profile.avatar}
                        alt={profile.name}
                        className="w-16 h-16 rounded-full border-2 border-white shadow-sm object-cover"
                    />
                ) : (
                    <div className="w-16 h-16 rounded-full border-2 border-white bg-blue-900 flex items-center justify-center shadow-sm">
                        <span className="text-base font-bold text-white">{initials}</span>
                    </div>
                )}
            </div>

            {/* Content — starts just below avatar so there isn't awkward whitespace */}
            <div className="pt-10 pb-4 px-4">
                {/* Stats row — location, projects, jobs, postings */}
                <div className="flex items-center gap-2 mb-2 text-[10px] text-gray-500 font-medium">
                    {profile.location && (
                        <div className="flex items-center gap-1 shrink-0">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate max-w-[60px]">{profile.location.split(',')[0]}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1 shrink-0">
                        <Layers className="w-3 h-3" />
                        <span>{projectCount > 0 ? `${projectCount} projects` : '0 projects'}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        <Briefcase className="w-3 h-3" />
                        <span>{jobsLabel}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        <Users className="w-3 h-3" />
                        <span>{postingsLabel}</span>
                    </div>
                </div>

                {/* Name & Title */}
                <h3 className="text-gray-900 font-bold text-sm mb-0.5 truncate group-hover:text-blue-600 transition-colors">
                    {profile.name}
                </h3>
                <p className="text-blue-700 text-xs font-medium mb-2 truncate">
                    {profile.title || 'Professional'}
                </p>

                {/* Skills tags — light blue rectangles */}
                {profile.skills && profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {profile.skills.slice(0, 3).map((skill) => (
                            <span
                                key={skill}
                                className="text-[11px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100"
                            >
                                {skill}
                            </span>
                        ))}
                        {profile.skills.length > 3 && (
                            <span className="text-[11px] text-gray-400 self-center">
                                +{profile.skills.length - 3}
                            </span>
                        )}
                    </div>
                )}

                {/* View Button */}
                <Link
                    to={`/profile/${profile.email}`}
                    className="block w-full text-center px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-[5px] hover:bg-blue-700 transition-colors"
                >
                    View Profile
                </Link>
            </div>
        </div>
    );
}