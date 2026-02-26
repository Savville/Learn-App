import { Hero } from '../components/Hero';
import { OpportunityCard } from '../components/OpportunityCard';
import { Newsletter } from '../components/Newsletter';
import { opportunities } from '../data/opportunities';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Home() {
  const featuredOpportunities = opportunities.filter(opp => opp.featured).slice(0, 3);
  const latestOpportunities = opportunities.slice(0, 6);

  return (
    <div>
      <Hero />
      
      {/* Featured Opportunities */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-gray-900 mb-4">Featured Opportunities</h2>
            <p className="text-gray-600">Hand-picked opportunities you don't want to miss</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredOpportunities.map(opportunity => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        </div>
      </section>

      {/* Latest Opportunities */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-gray-900 mb-2">Latest Opportunities</h2>
              <p className="text-gray-600">Recently added opportunities</p>
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
            {latestOpportunities.map(opportunity => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        </div>
      </section>

      <Newsletter />
    </div>
  );
}
