import { Target, Eye, Heart, Users } from 'lucide-react';

export function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="mb-6">About Opportunities Kenya</h1>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Empowering students and young professionals by connecting them with life-changing opportunities from around the world.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Who We Are */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-gray-900 mb-6">Who We Are</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Opportunities Kenya is a youth-focused initiative dedicated to connecting students, graduates and practitioners with valuable learning opportunities, grants, internships, fellowships, and career-building programs from around the world.
              </p>
              <p>
                We believe that access to the right opportunity can transform a young person's future, and our mission is to make that access simple, clear, and free.
              </p>
              <p>
                At Opportunities Kenya, we curate and publish high-quality opportunities daily, ensuring that learners never miss out on programs that can advance their knowledge, skills, or career path. Our goal is to incentivize learning by bringing life-changing opportunities closer to those who need them most.
              </p>
              <p>
                Whether you're looking for a scholarship, a competitive fellowship, a professional internship, or a grant to support your ideas, Opportunities Kenya serves as your trusted gateway. We simplify the process by researching, verifying, and linking you directly to official application pages, so you can focus on learning, growing, and achieving your goals.
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
              To empower students and young professionals across Africa and beyond by giving them equal access to global opportunities.
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
                <span>To highlight meaningful opportunities that promote learning and career growth</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>To bridge the information gap between youth and global organizations</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>To motivate and inspire continuous learning through accessible opportunities</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>To create a platform that supports personal development and professional readiness</span>
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
                Many young people miss out on life-changing opportunities simply because they never hear about them. L-earn Organisation exists to solve that problem—by making sure you stay informed, inspired, and connected to the opportunities that can shape your future.
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
                    <p className="text-gray-900 mb-1">Curate Quality Opportunities</p>
                    <p className="text-gray-600">We research and verify opportunities from trusted organizations worldwide, ensuring you only see legitimate programs.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    2
                  </span>
                  <div>
                    <p className="text-gray-900 mb-1">Daily Updates</p>
                    <p className="text-gray-600">Our team updates the platform daily with new internships, fellowships, jobs, scholarships, grants, and events.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    3
                  </span>
                  <div>
                    <p className="text-gray-900 mb-1">Simplify Access</p>
                    <p className="text-gray-600">We provide clear information and direct links to official application pages, making it easy for you to apply.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    4
                  </span>
                  <div>
                    <p className="text-gray-900 mb-1">Free for Everyone</p>
                    <p className="text-gray-600">All our services are completely free. We believe opportunities should be accessible to everyone, regardless of their financial situation.</p>
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
