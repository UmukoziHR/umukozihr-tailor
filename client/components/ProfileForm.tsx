import { useState, useEffect } from "react";
import { profile as profileApi } from "../lib/api";
import toast from 'react-hot-toast';
import { Plus, Save, Mail, Phone, MapPin, Link, GraduationCap, Briefcase, Code } from "lucide-react";

export default function ProfileForm({onSave}:{onSave:(p:any)=>void}) {
  const [p, setP] = useState<any>({
    name:"", 
    contacts:{ email:"", phone:"", location:"", links:[] as string[] },
    summary:"",
    skills:[] as string[],
    experience:[] as any[],
    education:[] as any[],
    projects:[] as any[],
  });

  const [linkText, setLinkText] = useState("");

  useEffect(() => {
    // Load saved profile from localStorage
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setP(parsed);
        onSave(parsed);
      } catch (error) {
        console.error('Error parsing saved profile:', error);
      }
    }
  }, [onSave]);

  function addSkill(s:string){
    if(!s.trim()) return;
    
    // Check if the input contains commas (pasted list)
    if(s.includes(',')) {
      const skills = s.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
      const updated = {...p, skills:[...p.skills, ...skills]};
      setP(updated);
      localStorage.setItem('userProfile', JSON.stringify(updated));
      onSave(updated);
    } else {
      const updated = {...p, skills:[...p.skills, s.trim()]};
      setP(updated);
      localStorage.setItem('userProfile', JSON.stringify(updated));
      onSave(updated);
    }
  }
  function addLink(){
    const v = linkText.trim();
    if(!v) return;
    setP((prev:any)=>({...prev, contacts:{...prev.contacts, links:[...prev.contacts.links, v]}}));
    setLinkText("");
  }
  function addRole(){
    setP((prev:any)=>({...prev, experience:[...prev.experience, {title:"", company:"", start:"", end:"", bullets:[] as string[] }]}));
  }
  function updateRole(i:number, field:string, value:any){
    setP((prev:any)=>{
      const arr = [...prev.experience];
      arr[i] = {...arr[i], [field]: value};
      return {...prev, experience: arr};
    });
  }
  function addBullet(i:number, b:string){
    if(!b.trim()) return;
    setP((prev:any)=>{
      const arr = [...prev.experience];
      arr[i] = {...arr[i], bullets:[...arr[i].bullets, b.trim()]};
      return {...prev, experience: arr};
    });
  }
  function addEducation(){
    setP((prev:any)=>({...prev, education:[...prev.education, {school:"", degree:"", period:""}]}));
  }
  function updateEducation(i:number, field:string, value:any){
    setP((prev:any)=>{
      const arr = [...prev.education];
      arr[i] = {...arr[i], [field]: value};
      return {...prev, education: arr};
    });
  }
  function addProject(){
    setP((prev:any)=>({...prev, projects:[...prev.projects, {name:"", stack:[] as string[], bullets:[] as string[]}]}));
  }
  function updateProject(i:number, field:string, value:any){
    setP((prev:any)=>{
      const arr = [...prev.projects];
      arr[i] = {...arr[i], [field]: value};
      return {...prev, projects: arr};
    });
  }
  function addProjectStack(i:number, s:string){
    if(!s.trim()) return;
    
    // Check if the input contains commas (pasted list)
    if(s.includes(',')) {
      const stackItems = s.split(',').map(item => item.trim()).filter(item => item.length > 0);
      setP((prev:any)=>{
        const arr = [...prev.projects];
        arr[i] = {...arr[i], stack:[...arr[i].stack, ...stackItems]};
        return {...prev, projects: arr};
      });
    } else {
      setP((prev:any)=>{
        const arr = [...prev.projects];
        arr[i] = {...arr[i], stack:[...arr[i].stack, s.trim()]};
        return {...prev, projects: arr};
      });
    }
  }
  function addProjectBullet(i:number, b:string){
    if(!b.trim()) return;
    setP((prev:any)=>{
      const arr = [...prev.projects];
      arr[i] = {...arr[i], bullets:[...arr[i].bullets, b.trim()]};
      return {...prev, projects: arr};
    });
  }

  async function save(){
    if (!p.name.trim()) {
      toast.error('📝 Please enter your full name');
      return;
    }
    
    if (!p.contacts.email.trim()) {
      toast.error('📧 Please enter your email address');
      return;
    }
    
    const saveToast = toast.loading('💾 Saving your profile...');
    
    try {
      await profileApi.save(p);
      onSave(p);
      localStorage.setItem('userProfile', JSON.stringify(p));
      toast.success(
        `✓ Profile saved successfully!`,
        { 
          id: saveToast,
          icon: '💾',
        }
      );
    } catch (error: any) {
      toast.error(
        `❌ Failed to save profile: ${error?.response?.data?.detail || 'Unknown error'}`,
        { id: saveToast }
      );
    }
  }

  return (
    <div className="space-y-8">
      {/* Basic Info */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-brand-black mb-2">Full Name</label>
            <input 
              className="input-field text-lg" 
              placeholder="John Doe" 
              value={p.name} 
              onChange={e=>setP({...p, name:e.target.value})}
            />
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-brand-black mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                className="input-field pl-11" 
                placeholder="john@example.com" 
                value={p.contacts.email} 
                onChange={e=>setP({...p, contacts:{...p.contacts, email:e.target.value}})}
              />
            </div>
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-brand-black mb-2">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                className="input-field pl-11" 
                placeholder="+1 (555) 123-4567" 
                value={p.contacts.phone} 
                onChange={e=>setP({...p, contacts:{...p.contacts, phone:e.target.value}})}
              />
            </div>
          </div>
          <div className="relative md:col-span-2">
            <label className="block text-sm font-medium text-brand-black mb-2">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                className="input-field pl-11" 
                placeholder="San Francisco, CA" 
                value={p.contacts.location} 
                onChange={e=>setP({...p, contacts:{...p.contacts, location:e.target.value}})}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-black mb-2">Professional Summary</label>
          <textarea 
            className="input-field resize-none" 
            placeholder="Experienced software engineer with 5+ years building scalable web applications..." 
            value={p.summary} 
            onChange={e=>setP({...p, summary:e.target.value})} 
            rows={4}
          />
        </div>
      </div>

      {/* Skills */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-brand-orange" />
          <h3 className="text-lg font-semibold text-brand-black">Skills</h3>
        </div>
        <SkillAdder onAdd={addSkill}/>
        {p.skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {p.skills.map((s:string,i:number)=>(
              <span key={i} className="px-3 py-1 bg-brand-orange/10 text-brand-orange border border-brand-orange/20 rounded-full text-sm font-medium">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="pt-6 border-t border-brand-gray-cool">
        <button onClick={save} className="btn-primary w-full py-4 text-lg font-semibold flex items-center justify-center gap-3">
          <Save className="w-6 h-6" />
          Save Profile
        </button>
      </div>
    </div>
  );
}

function SkillAdder({onAdd}:{onAdd:(s:string)=>void}){
  const [val,setVal]=useState("");
  return (
    <div className="flex gap-3">
      <input 
        className="input-field flex-1" 
        placeholder="Add a skill or paste comma-separated list (e.g., React, Node.js, Python)" 
        value={val} 
        onChange={e=>setVal(e.target.value)} 
      />
      <button onClick={()=>{ onAdd(val); setVal(""); }} className="btn-secondary">
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
}

function BulletAdder({onAdd}:{onAdd:(b:string)=>void}){
  const [val,setVal]=useState("");
  return (
    <div style={{display:"flex", gap:6, marginTop:6}}>
      <input placeholder="Add an impact bullet" value={val} onChange={e=>setVal(e.target.value)} style={{flex:1}}/>
      <button onClick={()=>{ onAdd(val); setVal(""); }}>Add bullet</button>
    </div>
  );
}

function ProjectStackAdder({onAdd}:{onAdd:(s:string)=>void}){
  const [val,setVal]=useState("");
  return (
    <div style={{display:"flex", gap:6}}>
      <input placeholder="Add tech stack (or paste comma-separated list)" value={val} onChange={e=>setVal(e.target.value)} style={{flex:1}}/>
      <button onClick={()=>{ onAdd(val); setVal(""); }}>Add</button>
    </div>
  );
}

function ProjectBulletAdder({onAdd}:{onAdd:(b:string)=>void}){
  const [val,setVal]=useState("");
  return (
    <div style={{display:"flex", gap:6, marginTop:6}}>
      <input placeholder="Add project bullet" value={val} onChange={e=>setVal(e.target.value)} style={{flex:1}}/>
      <button onClick={()=>{ onAdd(val); setVal(""); }}>Add bullet</button>
    </div>
  );
}
