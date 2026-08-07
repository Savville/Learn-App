import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Calendar, User, Tag, Clock } from 'lucide-react';
import { getProjectById, ProfileProject } from '../services/profilesAPI';
import ReactMarkdown from 'react-markdown';

export function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProfileProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await getProjectById(id);
        setProject(data);
      } catch (err: any) {
        console.error('Failed to fetch project details:', err);
        setError('Unable to load project details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Showcase': return 'bg-purple-100 text-purple-700';
      case 'Active': return 'bg-blue-100 text-blue-700';
      case 'Recruiting': return 'bg-orange-100 text-orange-700';
      case 'Seeking Funding': return 'bg-green-100 text-green-700';
      case 'Archived': return 'bg-gray-100 text-gray-700';
      default: return 'bg-blue-50 text-blue-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-[72px] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-slate-50 pt-[72px] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Project Not Found</h2>
          <p className="text-slate-600 mb-6">{error || 'This project may have been removed or does not exist.'}</p>
          <Link to="/projects" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-[72px]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/projects" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          {project.bannerImage && (
            <div className="w-full h-64 md:h-80 bg-gray-100 relative">
              <img 
                src={project.bannerImage} 
                alt={project.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 md:p-10">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold uppercase tracking-wider ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
              {project.category && (
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm font-medium flex items-center gap-1.5">
                  <Tag className="w-4 h-4" /> {project.category}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
              {project.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 mb-8 pb-8 border-b border-slate-100">
              {project.authorName && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    {project.authorName.charAt(0)}
                  </div>
                  <span className="font-medium text-slate-800">{project.authorName}</span>
                </div>
              )}
              {project.createdAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-blue-600 hover:prose-a:text-blue-700 prose-img:rounded-xl mb-10">
              <ReactMarkdown>{project.description}</ReactMarkdown>
            </div>

            {(project.proofLink || (project.resourceLinks && project.resourceLinks.length > 0)) && (
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-slate-400" /> Project Resources
                </h3>
                <div className="flex flex-col gap-3">
                  {project.proofLink && (
                    <a
                      href={project.proofLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-between w-full md:w-auto px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all group"
                    >
                      <span className="font-medium text-slate-700 group-hover:text-blue-600">Primary Project Link</span>
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                    </a>
                  )}
                  {project.resourceLinks?.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-between w-full md:w-auto px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all group"
                    >
                      <span className="font-medium text-slate-700 group-hover:text-blue-600">{link.label}</span>
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
