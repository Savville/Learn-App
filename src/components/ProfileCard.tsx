import { Link } from 'react-router-dom';
import { MapPin, Users, Briefcase } from 'lucide-react';
import type { Profile } from '../services/profilesAPI';

interface ProfileCardProps {
    profile: Profile;
}

// Banner images pool for profiles
const BANNER_IMAGES = [
    '/images/internship.avif',
    '/images/job_1.png',
    '/images/tech.avif',
    '/images/community.jpg',
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
    const locationName = profile.location?.split(',')[0] || '';

    return (
        <div className="group bg-white rounded-[7px] border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
            {/* Banner Image */}
            <div className="relative h-28 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                <img
                    src={BANNER_IMAGES[bannerIdx]}
                    alt={`${profile.name} banner`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Avatar overlay on banner */}
                {profile.avatar ? (
                    <img
                        src={profile.avatar}
                        alt={profile.name}
                        className="absolute bottom-[-24px] left-4 w-16 h-16 rounded-[5px] border-2 border-white object-cover shadow-sm"
                    />
                ) : (
                    <div className="absolute bottom-[-24px] left-4 w-16 h-16 rounded-[5px] border-2 border-white bg-white flex items-center justify-center shadow-sm">
                        <span className="text-lg font-bold text-blue-900">{initials}</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="pt-20 pb-4 px-4">
                {/* Stats row — below banner, above name */}
                <div className="flex items-center gap-3 mb-2 text-xs text-gray-500">
                    {locationName && (
                        <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{locationName}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        <span>{profile.totalClients || 0} jobs</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{profile.projects?.length || 0} postings</span>
                    </div>
                </div>

                {/* Name & Title */}
                <h3 className="text-gray-900 font-bold text-base mb-0.5 truncate group-hover:text-blue-600 transition-colors">
                    {profile.name}
                </h3>
                <p className="text-blue-700 text-sm font-medium mb-3 truncate">
                    {profile.title || 'Professional'}
                </p>

                {/* Skills tags */}
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
                    className="block w-full text-center px-3 py-2 bg-blue-600 text-white text-sm font-semibold rounded-[5px] hover:bg-blue-700 transition-colors"
                >
                    View Profile
                </Link>
            </div>
        </div>
    );
}