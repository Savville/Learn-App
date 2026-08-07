import { ArrowLeft, Calendar, Tag, CheckCircle, ExternalLink, Flag, ShieldCheck, Flame, Building2, User, Mail, Phone, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { calculateUrgency } from '@/utils/dateUtils';
import { isProjectCategory } from '@/constants/categories';
import { getDynamicImageUrl } from './OpportunityCard';

interface PosterInfo {
  name?: string;
  organization?: string;
  email?: string;
  telephone?: string;
  websiteOrSocial?: string;
  role?: string;
}

interface AdminOppDetailProps {
  opportunity: any;
  poster?: PosterInfo;
  type: 'pending' | 'edit' | 'published';
  onChangeReason?: string;
  onDiff?: Record<string, { old: string; new: string }>;
  onApprove?: () => void;
  onReject?: () => void;
  onEdit?: () => void;
  onUnpublish?: () => void;
  onDelete?: () => void;
  onBack?: () => void;
  loading?: boolean;
}

export function AdminOppDetail({
  opportunity,
  poster = {},
  type,
  onChangeReason = '',
  onDiff = {},
  onApprove,
  onReject,
  onEdit,
  onUnpublish,
  onDelete,
  onBack,
  loading = false,
}: AdminOppDetailProps) {
  const opp = opportunity;
  const urgency = opp?.deadline ? calculateUrgency(opp.deadline) : null;

  const verificationLabel = opp?.status || (opp?.isVerified ? 'Verified' : 'Unverified');
  const proofLinks = opp?.verificationAudit?.proofLinks ?? [];

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
      {/* Back button */}
      {onBack && (
        <div className="bg-white border-b border-slate-200 px-6 py-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to list
          </button>
        </div>
      )}

      {/* ── Top Panel: Poster Info ─────────────────────────────────── */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            <span className="font-medium text-slate-900">{poster.name || 'Unknown'}</span>
          </div>
          {poster.organization && (
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">{poster.organization}</span>
            </div>
          )}
          {poster.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">{poster.email}</span>
            </div>
          )}
          {poster.telephone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">{poster.telephone}</span>
            </div>
          )}
          {poster.websiteOrSocial && (
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600 truncate max-w-[200px]">{poster.websiteOrSocial}</span>
            </div>
          )}
          {poster.role && (
            <Badge variant="outline" className="text-xs">{poster.role}</Badge>
          )}
        </div>

        {/* Change reason for edit requests */}
        {type === 'edit' && onChangeReason && (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
            <p className="text-xs font-semibold text-amber-800 mb-1">Change Reason:</p>
            <p className="text-sm text-amber-900">{onChangeReason}</p>
          </div>
        )}

        {/* Diff for edit requests */}
        {type === 'edit' && Object.keys(onDiff).length > 0 && (
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <p className="text-xs font-semibold text-blue-800 mb-2">Proposed Changes:</p>
            <div className="space-y-1.5">
              {Object.entries(onDiff).map(([field, values]) => (
                <div key={field} className="text-xs">
                  <span className="font-semibold text-slate-700">{field}:</span>
                  <span className="text-red-500 line-through ml-2">{values.old || '(empty)'}</span>
                  <span className="text-green-600 ml-2">→ {values.new || '(empty)'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Middle Panel: Opportunity Card (matches OpportunityDetails exactly) ── */}
      {/* Header Image */}
      <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        <img
          src={getDynamicImageUrl(opp?.category, opp?.id, opp?.logoUrl, opp?.title)}
          alt={`${opp?.category}: ${opp?.title} by ${opp?.provider}`}
          decoding="async"
          className="w-full h-full object-cover"
          onError={(e: any) => { e.currentTarget.src = '/images/tech.avif'; }}
        />
      </div>

      {/* Content */}
      <div className="p-8">
          {/* Category Badge */}
          <div className="mb-4">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full">
              <Tag className="w-4 h-4" />
              {opp?.category || 'Uncategorized'}
            </span>
          </div>

          {/* Title & Provider */}
          <div className="mb-6">
            <h1 className="text-gray-900 mb-2 text-3xl font-bold">{opp?.title || 'Untitled'}</h1>
            <div className="flex flex-col">
              {opp?.postedBy && (
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs uppercase tracking-widest text-gray-400 font-bold">
                    Posted by {opp.postedBy}
                  </span>
                  {verificationLabel === 'Verified' && (
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                  )}
                </div>
              )}
              <p className="text-gray-600 text-lg">{opp?.provider || 'Unknown provider'}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                <span className={`rounded-full px-3 py-1 ${verificationLabel === 'Verified' ? 'bg-green-100 text-green-700' : verificationLabel === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                  {verificationLabel}
                </span>
                {opp?.verificationAudit?.reviewedAt && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                    Reviewed {new Date(opp.verificationAudit.reviewedAt).toLocaleDateString()}
                  </span>
                )}
                {opp?.verificationAudit?.reviewedBy && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                    By {opp.verificationAudit.reviewedBy}
                  </span>
                )}
              </div>
              {proofLinks.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {proofLinks.map((proofLink: string, index: number) => (
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
          <div className="flex flex-wrap gap-6 mb-8 pb-8 border-b border-slate-200">
            {opp?.deadline && (
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-5 h-5" />
                <div>
                  <p className="text-gray-500 text-sm">Deadline</p>
                  <p className={`font-semibold ${urgency?.textColor || 'text-gray-900'}`}>
                    {opp.deadline
                      ? new Date(opp.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                      : 'Open / Ongoing'}
                  </p>
                  {urgency?.label && <p className={`text-xs ${urgency?.textColor || 'text-gray-500'}`}>{urgency.label}</p>}
                </div>
              </div>
            )}
            {opp?.location && (
              <div className="flex items-center gap-2 text-gray-600">
                <Tag className="w-5 h-5" />
                <div>
                  <p className="text-gray-500 text-sm">Location</p>
                  <p className="font-semibold text-gray-900">{opp.location}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-600">
              <Flame className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-gray-500 text-sm">Active Interest</p>
                <p className="font-semibold text-orange-600">{opp?.views || 0} viewing</p>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className={`grid grid-cols-1 gap-4 mb-8 ${opp?.compensationType && opp.compensationType !== 'N/A' ? 'md:grid-cols-2' : 'md:grid-cols-1'}`}>
            {opp?.compensationType && opp.compensationType !== 'N/A' && (
              <div className={`p-4 rounded-xl border flex flex-col justify-center ${opp.compensationType === 'Paid' || opp.compensationType === 'Stipend' || opp.compensationType === 'Equity'
                ? 'bg-blue-50 border-blue-100'
                : 'bg-slate-50 border-slate-200'
                }`}>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Compensation</p>
                <p className={`text-lg font-bold ${opp.compensationType === 'Paid' || opp.compensationType === 'Stipend' || opp.compensationType === 'Equity'
                  ? 'text-blue-700'
                  : 'text-slate-700'
                  }`}>
                  {opp.compensationType}
                </p>
              </div>
            )}

            {!isProjectCategory(opp?.category) && (
              <div className={`p-4 rounded-xl border flex flex-col justify-center ${opp.upfrontCost === 'Has Upfront Cost'
                ? 'bg-amber-50 border-amber-100'
                : 'bg-green-50 border-green-100'
                }`}>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Application Cost</p>
                <div className="flex items-center gap-2">
                  <p className={`text-lg font-bold ${opp.upfrontCost === 'Has Upfront Cost'
                    ? 'text-amber-700'
                    : 'text-green-700'
                    }`}>
                    {opp.upfrontCost || 'No Upfront Cost'}
                  </p>
                  {opp.upfrontCost === 'Has Upfront Cost' && (
                    <span className="text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded font-bold uppercase">Alert</span>
                  )}
                </div>
                {opp.upfrontCost === 'Has Upfront Cost' && (
                  <p className="text-[10px] text-amber-600 mt-1 italic leading-tight">
                    This opportunity may require you to pay for visa, travel, or flights out-of-pocket initially.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Institutional Verification — Projects */}
          {isProjectCategory(opp?.category) && opp?.institutionalEndorsement && (
            <div className="mb-8 rounded-2xl border border-purple-200 bg-purple-50 p-6">
              <h3 className="text-lg font-bold text-purple-900 mb-2 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" /> Institutional Verification
              </h3>
              <p className="text-sm text-purple-800 mb-3">
                <strong>{opp.institutionalEndorsement.institutionName}</strong>
                {' — '}{opp.institutionalEndorsement.contactTitle}
              </p>
              <p className="text-xs text-purple-700 mb-4">
                We verify endorsement emails from department heads or recognized community organizations before publishing.
              </p>
              {opp.institutionalEndorsement.evidenceUrl && (
                <a
                  href={opp.institutionalEndorsement.evidenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-700 text-white rounded-lg text-sm font-semibold hover:bg-purple-800"
                >
                  View endorsement evidence
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          )}

          {/* Collaboration / volunteer mode */}
          {isProjectCategory(opp?.category) && !opp?.isEscrow && (
            <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-6 md:p-8 mb-8 border border-emerald-100">
              <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Volunteer or collaborate
              </h3>
              <p className="text-sm text-gray-600">
                This project is looking for collaborators and volunteers — not crowdfunding.
              </p>
            </div>
          )}

          {/* About This Opportunity */}
          <div className="mb-8">
            <h2 className="text-gray-900 mb-4 text-xl font-bold">About This Opportunity</h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              {(opp?.fullDescription || opp?.description || '').split('\n').map((line: string, i: number) => {
                const trimmed = line.trim();
                if (!trimmed) return null;
                if (/^---+$/.test(trimmed)) return <hr key={i} className="border-gray-200 my-4" />;
                const hMatch = trimmed.match(/^#{1,6}\s+(.+)$/);
                if (hMatch) {
                  const level = hMatch[0].match(/^#+/)!.length;
                  const text = hMatch[1];
                  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
                  return <Tag key={i} className={`text-gray-900 font-bold ${level === 3 ? 'text-base mt-6 mb-2 pb-1 border-b border-blue-100' : level === 2 ? 'text-lg mt-5 mb-2' : 'text-xl mt-6 mb-2'}`}>{text}</Tag>;
                }
                if (/^[\-\*]\s/.test(trimmed)) return <p key={i} className="ml-4 text-gray-700 list-none">{trimmed.slice(2)}</p>;
                const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
                return (
                  <p key={i} className="text-gray-700">
                    {parts.map((part: string, pi: number) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={pi}>{part.slice(2, -2)}</strong>;
                      }
                      return part;
                    })}
                  </p>
                );
              })}
            </div>
          </div>

          {/* Thematic Areas */}
          {opp?.thematicAreas && opp.thematicAreas.length > 0 && (
            <div className="mb-8">
              <h2 className="text-gray-900 mb-4 text-xl font-bold">Thematic Areas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {opp.thematicAreas.map((area: any, i: number) => (
                  <div key={i} className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <h4 className="text-blue-800 font-semibold text-sm mb-2">{area.heading}</h4>
                    <ul className="space-y-1">
                      {area.topics && area.topics.map((topic: string, j: number) => (
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
          {opp?.eligibility && (
            <div className="mb-8">
              <h3 className="text-gray-900 mb-4 text-lg font-bold">Eligibility Requirements</h3>
              <ul className="space-y-2">
                {opp.eligibility.educationLevel && (
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-gray-700">
                      Education Level: {(() => {
                        const level = opp.eligibility.educationLevel;
                        if (level === 'UnderGrad') return 'Undergraduate Students';
                        if (level === 'PostGrad') return 'Postgraduate Students';
                        if (level === 'Both') {
                          const cat = opp.category;
                          return (cat === 'Challenge' || cat === 'Grant') ? 'Students & Practitioners' : 'Undergraduate & Postgraduate Students';
                        }
                        return level;
                      })()}
                    </span>
                  </li>
                )}
                {opp.eligibility.requirements && opp.eligibility.requirements.map((req: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-gray-700">{req}</span>
                  </li>
                ))}
                {opp.eligibility.fieldOfStudy && opp.eligibility.fieldOfStudy.length > 0 && (
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-gray-700">Field of Study: {opp.eligibility.fieldOfStudy.join(', ')}</span>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {opp?.benefits && opp.benefits.length > 0 && (
            <div className="mb-8">
              <h3 className="text-gray-900 mb-4 text-lg font-bold">Benefits & Rewards</h3>
              <ul className="space-y-2">
                {opp.benefits.map((benefit: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risk Flags */}
          {opp?.riskFlags && opp.riskFlags.length > 0 && (
            <div className="mb-8">
              <h3 className="text-gray-900 mb-4 text-lg font-bold flex items-center gap-2">
                <Flag className="w-5 h-5 text-amber-500" /> Risk Flags
              </h3>
              <div className="flex flex-wrap gap-2">
                {opp.riskFlags.map((flag: string, i: number) => (
                  <Badge key={i} className="bg-amber-100 text-amber-800 border-amber-200">{flag}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Application Link */}
          {opp?.applicationLink && opp.applicationLink.length > 5 && (
            <div className="bg-[#f0f7ff] rounded-2xl p-8 text-center mb-8">
              <h3 className="text-gray-900 mb-3 text-xl font-bold">Ready to Apply?</h3>
              <p className="text-gray-600 mb-6 text-sm max-w-md mx-auto">
                You will be redirected to the official application page
              </p>
              <a
                href={opp.applicationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#131ADF] hover:bg-blue-800 text-white font-bold rounded-xl text-lg shadow-sm transition-all"
              >
                View Application Link
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          )}
      </div>

      {/* ── Bottom Panel: Actions ──────────────────────────────────── */}
      <div className="border-t border-slate-200 bg-slate-50 px-8 py-4">
        <div className="flex flex-wrap items-center gap-3 justify-end">
          {type === 'pending' && (
            <>
              <Button
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
                onClick={onReject}
                disabled={loading}
              >
                Reject
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={onApprove}
                disabled={loading}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve & Publish
              </Button>
            </>
          )}
          {type === 'edit' && (
            <>
              <Button
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
                onClick={onReject}
                disabled={loading}
              >
                Reject Edit
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={onApprove}
                disabled={loading}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve Edit
              </Button>
            </>
          )}
          {type === 'published' && (
            <>
              <Button
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
                onClick={onDelete}
                disabled={loading}
              >
                Delete Post
              </Button>
              <Button
                variant="outline"
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={onEdit}
                disabled={loading}
              >
                Edit Post
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
