import { Target, Eye, Heart, Users, Briefcase, Monitor, MapPin, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useSEO } from '../hooks/useSEO';

export function About() {
  const [activeTab, setActiveTab] = useState<'online' | 'onground'>('online');

  useSEO({
    title: 'About & Services',
    description: 'Opportunities Kenya connects companies with vetted student talent for data annotation, transcription, social media, research, event support and more. Cost-effective, escrow-protected.',
    url: '/about'
  });
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-[#131ADF] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="mb-6">About Opportunities Kenya</h1>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Empowering Kenya's technical talent by connecting them with paid subcontracting gigs, industry innovation challenges, and global career opportunities.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Logo & Name */}
        <div className="flex flex-col items-center mb-14">
          <img
            src="/Opportunities Kenya Logo 2.png"
            alt="Opportunities Kenya Logo"
            className="w-12 h-12 object-contain mb-4 drop-shadow-md"
          />
          <h2 className="text-2xl font-bold text-blue-900 tracking-tight text-center">Opportunities Kenya</h2>
          <p className="text-gray-500 text-sm mt-1 text-center">Your Gateway to Scholarly Excellence</p>
        </div>

        {/* Who We Are */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-gray-900 mb-6">Who We Are</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Opportunities Kenya is an Open Innovation Platform and Talent Subcontracting Hub. We bridge the gap between academia and industry by connecting Kenya's top university students, graduates, and practitioners with pressing corporate challenges and paid subcontracting jobs.
              </p>
              <p>
                While we actively curate high-value global scholarships, internships, and fellowships to foster continuous learning, our primary focus is on <strong>Value Creation</strong>. We facilitate direct subcontracting gigs—allowing professionals and organizations to outsource technical, administrative, and research tasks to our verified database of student talent.
              </p>
              <p>
                Furthermore, we host Industry Innovation Challenges, Hackathons, and Calls for Papers that let students apply their academic knowledge to real-world bottlenecks (such as local infrastructure or utility crises).
              </p>
              <p>
                We are transitioning from a simple opportunity-listing platform into an active ecosystem where students build real-world portfolios, earn income through executed gigs, and incubate their final-year projects into scalable, venture-backed startups.
              </p>
            </div>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
              <Eye className="w-7 h-7 text-blue-600" />
            </div>
            <h2 className="text-gray-900 mb-4">Our Vision</h2>
            <p className="text-gray-700 leading-relaxed">
              To transform Kenya's student talent pool into an active, monetizable engine for industry innovation and specialized subcontracting.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
              <Target className="w-7 h-7 text-purple-600" />
            </div>
            <h2 className="text-gray-900 mb-4">Our Mission</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>To facilitate seamless subcontracting between industry professionals and skilled students</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>To digitize corporate challenges and crowdsource actionable, verifiable prototypes</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>To curate high-value global academic opportunities, call for papers, and internships</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>To incubate breakthrough student projects into scalable, real-world solutions</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Why We Exist */}
        <section className="bg-[#f0f7ff] rounded-2xl p-8 mb-16">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
              <Heart className="w-7 h-7 text-red-500" />
            </div>
            <div>
              <h2 className="text-gray-900 mb-4">Why We Exist</h2>
              <p className="text-gray-700 leading-relaxed">
                African corporates lose billions to inefficiencies while universities produce thousands of skilled engineers and professionals who lack practical application paths. We exist to bridge this gap—providing organizations with an agile student workforce, and giving students real-world income, experience, and global exposure.
              </p>
            </div>
          </div>
        </section>

        {/* What We Do */}
        <section className="bg-white rounded-2xl p-8 shadow-sm mb-16">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Users className="w-7 h-7 text-green-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-gray-900 mb-4">What We Do</h2>
              <div className="space-y-4 text-gray-700">
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    1
                  </span>
                  <div>
                    <p className="text-gray-900 font-semibold mb-1">Talent Subcontracting (Jobs)</p>
                    <p className="text-gray-600">We match professionals needing specific operational tasks (tech, admin, engineering, research) with vetted student freelancers for quick, paid deliverables.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    2
                  </span>
                  <div>
                    <p className="text-gray-900 font-semibold mb-1">Industry Innovation Challenges</p>
                    <p className="text-gray-600">We host corporate challenges, hackathons, and calls for papers, giving learners real-world data to solve infrastructural bottlenecks.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    3
                  </span>
                  <div>
                    <p className="text-gray-900 font-semibold mb-1">Global Opportunities</p>
                    <p className="text-gray-600">We continually curate the best scholarships, internships, fellowships, and grants to ensure our community has access to continuous academic and career growth.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    4
                  </span>
                  <div>
                    <p className="text-gray-900 font-semibold mb-1">Project Incubation</p>
                    <p className="text-gray-600">We guide top-performing students and their final-year projects toward industry attachments or transition them into venture-backed startups.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Services Catalog ─── */}
        <section id="services" className="mb-16 scroll-mt-24">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="text-center mb-10">
              <h2 className="text-gray-900 mb-3 text-3xl font-bold">Services Students Offer</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Companies and individuals can source vetted student talent for cost-effective, fast deliverables.
                Browse our full service catalog below — or <a href="/post-with-us" className="text-blue-600 underline font-semibold">post a task</a> and we'll match you within hours.
              </p>
            </div>

            {/* Online / On-Ground Toggle */}
            <div className="flex justify-center mb-10">
              <div className="bg-gray-100 rounded-xl p-1 inline-flex">
                <button
                  onClick={() => setActiveTab('online')}
                  className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all ${activeTab === 'online'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <Monitor className="w-4 h-4 inline mr-2" />
                  Online Tasks
                </button>
                <button
                  onClick={() => setActiveTab('onground')}
                  className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all ${activeTab === 'onground'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <MapPin className="w-4 h-4 inline mr-2" />
                  On-Ground Tasks
                </button>
              </div>
            </div>

            {/* ── ONLINE TASKS ── */}
            {activeTab === 'online' && (
              <div className="space-y-6">
                {/* Data Services */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-blue-50 px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Data Services</h3>
                      <p className="text-sm text-gray-600">Accurate, fast data processing for AI, research & operations</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                        <tr>
                          <th className="px-6 py-3 text-left">Service</th>
                          <th className="px-6 py-3 text-left">Specific Tasks</th>
                          <th className="px-6 py-3 text-left">Target Clients</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Data Entry</td><td className="px-6 py-3 text-gray-600">Spreadsheet cleanup, form data input, CSV transformation</td><td className="px-6 py-3 text-gray-600">SMEs, NGOs, Consultants</td></tr>
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Data Annotation</td><td className="px-6 py-3 text-gray-600">Image bounding boxes, text classification, sentiment labeling</td><td className="px-6 py-3 text-gray-600">AI/ML Companies, Researchers</td></tr>
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Web Scraping</td><td className="px-6 py-3 text-gray-600">Business directory extraction, price monitoring, lead lists</td><td className="px-6 py-3 text-gray-600">Startups, Marketing Agencies</td></tr>
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Data Collection</td><td className="px-6 py-3 text-gray-600">API data aggregation, public record compilation</td><td className="px-6 py-3 text-gray-600">Research Firms, Academia</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Content & Writing */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-green-50 px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Content & Writing</h3>
                      <p className="text-sm text-gray-600">Professional content crafted by skilled student writers</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                        <tr>
                          <th className="px-6 py-3 text-left">Service</th>
                          <th className="px-6 py-3 text-left">Specific Tasks</th>
                          <th className="px-6 py-3 text-left">Target Clients</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Blog Writing</td><td className="px-6 py-3 text-gray-600">SEO articles, thought leadership, technical blogs</td><td className="px-6 py-3 text-gray-600">Brands, Media Houses, SaaS</td></tr>
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Copywriting</td><td className="px-6 py-3 text-gray-600">Ad copy, landing pages, email sequences</td><td className="px-6 py-3 text-gray-600">Startups, Agencies</td></tr>
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Translation</td><td className="px-6 py-3 text-gray-600">English↔Swahili, document localization, subtitle translation</td><td className="px-6 py-3 text-gray-600">Apps, NGOs, Educators</td></tr>
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Content Moderation</td><td className="px-6 py-3 text-gray-600">Comment review, community guideline enforcement</td><td className="px-6 py-3 text-gray-600">Platforms, Social Media Managers</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Transcription */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-purple-50 px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Transcription & Captioning</h3>
                      <p className="text-sm text-gray-600">Turn audio into accurate, searchable text</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                        <tr>
                          <th className="px-6 py-3 text-left">Service</th>
                          <th className="px-6 py-3 text-left">Specific Tasks</th>
                          <th className="px-6 py-3 text-left">Target Clients</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Audio Transcription</td><td className="px-6 py-3 text-gray-600">Meeting notes, interview transcripts, focus group records</td><td className="px-6 py-3 text-gray-600">Researchers, Podcasters</td></tr>
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Captioning</td><td className="px-6 py-3 text-gray-600">YouTube subtitles, video captions, accessibility transcripts</td><td className="px-6 py-3 text-gray-600">Content Creators, Educators</td></tr>
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Voiceover</td><td className="px-6 py-3 text-gray-600">Narration, radio spots, church messages (English, Swahili, local languages)</td><td className="px-6 py-3 text-gray-600">Brands, Churches, Media</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Social Media & Marketing */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-orange-50 px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center text-white">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Social Media & Marketing</h3>
                      <p className="text-sm text-gray-600">Grow brands with engaged, youthful digital talent</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                        <tr>
                          <th className="px-6 py-3 text-left">Service</th>
                          <th className="px-6 py-3 text-left">Specific Tasks</th>
                          <th className="px-6 py-3 text-left">Target Clients</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Community Management</td><td className="px-6 py-3 text-gray-600">Comment replies, group moderation, DM responses</td><td className="px-6 py-3 text-gray-600">Brands, Influencers</td></tr>
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Content Scheduling</td><td className="px-6 py-3 text-gray-600">Post calendar creation, bulk upload, hashtag research</td><td className="px-6 py-3 text-gray-600">SMEs, Agencies</td></tr>
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Brand Monitoring</td><td className="px-6 py-3 text-gray-600">Mention tracking, sentiment analysis, competitor reports</td><td className="px-6 py-3 text-gray-600">Marketing Teams</td></tr>
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Hype & Engagement</td><td className="px-6 py-3 text-gray-600">Like campaigns, share drives, hashtag challenges</td><td className="px-6 py-3 text-gray-600">Event Organizers, Startups</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Research & Analysis */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-teal-50 px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center text-white">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Research & Analysis</h3>
                      <p className="text-sm text-gray-600">Academic-grade research and data-driven insights</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                        <tr>
                          <th className="px-6 py-3 text-left">Service</th>
                          <th className="px-6 py-3 text-left">Specific Tasks</th>
                          <th className="px-6 py-3 text-left">Target Clients</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Literature Reviews</td><td className="px-6 py-3 text-gray-600">Academic paper synthesis, citation mapping</td><td className="px-6 py-3 text-gray-600">University Students, Researchers</td></tr>
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Market Research</td><td className="px-6 py-3 text-gray-600">Industry analysis, pricing benchmarks, consumer trends</td><td className="px-6 py-3 text-gray-600">Consultants, Startups</td></tr>
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Competitor Analysis</td><td className="px-6 py-3 text-gray-600">Feature comparison, SWOT matrices, gap analysis</td><td className="px-6 py-3 text-gray-600">Product Teams, Founders</td></tr>
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Survey Design</td><td className="px-6 py-3 text-gray-600">Questionnaire creation, KoboToolbox setup, data cleaning</td><td className="px-6 py-3 text-gray-600">NGOs, Academic Researchers</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Design & Creative */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-pink-50 px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center text-white">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Design & Creative</h3>
                      <p className="text-sm text-gray-600">Visual assets that communicate and convert</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                        <tr>
                          <th className="px-6 py-3 text-left">Service</th>
                          <th className="px-6 py-3 text-left">Specific Tasks</th>
                          <th className="px-6 py-3 text-left">Target Clients</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Logo Design</td><td className="px-6 py-3 text-gray-600">Brand identity, favicon, social avatar sets</td><td className="px-6 py-3 text-gray-600">Startups, SMEs</td></tr>
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Flyer & Poster</td><td className="px-6 py-3 text-gray-600">Event flyers, conference posters, social banners</td><td className="px-6 py-3 text-gray-600">Event Planners, Churches</td></tr>
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Social Media Graphics</td><td className="px-6 py-3 text-gray-600">Carousel posts, quote cards, story templates</td><td className="px-6 py-3 text-gray-600">Influencers, Brands</td></tr>
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Presentation Design</td><td className="px-6 py-3 text-gray-600">Pitch decks, lecture slides, board reports</td><td className="px-6 py-3 text-gray-600">Executives, Students</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Technology & Development */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-indigo-50 px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Technology & Development</h3>
                      <p className="text-sm text-gray-600">Technical skills for digital projects</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                        <tr>
                          <th className="px-6 py-3 text-left">Service</th>
                          <th className="px-6 py-3 text-left">Specific Tasks</th>
                          <th className="px-6 py-3 text-left">Target Clients</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Bug Testing / QA</td><td className="px-6 py-3 text-gray-600">Manual testing, edge case reporting, usability feedback</td><td className="px-6 py-3 text-gray-600">App Developers, SaaS</td></tr>
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Web Development</td><td className="px-6 py-3 text-gray-600">WordPress setup, landing pages, basic React apps</td><td className="px-6 py-3 text-gray-600">SMEs, Event Organizers</td></tr>
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Excel Automation</td><td className="px-6 py-3 text-gray-600">Macro writing, dashboard creation, data pipelines</td><td className="px-6 py-3 text-gray-600">Finance Teams, Analysts</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Virtual Assistance */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-amber-50 px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center text-white">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Virtual Assistance</h3>
                      <p className="text-sm text-gray-600">Administrative support, remotely</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                        <tr>
                          <th className="px-6 py-3 text-left">Service</th>
                          <th className="px-6 py-3 text-left">Specific Tasks</th>
                          <th className="px-6 py-3 text-left">Target Clients</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Email Management</td><td className="px-6 py-3 text-gray-600">Inbox zero, label sorting, draft responses</td><td className="px-6 py-3 text-gray-600">Executives, Consultants</td></tr>
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Calendar Scheduling</td><td className="px-6 py-3 text-gray-600">Appointment booking, timezone coordination</td><td className="px-6 py-3 text-gray-600">Doctors, Lawyers, Coaches</td></tr>
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Invoice Prep</td><td className="px-6 py-3 text-gray-600">QuickBooks entry, PDF invoices, expense reports</td><td className="px-6 py-3 text-gray-600">Small Businesses</td></tr>
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Travel Booking</td><td className="px-6 py-3 text-gray-600">Flight research, hotel comparison, itinerary creation</td><td className="px-6 py-3 text-gray-600">Corporate Teams, Individuals</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Customer Support */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-cyan-50 px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center text-white">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Customer Support</h3>
                      <p className="text-sm text-gray-600">Keep your customers happy, remotely</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                        <tr>
                          <th className="px-6 py-3 text-left">Service</th>
                          <th className="px-6 py-3 text-left">Specific Tasks</th>
                          <th className="px-6 py-3 text-left">Target Clients</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Live Chat Support</td><td className="px-6 py-3 text-gray-600">Website chat, WhatsApp business responses</td><td className="px-6 py-3 text-gray-600">E-commerce Stores</td></tr>
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Email Support</td><td className="px-6 py-3 text-gray-600">Ticket triage, FAQ responses, escalation handling</td><td className="px-6 py-3 text-gray-600">SaaS, Startups</td></tr>
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Appointment Scheduling</td><td className="px-6 py-3 text-gray-600">Booking calls, reminder messages, confirmation follows</td><td className="px-6 py-3 text-gray-600">Clinics, Salons, Consultants</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── ON-GROUND TASKS ── */}
            {activeTab === 'onground' && (
              <div className="space-y-6">
                {/* Event Support */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-red-50 px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Event Support</h3>
                      <p className="text-sm text-gray-600">Reliable student workforce for events of any size</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                        <tr>
                          <th className="px-6 py-3 text-left">Service</th>
                          <th className="px-6 py-3 text-left">Specific Tasks</th>
                          <th className="px-6 py-3 text-left">Target Clients</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Event Setup</td><td className="px-6 py-3 text-gray-600">Stage prep, seating arrangement, signage placement</td><td className="px-6 py-3 text-gray-600">Event Planners, Corporates</td></tr>
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Crowd Management</td><td className="px-6 py-3 text-gray-600">Queue control, direction guidance, VIP support</td><td className="px-6 py-3 text-gray-600">Conference Organizers</td></tr>
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Registration Desk</td><td className="px-6 py-3 text-gray-600">Badge printing, attendee check-in, lanyard distribution</td><td className="px-6 py-3 text-gray-600">All Event Types</td></tr>
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Photography / Videography</td><td className="px-6 py-3 text-gray-600">Event coverage, highlight reels, photo booths</td><td className="px-6 py-3 text-gray-600">Brands, Churches, Weddings</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Delivery & Logistics */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-yellow-50 px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center text-white">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Delivery & Logistics</h3>
                      <p className="text-sm text-gray-600">Fast, reliable last-mile execution</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                        <tr>
                          <th className="px-6 py-3 text-left">Service</th>
                          <th className="px-6 py-3 text-left">Specific Tasks</th>
                          <th className="px-6 py-3 text-left">Target Clients</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Package Delivery</td><td className="px-6 py-3 text-gray-600">Same-day parcel drop-off, document courier</td><td className="px-6 py-3 text-gray-600">Shops, Offices</td></tr>
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Grocery Shopping</td><td className="px-6 py-3 text-gray-600">Supermarket runs, pharmacy pickup, stock replenishment</td><td className="px-6 py-3 text-gray-600">Individuals, Restaurants</td></tr>
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Inventory Counting</td><td className="px-6 py-3 text-gray-600">Warehouse stocktake, shelf auditing, barcode scanning</td><td className="px-6 py-3 text-gray-600">Retailers, Warehouses</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Property & Housing */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-emerald-50 px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Property & Housing</h3>
                      <p className="text-sm text-gray-600">Real estate support around campus and city areas</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                        <tr>
                          <th className="px-6 py-3 text-left">Service</th>
                          <th className="px-6 py-3 text-left">Specific Tasks</th>
                          <th className="px-6 py-3 text-left">Target Clients</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Hostel Scouting</td><td className="px-6 py-3 text-gray-600">Vacancy gathering, rent comparison, caretaker contacts</td><td className="px-6 py-3 text-gray-600">Incoming Students</td></tr>
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Property Photography</td><td className="px-6 py-3 text-gray-600">Room photos, drone shots, virtual tour clips</td><td className="px-6 py-3 text-gray-600">Landlords, Agents</td></tr>
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Facility Inspection</td><td className="px-6 py-3 text-gray-600">Pre-move-in condition reports, maintenance tracking</td><td className="px-6 py-3 text-gray-600">Property Managers</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Marketing & Promotions */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-violet-50 px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-600 rounded-lg flex items-center justify-center text-white">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Marketing & Promotions</h3>
                      <p className="text-sm text-gray-600">Boots on the ground for brand awareness campaigns</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                        <tr>
                          <th className="px-6 py-3 text-left">Service</th>
                          <th className="px-6 py-3 text-left">Specific Tasks</th>
                          <th className="px-6 py-3 text-left">Target Clients</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Brand Ambassador</td><td className="px-6 py-3 text-gray-600">Represent products, engage attendees, collect leads</td><td className="px-6 py-3 text-gray-600">FMCG, Startups</td></tr>
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Flyer Distribution</td><td className="px-6 py-3 text-gray-600">Campus handouts, mall drops, mailbox inserts</td><td className="px-6 py-3 text-gray-600">Events, Businesses</td></tr>
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Product Sampling</td><td className="px-6 py-3 text-gray-600">Food/drink tastings, trial distribution, feedback collection</td><td className="px-6 py-3 text-gray-600">Consumer Brands</td></tr>
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Street Marketing</td><td className="px-6 py-3 text-gray-600">Flash mobs, live demos, interactive activations</td><td className="px-6 py-3 text-gray-600">Agencies, Brands</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Retail & Sales */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-sky-50 px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-sky-600 rounded-lg flex items-center justify-center text-white">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Retail & Sales</h3>
                      <p className="text-sm text-gray-600">Sales support for local businesses</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                        <tr>
                          <th className="px-6 py-3 text-left">Service</th>
                          <th className="px-6 py-3 text-left">Specific Tasks</th>
                          <th className="px-6 py-3 text-left">Target Clients</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Shop Assistant</td><td className="px-6 py-3 text-gray-600">Customer service, checkout, stock display</td><td className="px-6 py-3 text-gray-600">Boutiques, Groceries</td></tr>
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Sales Agent</td><td className="px-6 py-3 text-gray-600">Door-to-door sales, lead generation, subscription drives</td><td className="px-6 py-3 text-gray-600">Utilities, Media, EdTech</td></tr>
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Price Tagging</td><td className="px-6 py-3 text-gray-600">Shelf labeling, promo sticker placement, barcode creation</td><td className="px-6 py-3 text-gray-600">Supermarkets</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Academic & Campus Support */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-lime-50 px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-lime-600 rounded-lg flex items-center justify-center text-white">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Academic & Campus Support</h3>
                      <p className="text-sm text-gray-600">On-campus presence and student-facing roles</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                        <tr>
                          <th className="px-6 py-3 text-left">Service</th>
                          <th className="px-6 py-3 text-left">Specific Tasks</th>
                          <th className="px-6 py-3 text-left">Target Clients</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Campus Ambassador</td><td className="px-6 py-3 text-gray-600">Brand presence, student feedback, event hosting</td><td className="px-6 py-3 text-gray-600">EdTech, Telcos, Banks</td></tr>
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Student Recruiter</td><td className="px-6 py-3 text-gray-600">Enrollment drives, info sessions, prospect follow-up</td><td className="px-6 py-3 text-gray-600">Universities, Colleges</td></tr>
                        <tr><td className="px-6 py-3 font-semibold text-gray-900">Orientation Guide</td><td className="px-6 py-3 text-gray-600">Freshman tours, campus navigation, welcome desks</td><td className="px-6 py-3 text-gray-600">Universities</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* CTA Row */}
            <div className="mt-10 text-center">
              <p className="text-gray-600 mb-4">Don't see what you need? We have 50+ more services across 30+ campuses.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="/post-with-us" className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-colors">
                  Post a Task Now
                </a>
                <a href="/opportunities" className="px-8 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 font-semibold transition-colors">
                  Browse All Opportunities
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Why Hire Through Us */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
            <h2 className="text-gray-900 mb-6 text-2xl font-bold text-center">Why Hire Through Opportunities Kenya?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mx-auto mb-3">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">60-70% Cost Savings</h3>
                <p className="text-sm text-gray-600">Student talent delivers enterprise-quality work at a fraction of agency rates</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-3">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">24-48 Hour Turnaround</h3>
                <p className="text-sm text-gray-600">Mass student workforce means tasks get started immediately, not next week</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-3">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Multilingual Talent</h3>
                <p className="text-sm text-gray-600">Fluent in English, Swahili, Kikuyu, Luo, Luganda, and more</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-3">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Escrow Protection</h3>
                <p className="text-sm text-gray-600">Payments held securely until you're satisfied with the deliverable</p>
              </div>
            </div>
          </div>
        </section>

        {/* Terms of Usage */}
        <section id="terms" className="bg-white rounded-2xl p-8 shadow-sm mb-16 scroll-mt-24">
          <h2 className="text-gray-900 mb-6">Terms of Usage</h2>
          <div className="space-y-4 text-gray-700 leading-relaxed text-sm">
            <p>
              By accessing and using Opportunities Kenya, you agree to comply with and be bound by the following terms of use. Please review these terms carefully. If you do not agree to these terms, you should not use this platform.
            </p>
            <p>
              <strong>1. User Conduct:</strong> Users must provide accurate, current, and complete information when creating accounts, posting opportunities, or applying. Any fraudulent, abusive, or otherwise illegal activity may be grounds for termination of your account, at our sole discretion.
            </p>
            <p>
              <strong>2. Opportunity Postings:</strong> Organizations and individuals posting opportunities are solely responsible for the accuracy and legitimacy of their postings. Opportunities Kenya reserves the right to review, reject, or remove any posting that violates our guidelines or is deemed inappropriate, without prior notice.
            </p>
            <p>
              <strong>3. Subcontracting and Escrow:</strong> For gig and subcontracting opportunities involving escrow or direct payments, Opportunities Kenya acts as a facilitator. We are not liable for disputes over deliverable quality. Users must resolve disputes through our provided mediation channels in good faith.
            </p>
            <p>
              <strong>4. Crowdfunding & Refunds:</strong> Contributions made to community projects or hackathons are pooled together. In the event a project is deemed unsustainable, fraudulent, or if the original creator requests cancellation, Opportunities Kenya will initiate a group refund, returning the contributed funds to all backers simultaneously.
            </p>
            <p>
              <strong>5. Intellectual Property & Third-Party Content:</strong> Opportunities Kenya acts as an aggregator for public educational and professional opportunities. We do not claim ownership over third-party opportunity listings, external company names, or logos, which remain the property of their respective trademark owners and are shared for informational purposes. However, our original platform design, custom code, and proprietary Opportunities Kenya branding are protected by intellectual property laws.
            </p>
            <p>
              <strong>6. Privacy & Data Use:</strong> We respect your privacy. User data is collected and used strictly to improve platform matchmaking, facilitate applications, and track analytics. We do not sell your personal data to third parties.
            </p>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-[#131ADF] rounded-2xl p-8 text-center text-white">
          <h2 className="text-white mb-4">Join Our Community</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Stay connected with thousands of students and young professionals who are discovering opportunities every day.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/opportunities"
              className="px-8 py-3 bg-white text-blue-600 rounded-xl hover:shadow-lg transition-all"
            >
              Browse Opportunities
            </a>
            <a
              href="/contact"
              className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white hover:text-blue-600 transition-all"
            >
              Get in Touch
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

// Refurbished
