import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Type definition for the data returned by the AI parser
interface ParsedOpportunityData {
  basicInfo: {
    title: string;
    provider: string;
    category: string;
    description: string;
    fullDescription: string;
    fundingType: string;
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
}

// Use the same API base URL as the rest of the app — reads from VITE_API_URL env var
const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';

export function PostWithUs() {
  const [rawText, setRawText] = useState('');
  const [reporter, setReporter] = useState({ name: '', email: '' });
  const [isParsing, setIsParsing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedOpportunityData | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);

  const handleParse = async () => {
    if (!reporter.name || !reporter.email) {
      setError('Please provide your name and email first.');
      return;
    }
    setIsParsing(true);
    setError(null);
    setParsedData(null);
    setPublishedSlug(null);
    try {
      const response = await fetch(`${API_BASE}/public/parse-opportunity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rawText }),
      });

      const data = await response.json();

      if (!response.ok) {
        const msg = data.details || data.error || 'An unknown error occurred.';
        throw new Error(msg);
      }
      
      setParsedData(data);
    } catch (error: any) {
      console.error(error);
      setError(`Parsing failed: ${error.message}`);
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

  const handlePublish = async () => {
    if (!parsedData) {
      setError('Cannot publish without parsed data.');
      return;
    }

    setIsPublishing(true);
    setError(null);

    try {
        if (!reporter.name || !reporter.email) {
            throw new Error('Name and email are required to submit.');
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

        const slug = parsedData.basicInfo.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const finalOpportunity = {
          id: `pub-${Date.now()}`,          // unique ID
          title: parsedData.basicInfo.title,
          provider: parsedData.basicInfo.provider,
          category: parsedData.basicInfo.category,
          description: parsedData.basicInfo.description,
          fullDescription: parsedData.basicInfo.fullDescription || parsedData.basicInfo.description,
          fundingType: parsedData.basicInfo.fundingType,
          deadline: deadline || 'Rolling',
          location,
          applicationLink,
          eligibility: {
            educationLevel: 'Both',
            requirements: parsedData.eligibilityRequirements || [],
          },
          benefits: parsedData.benefits || [],
          thematicAreas: parsedData.thematicAreas || [],
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
        <header className="flex flex-col items-start justify-between gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
              Post With Us
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Share an opportunity with thousands of students and change-makers across Kenya.
            </p>
          </div>
        </header>

        {/* STEP 1: Details & Text Input */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900">
                1. Provide the Details
              </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-4 cursor-pointer">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Your Name</label>
                  <Input 
                    value={reporter.name} 
                    onChange={e => setReporter({...reporter, name: e.target.value})} 
                    placeholder="John Doe" 
                  />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Your Email</label>
                  <Input 
                    value={reporter.email} 
                    onChange={e => setReporter({...reporter, email: e.target.value})} 
                    placeholder="john@example.com" 
                    type="email"
                  />
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
                      {isParsing ? 'Extracting…' : 'Extract data points'}
                    </Button>
                </div>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              {publishedSlug && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 flex items-center justify-between mt-4">
                  <div>
                    <p className="text-sm font-semibold text-green-800">✅ Opportunity sent for verification!</p>
                    <p className="text-xs text-green-700 mt-0.5">Our admin team will review it shortly. Thank you for contributing.</p>
                  </div>
                </div>
              )}
          </CardContent>
        </Card>


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
                    <Input
                      value={parsedData.basicInfo.category}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBasicInfoEdit('category', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Funding type
                    </span>
                    <Input
                      value={parsedData.basicInfo.fundingType}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBasicInfoEdit('fundingType', e.target.value)}
                    />
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
                                <Input
                                  type="text"
                                  className="w-full text-sm"
                                  value={feat.value}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    handleFeatureEdit(idx, 'value', e.target.value)
                                  }
                                  placeholder="Leave blank or edit…"
                                />
                              </td>
                              <td className="border-b border-slate-100 px-3 py-2 align-top">
                                <Badge
                                  variant={
                                    feat.importance === 'High'
                                      ? 'destructive'
                                      : feat.importance === 'Medium'
                                      ? 'secondary'
                                      : 'default'
                                  }
                                >
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

                {/* STEP 3: Desktop Wide Image Upload */}
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

                <Button
                  className="mt-4 w-full"
                  size="lg"
                  style={{ backgroundColor: '#0933ed', color: '#ffffff' }}
                  onClick={handlePublish}
                  disabled={isPublishing || !parsedData}
                >
                  {isPublishing ? 'Submitting…' : 'Submit for verification'}
                </Button>
              </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
