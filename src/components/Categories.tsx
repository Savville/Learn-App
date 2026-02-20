import { FileText, Briefcase, DollarSign, Calendar, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Category {
  name: string;
  id: string;
  icon: any;
  bgColor: string;
  textColor: string;
  description: string;
}

const categories: Category[] = [
  {
    name: 'Call for Papers',
    id: 'CallForPapers',
    icon: FileText,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-900',
    description: 'Academic conferences & journals'
  },
  {
    name: 'Internships',
    id: 'Internship',
    icon: Briefcase,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-900',
    description: 'Work experience programs'
  },
  {
    name: 'Grants',
    id: 'Grant',
    icon: DollarSign,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-900',
    description: 'Research & project funding'
  },
  {
    name: 'Conferences',
    id: 'Conference',
    icon: Calendar,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-900',
    description: 'Networking events & workshops'
  },
  {
    name: 'Scholarships',
    id: 'Scholarship',
    icon: GraduationCap,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-900',
    description: 'Education & living support'
  },
];

export function Categories() {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/opportunities?type=${categoryId}`);
  };

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-blue-900 mb-4 uppercase tracking-tight">
            Explore by Category
          </h2>
          <p className="text-gray-700 max-w-2xl mx-auto font-medium">
            Find opportunities tailored for Kenya university students
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`${category.bgColor} p-6 hover:shadow-sm transition-all duration-300 group cursor-pointer border border-blue-200 hover:border-blue-900 hover:bg-blue-100 rounded-sm m-0.5`}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <Icon className={`${category.textColor} w-8 h-8`} />
                  <h3 className={`${category.textColor} font-bold text-base uppercase tracking-wider`}>
                    {category.name}
                  </h3>
                  <p className="text-gray-700 text-xs font-medium leading-snug">
                    {category.description}
                  </p>
                  <span className={`${category.textColor} text-xs font-bold uppercase tracking-widest group-hover:gap-2 transition-all inline-flex items-center gap-1`}>
                    Browse →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
