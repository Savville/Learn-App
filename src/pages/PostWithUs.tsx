import React, { useState, useEffect } from 'react';
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

// Use the same API base URL as the rest of the app — reads from VITE_API_URL env var
const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';

export function PostWithUs() {
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

  // Custom Form Builder State
  const [customForm, setCustomForm] = useState<ApplicationForm>({ isEnabled: false, fields: [] });

  // Handle Edit Redirection from Dashboard
  const location = useLocation();
  const navigate = useNavigate();
  const editPost = location.state?.editPost;
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  useEffect(() => {
    if (editPost) {
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
    if (!reporter.name || !reporter.organization || !reporter.role || !reporter.telephone || !reporter.email || !reporter.websiteOrSocial) {
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
  };

  const handleParse = async () => {
    if (!reporter.name || !reporter.organization || !reporter.role || !reporter.telephone || !reporter.email || !reporter.websiteOrSocial) {
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

        // Step 1: Upload the image (optional — skip if no image selected)
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
              // Don't block publish on image failure — just warn and use default
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

    } catch (error: any) {
        console.error(error);
        setError(`Publishing failed: ${error.message}`);
    }
    setIsPublishing(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
        <header className="flex flex-col items-start justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl flex items-center gap-3">
              {viewMode === 'post' ? (editingPostId ? 'Edit Opportunity Request' : 'Post With Us') : 'Manage My Postings'}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {viewMode === 'post' 
                ? (editingPostId ? 'Update your live opportunity parameters below and re-submit it for verification. The Admin team will approve changes shortly.' : 'Share an opportunity with thousands of students and change-makers across Kenya.') 
                : 'Review your live and pending posts, and see who has applied.'
              }
            </p>
          </div>
          <div className="flex gap-3">
             <Button 
               variant={viewMode === 'post' ? 'default' : 'outline'}
               onClick={() => setViewMode('post')}
               className={viewMode === 'post' ? 'bg-[#0933ed] text-white hover:bg-blue-800' : 'text-slate-600'}
             >
               Post Opportunity
             </Button>
             <Button 
               variant={viewMode === 'manage' ? 'default' : 'outline'}
               onClick={() => setViewMode('manage')}
               className={viewMode === 'manage' ? 'bg-[#0933ed] text-white hover:bg-blue-800' : 'text-slate-600 border-slate-300'}
             >
               <LayoutDashboard className="w-4 h-4 mr-2" />
               View Dashboard
             </Button>
          </div>
        </header>

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
            <Card className="border-slate-200 shadow-sm mt-4">
          <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900">
                1. Provide the Details
              </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input
                    required
                    placeholder="e.g. John Doe"
                    value={reporter.name}
                    onChange={(e) => setReporter({ ...reporter, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Organization</label>
                  <Input
                    required
                    placeholder="e.g. IEEE Kenya"
                    value={reporter.organization}
                    onChange={(e) => setReporter({ ...reporter, organization: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role / Position</label>
                  <Input
                    required
                    placeholder="e.g. Communications Lead"
                    value={reporter.role}
                    onChange={(e) => setReporter({ ...reporter, role: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input
                    required
                    placeholder="e.g. +254 700 000 000"
                    value={reporter.telephone}
                    onChange={(e) => setReporter({ ...reporter, telephone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Organization Email</label>
                  <Input
                    required
                    type="email"
                    placeholder="e.g. name@organization.org"
                    value={reporter.email}
                    onChange={(e) => setReporter({ ...reporter, email: e.target.value })}
                  />
                  <p className="text-[10px] text-gray-500 italic">
                    Use an organization-domain email if possible.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Website or Social Page</label>
                  <Input
                    required
                    placeholder="e.g. https://linkedin.com/company/..."
                    value={reporter.websiteOrSocial}
                    onChange={(e) => setReporter({ ...reporter, websiteOrSocial: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-2 border-t mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
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
                              onChange={(e) => setOrgRequest({...orgRequest, name: e.target.value})}
                            />
                            <Input 
                              placeholder="Organization Name (e.g. IEEE Kenya)" 
                              required
                              value={orgRequest.organization}
                              onChange={(e) => setOrgRequest({...orgRequest, organization: e.target.value})}
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Input 
                              type="email" 
                              placeholder="Official Email" 
                              required
                              value={orgRequest.email}
                              onChange={(e) => setOrgRequest({...orgRequest, email: e.target.value})}
                            />
                            <Input 
                              placeholder="Phone Number" 
                              value={orgRequest.telephone}
                              onChange={(e) => setOrgRequest({...orgRequest, telephone: e.target.value})}
                            />
                          </div>
                          <Textarea 
                            placeholder="Briefly describe your organization..." 
                            className="h-20"
                            value={orgRequest.description}
                            onChange={(e) => setOrgRequest({...orgRequest, description: e.target.value})}
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="md:col-span-3">
                  <Textarea
                    className="h-64 w-full rounded-md border-slate-200 bg-white px-4 py-3 text-sm placeholder:text-slate-400 focus-visible:ring-primary cursor-pointer"
                    placeholder="Paste the opportunity details here (e.g., from a poster, email, or website)... We will auto-extract the relevant parts."
                    value={rawText}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRawText(e.target.value)}
                  />
                </div>
                <div className="md:col-span-1 space-y-3 rounded-md bg-slate-50 p-3 flex flex-col justify-end">
                    <Button
                      onClick={handleParse}
                      disabled={isParsing || !rawText}
                      size="lg"
                      className="w-full"
                      style={{ backgroundColor: '#0933ed', color: '#ffffff' }}
                    >
                      {isParsing ? 'Extracting...' : 'AI Extract Data'}
                    </Button>
                    <div className="relative flex items-center py-2">
                      <div className="flex-grow border-t border-slate-300"></div>
                      <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-medium uppercase">OR</span>
                      <div className="flex-grow border-t border-slate-300"></div>
                    </div>
                    <Button
                      onClick={handleManualEntry}
                      disabled={isParsing}
                      variant="outline"
                      size="lg"
                      className="w-full border-slate-300 text-slate-700 hover:bg-slate-100"
                    >
                      Enter Manually
                    </Button>
                </div>
              </div>
              {error && !parsedData && (
                <div className="mt-4">
                  <p className="text-sm text-red-500 font-medium p-3 bg-red-50 border border-red-200 rounded-lg">{error}</p>
                </div>
              )}
          </CardContent>
        </Card>
        )}

        {/* STEP 2: Review Table & Dictionary */}
        {parsedData && (
          <Card className="animate-fade-in border-slate-200 shadow-sm mt-6">
              <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-slate-900">
                    2. Review & Submit
                  </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4 rounded-md bg-slate-50 p-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Title
                    </span>
                    <Input
                      value={parsedData.basicInfo.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBasicInfoEdit('title', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Provider
                    </span>
                    <Input
                      value={parsedData.basicInfo.provider}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBasicInfoEdit('provider', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Category
                    </span>
                    <select
                      className="w-full h-10 px-3 py-2 text-sm bg-white border rounded-md border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={parsedData.basicInfo.fundingType || ''}
                      onChange={(e) => handleBasicInfoEdit('fundingType', e.target.value)}
                    >
                      <option value="">Select funding type...</option>
                      <option value="Fully Funded">Fully Funded</option>
                      <option value="Partially Funded">Partially Funded</option>
                      <option value="Self Funded">Self Funded</option>
                      <option value="Paid / Salary">Paid / Salary</option>
                      <option value="Stipend Provided">Stipend Provided</option>
                      <option value="Unpaid">Unpaid</option>
                      <option value="Prize Money / Award">Prize Money / Award</option>
                      <option value="Not Applicable">Not Applicable</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Compensation
                    </span>
                    <select 
                      className="w-full h-10 px-3 py-2 text-sm bg-white border rounded-md border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={parsedData.basicInfo.compensationType || 'N/A'}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleBasicInfoEdit('compensationType', e.target.value)}
                    >
                      <option value="Paid">Paid (Salary/Wage)</option>
                      <option value="Stipend">Stipend / Allowance</option>
                      <option value="Unpaid">Unpaid</option>
                      <option value="N/A">Not Applicable</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Upfront Cost
                    </span>
                    <select 
                      className="w-full h-10 px-3 py-2 text-sm bg-white border rounded-md border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                      className="min-h-[80px]"
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
                      className="min-h-[120px]"
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
                        className="min-h-[80px]"
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
                        className="min-h-[80px]"
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
                  <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                            <th className="border-b border-slate-200 px-3 py-2 font-medium">
                              Feature
                            </th>
                            <th className="border-b border-slate-200 px-3 py-2 font-medium">
                              Extracted value
                            </th>
                            <th className="border-b border-slate-200 px-3 py-2 font-medium">
                              Importance
                            </th>
                            <th className="border-b border-slate-200 px-3 py-2 font-medium">
                              Quick actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {parsedData.extractedFeatures.map((feat, idx) => (
                            <tr
                              key={idx}
                              className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}
                            >
                              <td className="border-b border-slate-100 px-3 py-2 text-slate-900">
                                <span className="font-medium">{feat.feature}</span>
                              </td>
                              <td className="border-b border-slate-100 px-3 py-2 align-top">
                                {feat.feature === 'Deadline' ? (
                                  <div className="flex flex-col gap-2 sm:flex-row">
                                    <Input
                                      type="date"
                                      className="w-full sm:w-40 text-sm"
                                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        handleFeatureEdit(idx, 'value', e.target.value)
                                      }
                                    />
                                    <Input
                                      type="text"
                                      className="w-full text-sm"
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
                                    className="w-full text-sm"
                                    value={feat.value}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                      handleFeatureEdit(idx, 'value', e.target.value)
                                    }
                                    placeholder="Leave blank or edit…"
                                  />
                                )}
                              </td>
                              <td className="border-b border-slate-100 px-3 py-2 align-top">
                                  <Badge
                                    variant={
                                      feat.importance === 'High'
                                        ? 'destructive'
                                        : 'secondary'
                                    }
                                    className={`flex items-center gap-1 font-bold ${feat.importance === 'High' ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse' : feat.importance === 'Medium' ? 'bg-amber-400 text-slate-900 hover:bg-amber-500' : ''}`}
                                  >
                                    {feat.importance === 'High' && (
                                      <AlertCircle className="h-3 w-3" />
                                    )}
                                    {feat.importance === 'Medium' && (
                                      <Info className="h-3 w-3" />
                                    )}
                                    {feat.importance}
                                  </Badge>
                              </td>
                              <td className="border-b border-slate-100 px-3 py-2 align-top">
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
                                    >
                                      Use “Visit main page”
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
                                    >
                                      Use “Rolling” template
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
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={customForm.isEnabled}
                        onChange={(e) => setCustomForm(prev => ({ ...prev, isEnabled: e.target.checked }))}
                      />
                      <div className="peer h-6 w-11 rounded-full bg-slate-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rtl:peer-checked:after:-translate-x-full dark:border-slate-600 dark:bg-slate-700"></div>
                      <span className="ml-3 text-sm font-medium text-slate-900">
                        {customForm.isEnabled ? 'Enabled' : 'Disabled'}
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
                              className="w-48 text-sm"
                            />
                            <select
                              value={field.type}
                              onChange={(e) => {
                                const newFields = [...customForm.fields];
                                newFields[idx].type = e.target.value as FormField['type'];
                                setCustomForm({ ...customForm, fields: newFields });
                              }}
                              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
                                className="w-40 text-sm"
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
                                className="rounded border-slate-300 text-primary focus:ring-primary"
                              />
                              Required
                            </label>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2"
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
                <div className="mt-6 border border-blue-200 bg-blue-50 rounded-xl p-5 space-y-4">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      className="mt-1"
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
                      <p className="text-sm font-semibold text-green-800">✅ {editingPostId ? 'Edit request submitted!' : 'Opportunity sent for verification!'}</p>
                      <p className="text-xs text-green-700 mt-0.5">Our admin team will review it shortly. Thank you for contributing.</p>
                      {editingPostId && (
                         <Button asChild size="sm" variant="link" className="mt-2 text-green-700 p-0 h-auto font-bold underline">
                           <Link to="/post-with-us" onClick={() => window.location.reload()}>Return to Dashboard</Link>
                         </Button>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  className="mt-4 w-full"
                  size="lg"
                  style={{ backgroundColor: '#0933ed', color: '#ffffff' }}
                  onClick={handlePublish}
                  disabled={isPublishing || !parsedData}
                >
                  {isPublishing ? 'Submitting…' : editingPostId ? 'Submit Edit Request' : 'Submit for verification'}
                </Button>
              </CardContent>
          </Card>
        )}
        </>
      )}
      </div>
    </div>
  );
}

// Refurbished
