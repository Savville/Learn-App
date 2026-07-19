import { Hero } from '../components/Hero';
import { OpportunityCard } from '../components/OpportunityCard';
import { Newsletter } from '../components/Newsletter';
import { opportunities } from '../data/opportunities';
import { ArrowRight, Briefcase, Monitor, MapPin, Code, PenTool, Headphones, Palette, Megaphone, ClipboardCheck, GraduationCap, Truck, FileText, Search, Building2, Users, HandHeart, Sparkles, Globe, Lightbulb, Calendar, UserCheck, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';

// Categories displayed as overview badges (not clickable buttons)
const platformCategories = [
  { icon: Wallet, label: 'Grants & Funding', desc: 'Micro-grants, venture funding, and seed capital for student projects' },
  { icon: GraduationCap, label: 'Internships', desc: 'Paid and unpaid internships with established organizations' },
  { icon: Monitor, label: 'Online Tasks', desc: 'Data entry, transcription, social media, research — work from anywhere' },
  { icon: MapPin, label: 'On-Ground Work', desc: 'Event support, delivery, property scouting, brand ambassador roles' },
  { icon: Users, label: 'Call for Agents', desc: 'Campus representative and student agent opportunities nationwide' },
  { icon: Calendar, label: 'Events & Participants', desc: 'Hackathons, conferences, workshops, and community gatherings' },
  { icon: HandHeart, label: 'Equity Contributions', desc: 'Fund student projects in exchange for equity or recognition' },
  { icon: Lightbulb, label: 'Project Collaborations', desc: 'Join forces with fellow students on innovative research and builds' },
  { icon: UserCheck, label: 'Call for Volunteers', desc: 'Contribute your time and skills to causes that matter' },
  { icon: Globe, label: 'Scholarships', desc: 'Fully and partially funded academic programs worldwide' },
];

const howItWorksStudents = [
  { step: '1', title: 'Browse', desc: 'Search gigs, scholarships and opportunities' },
  { step: '2', title: 'Apply', desc: 'Submit your pitch or application' },
  { step: '3', title: 'Work', desc: 'Complete the task and deliver quality work' },
  { step: '4', title: 'Get Paid', desc: 'Receive payment via M-Pesa (escrow-protected)' },
];

const howItWorksCompanies = [
  { step: '1', title: 'Post', desc: 'Describe your task, budget and deadline' },
  { step: '2', title: 'Review', desc: 'Student applications arrive within hours' },
  { step: '3', title: 'Hire', desc: 'Select the best candidate for your needs' },
  { step: '4', title: 'Release Payment', desc: 'Pay securely via escrow after approval' },
];

export function Home() {
  useSEO({
    title: 'Home',
    description: 'Find paid micro-gigs, internships, scholarships and more. Companies source vetted student talent. Escrow-protected payments.',
    url: '/'
  });

  const featured = [...opportunities].filter(opp => opp.featured);
  const featuredOpportunities = (featured.length > 0 ? featured : [...opportunities].sort((a, b) => new Date(b.dateAdded || 0).getTime() - new Date(a.dateAdded || 0).getTime())).slice(0, 6);

  return (
    <div>
      <Hero />

      {/* Platform Overview — What We Post */}
      <section className="py-16 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-gray-900 mb-3 font-extrabold tracking-tight text-3xl">What We Post on This Platform</h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
              Opportunities Kenya curates and verifies a wide range of opportunities for students, young professionals, and partnering organizations.
              Whether you're looking for paid work, academic funding, project collaboration, or a way to source talented student workers — we connect you.
            </p>
          </div>

          {/* Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {platformCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.label}
                  className="group flex items-start gap-3 p-5 bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 rounded-xl transition-all"
                >
                  <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 text-blue-700 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1">{cat.label}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{cat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA Row */}
          <div className="text-center mt-10">
            <p className="text-gray-600 mb-4 text-sm">
              Browse all opportunities or use the filters above to find exactly what you need.
            </p>
            <Link
              to="/opportunities"
              className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-colors"
            >
              Browse All Opportunities
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-gray-900 mb-2 text-3xl font-extrabold tracking-tight">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Whether you're a student looking for work or a company needing talent — we've got you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Students Flow */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">For Students</h3>
              </div>
              <div className="space-y-4">
                {howItWorksStudents.map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                to="/opportunities"
                className="mt-6 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm"
              >
                Browse Opportunities
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Companies Flow */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">For Companies</h3>
              </div>
              <div className="space-y-4">
                {howItWorksCompanies.map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                to="/post-with-us"
                className="mt-6 inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold text-sm"
              >
                Post a Task
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Opportunities */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-gray-900 mb-2 font-extrabold tracking-tight">Featured Opportunities</h2>
              <p className="text-gray-800 font-semibold text-lg">Hand-picked opportunities you don't want to miss</p>
            </div>
            <Link
              to="/opportunities"
              className="flex items-center gap-2 text-blue-600 hover:gap-3 transition-all"
            >
              <span>View All</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredOpportunities.map(opportunity => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        </div>
      </section>

      {/* Companies That Have Posted With Us */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-gray-900 mb-3 font-extrabold tracking-tight text-2xl">Companies That Have Posted With Us</h2>
          <p className="text-gray-600 mb-10 max-w-xl mx-auto">
            We work with organizations that value student talent. These companies have posted tasks and opportunities through our platform.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 mb-10">
            <img
              src="/images/Safal_Group.jpg"
              alt="Safal Group"
              className="h-16 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
            />
            <img
              src="/images/hazina.png"
              alt="Hazina"
              className="h-16 w-auto object-contain opacity-80 hover:opacity-100 transition-colors grayscale hover:grayscale-0"
            />
          </div>
          <Link
            to="/post-with-us"
            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-colors"
          >
            Post Your First Task
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Newsletter Section */}
      <Newsletter />
    </div>
  );
}

// Refurbished
