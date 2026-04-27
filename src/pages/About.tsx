import { Target, Eye, Heart, Users } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

export function About() {
  useSEO({
    title: 'About Us',
    description: 'Learn about Opportunities Kenya — empowering African students and young professionals by connecting them with life-changing opportunities worldwide.',
    url: '/about'
  });
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
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
        <section className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 mb-16">
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

        {/* Call to Action */}
        <section className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
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
