import { Link } from 'react-router-dom';
import { ExternalLink, Calendar, User, Tag } from 'lucide-react';
import type { ProfileProject } from '../services/profilesAPI';
import ReactMarkdown from 'react-markdown';

export function ProjectCard({ project }: { project: ProfileProject }) {
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

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full group overflow-hidden">
      {project.bannerImage && (
        <div className="w-full h-40 mb-4 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
          <img 
            src={project.bannerImage} 
            alt={project.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3">
             <span className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider shadow-sm ${getStatusColor(project.status)}`}>
               {project.status}
             </span>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {!project.bannerImage && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
            )}
            {project.category && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium flex items-center gap-1">
                <Tag className="w-3 h-3" /> {project.category}
              </span>
            )}
          </div>
          <Link to={`/projects/${project._id || ''}`} className="hover:text-blue-600 transition-colors">
            <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2">{project.title}</h3>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
        {project.authorName && (
          <div className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer" title="View Profile">
            <User className="w-3.5 h-3.5" />
            <Link to={`/profile/${encodeURIComponent(project.userEmail || '')}`} className="font-medium">{project.authorName}</Link>
          </div>
        )}
        {(project.startDate || project.endDate) && (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {project.startDate ? new Date(project.startDate).getFullYear() : ''} 
              {project.endDate ? ` - ${new Date(project.endDate).getFullYear()}` : ' - Present'}
            </span>
          </div>
        )}
      </div>

      <div className="text-sm text-gray-600 mb-4 line-clamp-3 prose prose-sm max-w-none flex-grow">
        <ReactMarkdown>{project.description}</ReactMarkdown>
      </div>

      {project.tags && project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.tags.slice(0, 4).map((tag, i) => (
            <span key={i} className="text-[10px] px-2 py-1 bg-gray-50 border border-gray-100 text-gray-600 rounded-md">
              #{tag}
            </span>
          ))}
          {project.tags.length > 4 && (
            <span className="text-[10px] px-2 py-1 text-gray-500">
              +{project.tags.length - 4} more
            </span>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 mt-auto pt-4 border-t border-gray-50">
        <Link 
          to={`/projects/${project._id || ''}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          View Details
        </Link>
        <div className="flex flex-wrap gap-2">
          {project.resourceLinks?.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] text-gray-600 bg-white border border-gray-200 hover:border-blue-300 hover:text-blue-600 px-3 py-1.5 rounded-lg font-medium transition-colors shadow-sm"
            >
              <ExternalLink className="w-3 h-3" />
              {link.label}
            </a>
          ))}
          {project.proofLink && !project.resourceLinks?.length && (
            <a
              href={project.proofLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] text-gray-600 bg-white border border-gray-200 hover:border-blue-300 hover:text-blue-600 px-3 py-1.5 rounded-lg font-medium transition-colors shadow-sm"
            >
              <ExternalLink className="w-3 h-3" />
              Link
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
