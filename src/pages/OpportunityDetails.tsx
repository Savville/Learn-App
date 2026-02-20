import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { opportunitiesAPI, analyticsAPI } from '../services/api';
import { Calendar, ExternalLink, ArrowLeft, Tag, CheckCircle, Globe } from 'lucide-react';
import { calculateUrgency } from '../utils/dateUtils';
import type { Opportunity } from '../data/opportunities';

export function OpportunityDetails() {
  const { id } = useParams();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedOpportunities, setRelatedOpportunities] = useState<Opportunity[]>([]);

  const urgency = opportunity ? calculateUrgency(opportunity.deadline) : null;

  // Fetch the opportunity details
  useEffect(() => {
    const fetchOpportunity = async () => {
      try {
        setLoading(true);
        const response = await opportunitiesAPI.getOne(id!);
        setOpportunity(response.data);
        setError(null);

        // Track the view event
        analyticsAPI.track(id!, 'view').catch(err => {
          console.error('Analytics tracking error:', err);
        });

        // Fetch related opportunities (same category)
        const allOpsResponse = await opportunitiesAPI.getAll({ category: response.data.category });
        setRelatedOpportunities(allOpsResponse.data.filter((opp: Opportunity) => opp.id !== id).slice(0, 3));
      } catch (err) {
        console.error('Error fetching opportunity:', err);
        setError('Failed to load opportunity details. Please try again.');
        setOpportunity(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOpportunity();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-gray-200 border-t-blue-900 rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading opportunity details...</p>
        </div>
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-gray-900 mb-4 text-2xl font-bold">{error ? 'Error' : 'Not Found'}</h2>
          <p className="text-gray-600 mb-6">{error || 'This opportunity could not be found.'}</p>
          <Link to="/opportunities" className="text-blue-900 hover:text-blue-900 font-bold uppercase tracking-wider text-sm">
            ← Back to Opportunities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-blue-50 border-b border-gray-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/opportunities"
            className="inline-flex items-center gap-2 text-blue-900 hover:text-blue-900 transition-colors font-bold uppercase tracking-wider text-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Opportunities</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white border border-gray-300 overflow-hidden rounded-sm m-0.5">
          {/* Header Image */}
          <div className="relative h-56 bg-blue-50 overflow-hidden border-b border-gray-300">
            <img
              src={opportunity.logoUrl}
              alt={opportunity.provider}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Top Badge Row */}
            <div className="flex flex-wrap gap-3 pb-4 border-b border-gray-300">
              <span className="inline-flex items-center gap-2 px-3 py-2 bg-blue-900 text-white font-bold text-xs uppercase tracking-wider">
                <Tag className="w-4 h-4" />
                {opportunity.category}
              </span>
              <span className={`inline-flex items-center gap-2 px-3 py-2 font-bold text-xs uppercase tracking-wider border ${
                opportunity.isKenyaBased 
                  ? 'bg-green-100 text-green-800 border-green-300' 
                  : 'bg-gray-100 text-gray-800 border-gray-300'
              }`}>
                <Globe className="w-4 h-4" />
                {opportunity.isKenyaBased ? 'Kenya-Based' : 'International'}
              </span>
              {urgency && (
                <span className={`inline-flex items-center gap-2 px-3 py-2 font-bold text-xs uppercase tracking-wider border ${urgency.bgColor} ${urgency.textColor} border-current rounded-sm`}>
                  <Calendar className="w-4 h-4" />
                  {urgency.label}
                </span>
              )}
            </div>

            {/* Title & Provider */}
            <div>
              <h1 className="text-gray-900 mb-3 text-3xl font-bold uppercase tracking-tight">{opportunity.title}</h1>
              <p className="text-blue-900 font-bold uppercase tracking-wider text-sm">{opportunity.provider}</p>
            </div>

            {/* Kenya-Specific Features */}
            {opportunity.isKenyaBased && (
              <div className="bg-green-50 border border-green-300 p-4 space-y-2 rounded-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-800 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-green-900 text-sm uppercase tracking-wider">Local Opportunity</p>
                    <p className="text-green-800 text-sm mt-1">This opportunity is based in Kenya and particularly relevant for local students.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Meta Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 py-6 border-t border-b border-gray-300">
              <div>
                <p className="text-gray-600 text-xs font-bold uppercase tracking-wider mb-2">Deadline</p>
                <div className={`${urgency?.bgColor} px-3 py-2 border border-current rounded-sm`}>
                  <p className="font-bold text-sm">{new Date(opportunity.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p className={`text-xs font-bold uppercase tracking-wider ${urgency?.textColor}`}>{urgency?.label}</p>
                </div>
              </div>
              <div>
                <p className="text-gray-600 text-xs font-bold uppercase tracking-wider mb-2">Location</p>
                <div className="border border-gray-300 px-3 py-2 rounded-sm">
                  <p className="font-bold text-sm text-gray-900">{opportunity.location}</p>
                </div>
              </div>
              <div>
                <p className="text-gray-600 text-xs font-bold uppercase tracking-wider mb-2">Level</p>
                <div className="border border-gray-300 px-3 py-2 rounded-sm">
                  <p className="font-bold text-sm text-gray-900">{opportunity.eligibility.educationLevel}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-gray-900 mb-4 font-bold uppercase tracking-wider text-lg border-b border-gray-300 pb-3">About This Opportunity</h2>
              <p className="text-gray-700 leading-relaxed text-base">
                {opportunity.fullDescription || opportunity.description}
              </p>
            </div>

            {/* Eligibility Requirements */}
            <div>
              <h3 className="text-gray-900 mb-4 font-bold uppercase tracking-wider text-lg border-b border-gray-300 pb-3">Eligibility Requirements</h3>
              <ul className="space-y-3">
                {opportunity.eligibility.requirements && opportunity.eligibility.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-700">
                    <span className="w-2 h-2 bg-blue-900 mt-2.5 flex-shrink-0"></span>
                    <span className="text-base">{req}</span>
                  </li>
                ))}
                {opportunity.eligibility.fieldOfStudy && opportunity.eligibility.fieldOfStudy.length > 0 && (
                  <li className="flex items-start gap-3 text-gray-700">
                    <span className="w-2 h-2 bg-blue-900 mt-2.5 flex-shrink-0"></span>
                    <span className="text-base">Field of Study: {opportunity.eligibility.fieldOfStudy.join(', ')}</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Benefits */}
            {opportunity.benefits && opportunity.benefits.length > 0 && (
              <div>
                <h3 className="text-gray-900 mb-4 font-bold uppercase tracking-wider text-lg border-b border-gray-300 pb-3">Benefits & Rewards</h3>
                <ul className="space-y-3">
                  {opportunity.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-700">
                      <span className="w-2 h-2 bg-green-700 mt-2.5 flex-shrink-0"></span>
                      <span className="text-base">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Estimated Benefit */}
            {opportunity.estimatedBenefit && (
              <div className="bg-blue-50 border border-blue-300 p-6 rounded-sm">
                <p className="text-gray-600 text-xs font-bold uppercase tracking-wider mb-2">Financial Benefit</p>
                <p className="text-blue-900 font-bold text-2xl">{opportunity.estimatedBenefit}</p>
              </div>
            )}

            {/* Apply Button */}
            <div className="bg-blue-900 text-white p-8 text-center space-y-4 border border-blue-900 rounded-sm">
              <h3 className="font-bold uppercase tracking-wider text-lg">Ready to Apply?</h3>
              <p className="text-blue-100 text-sm">This will redirect you to the official application page</p>
              <a
                href={opportunity.applicationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3 bg-white text-blue-900 font-bold uppercase tracking-wider text-sm hover:bg-gray-100 transition-all"
              >
                <span>Apply Now</span>
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Related Opportunities */}
        {relatedOpportunities.length > 0 && (
          <div className="mt-12">
            <h2 className="text-gray-900 mb-6 font-bold uppercase tracking-wider text-2xl">Similar Opportunities</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedOpportunities.map(opp => {
                const relatedUrgency = calculateUrgency(opp.deadline);
                return (
                  <Link
                    key={opp.id}
                    to={`/opportunity/${opp.id}`}
                    className="bg-white border border-gray-300 p-6 hover:border-blue-900 hover:shadow-md transition-all space-y-3 rounded-sm m-0.5"
                  >
                    <h3 className="text-gray-900 mb-2 line-clamp-2 font-bold text-sm uppercase tracking-wider">{opp.title}</h3>
                    <p className="text-gray-700 text-xs font-bold uppercase tracking-wider">{opp.provider}</p>
                    <div className={`${relatedUrgency.bgColor} px-2 py-1 border border-current rounded-sm`}>
                      <p className={`text-xs font-bold uppercase tracking-wider ${relatedUrgency.textColor}`}>{relatedUrgency.label}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
