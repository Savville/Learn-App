import { Hero } from '../components/Hero';
import { OpportunityCard } from '../components/OpportunityCard';
import { Newsletter } from '../components/Newsletter';
import { opportunities } from '../data/opportunities';
import { ArrowRight, Briefcase, Monitor, MapPin, Code, PenTool, Headphones, Palette, Megaphone, ClipboardCheck, GraduationCap, Truck, FileText, Search, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';

const categoryPills = [
  { icon: ClipboardCheck, label: 'Data Entry', query: 'category=Gig&compensation=Paid' },
  { icon: FileText, label: 'Transcription', query: 'category=Gig' },
  { icon: Megaphone, label: 'Social Media', query: 'category=Gig' },
  { icon: PenTool, label: 'Writing', query: 'category=Gig' },
  { icon: Search, label: 'Research', query: 'category=Gig' },
  { icon: Palette, label: 'Design', query: 'category=Gig' },
  { icon: Code, label: 'Tech', query: 'category=Gig' },
  { icon: Headphones, label: 'Support', query: 'category=Gig' },
  { icon: GraduationCap, label: 'Internships', query: 'category=Internship' },
  { icon: Monitor, label: 'Online Tasks', query: 'task_type=online' },
  { icon: MapPin, label: 'On-Ground', query: 'task_type=on_ground' },
  { icon: Briefcase, label: 'Scholarships', query: 'category=Scholarship' },
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

      {/* Category Pills */}
      <section className="py-10 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-gray-500 text-sm font-semibold uppercase tracking-wider mb-6">
            What kind of work are you looking for?
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            {categoryPills.map((pill) => {
              const Icon = pill.icon;
              return (
                <Link
                  key={pill.label}
                  to={`/opportunities?${pill.query}`}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-full text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  {pill.label}
                </Link>
              );
            })}
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

      {/* Newsletter Section */}
      <Newsletter />
    </div>
  );
}

// Refurbished