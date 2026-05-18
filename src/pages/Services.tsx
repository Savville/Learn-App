import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const services = [
  {
    title: "Academic Research Assistant",
    description: "Literature reviews, citation management, and research synthesis.",
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    title: "Lab & Survey Data Collection",
    description: "Administering field surveys and lab data entry for researchers.",
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    title: "Lecture Formatting & LMS",
    description: "Converting rough notes into standard slides and course modules.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    title: "Transcription & Minutes",
    description: "Transcribing and formatting university & committee meeting records.",
    image: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    title: "Web & App Development",
    description: "Building responsive landing pages and software tools for startups.",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    title: "UI/UX & Prototyping",
    description: "Designing intuitive interfaces and mockups for digital products.",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    title: "Construction Site Assistant",
    description: "Shadowing supervisors, material tracking, and daily site reporting.",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    title: "CAD & Architectural Drafting",
    description: "Digitizing floor plans and modifying sketches for engineers.",
    image: "https://images.unsplash.com/photo-1503708928676-1cb796a0891e?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    title: "Community Mobilization",
    description: "Organizing grassroots health, education, and NGO campaigns.",
    image: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    title: "Swahili Localization",
    description: "Translating community health and legal documents for NGOs.",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead2708?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    title: "Case Law Research",
    description: "Analyzing precedents and drafting briefs for local law firms.",
    image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    title: "M-PESA Reconciliation",
    description: "Automated matching and reconciliation of bulk SACCO payments.",
    image: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    title: "Property Scouting",
    description: "On-ground mapping and validation for off-market real estate.",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    title: "PDF Brochure Design",
    description: "Creating branded portfolios for high-value property listings.",
    image: "https://images.unsplash.com/photo-1626178793926-22b28830aa30?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    title: "Agri-Input Price Tracker",
    description: "Weekly ground-level price intelligence across agricultural zones.",
    image: "https://images.unsplash.com/photo-1592982537447-6f29e160e1d2?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    title: "Google My Business",
    description: "Local SEO, mapping, and digital setups for small physical shops.",
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    title: "Social Media Prep",
    description: "Monthly marketing posts and scheduled social content calendars.",
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    title: "E-commerce Uploads",
    description: "Writing bulk product descriptions and maintaining online stores.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    title: "Podcast Prod & Notes",
    description: "Audio leveling, cut-editing, and formatting SEO show notes.",
    image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    title: "AI Audio Data Collection",
    description: "Native dictation mapping and audio samples for machine learning.",
    image: "https://images.unsplash.com/photo-1589903308904-1010c2294adc?auto=format&fit=crop&w=150&h=150&q=80"
  }
];

export default function Services() {
  return (
    <div className="min-h-screen bg-gray-50/50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">
            Freelance Force Catalogue
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Real companies. Real problems. Real student solutions. Explore specific ways our network can accelerate your operational needs across Kenya.
          </p>
        </div>
        
        {/* Responsive Grid: 1 col on mobile, 2 on small tablets, 3 on md, 4 on lg */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {services.map((service, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-200 transition-all duration-300 flex items-center group cursor-pointer"
            >
              <img 
                src={service.image} 
                alt={service.title}
                className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover border border-gray-100 shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-sm"
              />
              <div className="ml-4 overflow-hidden">
                <h3 className="font-bold text-gray-900 text-sm md:text-base mb-1 leading-tight group-hover:text-blue-700 transition-colors">
                  {service.title}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <div className="inline-flex rounded-full shadow-lg hover:shadow-xl transition-all">
            <Link 
              to="/post-with-us" 
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Post a Gig Now
              <ChevronRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
