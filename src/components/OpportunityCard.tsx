import { ArrowRight, Calendar } from 'lucide-react';
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
      className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      {/* Header Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        <img
          src={opportunity.logoUrl}
          alt={opportunity.provider}
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
  );
}
