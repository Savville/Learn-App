import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { opportunitiesAPI, analyticsAPI } from '../services/api';
import { Calendar, ExternalLink, ArrowLeft, Tag } from 'lucide-react';
import { calculateUrgency } from '../utils/dateUtils';
import type { Opportunity } from '../data/opportunities';
import { opportunities as localOpportunities } from '../data/opportunities';

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
        const local = localOpportunities.find(l => l.id === id);
        setOpportunity(local ? { ...response.data, logoUrl: local.logoUrl } : response.data);
        setError(null);

        // Track the view event
        analyticsAPI.track(id!, 'view').catch(err => {
          console.error('Analytics tracking error:', err);
        });

        // Fetch related opportunities (same category)
        const allOpsResponse = await opportunitiesAPI.getAll({ category: response.data.category });
        const relatedMerged = allOpsResponse.data
          .filter((opp: Opportunity) => opp.id !== id)
          .slice(0, 3)
          .map((opp: Opportunity) => {
            const l = localOpportunities.find(lo => lo.id === opp.id);
            return l ? { ...opp, logoUrl: l.logoUrl } : opp;
          });
        setRelatedOpportunities(relatedMerged);
      } catch (err) {
        console.error('Error fetching opportunity:', err);
        const local = localOpportunities.find(l => l.id === id);
        if (local) {
          setOpportunity(local);
          setError(null);
        } else {
          setError('Failed to load opportunity details. Please try again.');
          setOpportunity(null);
        }
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/opportunities"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Opportunities</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header Image */}
          <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
            <img
              src={opportunity.logoUrl}
              alt={opportunity.provider}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Category Badge */}
            <div className="mb-4">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full">
                <Tag className="w-4 h-4" />
                {opportunity.category}
              </span>
            </div>

            {/* Title & Provider */}
            <div className="mb-6">
              <h1 className="text-gray-900 mb-2 text-3xl font-bold">{opportunity.title}</h1>
              <p className="text-gray-600">{opportunity.provider}</p>
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-6 mb-8 pb-8 border-b">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-5 h-5" />
                <div>
                  <p className="text-gray-500 text-sm">Deadline</p>
                  <p className={`font-semibold ${urgency?.textColor}`}>
                    {new Date(opportunity.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <p className={`text-xs ${urgency?.textColor}`}>{urgency?.label}</p>
                </div>
              </div>
              {opportunity.location && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Tag className="w-5 h-5" />
                  <div>
                    <p className="text-gray-500 text-sm">Location</p>
                    <p className="font-semibold text-gray-900">{opportunity.location}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-gray-900 mb-4 text-xl font-bold">About This Opportunity</h2>
              <p className="text-gray-700 leading-relaxed">
                {opportunity.fullDescription || opportunity.description}
              </p>
            </div>

            {/* Eligibility Requirements */}
            <div className="mb-8">
              <h3 className="text-gray-900 mb-4 text-lg font-bold">Eligibility Requirements</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-gray-700">Education Level: {opportunity.eligibility.educationLevel === 'Both' ? 'Practitioners' : opportunity.eligibility.educationLevel}</span>
                </li>
                {opportunity.eligibility.requirements && opportunity.eligibility.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-gray-700">{req}</span>
                  </li>
                ))}
                {opportunity.eligibility.fieldOfStudy && opportunity.eligibility.fieldOfStudy.length > 0 && (
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-gray-700">Field of Study: {opportunity.eligibility.fieldOfStudy.join(', ')}</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Benefits */}
            {opportunity.benefits && opportunity.benefits.length > 0 && (
              <div className="mb-8">
                <h3 className="text-gray-900 mb-4 text-lg font-bold">Benefits & Rewards</h3>
                <ul className="space-y-2">
                  {opportunity.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            
            {/* Apply Button */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 text-center">
              <h3 className="text-gray-900 mb-4 text-xl font-bold">Ready to Apply?</h3>
              <a
                href={opportunity.applicationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
              >
                <span>Apply Now</span>
                <ExternalLink className="w-5 h-5" />
              </a>
              <p className="text-gray-600 mt-4 text-sm">You'll be redirected to the official application page</p>
            </div>
          </div>
        </div>

        {/* Related Opportunities */}
        {relatedOpportunities.length > 0 && (
          <div className="mt-12">
            <h2 className="text-gray-900 mb-6 text-2xl font-bold">Similar Opportunities</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedOpportunities.map(opp => {
                const relatedUrgency = calculateUrgency(opp.deadline);
                return (
                  <Link
                    key={opp.id}
                    to={`/opportunity/${opp.id}`}
                    className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all"
                  >
                    <h3 className="text-gray-900 mb-2 line-clamp-2 font-semibold">{opp.title}</h3>
                    <p className="text-gray-600 mb-2 text-sm">{opp.provider}</p>
                    <p className={`text-xs font-semibold ${relatedUrgency.textColor}`}>{relatedUrgency.label}</p>
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
