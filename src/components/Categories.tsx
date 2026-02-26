import { FileText, Briefcase, DollarSign, Calendar, GraduationCap, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const categories = [
  {
    name: 'Call for Papers',
    id: 'CallForPapers',
    icon: FileText,
    color: 'from-blue-500 to-blue-600',
    description: 'Academic conferences & journals',
  },
  {
    name: 'Internships',
    id: 'Internship',
    icon: Briefcase,
    color: 'from-green-500 to-green-600',
    description: 'Work experience programs',
  },
  {
    name: 'Grants',
    id: 'Grant',
    icon: DollarSign,
    color: 'from-orange-500 to-orange-600',
    description: 'Research & project funding',
  },
  {
    name: 'Conferences',
    id: 'Conference',
    icon: Calendar,
    color: 'from-purple-500 to-purple-600',
    description: 'Networking events & workshops',
  },
  {
    name: 'Scholarships',
    id: 'Scholarship',
    icon: GraduationCap,
    color: 'from-pink-500 to-pink-600',
    description: 'Education & living support',
  },
  {
    name: 'Others',
    id: 'Others',
    icon: LayoutGrid,
    color: 'from-indigo-500 to-indigo-600',
    description: 'More opportunities',
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className="group p-6 bg-white rounded-2xl border-2 border-gray-100 hover:border-transparent hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-gray-900 text-center font-bold text-sm">
                  {category.name}
                </h3>
                <p className="text-gray-500 text-center text-xs mt-1">
                  {category.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
