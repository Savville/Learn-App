import React from 'react';
import { ArrowRight, Calendar, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { analyticsAPI } from '../services/api';
import type { Opportunity } from '../data/opportunities';
import { calculateUrgency, toSlug } from '../utils/dateUtils';

interface OpportunityCardProps {
  opportunity: Opportunity;
}

const CATEGORY_FALLBACKS: Record<string, string> = {
  Scholarship: '/images/opportunities/internship.avif',
  Fellowship: '/images/opportunities/fellowship.avif',
  Attachment: '/images/opportunities/attachment.jpeg',
  Internship: '/images/opportunities/internship.avif',
  Grant: '/images/opportunities/grant.avif',
  Conference: '/images/opportunities/tech.avif',
  CallForPapers: '/images/opportunities/tech.avif',
  Challenge: '/images/opportunities/tech.avif',
  Hackathon: '/images/opportunities/tech.avif',
  Project: '/images/opportunities/tech.avif'
};

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const urgency = calculateUrgency(opportunity.deadline);
  const verificationLabel = opportunity.status || (opportunity.isVerified ? 'Verified' : undefined);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const fallback = CATEGORY_FALLBACKS[opportunity.category] ?? '/images/opportunities/internship.avif';
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
            src={opportunity.logoUrl}
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
