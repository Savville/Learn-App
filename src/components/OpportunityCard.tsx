import React from 'react';
import { ArrowRight, Calendar, CheckCircle, Users, Flame, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import { analyticsAPI } from '../services/api';
import { OTPLoginForm } from './OTPLoginForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { Opportunity } from '../data/opportunities';
import { useAlert } from '../contexts/AlertContext';
import { calculateUrgency, toSlug } from '../utils/dateUtils';

interface OpportunityCardProps {
  opportunity: Opportunity;
}

const CATEGORY_IMAGES: Record<string, string[]> = {
  Job: ['/images/job_1.png', '/images/job_2.png'],
  Gig: ['/images/gig_1.png'],
  Scholarship: ['/images/scholarship.jpeg', '/images/scholarship.jpg'],
  Fellowship: ['/images/fellowship.avif'],
  Attachment: ['/images/attachment.jpeg'],
  Internship: ['/images/internship.avif'],
  Grant: ['/images/grant.avif'],
  Conference: ['/images/conference.jpeg', '/images/tech.avif'],
  CallForPapers: ['/images/call-for-papers.png', '/images/tech.avif'],
  Challenge: ['/images/tech.avif'],
  Hackathon: ['/images/hackathon.jpg', '/images/tech.avif'],
  Project: ['/images/tech.avif'],
  Event: ['/images/community.jpg', '/images/tech.avif']
};

export const getDynamicImageUrl = (category: string, id: string, providedUrl?: string, title?: string) => {
  // If the provided url is not the default generic logo, use it
  if (providedUrl && !providedUrl.includes('Opportunities Kenya Logo')) {
    return providedUrl;
  }

  let options = CATEGORY_IMAGES[category] || ['/images/internship.avif'];

  // Override based on TITLE keywords for smarter image assignment!
  if (title) {
    const t = title.toLowerCase();
    if (t.includes('tech') || t.includes('software') || t.includes('data') || t.includes('developer') || t.includes('engineer')) {
      options = ['/images/tech.avif'];
    } else if (t.includes('community') || t.includes('volunteer') || t.includes('social') || t.includes('youth')) {
      options = ['/images/community.jpg'];
    } else if (t.includes('health') || t.includes('medical') || t.includes('clinical')) {
      options = ['/images/kemri.png']; // or a generic health one if we generate it
    } else if (t.includes('finance') || t.includes('business') || t.includes('marketing')) {
      options = ['/images/job_1.png'];
    } else if (t.includes('design') || t.includes('creative') || t.includes('art')) {
      options = ['/images/gig_1.png'];
    }
  }

  // Use a simple hash of the ID to consistently pick the same image for the same post
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return options[hash % options.length];
};

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const [isSaved, setIsSaved] = React.useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('saved_bookmarks') || '[]');
      return saved.includes(opportunity.id);
    } catch {
      return false;
    }
  });
  const [showLogin, setShowLogin] = React.useState(false);
  const { showAlert } = useAlert();
  const urgency = calculateUrgency(opportunity.deadline);
  const verificationLabel = opportunity.status || (opportunity.isVerified ? 'Verified' : undefined);

  // Real metrics from DB tracking for new posts, deterministic fake for older hardcoded posts
  const seed = opportunity.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const views = opportunity.views ? opportunity.views : (100 + (seed % 100));
  const isHot = views > 50;

  const finalImageUrl = getDynamicImageUrl(opportunity.category, opportunity.id, opportunity.logoUrl, opportunity.title);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const fallback = getDynamicImageUrl(opportunity.category, opportunity.id, undefined, opportunity.title);
    if (e.currentTarget.src !== window.location.origin + fallback) {
      e.currentTarget.src = fallback;
    }
  };

  const handleCardClick = async () => {
    try {
      analyticsAPI.track(opportunity.id, 'click').catch(err => {
        console.error('Analytics tracking error:', err);
      });
    } catch (err) {
      console.error('Error tracking click:', err);
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const token = localStorage.getItem('user_token');
    if (!token) {
      setShowLogin(true);
      return;
    }

    try {
      const res = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api'}/public/bookmarks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ opportunityId: opportunity.id })
      });
      const data = await res.json();
      if (res.ok) {
        setIsSaved(data.saved);
        try {
          let savedList = JSON.parse(localStorage.getItem('saved_bookmarks') || '[]');
          if (data.saved && !savedList.includes(opportunity.id)) {
            savedList.push(opportunity.id);
          } else if (!data.saved) {
            savedList = savedList.filter((id: string) => id !== opportunity.id);
          }
          localStorage.setItem('saved_bookmarks', JSON.stringify(savedList));
        } catch (e) {}
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLoginSuccess = (newToken: string, newEmail: string) => {
    // Note: handleSuccess on OTPLoginForm automatically sets localStorage.
    setShowLogin(false);
    showAlert({ title: 'Logged In', message: 'You can now save this opportunity!', type: 'success' });
    // Optionally trigger bookmark automatically here
  };

  return (
    <>
      <Link
      to={`/opportunity/${toSlug(opportunity.title)}`}
      onClick={handleCardClick}
      className={`group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${urgency.label === 'Depleted' ? 'grayscale opacity-75' : ''}`}
    >
      <article className="h-full flex flex-col pt-0">
        {/* Header Image */}
        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          <img
            src={opportunity.logoUrl}
            alt={`${opportunity.category} opportunity from ${opportunity.provider}`}
            loading="lazy"
            decoding="async"
            onError={handleImageError}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {urgency.label === 'Expired' && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 pointer-events-none">
              <span className="bg-gray-800 text-white font-bold tracking-widest uppercase px-4 py-2 rounded shadow-lg transform -rotate-12 border-2 border-dashed border-gray-400">
                Expired
              </span>
            </div>
          )}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button 
              onClick={handleBookmark}
              className={`p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${isSaved ? 'bg-[#131ADF] text-white' : 'bg-white/90 text-slate-500 hover:text-[#131ADF]'}`}
              title="Save for later"
            >
              <Bookmark className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} />
            </button>
            <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 text-xs font-bold uppercase tracking-wider shadow-sm">
              {opportunity.category}
            </span>
          </div>
          {verificationLabel && (
            <div className="absolute top-4 left-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${verificationLabel === 'Verified' ? 'bg-green-600 text-white' : verificationLabel === 'Rejected' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'}`}>
                {verificationLabel}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-gray-900 font-bold mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
            {opportunity.title}
          </h3>

          <div className="flex flex-col mb-3">
            {opportunity.postedBy && (
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs uppercase tracking-widest text-gray-400 font-bold">
                  Posted by {opportunity.postedBy}
                </span>
                {verificationLabel === 'Verified' && (
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                )}
              </div>
            )}
            <p className="text-blue-600 text-sm font-semibold">{opportunity.provider}</p>
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{opportunity.description}</p>

          <div className="flex items-center justify-between mt-auto mb-4">
            {/* Deadline */}
            <div className={`flex items-center gap-1 text-sm font-medium ${urgency.textColor}`}>
              <Calendar className="w-4 h-4" />
              <span>{urgency.label}</span>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-1.5 text-xs font-semibold bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100 shadow-sm">
              {isHot ? (
                <>
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  <span className="text-orange-600">{views} viewed</span>
                </>
              ) : (
                <>
                  <Users className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-blue-600">{views} viewed</span>
                </>
              )}
            </div>
          </div>

          {/* View Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm group-hover:gap-3 transition-all">
              <span>View Details & Apply</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </article>
    </Link>

      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent className="sm:max-w-[425px] p-0 border-0 overflow-hidden bg-transparent shadow-none">
          <div className="bg-white rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6">
              <OTPLoginForm 
                onSuccess={handleLoginSuccess}
                title="Sign in to Save"
                subtitle="You need to sign in to save opportunities to your Tracker."
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Refurbished
