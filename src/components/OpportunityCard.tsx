import React from 'react';
import { ArrowRight, Calendar, Bell } from 'lucide-react';
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
};

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const urgency = calculateUrgency(opportunity.deadline);

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
    <div className="flex flex-col">
    <Link
      to={`/opportunity/${toSlug(opportunity.title)}`}
      onClick={handleCardClick}
      className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex-1"
    >
      {/* Header Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        <img
          src={opportunity.logoUrl}
          alt={opportunity.provider}
          onError={handleImageError}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 text-sm font-medium">
            {opportunity.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-gray-900 font-bold mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
          {opportunity.title}
        </h3>

        <p className="text-blue-600 text-sm mb-3 font-semibold">{opportunity.provider}</p>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{opportunity.description}</p>

        {/* Deadline */}
        <div className={`flex items-center gap-1 text-sm font-medium mb-4 ${urgency.textColor}`}>
          <Calendar className="w-4 h-4" />
          <span>{urgency.label}</span>
        </div>

        {/* View Button */}
        <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm group-hover:gap-3 transition-all">
          <span>View More</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </Link>

    {/* Subscribe for more — below card */}
    <a
      href="/#newsletter"
      onClick={(e) => { e.stopPropagation(); }}
      className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-gray-400 hover:text-blue-600 transition-colors border-t border-gray-100 bg-white rounded-b-2xl hover:bg-blue-50"
    >
      <Bell className="w-3 h-3" />
      <span>Subscribe for more</span>
    </a>
    </div>
  );
}
