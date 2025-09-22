import toast from 'react-hot-toast';
import { FileText, Download, ExternalLink, Calendar, MapPin } from "lucide-react";

export default function JobCard({data}:{data:any}) {
  return (
    <div className="card p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-brand-orange/10 rounded-lg">
              <FileText className="w-5 h-5 text-brand-orange" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-brand-black truncate">
                {data.job_id}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    {data.region}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs text-gray-500">
                    {new Date(data.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Resume and cover letter successfully generated
          </p>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          {data.resume_pdf && (
            <a 
              href={data.resume_pdf} 
              target="_blank" 
              rel="noreferrer" 
              className="btn-primary flex items-center gap-2 text-sm px-4 py-2"
              onClick={() => toast.success('📄 Resume PDF opened in new tab')}
            >
              <Download className="w-4 h-4" />
              Resume PDF
            </a>
          )}
          {data.cover_letter_pdf && (
            <a 
              href={data.cover_letter_pdf} 
              target="_blank" 
              rel="noreferrer" 
              className="btn-primary flex items-center gap-2 text-sm px-4 py-2"
              onClick={() => toast.success('📝 Cover letter PDF opened in new tab')}
            >
              <Download className="w-4 h-4" />
              Cover PDF
            </a>
          )}
          <div className="flex items-center gap-1">
            <a 
              href={data.resume_tex} 
              target="_blank" 
              rel="noreferrer" 
              className="btn-ghost flex items-center gap-1 text-xs px-3 py-1"
            >
              <ExternalLink className="w-3 h-3" />
              Resume .tex
            </a>
            <a 
              href={data.cover_letter_tex} 
              target="_blank" 
              rel="noreferrer" 
              className="btn-ghost flex items-center gap-1 text-xs px-3 py-1"
            >
              <ExternalLink className="w-3 h-3" />
              Cover .tex
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
  