import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, AlertCircle, Info, CheckCircle2, Building2, User, Camera, Plus, Trash2, LayoutDashboard } from 'lucide-react';
import { FormField, ApplicationForm } from '@/data/opportunities';
import { PosterDashboard } from '@/components/PosterDashboard';

// Type definition for the data returned by the AI parser
interface ParsedOpportunityData {
  suggestCustomForm?: boolean;
  basicInfo: {
    title: string;
    provider: string;
    category: string;
    description: string;
    fullDescription: string;
    fundingType: string;
    compensationType?: string;
    upfrontCost?: string;
  };
  extractedFeatures: {
    feature: string;
    value: string;
    importance: 'High' | 'Medium' | 'Low';
    notes: string;
  }[];
  eligibilityRequirements?: string[];
  benefits?: string[];
  thematicAreas?: { heading: string; topics: string[] }[];
  isEscrow?: boolean;
  escrowAmount?: number;
}

// Use the same API base URL as the rest of the app â€” reads from VITE_API_URL env var
const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';

export function PostWithUs() {
  const reviewSectionRef = useRef<HTMLDivElement>(null);
  const [rawText, setRawText] = useState('');
  const [reporter, setReporter] = useState({
    name: '',
    organization: '',
    role: '',
    telephone: '',
    email: '',
    websiteOrSocial: '',
  });
  const [isParsing, setIsParsing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedOpportunityData | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);
  const [showOrgRequest, setShowOrgRequest] = useState(false);
  const [orgRequest, setOrgRequest] = useState({ name: '', organization: '', email: '', telephone: '', description: '' });
  const [requestStatus, setRequestStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Custom Form Builder State
  const [customForm, setCustomForm] = useState<ApplicationForm>({ isEnabled: false, fields: [] });

  // Handle Edit Redirection from Dashboard
  const location = useLocation();
  const navigate = useNavigate();
  const editPost = location.state?.editPost;
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  useEffect(() => {
    if (editPost) {
      setViewMode('post');
      setEditingPostId(editPost.id);
      setReporter({
        name: 'Edit Update',
        organization: editPost.provider || 'Self',
        role: 'Author',
        telephone: '0000000000',
        email: localStorage.getItem('user_email') || '',
        websiteOrSocial: 'N/A'
      });
      setParsedData({
        suggestCustomForm: editPost.applicationForm?.isEnabled,
        basicInfo: {
          title: editPost.title,
          provider: editPost.provider || '',
          category: editPost.category,
          description: editPost.description || '',
          fullDescription: editPost.fullDescription || '',
          fundingType: editPost.fundingType || '',
          compensationType: editPost.compensationType || '',
          upfrontCost: editPost.upfrontCost || ''
        },
        extractedFeatures: editPost.extractedFeatures || [],
        eligibilityRequirements: editPost.eligibilityRequirements || [],
        benefits: editPost.benefits || [],
        thematicAreas: editPost.thematicAreas || [],
        isEscrow: editPost.isEscrow,
        escrowAmount: editPost.escrowAmount,
      });
      if (editPost.applicationForm) {
        setCustomForm(editPost.applicationForm);
      }

      // Clear location state so refresh doesn't trigger edit mode again accidentally
      navigate('.', { replace: true });
    }
  }, [editPost, navigate]);

  // View Mode
  const [viewMode, setViewMode] = useState<'post' | 'manage'>('post');

  const handleManualEntry = () => {
    if (!reporter.name || !reporter.organization || !reporter.role || !reporter.telephone || !reporter.email) {
      setError('Please provide your full identity details first.');
      return;
    }
    setError(null);
    setParsedData({
      basicInfo: {
        title: '',
        provider: '',
        category: '',
        description: '',
        fullDescription: '',
        fundingType: '',
        compensationType: 'N/A',
        upfrontCost: 'No Upfront Cost'
      },
      extractedFeatures: [
        { feature: 'Application Link', value: '', importance: 'High', notes: 'Critical for applying' },
        { feature: 'Deadline', value: '', importance: 'High', notes: '' },
        { feature: 'Location', value: '', importance: 'Medium', notes: '' }
      ],
      eligibilityRequirements: [],
      benefits: [],
      thematicAreas: [],
      suggestCustomForm: false
    });
    setTimeout(() => {
      reviewSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  const handleParse = async () => {
    if (!reporter.name || !reporter.organization || !reporter.role || !reporter.telephone || !reporter.email) {
      setError('Please provide your full identity details first.');
      return;
    }
    setIsParsing(true);
    setError(null);
    setParsedData(null);
    setPublishedSlug(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout
      const response = await fetch(`${API_BASE}/public/parse-opportunity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rawText }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok) {
        const msg = data.details || data.error || 'An unknown error occurred.';
        throw new Error(msg);
      }

      setParsedData(data);

      if (data.suggestCustomForm) {
        setCustomForm({
          isEnabled: true,
          fields: [
            { id: Date.now().toString(), key: 'email', label: 'Email Address', type: 'email', required: true },
            { id: (Date.now() + 1).toString(), key: 'full_name', label: 'Full Name', type: 'text', required: true }
          ]
        });
      } else {
        setCustomForm({ isEnabled: false, fields: [] });
      }

    } catch (error: any) {
      console.error(error);
      if (error.name === 'AbortError') {
        setError('Extraction timed out. The server might be busy. Please try "Enter Manually".');
      } else {
        setError(`Parsing failed: ${error.message}`);
      }
    }
    setIsParsing(false);
  };

  const handleFeatureEdit = (index: number, key: string, newValue: string) => {
    if (!parsedData) return;
    const updatedFeatures = [...parsedData.extractedFeatures];
    updatedFeatures[index] = { ...updatedFeatures[index], [key]: newValue };
    setParsedData({ ...parsedData, extractedFeatures: updatedFeatures });
  };

  const handleBasicInfoEdit = (key: string, newValue: string) => {
    if (!parsedData) return;
    setParsedData({
      ...parsedData,
      basicInfo: { ...parsedData.basicInfo, [key]: newValue },
    });
  };

  const applyTemplate = (index: number, template: string) => {
    handleFeatureEdit(index, 'value', template);
  };

  const handleOrgRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestStatus('sending');
    try {
      const response = await fetch(`${API_BASE}/public/organizations/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orgRequest),
      });
      if (!response.ok) throw new Error('Failed to send request');
      setRequestStatus('success');
      setTimeout(() => {
        setShowOrgRequest(false);
        setRequestStatus('idle');
      }, 3000);
    } catch (err) {
      setRequestStatus('error');
    }
  };

  const handlePublish = async () => {
    if (!parsedData) {
      setError('Cannot publish without parsed data.');
      return;
    }

    setIsPublishing(true);
    setError(null);

    try {
      if (!reporter.name || !reporter.organization || !reporter.role || !reporter.telephone || !reporter.email || !reporter.websiteOrSocial) {
        throw new Error('Identity details are required to submit.');
      }

      // Step 1: Upload the image (optional â€” skip if no image selected)
      let imageUrl = '/Opportunities Kenya Logo 2.png'; // default fallback

      if (coverImage) {
        const formData = new FormData();
        formData.append('coverImage', coverImage);

        const uploadResponse = await fetch(`${API_BASE}/public/upload-image`, {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok) {
          // Don't block publish on image failure â€” just warn and use default
          console.warn('Image upload failed, using default logo:', uploadData.error);
        } else {
          imageUrl = uploadData.imageUrl;
        }
      }


      // Step 2: Assemble the full opportunity object from parsed data
      const deadline = parsedData.extractedFeatures.find(f => f.feature === 'Deadline')?.value || '';
      const applicationLink = parsedData.extractedFeatures.find(f => f.feature === 'Application Link')?.value || '';
      const location = parsedData.extractedFeatures.find(f => f.feature === 'Location')?.value || '';

      // Validation: Application Link is MANDATORY for most categories UNLESS custom form is enabled
      const category = parsedData.basicInfo.category;
      const isDemoLink = applicationLink.toLowerCase().includes('demo') || applicationLink.includes('example.com');

      if (!customForm.isEnabled && category !== 'Open Challenge' && (!applicationLink || applicationLink.trim().length < 8 || isDemoLink)) {
        throw new Error(`For ${category}, a valid application link is required unless you enable the Custom Form. Please edit the "Application Link" field below.`);
      }

      const slug = parsedData.basicInfo.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const finalOpportunity = {
        id: editingPostId || `pub-${Date.now()}`,          // unique ID, or keep original if editing
        editOf: editingPostId || undefined,                // Flag it as an edit request for admins
        title: parsedData.basicInfo.title,
        provider: parsedData.basicInfo.provider,
        category: parsedData.basicInfo.category,
        description: parsedData.basicInfo.description,
        fullDescription: parsedData.basicInfo.fullDescription || parsedData.basicInfo.description,
        fundingType: parsedData.basicInfo.fundingType,
        compensationType: parsedData.basicInfo.compensationType || 'N/A',
        upfrontCost: parsedData.basicInfo.upfrontCost || 'No Upfront Cost',
        deadline: deadline || 'Rolling',
        location,
        applicationLink,
        eligibility: {
          educationLevel: 'Both',
          requirements: parsedData.eligibilityRequirements || [],
        },
        benefits: parsedData.benefits || [],
        thematicAreas: parsedData.thematicAreas || [],
        applicationForm: customForm,
        isEscrow: parsedData.isEscrow,
        escrowAmount: parsedData.escrowAmount,
        isEscrowFunded: false,
        featured: false,
        dateAdded: new Date().toISOString().split('T')[0],
        logoUrl: imageUrl,
        views: 0,
        clicks: 0,
      };

      // Step 3: POST to MongoDB via submit-opportunity
      const publishResponse = await fetch(`${API_BASE}/public/submit-opportunity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ opportunity: finalOpportunity, reporter }),
      });

      const publishData = await publishResponse.json();
      if (!publishResponse.ok) {
        throw new Error(publishData.error || 'Submission failed.');
      }

      // Success!
      setPublishedSlug('success');
      setRawText('');
      setParsedData(null);
      setCoverImage(null);
      setShowSuccessModal(true);

    } catch (error: any) {
      console.error(error);
      setError(`Publishing failed: ${error.message}`);
    }
    setIsPublishing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Dynamic Header */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md rounded-b-3xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="text-white mb-6 px-4 py-1 uppercase tracking-widest text-sm font-semibold opacity-90 block">For Organizations & Recruiters</p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
            {viewMode === 'post' ? (editingPostId ? 'Edit Opportunity' : 'Post an Opportunity') : 'Your Dashboard'}
          </h1>
          <p className="text-blue-50 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            {viewMode === 'post'
              ? (editingPostId ? 'Update your live opportunity instantly.' : 'Reach thousands of top-tier African students and young professionals instantly.')
              : 'Manage your active opportunities and download applications.'}
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => { setViewMode('post'); setEditingPostId(null); }}
              className={`px-8 py-4 rounded-full font-bold transition-all text-lg ${viewMode === 'post' && !editingPostId ? 'bg-white text-gray-900 shadow-md' : 'bg-transparent text-white hover:bg-white/10'}`}
            >
              Post Opportunity
            </button>
            <button
              onClick={() => { setViewMode('manage'); setEditingPostId(null); }}
              className={`px-8 py-4 flex items-center justify-center rounded-full font-bold transition-all text-lg ${viewMode === 'manage' ? 'bg-white text-gray-900 shadow-md' : 'bg-transparent text-white hover:bg-white/10'}`}
            >
              <LayoutDashboard className="w-5 h-5 mr-2" />
              Manage Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {viewMode === 'manage' ? (
          <PosterDashboard />
        ) : (
          <>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 flex items-start gap-3 mt-4">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <p>
                {editingPostId
                  ? "You are submitting changes to an already verified live opportunity. An admin will review these changes before they reflect publicly."
                  : "We manually review submissions, but we do not guarantee every opportunity, especially external postings. Please provide accurate identity and proof details."}
              </p>
            </div>

            {/* STEP 1: Details & Text Input (Hidden during Edit Mode) */}
            {!editingPostId && (
              <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm relative overflow-hidden mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">1. Provide the Details</h2>
                <p className="text-xs text-gray-500 mb-8"><span className="text-red-500 font-bold">*</span> Indicates required fields</p>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Full Name <span className="text-red-500">*</span></label>
                      <Input
                        required
                        placeholder="e.g. John Doe"
                        value={reporter.name}
                        onChange={(e) => setReporter({ ...reporter, name: e.target.value })}
                        className="w-full px-5 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 bg-gray-50/50 transition-colors h-auto"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Organization <span className="text-red-500">*</span></label>
                      <Input
                        required
                        placeholder="e.g. IEEE Kenya"
                        value={reporter.organization}
                        onChange={(e) => setReporter({ ...reporter, organization: e.target.value })}
                        className="w-full px-5 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 bg-gray-50/50 transition-colors h-auto"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Role / Position <span className="text-red-500">*</span></label>
                      <Input
                        required
                        placeholder="e.g. Communications Lead"
                        value={reporter.role}
                        onChange={(e) => setReporter({ ...reporter, role: e.target.value })}
                        className="w-full px-5 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 bg-gray-50/50 transition-colors h-auto"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Phone Number <span className="text-red-500">*</span></label>
                      <Input
                        required
                        placeholder="e.g. +254 700 000 000"
                        value={reporter.telephone}
                        onChange={(e) => setReporter({ ...reporter, telephone: e.target.value })}
                        className="w-full px-5 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 bg-gray-50/50 transition-colors h-auto"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Email <span className="text-red-500">*</span></label>
                      <Input
                        required
                        type="email"
                        placeholder="e.g. name@organization.org"
                        value={reporter.email}
                        onChange={(e) => setReporter({ ...reporter, email: e.target.value })}
                        className="w-full px-5 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 bg-gray-50/50 transition-colors h-auto"
                      />
                      <p className="text-[11px] text-gray-500 italic mt-1 font-medium">
                        Use an organization-domain email if possible.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Website or Social Page <span className="text-gray-400 font-normal">(Optional)</span></label>
                      <Input
                        placeholder="e.g. https://linkedin.com/company/..."
                        value={reporter.websiteOrSocial}
                        onChange={(e) => setReporter({ ...reporter, websiteOrSocial: e.target.value })}
                        className="w-full px-5 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 bg-gray-50/50 transition-colors h-auto"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 mt-6">
                    <Button
                      variant="outline"
                      className="text-blue-600 border-blue-200 hover:bg-blue-50 rounded-xl px-6 py-4 h-auto font-semibold"
                      onClick={() => setShowOrgRequest(!showOrgRequest)}
                    >
                      Post as an Organization?
                    </Button>

                    {showOrgRequest && (
                      <Card className="mt-4 border-blue-100 bg-blue-50/30">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Request Official Organization Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {requestStatus === 'success' ? (
                            <div className="text-green-600 font-medium py-4 text-center">
                              Request sent! We will verify and contact you shortly.
                            </div>
                          ) : (
                            <form onSubmit={handleOrgRequestSubmit} className="space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Input
                                  placeholder="Contact Name"
                                  required
                                  value={orgRequest.name}
                                  onChange={(e) => setOrgRequest({ ...orgRequest, name: e.target.value })}
                                />
                                <Input
                                  placeholder="Organization Name (e.g. IEEE Kenya)"
                                  required
                                  value={orgRequest.organization}
                                  onChange={(e) => setOrgRequest({ ...orgRequest, organization: e.target.value })}
                                />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Input
                                  type="email"
                                  placeholder="Official Email"
                                  required
                                  value={orgRequest.email}
                                  onChange={(e) => setOrgRequest({ ...orgRequest, email: e.target.value })}
                                />
                                <Input
                                  placeholder="Phone Number"
                                  value={orgRequest.telephone}
                                  onChange={(e) => setOrgRequest({ ...orgRequest, telephone: e.target.value })}
                                />
                              </div>
                              <Textarea
                                placeholder="Briefly describe your organization..."
                                className="h-20"
                                value={orgRequest.description}
                                onChange={(e) => setOrgRequest({ ...orgRequest, description: e.target.value })}
                              />
                              <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                disabled={requestStatus === 'sending'}
                              >
                                {requestStatus === 'sending' ? 'Sending Request...' : 'Send Verification Request'}
                              </Button>
                            </form>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Text / Details Dump */}
            {!editingPostId && (
              <div className="mt-16 mb-24">
                <label className="text-lg font-extrabold text-gray-900 block mb-4 pl-1">Copy & Paste Opportunity Details Here or Type it in the box below</label>
                <div className="flex flex-col gap-8">
                  <Textarea
                    rows={12}
                    style={{ minHeight: '280px' }}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-6 py-5 text-base placeholder:text-gray-400 focus-visible:ring-blue-500 shadow-inner resize-y"
                    placeholder="Paste the opportunity details here (e.g., from a poster, email, or website)... We will auto-extract the relevant parts."
                    value={rawText}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRawText(e.target.value)}
                  />
                  <div className="flex flex-col sm:flex-row gap-4 w-full mt-2 mb-12">
                    <Button
                      onClick={handleParse}
                      disabled={isParsing || !rawText}
                      size="lg"
                      className="flex-1 rounded-2xl h-14 text-lg font-bold shadow hover:shadow-md transition-shadow"
                      style={{ backgroundColor: '#0933ed', color: '#ffffff' }}
                    >
                      {isParsing ? 'Extracting...' : 'AI Extract Data'}
                    </Button>
                    <div className="hidden sm:flex items-center justify-center px-4 self-center">
                      <span className="text-gray-400 text-sm font-bold uppercase tracking-widest leading-none">OR</span>
                    </div>
                    <Button
                      onClick={handleManualEntry}
                      disabled={isParsing}
                      variant="outline"
                      size="lg"
                      className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-2xl h-14 text-lg font-bold"
                    >
                      Enter Manually
                    </Button>
                  </div>
                </div>
                {error && !parsedData && (
                  <div className="mt-6">
                    <p className="text-base text-red-500 font-medium p-4 bg-red-50 border border-red-200 rounded-xl">{error}</p>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: Review Table & Dictionary */}
            {parsedData && (
              <div ref={reviewSectionRef} className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm relative overflow-hidden mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Review & Submit</h2>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 rounded-2xl bg-gray-50/50 p-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <span className="text-sm font-semibold text-gray-700">Title</span>
                      <Input
                        value={parsedData.basicInfo.title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBasicInfoEdit('title', e.target.value)}
                        className="w-full px-5 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 bg-white transition-colors h-auto"
                      />
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-semibold text-gray-700">
                        Provider or Institution
                      </span>
                      <Input
                        value={parsedData.basicInfo.provider}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBasicInfoEdit('provider', e.target.value)}
                        className="w-full px-5 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 bg-white transition-colors h-auto"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Category
                      </span>
                      <select
                        className="w-full px-5 py-3 text-sm bg-white border rounded-xl border-gray-200 focus:outline-none focus:border-blue-500 transition-colors h-auto"
                        value={parsedData.basicInfo.category}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleBasicInfoEdit('category', e.target.value)}
                      >
                        <option value="" disabled>Select a category</option>
                        <optgroup label="Microgigs and Jobs">
                          <option value="Gig">Microgig</option>
                          <option value="Job">Job</option>
                        </optgroup>
                        <optgroup label="Career and Innovation">
                          <option value="Internship">Internship</option>
                          <option value="Attachment">Attachment</option>
                          <option value="Project">Project</option>
                          <option value="Hackathon">Hackathon</option>
                          <option value="Challenge">Industry Challenge</option>
                        </optgroup>
                        <optgroup label="Academic and Learning">
                          <option value="Scholarship">Scholarship</option>
                          <option value="Fellowship">Fellowship</option>
                          <option value="Grant">Grant</option>
                          <option value="Conference">Conference</option>
                          <option value="CallForPapers">Call for Papers</option>
                          <option value="Event">Event</option>
                          <option value="Volunteer">Volunteer Programme</option>
                        </optgroup>
                        <optgroup label="Other">
                          <option value="Other">Other</option>
                        </optgroup>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Funding type
                      </span>
                      <select
                        className="w-full px-5 py-3 text-sm bg-white border rounded-xl border-gray-200 focus:outline-none focus:border-blue-500 transition-colors h-auto"
                        value={parsedData.basicInfo.fundingType || ''}
                        onChange={(e) => handleBasicInfoEdit('fundingType', e.target.value)}
                      >
                        <option value="">Select funding type...</option>
                        <option value="Fully Funded">Fully Funded</option>
                        <option value="Partially Funded">Partially Funded</option>
                        <option value="Self Funded">Self Funded</option>
                        <option value="Grant / Venture Backed">Grant / Venture Backed</option>
                        <option value="Not Applicable">Not Applicable</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Compensation
                      </span>
                      <select
                        className="w-full px-5 py-3 text-sm bg-white border rounded-xl border-gray-200 focus:outline-none focus:border-blue-500 transition-colors h-auto"
                        value={parsedData.basicInfo.compensationType || 'N/A'}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleBasicInfoEdit('compensationType', e.target.value)}
                      >
                        <option value="Paid">Paid (Salary/Wage)</option>
                        <option value="Stipend">Stipend / Allowance</option>
                        <option value="Unpaid">Unpaid</option>
                        <option value="Equity">Equity / Profit Sharing</option>
                        <option value="N/A">Not Applicable</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Upfront Cost
                      </span>
                      <select
                        className="w-full px-5 py-3 text-sm bg-white border rounded-xl border-gray-200 focus:outline-none focus:border-blue-500 transition-colors h-auto"
                        value={parsedData.basicInfo.upfrontCost || 'No Upfront Cost'}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleBasicInfoEdit('upfrontCost', e.target.value)}
                      >
                        <option value="No Upfront Cost">No Upfront Cost</option>
                        <option value="Has Upfront Cost">Has Upfront Cost</option>
                      </select>
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Short description
                      </span>
                      <Textarea
                        value={parsedData.basicInfo.description}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleBasicInfoEdit('description', e.target.value)}
                        className="min-h-[80px] w-full px-5 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 bg-white transition-colors h-auto"
                      />
                    </div>
                  </div>

                  {/* Intelligent Discretized Zones added here */}
                  <div className="grid grid-cols-1 gap-4 rounded-md bg-slate-50 p-4 mt-4">
                    <div className="space-y-1.5">
                      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        About This Opportunity (Full Description)
                      </span>
                      <Textarea
                        value={parsedData.basicInfo.fullDescription || ''}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleBasicInfoEdit('fullDescription', e.target.value)}
                        className="min-h-[120px] w-full px-5 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 bg-white transition-colors h-auto"
                        placeholder="The comprehensive detail of the opportunity..."
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Benefits (One per line)
                        </span>
                        <Textarea
                          value={(parsedData.benefits || []).join('\n')}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            setParsedData({
                              ...parsedData,
                              benefits: e.target.value.split('\n').filter(Boolean)
                            })
                          }
                          className="min-h-[80px] w-full px-5 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 bg-white transition-colors h-auto"
                          placeholder="e.g. Fully funded travel\nMonthly stipend..."
                        />
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Eligibility Requirements (One per line)
                        </span>
                        <Textarea
                          value={(parsedData.eligibilityRequirements || []).join('\n')}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            setParsedData({
                              ...parsedData,
                              eligibilityRequirements: e.target.value.split('\n').filter(Boolean)
                            })
                          }
                          className="min-h-[80px] w-full px-5 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 bg-white transition-colors h-auto"
                          placeholder="e.g. Undergraduates only\nMust be Kenyan citizen..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-900">
                        Extracted features
                      </h3>
                      <p className="text-xs text-slate-500">
                        Edit any value before publishing.
                      </p>
                    </div>
                    <div className="">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-separate border-spacing-y-4">
                          <thead>
                            <tr className="text-xs uppercase tracking-wide text-slate-500">
                              <th className="px-5 py-3 font-medium">
                                Feature
                              </th>
                              <th className="px-5 py-3 font-medium">
                                Extracted value
                              </th>
                              <th className="px-5 py-3 font-medium text-center">
                                Importance
                              </th>
                              <th className="px-5 py-3 font-medium">
                                Quick actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {parsedData.extractedFeatures.map((feat, idx) => (
                              <tr
                                key={idx}
                                className="bg-white shadow-sm hover:shadow-md transition-shadow group"
                              >
                                <td className="border-y border-l border-gray-100 px-5 py-5 text-slate-900 rounded-l-2xl group-hover:border-blue-100">
                                  <span className="font-medium">{feat.feature}</span>
                                </td>
                                <td className="border-y border-gray-100 px-5 py-5 align-top group-hover:border-blue-100">
                                  {feat.feature === 'Deadline' ? (
                                    <div className="flex flex-col gap-2 sm:flex-row">
                                      <Input
                                        type="date"
                                        className="w-full sm:w-40 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-colors h-auto text-sm bg-gray-50/50"
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                          handleFeatureEdit(idx, 'value', e.target.value)
                                        }
                                      />
                                      <Input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-colors h-auto text-sm bg-gray-50/50"
                                        value={feat.value}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                          handleFeatureEdit(idx, 'value', e.target.value)
                                        }
                                        placeholder="Or type e.g. 'Rolling'"
                                      />
                                    </div>
                                  ) : (
                                    <Input
                                      type="text"
                                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-colors h-auto text-sm bg-gray-50/50"
                                      value={feat.value}
                                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        handleFeatureEdit(idx, 'value', e.target.value)
                                      }
                                      placeholder="Leave blank or editâ€¦"
                                    />
                                  )}
                                </td>
                                <td className="border-y border-gray-100 px-5 py-5 align-top group-hover:border-blue-100">
                                  {feat.importance === 'High' || feat.importance === 'Medium' ? (
                                    <span className={`flex items-center gap-1.5 font-bold ${feat.importance === 'High' ? 'text-red-600' : 'text-amber-500'}`}>
                                      {feat.importance === 'High' && <AlertCircle className="h-4 w-4" />}
                                      {feat.importance === 'Medium' && <Info className="h-4 w-4" />}
                                      {feat.importance}
                                    </span>
                                  ) : null}
                                </td>
                                <td className="border-y border-r border-gray-100 px-5 py-5 align-top rounded-r-2xl group-hover:border-blue-100">
                                  <div className="flex flex-wrap gap-2">
                                    {feat.feature === 'Application Link' && !feat.value && (
                                      <Button
                                        onClick={() =>
                                          applyTemplate(
                                            idx,
                                            "Please visit the provider's main website for application details.",
                                          )
                                        }
                                        variant="outline"
                                        size="sm"
                                        className="rounded-lg border-blue-200 text-blue-700 hover:bg-blue-50 bg-blue-50/30"
                                      >
                                        Use â€œVisit main pageâ€
                                      </Button>
                                    )}
                                    {feat.feature === 'Deadline' && !feat.value && (
                                      <Button
                                        onClick={() =>
                                          applyTemplate(
                                            idx,
                                            'Rolling Basis / Subject to change',
                                          )
                                        }
                                        variant="outline"
                                        size="sm"
                                        className="rounded-lg border-blue-200 text-blue-700 hover:bg-blue-50 bg-blue-50/30"
                                      >
                                        Use â€œRollingâ€ template
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* STEP 3: Application Form Builder */}
                  <div className="mt-6 space-y-4 border-t border-slate-200 pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Application Form Builder</h3>
                        <p className="text-sm text-slate-500">
                          Toggle this to collect applications directly on our platform instead of an external website.
                        </p>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          className="h-5 w-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors cursor-pointer"
                          checked={customForm.isEnabled}
                          onChange={(e) => setCustomForm(prev => ({ ...prev, isEnabled: e.target.checked }))}
                        />
                        <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                          {customForm.isEnabled ? 'Enabled' : 'Enable'}
                        </span>
                      </label>
                    </div>

                    {customForm.isEnabled && (
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <p className="mb-4 text-xs text-slate-500">
                          Configure the fields applicants need to fill. An "Email Address" step will be automatically enforced for verification.
                        </p>
                        <div className="mb-4 space-y-3">
                          {customForm.fields.map((field, idx) => (
                            <div key={field.id} className="flex flex-wrap items-center gap-2 rounded bg-white p-3 shadow-sm border border-slate-100">
                              <Input
                                value={field.label}
                                onChange={(e) => {
                                  const newFields = [...customForm.fields];
                                  newFields[idx].label = e.target.value;
                                  newFields[idx].key = e.target.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                                  setCustomForm({ ...customForm, fields: newFields });
                                }}
                                placeholder="Field Label (e.g. Portfolio Link)"
                                className="w-full md:w-48 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-colors h-auto text-sm bg-white"
                              />
                              <select
                                value={field.type}
                                onChange={(e) => {
                                  const newFields = [...customForm.fields];
                                  newFields[idx].type = e.target.value as FormField['type'];
                                  setCustomForm({ ...customForm, fields: newFields });
                                }}
                                className="w-full md:w-auto px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-colors h-auto text-sm bg-white"
                              >
                                <option value="text">Short Text</option>
                                <option value="textarea">Paragraph</option>
                                <option value="email">Email</option>
                                <option value="url">URL Link</option>
                                <option value="number">Number</option>
                              </select>

                              {field.type === 'textarea' && (
                                <Input
                                  type="number"
                                  placeholder="Max words (e.g. 500)"
                                  value={field.validation?.maxLength || ''}
                                  onChange={(e) => {
                                    const newFields = [...customForm.fields];
                                    newFields[idx].validation = { ...newFields[idx].validation, maxLength: parseInt(e.target.value) || undefined };
                                    setCustomForm({ ...customForm, fields: newFields });
                                  }}
                                  className="w-full md:w-32 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-colors h-auto text-sm bg-white"
                                />
                              )}

                              <label className="flex items-center gap-1 ml-auto text-sm text-slate-700">
                                <input
                                  type="checkbox"
                                  checked={field.required}
                                  onChange={(e) => {
                                    const newFields = [...customForm.fields];
                                    newFields[idx].required = e.target.checked;
                                    setCustomForm({ ...customForm, fields: newFields });
                                  }}
                                  className="h-5 w-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
                                />
                                Required
                              </label>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-xl h-auto"
                                onClick={() => {
                                  const newFields = customForm.fields.filter((_, i) => i !== idx);
                                  setCustomForm({ ...customForm, fields: newFields });
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setCustomForm({
                              ...customForm,
                              fields: [...customForm.fields, { id: Date.now().toString(), key: 'new_field', label: 'New Field', type: 'text', required: false }]
                            });
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Field
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Optional Escrow Security Field */}
                  {(parsedData.basicInfo.category === 'Gig' || parsedData.basicInfo.category === 'Job') && (
                    <div className="mt-6 border border-blue-200 bg-blue-50 rounded-xl p-5 space-y-4">
                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          checked={!!parsedData.isEscrow}
                          onChange={(e) => setParsedData({ ...parsedData, isEscrow: e.target.checked, escrowAmount: e.target.checked ? 1000 : undefined })}
                        />
                        <div>
                          <h4 className="font-semibold text-blue-900 text-base">Protect this job with Escrow?</h4>
                          <p className="text-sm text-blue-700">We will hold the payment securely via M-PESA until the work is approved. You will deposit the funds via your Dashboard after submitting the job.</p>

                          {parsedData.isEscrow && (
                            <div className="mt-4 flex items-center gap-3">
                              <label className="text-sm font-semibold text-blue-900 whitespace-nowrap">Amount to lock (KES):</label>
                              <Input
                                type="number"
                                className="bg-white border-blue-200 text-blue-900 font-bold max-w-[200px]"
                                min="100"
                                value={parsedData.escrowAmount || 1000}
                                onChange={(e) => setParsedData({ ...parsedData, escrowAmount: Number(e.target.value) })}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: Desktop Wide Image Upload */}
                  <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
                    <label className="block text-sm font-semibold text-slate-900">
                      Upload cover image (desktop / wide)
                    </label>
                    <p className="text-xs text-slate-500">
                      Recommended size: 1200x630px (16:9). This will appear on the public opportunity page.
                    </p>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setCoverImage(e.target.files?.[0] || null)
                      }
                      className="block w-full text-xs text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/15"
                    />
                  </div>

                  {error && <p className="text-sm text-red-500 font-medium p-3 bg-red-50 border border-red-200 rounded-lg">{error}</p>}
                  {publishedSlug && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 flex items-center justify-between mt-4">
                      <div>
                        <p className="text-sm font-semibold text-green-800">âœ… {editingPostId ? 'Edit request submitted!' : 'Opportunity sent for verification!'}</p>
                        <p className="text-xs text-green-700 mt-0.5">Our admin team will review it shortly. Thank you for contributing.</p>
                        {editingPostId && (
                          <Button asChild size="sm" variant="link" className="mt-2 text-green-700 p-0 h-auto font-bold underline">
                            <Link to="/post-with-us" onClick={() => window.location.reload()}>Return to Dashboard</Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center mt-12 mb-4">
                    <Button
                      className="px-12 py-4 h-auto rounded-md min-w-[280px] font-bold text-xl hover:shadow-xl transition-all hover:-translate-y-1 shadow-md"
                      style={{ backgroundColor: '#0933ed', color: '#ffffff', borderRadius: '10px' }}
                      onClick={handlePublish}
                      disabled={isPublishing || !parsedData}
                    >
                      {isPublishing ? 'Submitting...' : editingPostId ? 'Submit Edit Request' : 'Submit for Verification'}
                     </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl transform scale-100 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Success!</h3>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              {editingPostId 
                ? 'Your edit request was submitted successfully! Please wait for our admins to review and approve the changes.'
                : 'Opportunity submitted successfully! Please wait for approval to be posted publicly.'}
            </p>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                // If they were editing, maybe optionally reload or navigate
                if (editingPostId) window.location.reload();
              }}
              className="w-full py-4 text-xl font-bold text-white rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
              style={{ backgroundColor: '#0933ed', borderRadius: '10px' }}
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Refurbished
