import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, type JSX } from 'react';
import { opportunitiesAPI, analyticsAPI } from '../services/api';
import { Calendar, ExternalLink, ArrowLeft, Tag, Bell } from 'lucide-react';
import { calculateUrgency, toSlug } from '../utils/dateUtils';
import type { Opportunity } from '../data/opportunities';
import { opportunities as localOpportunities } from '../data/opportunities';
import { useSEO } from '../hooks/useSEO';

function renderDescription(text: string): JSX.Element {
  const lines = text.split('\n');
  const elements: JSX.Element[] = [];
  let key = 0;

  for (const raw of lines) {
    const line = raw.trim();

    // Skip separator lines
    if (!line || /^[─\-\u2014]{3,}$/.test(line)) continue;

    // ALL-CAPS heading (min 4 chars, has letters)
    const isHeading = line === line.toUpperCase() && line.length > 4 && /[A-Z]/.test(line);

    // Emoji-led line — bold label
    const isEmojiLabel = /^[\u{1F300}-\u{1FFFF}\u{2600}-\u{27FF}\u{2B00}-\u{2BFF}\u{FE00}-\u{FEFF}]/u.test(line);

    // Bullet point
    const isBullet = /^[•\-\*]/.test(line);

    if (isHeading) {
      elements.push(
        <h3 key={key++} className="text-base font-bold text-gray-900 mt-6 mb-2 pb-1 border-b border-blue-100">
          {line}
        </h3>
      );
    } else if (isEmojiLabel) {
      elements.push(
        <p key={key++} className="font-semibold text-gray-800 mt-4 mb-1">
          {line}
        </p>
      );
    } else if (isBullet) {
      elements.push(
        <li key={key++} className="flex gap-2 text-gray-700 list-none">
          <span className="text-blue-500 mt-1 flex-shrink-0">•</span>
          <span>{line.replace(/^[•\-\*]\s*/, '')}</span>
        </li>
      );
    } else {
      elements.push(
        <p key={key++} className="text-gray-700 leading-relaxed">
          {line}
        </p>
      );
    }
  }

  return <div className="space-y-2">{elements}</div>;
}

