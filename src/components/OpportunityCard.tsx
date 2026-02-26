import { ArrowRight, Globe, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { analyticsAPI } from '../services/api';
import type { Opportunity } from '../data/opportunities';
import { calculateUrgency } from '../utils/dateUtils';

interface OpportunityCardProps {
  opportunity: Opportunity;
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const urgency = calculateUrgency(opportunity.deadline);

  const handleCardClick = async () => {
    try {
      // Track the click without blocking navigation
      analyticsAPI.track(opportunity.id, 'click').catch(err => {
        console.error('Analytics tracking error:', err);
      });
    } catch (err) {
      console.error('Error tracking click:', err);
    }
  };

  return (
    <Link
      to={`/opportunity/${opportunity.id}`}
      onClick={handleCardClick}
      className="group bg-white border border-gray-300 overflow-hidden hover:border-blue-900 transition-all duration-300 rounded-sm m-0.5"
    >
      {/* Header Image */}
      <div className="relative h-40 bg-blue-50 overflow-hidden">
        <img
          src={opportunity.logoUrl}
          alt={opportunity.provider}
          className="w-full h-full object-cover group-hover:brightness-95 transition-all duration-300"
        />
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <span className="px-2 py-1 bg-blue-900 text-white text-xs font-bold uppercase tracking-wider">
            {opportunity.category}
          </span>
          <span className={`px-2 py-1 text-white text-xs font-bold flex items-center gap-1 ${
            opportunity.isKenyaBased 
              ? 'bg-green-800' 
              : 'bg-gray-700'
          }`}>
            <Globe className="w-3 h-3" />
            {opportunity.isKenyaBased ? 'Kenya' : 'Int\'l'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        <h3 className="text-gray-900 font-bold text-sm group-hover:text-blue-900 transition-colors line-clamp-2 uppercase tracking-tight">
          {opportunity.title}
        </h3>
        
        <p className="text-gray-600 text-xs font-semibold uppercase tracking-wider">{opportunity.provider}</p>

        <p className="text-gray-700 text-sm line-clamp-2 leading-snug">{opportunity.description}</p>

        {/* Urgency Badge */}
        <div className={`flex items-center gap-2 px-3 py-2 ${urgency.bgColor} border border-current rounded-sm`}>
          <Calendar className="w-3 h-3" />
          <span className={`text-xs font-bold uppercase tracking-wider ${urgency.textColor}`}>
            {urgency.label}
          </span>
        </div>

        {/* Footer Info */}
        <div className="flex flex-wrap gap-2 border-t border-gray-200 pt-3">
          <span className="px-2 py-1 bg-blue-100 text-blue-900 text-xs font-bold uppercase tracking-wider rounded-sm">
            {opportunity.eligibility.educationLevel}
          </span>
          {opportunity.estimatedBenefit && (
            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-bold uppercase tracking-wider rounded-sm">
              {opportunity.estimatedBenefit}
            </span>
          )}
        </div>

        {/* View Button */}
        <div className="flex items-center gap-2 text-blue-900 font-bold text-sm group-hover:gap-3 transition-all pt-2">
          <span className="uppercase tracking-wider text-xs">View Details</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}
