import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, type JSX, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { opportunitiesAPI, analyticsAPI } from '../services/api';
import { Calendar, ExternalLink, ArrowLeft, Tag, Bell, CheckCircle, AlertCircle, Flag } from 'lucide-react';
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
  const generateSchema = (opp: Opportunity) => {
    const baseSchema: any = {
      "@context": "https://schema.org",
      "name": opp.title,
      "description": opp.description,
      "url": `https://opportunitieskenya.live/opportunity/${toSlug(opp.title)}`,
      "image": opp.logoUrl?.startsWith('/') ? `https://opportunitieskenya.live${opp.logoUrl}` : opp.logoUrl,
      "provider": {
        "@type": "Organization",
        "name": opp.provider,
        "logo": opp.logoUrl?.startsWith('/') ? `https://opportunitieskenya.live${opp.logoUrl}` : opp.logoUrl
      }
    };

    if (['Internship', 'Attachment'].includes(opp.category)) {
      baseSchema["@type"] = "JobPosting";
      baseSchema.datePosted = opp.dateAdded || new Date().toISOString();
      baseSchema.validThrough = opp.deadline;
      baseSchema.employmentType = "INTERN";
      baseSchema.hiringOrganization = baseSchema.provider;
      baseSchema.jobLocation = {
        "@type": "Place",
        "address": opp.location || "Remote"
      };
    } else if (['Conference', 'Hackathon', 'Event', 'CallForPapers'].includes(opp.category)) {
      baseSchema["@type"] = "Event";
      baseSchema.startDate = opp.deadline;
      baseSchema.endDate = opp.deadline;
      baseSchema.eventAttendanceMode = opp.location?.toLowerCase().includes('online') 
        ? "https://schema.org/OnlineEventAttendanceMode" 
        : "https://schema.org/OfflineEventAttendanceMode";
      baseSchema.location = {
        "@type": "VirtualLocation",
        "url": baseSchema.url
      };
      if (!opp.location?.toLowerCase().includes('online')) {
        baseSchema.location = {
          "@type": "Place",
          "name": opp.location || "TBA",
          "address": opp.location
        };
      }
    } else {
      baseSchema["@type"] = "EducationalOccupationalProgram";
      baseSchema.applicationDeadline = opp.deadline;
      baseSchema.educationalCredentialAwarded = opp.category;
    }

    return JSON.stringify(baseSchema);
  };

  const { slug } = useParams();
  const localMatch = localOpportunities.find(l => toSlug(l.title) === slug);
  const id = localMatch?.id;
  // Pre-populate with local data instantly — no spinner for known opportunities
  const [opportunity, setOpportunity] = useState<Opportunity | null>(localMatch ?? null);
  const [loading, setLoading] = useState(!localMatch); // only show spinner if no local fallback
  const [error, setError] = useState<string | null>(null);
  const [relatedOpportunities, setRelatedOpportunities] = useState<Opportunity[]>([]);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportMessage, setReportMessage] = useState<string | null>(null);
  const [reportForm, setReportForm] = useState({ name: '', email: '', reason: '', details: '' });

  const urgency = opportunity ? calculateUrgency(opportunity.deadline) : null;
  const verificationLabel = opportunity?.status || (opportunity?.isVerified ? 'Verified' : 'Unverified');
  const proofLinks = opportunity?.verificationAudit?.proofLinks ?? [];

  const handleReportSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!opportunity) return;

    try {
      setReportSubmitting(true);
      setReportMessage(null);
      await opportunitiesAPI.report(opportunity.id, {
        reason: reportForm.reason,
        details: reportForm.details,
        reporterName: reportForm.name,
        reporterEmail: reportForm.email,
      });
      setReportMessage('Report received. We will review this post quickly.');
      setReportForm({ name: '', email: '', reason: '', details: '' });
      setReportOpen(false);
    } catch (reportError: any) {
      setReportMessage(reportError?.response?.data?.error || 'Failed to send report.');
    } finally {
      setReportSubmitting(false);
    }
  };

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
      {/* JSON-LD Schema for Google Rich Snippets */}
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: generateSchema(opportunity) }} 
      />

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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="border-b border-amber-200 bg-amber-50 px-6 py-4 text-sm text-amber-900 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p>
              We review submissions manually, but we do not guarantee every opportunity, especially external postings. Verify details before applying.
            </p>
          </div>
          {/* Header Image */}
          <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
            <img
              src={opportunity.logoUrl}
              alt={`${opportunity.category}: ${opportunity.title} by ${opportunity.provider}`}
              decoding="async"
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
              <div className="flex flex-col">
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
                <p className="text-gray-600 text-lg">{opportunity.provider}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                  <span className={`rounded-full px-3 py-1 ${verificationLabel === 'Verified' ? 'bg-green-100 text-green-700' : verificationLabel === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {verificationLabel}
                  </span>
                  {opportunity.verificationAudit?.reviewedAt && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                      Reviewed {new Date(opportunity.verificationAudit.reviewedAt).toLocaleDateString()}
                    </span>
                  )}
                  {opportunity.verificationAudit?.reviewedBy && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                      By {opportunity.verificationAudit.reviewedBy}
                    </span>
                  )}
                </div>
                {proofLinks.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {proofLinks.map((proofLink, index) => (
                      <a
                        key={index}
                        href={proofLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-blue-700 underline underline-offset-2"
                      >
                        Proof Link {index + 1}
                      </a>
                    ))}
                  </div>
                )}
              </div>
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

            {/* Financial Summary - New Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className={`p-4 rounded-xl border flex flex-col justify-center ${
                opportunity.compensationType === 'Paid' || opportunity.compensationType === 'Stipend'
                  ? 'bg-blue-50 border-blue-100'
                  : 'bg-slate-50 border-slate-200'
              }`}>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Compensation</p>
                <p className={`text-lg font-bold ${
                  opportunity.compensationType === 'Paid' || opportunity.compensationType === 'Stipend'
                    ? 'text-blue-700'
                    : 'text-slate-700'
                }`}>
                  {opportunity.compensationType}
                </p>
              </div>

              <div className={`p-4 rounded-xl border flex flex-col justify-center ${
                opportunity.upfrontCost === 'Has Upfront Cost'
                  ? 'bg-amber-50 border-amber-100'
                  : 'bg-green-50 border-green-100'
              }`}>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Application Cost</p>
                <div className="flex items-center gap-2">
                  <p className={`text-lg font-bold ${
                    opportunity.upfrontCost === 'Has Upfront Cost'
                      ? 'text-amber-700'
                      : 'text-green-700'
                  }`}>
                    {opportunity.upfrontCost}
                  </p>
                  {opportunity.upfrontCost === 'Has Upfront Cost' && (
                    <span className="text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded font-bold uppercase">Alert</span>
                  )}
                </div>
                {opportunity.upfrontCost === 'Has Upfront Cost' && (
                  <p className="text-[10px] text-amber-600 mt-1 italic leading-tight">
                    This opportunity may require you to pay for visa, travel, or flights out-of-pocket initially.
                  </p>
                )}
              </div>
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

            {/* Report + Verification audit */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-gray-900 text-lg font-bold">See something suspicious?</h3>
                  <p className="text-sm text-gray-600">Report it and we will remove or review it quickly.</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="inline-flex items-center gap-2 self-start border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setReportOpen(prev => !prev)}
                >
                  <Flag className="w-4 h-4" />
                  Report Suspicious Post
                </Button>
              </div>

              {reportMessage && (
                <p className="mt-3 text-sm font-medium text-slate-700">{reportMessage}</p>
              )}

              {reportOpen && (
                <form onSubmit={handleReportSubmit} className="mt-4 grid grid-cols-1 gap-4 rounded-xl bg-white p-4 border border-slate-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      required
                      placeholder="Your name"
                      value={reportForm.name}
                      onChange={(e) => setReportForm({ ...reportForm, name: e.target.value })}
                    />
                    <Input
                      required
                      type="email"
                      placeholder="Your email"
                      value={reportForm.email}
                      onChange={(e) => setReportForm({ ...reportForm, email: e.target.value })}
                    />
                  </div>
                  <Input
                    required
                    placeholder="Reason for report"
                    value={reportForm.reason}
                    onChange={(e) => setReportForm({ ...reportForm, reason: e.target.value })}
                  />
                  <Textarea
                    placeholder="Add any details, screenshots, or context"
                    className="min-h-[100px]"
                    value={reportForm.details}
                    onChange={(e) => setReportForm({ ...reportForm, details: e.target.value })}
                  />
                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={reportSubmitting}>
                    {reportSubmitting ? 'Sending report...' : 'Send Report'}
                  </Button>
                </form>
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
        </article>

        {/* Related Opportunities */}
        {relatedOpportunities.length > 0 && (
          <section className="mt-12">
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
          </section>
        )}
      </main>
    </div>
  );
}
