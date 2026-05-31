import { Newsletter } from '../components/Newsletter';
import { useSEO } from '../hooks/useSEO';

export function Subscribe() {
  useSEO({
    title: 'Subscribe',
    description: 'Subscribe to Opportunities Kenya for curated scholarships, jobs, and gigs delivered directly to your inbox.',
    url: '/subscribe'
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <Newsletter />
    </div>
  );
}
