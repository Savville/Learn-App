import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, type JSX, type FormEvent, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { opportunitiesAPI, analyticsAPI } from '../services/api';
import { Calendar, ExternalLink, ArrowLeft, Tag, Bell, CheckCircle, Flag, Share2, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
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

// ── Share Dialog Row Item ──────────────────────────────────────────────────────
function ShareItem({
  icon,
  label,
  sublabel,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  sublabel: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors text-left group"
    >
      {icon}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 group-hover:text-slate-900">{label}</p>
        <p className="text-xs text-slate-500 truncate">{sublabel}</p>
      </div>
      <svg className="w-4 h-4 text-slate-300 group-hover:text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
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

  // Custom Form Application State
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applicationData, setApplicationData] = useState<Record<string, any>>({});
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);
  const [appSubmitSuccess, setAppSubmitSuccess] = useState(false);
  const [appSubmitError, setAppSubmitError] = useState<string | null>(null);

  // Pitch State (For Microgigs)
  const [pitchEmail, setPitchEmail] = useState('');
  const [pitchMessage, setPitchMessage] = useState('');
  const [isSubmittingPitch, setIsSubmittingPitch] = useState(false);
  const [pitchSuccess, setPitchSuccess] = useState(false);
  const [pitchError, setPitchError] = useState<string | null>(null);

  const handleApplySubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!opportunity || !opportunity.applicationForm) return;

    setIsSubmittingApp(true);
    setAppSubmitError(null);

    // The backend expects `email` at the root, and the rest in `data`
    // Find the field that was marked as 'email' type, or default to checking 'email' key
    const emailField = opportunity.applicationForm.fields.find(f => f.type === 'email' || f.key === 'email');
    const emailValue = emailField ? applicationData[emailField.key] : applicationData['email'];

    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api'}/public/opportunities/${opportunity.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailValue, data: applicationData }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to submit application');
      
      setAppSubmitSuccess(true);
    } catch (err: any) {
      setAppSubmitError(err.message);
    } finally {
      setIsSubmittingApp(false);
    }
  };

  const handlePitchSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!opportunity) return;
    
    setIsSubmittingPitch(true);
    setPitchError(null);

    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api'}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gigId: opportunity.id,
          senderEmail: pitchEmail,
          receiverEmail: opportunity.contactEmail || 'admin@l-earn.co',
          content: pitchMessage
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to send pitch');

      setPitchSuccess(true);
    } catch (err: any) {
      setPitchError(err.message);
    } finally {
      setIsSubmittingPitch(false);
    }
  };

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
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 text-center" id="apply-section">
              {urgency?.label === 'Closed' ? (
                <>
                  <h3 className="text-gray-900 mb-3 text-xl font-bold">Applications Closed</h3>
                  <p className="text-gray-600 mb-6 text-sm max-w-md mx-auto">
                    The deadline for this opportunity has passed and applications are no longer being accepted.
                  </p>
                  <Button variant="outline" className="opacity-50 cursor-not-allowed" disabled>
                    Closed
                  </Button>
                </>
              ) : opportunity.category === 'Gig' || opportunity.category === 'Job' ? (
                <>
                  <h3 className="text-gray-900 mb-6 text-xl font-bold">Pitch for this {opportunity.category}</h3>
                  {!pitchSuccess ? (
                    <form onSubmit={handlePitchSubmit} className="text-left max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-blue-100">
                      <p className="text-sm text-gray-500 mb-6 border-b border-gray-100 pb-4">
                        Send a message directly to the poster. This will open a secure inbox where you can negotiate.
                      </p>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Your Email</label>
                          <Input
                            type="email"
                            required
                            placeholder="Enter your email"
                            value={pitchEmail}
                            onChange={(e) => setPitchEmail(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Your Pitch Message</label>
                          <Textarea
                            required
                            rows={5}
                            placeholder="Why are you the best fit for this role?"
                            value={pitchMessage}
                            onChange={(e) => setPitchMessage(e.target.value)}
                          />
                        </div>
                      </div>

                      {pitchError && (
                        <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
                          {pitchError}
                        </div>
                      )}

                      <div className="mt-6 flex gap-3">
                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                          disabled={isSubmittingPitch}
                        >
                          {isSubmittingPitch ? 'Sending Pitch...' : 'Send Pitch'}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="max-w-md mx-auto bg-green-50 rounded-xl p-8 border border-green-100 shadow-sm animate-in fade-in zoom-in duration-300">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h4 className="text-xl font-bold text-gray-900 mb-2">Pitch Sent Successfully!</h4>
                      <p className="text-gray-600 text-sm mb-6">
                        Your message has been delivered to the employer.
                      </p>
                      <Link to="/inbox">
                        <Button className="w-full shadow-sm">
                          Go to Inbox
                        </Button>
                      </Link>
                    </div>
                  )}
                </>
              ) : opportunity.applicationForm?.isEnabled ? (
                <>
                  <h3 className="text-gray-900 mb-6 text-xl font-bold">Ready to Apply?</h3>
                  {!showApplyForm && !appSubmitSuccess && (
                     <div className="flex justify-center">
                        <Button
                          onClick={() => setShowApplyForm(true)}
                          className="flex-1 max-w-xs inline-flex items-center justify-center py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                        >
                          Fill Application Form
                        </Button>
                     </div>
                  )}

                  {showApplyForm && !appSubmitSuccess && (
                    <form onSubmit={handleApplySubmit} className="text-left max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-blue-100">
                      <p className="text-sm text-gray-500 mb-6 border-b border-gray-100 pb-4">
                        Please fill out the form below. Your email address will be used to track your application.
                      </p>
                      
                      <div className="space-y-5">
                        {opportunity.applicationForm.fields.map(field => (
                          <div key={field.id}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {field.label} {field.required && <span className="text-red-500">*</span>}
                            </label>
                            
                            {field.type === 'textarea' ? (
                              <Textarea
                                required={field.required}
                                placeholder={`Enter your ${field.label.toLowerCase()}`}
                                className="w-full rounded-lg border-gray-300"
                                rows={4}
                                maxLength={field.validation?.maxLength}
                                value={applicationData[field.key] || ''}
                                onChange={(e) => setApplicationData({ ...applicationData, [field.key]: e.target.value })}
                              />
                            ) : (
                              <Input
                                type={field.type}
                                required={field.required}
                                placeholder={field.type === 'url' ? 'https://...' : `Enter your ${field.label.toLowerCase()}`}
                                className="w-full rounded-lg border-gray-300"
                                value={applicationData[field.key] || ''}
                                onChange={(e) => setApplicationData({ ...applicationData, [field.key]: e.target.value })}
                              />
                            )}
                            
                            {field.type === 'textarea' && field.validation?.maxLength && (
                              <p className="text-xs text-gray-400 mt-1 text-right">
                                Max {field.validation.maxLength} characters
                              </p>
                            )}
                          </div>
                        ))}
                      </div>

                      {appSubmitError && (
                        <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
                          {appSubmitError}
                        </div>
                      )}

                      <div className="mt-8 flex gap-3">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setShowApplyForm(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                          disabled={isSubmittingApp}
                        >
                          {isSubmittingApp ? 'Submitting...' : 'Submit Application'}
                        </Button>
                      </div>
                    </form>
                  )}

                  {appSubmitSuccess && (
                     <div className="max-w-md mx-auto bg-green-50 rounded-xl p-8 border border-green-100 shadow-sm animate-in fade-in zoom-in duration-300">
                       <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                       <h4 className="text-xl font-bold text-gray-900 mb-2">Application Sent!</h4>
                       <p className="text-gray-600 text-sm">
                         Your application has been securely delivered to the poster. You can track your status in the "Applied" tab on the main page.
                       </p>
                       <Button 
                         variant="outline" 
                         className="mt-6 w-full shadow-sm text-green-700 border-green-200 hover:bg-green-100"
                         onClick={() => {
                           setAppSubmitSuccess(false);
                           setShowApplyForm(false);
                         }}
                       >
                         Submit Another Application
                       </Button>
                     </div>
                  )}
                </>
              ) : opportunity.applicationLink ? (
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

            {/* Action Footer: Share & Subscribe */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Share Button */}
              <div className="flex items-center justify-start gap-3 w-full sm:w-auto">
                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 transition-all shadow-sm hover:shadow-md active:scale-95"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-sm p-0 overflow-hidden rounded-2xl">
                    <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
                      <DialogTitle className="text-base font-bold text-slate-900">Share this Opportunity</DialogTitle>
                      <DialogDescription className="text-sm text-slate-500 mt-0.5">
                        {opportunity.title}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="px-4 py-4 space-y-2">

                      {/* Copy Link */}
                      <ShareItem
                        icon={
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                            <LinkIcon className="w-4 h-4 text-slate-700" />
                          </div>
                        }
                        label="Copy Link"
                        sublabel="Copy the URL to clipboard"
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          toast.success('Link copied!');
                        }}
                      />

                      {/* WhatsApp */}
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(`🌟 Check out this opportunity: ${opportunity.title}\n${window.location.href}`)}`}
                        target="_blank" rel="noopener noreferrer"
                      >
                        <ShareItem
                          icon={
                            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            </div>
                          }
                          label="WhatsApp"
                          sublabel="Send to a contact or group"
                        />
                      </a>

                      {/* LinkedIn */}
                      <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                        target="_blank" rel="noopener noreferrer"
                      >
                        <ShareItem
                          icon={
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                              <svg className="w-5 h-5 text-blue-700" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                            </div>
                          }
                          label="LinkedIn"
                          sublabel="Share with your professional network"
                        />
                      </a>

                      {/* X / Twitter */}
                      <a
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`🚀 ${opportunity.title} — don't miss this!`)}`}
                        target="_blank" rel="noopener noreferrer"
                      >
                        <ShareItem
                          icon={
                            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.743l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.907-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                            </div>
                          }
                          label="X (Twitter)"
                          sublabel="Post to your followers"
                        />
                      </a>

                      {/* Native Share — only shown on mobile/supported browsers */}
                      {typeof navigator !== 'undefined' && 'share' in navigator && (
                        <ShareItem
                          icon={
                            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                              <Share2 className="w-4 h-4 text-purple-600" />
                            </div>
                          }
                          label="More Options"
                          sublabel="Telegram, Email, Instagram & more"
                          onClick={() =>
                            navigator.share({
                              title: opportunity.title,
                              text: `Check out this opportunity: ${opportunity.title}`,
                              url: window.location.href,
                            }).catch(() => {})
                          }
                        />
                      )}
                    </div>

                    <div className="px-6 pb-5 pt-2">
                      <p className="text-[11px] text-slate-400 text-center">Help a friend — sharing takes 2 seconds 🌍</p>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Subscribe for more */}
              <div className="w-full sm:w-auto text-left sm:text-right">
                <Link
                  to="/#newsletter"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2 w-full sm:w-auto rounded-full border border-blue-200 text-sm font-semibold text-blue-600 hover:text-blue-800 hover:border-blue-400 hover:bg-blue-50 transition-all"
                >
                  <Bell className="w-4 h-4" />
                  Subscribe for more like this
                </Link>
              </div>
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

// Refurbished
