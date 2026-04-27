import React from 'react';
import { ArrowRight, Calendar, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { analyticsAPI } from '../services/api';
import type { Opportunity } from '../data/opportunities';
import { calculateUrgency, toSlug } from '../utils/dateUtils';

interface OpportunityCardProps {
  opportunity: Opportunity;
}

const CATEGORY_IMAGES: Record<string, string[]> = {
  Job: ['/images/opportunities/job_1.png', '/images/opportunities/job_2.png'],
  Gig: ['/images/opportunities/gig_1.png'],
  Scholarship: ['/images/opportunities/scholarship.jpeg', '/images/opportunities/scholarship.jpg'],
  Fellowship: ['/images/opportunities/fellowship.avif'],
  Attachment: ['/images/opportunities/attachment.jpeg'],
  Internship: ['/images/opportunities/internship.avif'],
  Grant: ['/images/opportunities/grant.avif'],
  Conference: ['/images/opportunities/conference.jpeg', '/images/opportunities/tech.avif'],
  CallForPapers: ['/images/opportunities/call-for-papers.png', '/images/opportunities/tech.avif'],
  Challenge: ['/images/opportunities/tech.avif'],
  Hackathon: ['/images/opportunities/hackathon.jpg', '/images/opportunities/tech.avif'],
  Project: ['/images/opportunities/tech.avif'],
  Event: ['/images/opportunities/community.jpg', '/images/opportunities/tech.avif']
};

export const getDynamicImageUrl = (category: string, id: string, providedUrl?: string, title?: string) => {
  // If the provided url is not the default generic logo, use it
  if (providedUrl && !providedUrl.includes('Opportunities Kenya Logo')) {
    return providedUrl;
  }
  
  let options = CATEGORY_IMAGES[category] || ['/images/opportunities/internship.avif'];

  // Override based on TITLE keywords for smarter image assignment!
  if (title) {
    const t = title.toLowerCase();
    if (t.includes('tech') || t.includes('software') || t.includes('data') || t.includes('developer') || t.includes('engineer')) {
      options = ['/images/opportunities/tech.avif'];
    } else if (t.includes('community') || t.includes('volunteer') || t.includes('social') || t.includes('youth')) {
      options = ['/images/opportunities/community.jpg'];
    } else if (t.includes('health') || t.includes('medical') || t.includes('clinical')) {
      options = ['/images/opportunities/kemri.png']; // or a generic health one if we generate it
    } else if (t.includes('finance') || t.includes('business') || t.includes('marketing')) {
      options = ['/images/opportunities/job_1.png'];
    } else if (t.includes('design') || t.includes('creative') || t.includes('art')) {
      options = ['/images/opportunities/gig_1.png'];
    }
  }

  // Use a simple hash of the ID to consistently pick the same image for the same post
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return options[hash % options.length];
};

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const urgency = calculateUrgency(opportunity.deadline);
  const verificationLabel = opportunity.status || (opportunity.isVerified ? 'Verified' : undefined);

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

  return (
    <Link
      to={`/opportunity/${toSlug(opportunity.title)}`}
      onClick={handleCardClick}
      className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      <article className="h-full flex flex-col pt-0">
        {/* Header Image */}
        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          <img
            src={finalImageUrl}
            alt={`${opportunity.category} opportunity from ${opportunity.provider}`}
            loading="lazy"
            decoding="async"
            onError={handleImageError}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 text-sm font-medium">
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

        {/* Deadline */}
        <div className={`flex items-center gap-1 text-sm font-medium mb-4 ${urgency.textColor}`}>
          <Calendar className="w-4 h-4" />
          <span>{urgency.label}</span>
        </div>

        {/* View Button */}
        <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm group-hover:gap-3 transition-all mt-auto">
          <span>View More</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
      </article>
    </Link>
  );
}

// Refurbished
