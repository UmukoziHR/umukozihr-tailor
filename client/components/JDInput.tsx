import { useState } from "react";
import toast from 'react-hot-toast';
import { Plus, Building, MapPin, FileText } from "lucide-react";

export default function JDInput({onAdd}:{onAdd:(j:any)=>void}) {
  const [j, setJ] = useState<any>({ id:"", region:"US", company:"", title:"", jd_text:"" });

  function add(){
    if(!j.company || !j.title || !j.jd_text) { 
      toast.error('📝 Please fill in Company, Title, and Job Description');
      return; 
    }
    
    if (j.jd_text.length < 50) {
      toast.error('📄 Job description seems too short. Please provide more details for better AI tailoring.');
      return;
    }
    
    onAdd(j);
    setJ({ id:"", region:j.region, company:"", title:"", jd_text:"" });
    
    toast.success(
      `✓ Added "${j.title}" at ${j.company}`,
      {
        icon: '🎯',
        duration: 3000,
      }
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-brand-black mb-2">Job ID (Optional)</label>
          <input 
            className="input-field" 
            placeholder="SWE-2024-001" 
            value={j.id} 
            onChange={e=>setJ({...j, id:e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-black mb-2">Region</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select 
              className="input-field pl-11 appearance-none" 
              value={j.region} 
              onChange={e=>setJ({...j, region:e.target.value})}
            >
              <option value="US">🇺🇸 United States</option>
              <option value="EU">🇪🇺 Europe</option>
              <option value="GL">🌍 Global</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-black mb-2">Company</label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              className="input-field pl-11" 
              placeholder="Google" 
              value={j.company} 
              onChange={e=>setJ({...j, company:e.target.value})}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-black mb-2">Job Title</label>
          <input 
            className="input-field" 
            placeholder="Senior Software Engineer" 
            value={j.title} 
            onChange={e=>setJ({...j, title:e.target.value})}
          />
        </div>
      </div>
      
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-5 h-5 text-brand-orange" />
          <label className="block text-sm font-medium text-brand-black">Job Description</label>
        </div>
        <textarea 
          className="input-field resize-none" 
          placeholder="Paste the complete job description here. Include requirements, responsibilities, and qualifications for better AI tailoring." 
          rows={8} 
          value={j.jd_text} 
          onChange={e=>setJ({...j, jd_text:e.target.value})}
        />
      </div>
      
      <div className="flex justify-end">
        <button 
          onClick={add} 
          className="btn-primary flex items-center gap-2 px-8 py-3"
        >
          <Plus className="w-5 h-5" />
          Add Job
        </button>
      </div>
    </div>
  );
}