export function OpportunityDetails() {
  const { slug } = useParams();
  const localMatch = localOpportunities.find(l => toSlug(l.title) === slug);
  const id = localMatch?.id;
  // Pre-populate with local data instantly — no spinner for known opportunities
  const [opportunity, setOpportunity] = useState<Opportunity | null>(localMatch ?? null);
  const [loading, setLoading] = useState(!localMatch); // only show spinner if no local fallback
  const [error, setError] = useState<string | null>(null);
  const [relatedOpportunities, setRelatedOpportunities] = useState<Opportunity[]>([]);

  const urgency = opportunity ? calculateUrgency(opportunity.deadline) : null;

  useSEO({
    title: opportunity?.title,
    description: opportunity
      ? `${opportunity.description} — Deadline: ${opportunity.deadline ?? 'Open'}. Provider: ${opportunity.provider}.`
      : undefined,
    image: opportunity?.logoUrl?.startsWith('/')
      ? `https://opportunitieskenya.live${opportunity.logoUrl}`
      : opportunity?.logoUrl,
    url: slug ? `/opportunity/${slug}` : undefined,
    type: 'article'
  });

  // Silently fetch DB version to upgrade local data — user already sees the page
  useEffect(() => {
    const fetchOpportunity = async () => {
      try {
        // Only show a blocking spinner if there is NO local data at all
        if (!localMatch) setLoading(true);

        const response = await opportunitiesAPI.getOne(id || slug!);
        const local = localOpportunities.find(l => l.id === id);
        // Merge: keep local logoUrl (served from Vercel), upgrade everything else from DB
        setOpportunity(local ? { ...response.data, logoUrl: local.logoUrl } : response.data);
        setError(null);

        // Track the view event (fire-and-forget)
        analyticsAPI.track(response.data.id, 'view').catch(err => {
          console.error('Analytics tracking error:', err);
        });

        // Fetch related opportunities (same category)
        const allOpsResponse = await opportunitiesAPI.getAll({ category: response.data.category });
        const opsList: Opportunity[] = Array.isArray(allOpsResponse.data)
          ? allOpsResponse.data
          : allOpsResponse.data?.data ?? [];
        const relatedMerged = opsList
          .filter((opp: Opportunity) => opp.id !== id)
          .slice(0, 3)
          .map((opp: Opportunity) => {
            const l = localOpportunities.find(lo => lo.id === opp.id);
            return l ? { ...opp, logoUrl: l.logoUrl } : opp;
          });
        setRelatedOpportunities(relatedMerged);
      } catch (err) {
        // API cold-start / offline — local data is already showing, stay there silently
        console.error('Error fetching opportunity:', err);
        if (!localMatch) {
          setError('Failed to load opportunity details. Please try again.');
          setOpportunity(null);
        }
        // If localMatch exists the user is already seeing content — do nothing on API error
      } finally {
        setLoading(false);
      }
    };

    if (id || slug) {
      fetchOpportunity();
    } else {
      setLoading(false);
      setError('Opportunity not found.');
    }
  }, [slug, id]); // Re-run when slug or id changes

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          {/* Segmented pill-style spinner — 12 dashes, brand blue */}
          <div className="relative w-14 h-14">
            {Array.from({ length: 12 }).map((_, i) => (
              <span
                key={i}
                style={{
                  position: 'absolute',
                  top: '2px',
                  left: '50%',
                  width: '5px',
                  height: '14px',
                  marginLeft: '-2.5px',
                  borderRadius: '3px',
                  backgroundColor: '#1d4ed8',
                  transformOrigin: '2.5px 26px',
                  transform: `rotate(${i * 30}deg)`,
                  animation: 'spinner-fade 1s linear infinite',
                  animationDelay: `${-i / 12}s`,
                }}
              />
            ))}
          </div>
          <p className="text-gray-400 text-sm tracking-widest uppercase font-medium">Loading...</p>
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
                    {opportunity.deadline
                      ? new Date(opportunity.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                      : 'Open / Ongoing'}
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
              {renderDescription(opportunity.fullDescription || opportunity.description)}
            </div>

            {/* Thematic Areas — 3-column grid */}
            {opportunity.thematicAreas && opportunity.thematicAreas.length > 0 && (
              <div className="mb-8">
                <h2 className="text-gray-900 mb-4 text-xl font-bold">Thematic Areas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {opportunity.thematicAreas.map((area, i) => (
                    <div key={i} className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                      <h4 className="text-blue-800 font-semibold text-sm mb-2">{area.heading}</h4>
                      <ul className="space-y-1">
                        {area.topics.map((topic, j) => (
                          <li key={j} className="flex items-start gap-2 text-gray-700 text-sm">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                            {topic}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Eligibility Requirements */}
            <div className="mb-8">
              <h3 className="text-gray-900 mb-4 text-lg font-bold">Eligibility Requirements</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-gray-700">Education Level: {(() => {
                    const level = opportunity.eligibility.educationLevel;
                    if (level === 'UnderGrad') return 'Undergraduate Students';
                    if (level === 'PostGrad') return 'Postgraduate Students';
                    if (level === 'Both') {
                      const cat = opportunity.category;
                      return (cat === 'Challenge' || cat === 'Grant') ? 'Students & Practitioners' : 'Undergraduate & Postgraduate Students';
                    }
                    return level;
                  })()}</span>
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

            
            {/* Apply Button / Challenge CTA */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 text-center">
              {opportunity.applicationLink ? (
                <>
                  <h3 className="text-gray-900 mb-6 text-xl font-bold">Ready to Apply?</h3>
                  <div className="flex gap-4 justify-center">
                    <a
                      href={opportunity.applicationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 max-w-xs inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                    >
                      <span>Apply Now</span>
                      <ExternalLink className="w-5 h-5" />
                    </a>
                    {opportunity.contactLink && (
                      <a
                        href={opportunity.contactLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 max-w-xs inline-flex items-center justify-center gap-2 px-8 py-4 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                        style={{ background: 'linear-gradient(to right, #ef4444, #dc2626)' }}
                      >
                        <span>Contact for Help</span>
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                  <p className="text-gray-600 mt-4 text-sm">You'll be redirected to the official application page</p>
                </>
              ) : (
                <>
                  <h3 className="text-gray-900 mb-3 text-xl font-bold">Make This Your Project</h3>
                  <p className="text-gray-600 mb-6 text-sm max-w-md mx-auto">This is an open industry challenge — no formal application needed. Use it as inspiration for your capstone, thesis, class project, or research paper.</p>
                  {opportunity.contactLink && (
                    <a
                      href={opportunity.contactLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                    >
                      <span>Explore Further</span>
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                </>
              )}
            </div>

            {/* Subscribe for more */}
            <div className="mt-4 text-center">
              <Link
                to="/#newsletter"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-blue-200 text-sm font-semibold text-blue-600 hover:text-blue-800 hover:border-blue-400 hover:bg-blue-50 transition-all"
              >
                <Bell className="w-4 h-4" />
                Subscribe for more opportunities like this
              </Link>
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
                    to={`/opportunity/${toSlug(opp.title)}`}
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
