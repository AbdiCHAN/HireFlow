
import { useState } from "react";
import { apiUrl, authHeaders, readApiError } from "../services/api";
import { useAuth } from "../context/AuthContext";
function Section({ title, sub, children }) {
  return (
    <div style={{ padding:"60px 0 100px" }}>
      <div className="container">
        <div style={{ textAlign:"center", marginBottom:48, animation:"fadeUp .5s ease both" }}>
          <h1 style={{ fontFamily:"var(--font-display)", fontSize:44, fontWeight:800, letterSpacing:0, color:"var(--text)", marginBottom:12 }}>{title}</h1>
          {sub && <p style={{ fontSize:16, color:"var(--text2)", maxWidth:500, margin:"0 auto", lineHeight:1.7 }}>{sub}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}


export function AboutPage({ onNavigate }) {
  return (
    <Section
      title="About HireFlow"
      sub="We connect Africa's best tech talent with world-class companies. Our platform is built on speed, trust, and transparency."
    >
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:20 }}>
        {[
          { icon:"🚀", title:"Our Mission",    text:"To eliminate friction in hiring by making job discovery, application, and communication instant and delightful for both candidates and companies." },
          { icon:"🌍", title:"Our Reach",      text:"HireFlow operates across 40+ countries with over 600,000 company profiles and tens of thousands of active job listings updated daily." },
          { icon:"🤝", title:"Our Values",     text:"We believe in radical transparency, continuous improvement, and building technology that genuinely serves people rather than just extracting value from them." },
          { icon:"📊", title:"Our Track Record", text:"Over 12,000 successful placements in the last 12 months. Average time-to-hire reduced by 40% compared to traditional job boards." },
        ].map(f => (
          <div key={f.title} className="why__feature" style={{ textAlign:"left", animation:"fadeUp .4s ease both" }}>
            <div className="why__feature-icon">{f.icon}</div>
            <h3 className="why__feature-title">{f.title}</h3>
            <p className="why__feature-text">{f.text}</p>
          </div>
        ))}
      </div>
      <div style={{ textAlign:"center", marginTop:40 }}>
        <button className="btn btn--primary" onClick={() => onNavigate("jobs")}>Browse Jobs</button>
      </div>
    </Section>
  );
}


export function CategoriesPage({ onNavigate, onCategorySelect }) {
  const cats = [
    { value:"digital",     label:"Digital",      icon:"💻", count:120, desc:"Digital marketing, social media, content creation and SEO roles." },
    { value:"engineering", label:"Engineering",   icon:"⚙️", count:340, desc:"Software, hardware, DevOps, QA and full-stack engineering positions." },
    { value:"management",  label:"Management",    icon:"📋", count:95,  desc:"Product, project, and people management leadership roles." },
    { value:"finance",     label:"Finance",       icon:"💰", count:78,  desc:"Accounting, financial analysis, banking and investment roles." },
    { value:"marketing",   label:"Marketing",     icon:"📣", count:130, desc:"Brand, growth, performance marketing and communications." },
    { value:"design",      label:"Design",        icon:"🎨", count:88,  desc:"UX/UI, graphic design, branding and creative direction." },
    { value:"development", label:"Development",   icon:"🛠️", count:210, desc:"Web, mobile, backend and frontend development specialisations." },
  ];
  return (
    <Section title="Browse by Category" sub="Find roles tailored to your expertise and passion area.">
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:16 }}>
        {cats.map((c, i) => (
          <div
            key={c.value}
            className="why__feature"
            style={{ cursor:"pointer", animation:`fadeUp .4s ${i*0.05}s ease both` }}
            onClick={() => { onCategorySelect(c.value); onNavigate("jobs"); }}
          >
            <div className="why__feature-icon">{c.icon}</div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
              <h3 className="why__feature-title" style={{ marginBottom:0 }}>{c.label}</h3>
              <span style={{ fontSize:12, color:"var(--violet-lt)", fontWeight:700, background:"var(--violet-bg)", padding:"2px 10px", borderRadius:99 }}>{c.count}+</span>
            </div>
            <p className="why__feature-text">{c.desc}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}


export function CandidatesPage({ onNavigate }) {
  return (
    <Section title="For Candidates" sub="Everything you need to land your next role — faster.">
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:20 }}>
        {[
          { icon:"📝", title:"Build Your Profile",   text:"Create a professional profile that highlights your skills, experience, and portfolio. Recruiters search HireFlow daily." },
          { icon:"🔔", title:"Job Alerts",           text:"Set up instant notifications for roles that match your exact preferences. Never miss a perfect opportunity." },
          { icon:"📄", title:"CV Builder",           text:"Use our guided CV builder to create a polished, ATS-friendly resume that stands out from the crowd." },
          { icon:"💬", title:"Direct Messaging",     text:"Message hiring managers and recruiters directly within HireFlow. No middlemen, no delays." },
          { icon:"📈", title:"Salary Insights",      text:"Access real salary data from 600,000+ companies to negotiate confidently and know your market worth." },
          { icon:"🎓", title:"Skills Assessment",    text:"Complete short skill assessments to verify your expertise and earn badges that boost your profile credibility." },
        ].map((f,i) => (
          <div key={f.title} className="why__feature" style={{ animation:`fadeUp .4s ${i*0.05}s ease both` }}>
            <div className="why__feature-icon">{f.icon}</div>
            <h3 className="why__feature-title">{f.title}</h3>
            <p className="why__feature-text">{f.text}</p>
          </div>
        ))}
      </div>
      <div style={{ textAlign:"center", marginTop:40, display:"flex", gap:12, justifyContent:"center" }}>
        <button className="btn btn--primary" onClick={() => onNavigate("cv-post")}>Upload Your CV</button>
        <button className="btn btn--outline" onClick={() => onNavigate("jobs")}>Find Jobs</button>
      </div>
    </Section>
  );
}


export function NewsPage() {
  const articles = [
    { tag:"Hiring Trends",  date:"May 10, 2025", title:"Remote work is here to stay: 68% of tech roles now offer full flexibility", excerpt:"New data from HireFlow's Q2 report reveals remote and hybrid positions dominate the tech job market, with salaries matching or exceeding on-site equivalents." },
    { tag:"Career Advice",  date:"May 7, 2025",  title:"How to negotiate your salary in 2025: the complete guide",               excerpt:"Salary negotiation has never been more data-driven. We break down exactly how to use market data, competing offers, and timing to maximise your package." },
    { tag:"Africa Tech",    date:"May 4, 2025",  title:"Nairobi, Lagos, and Cairo lead Africa's tech hiring surge in 2025",       excerpt:"Three African cities are now competing globally for top tech talent, with developer salaries rising 22% YoY and international companies opening regional hubs." },
    { tag:"Product Update", date:"Apr 30, 2025", title:"HireFlow launches AI-powered job matching and salary estimator",          excerpt:"Our new matching engine analyses 40+ signals from your profile to surface the most relevant roles — and now tells you what you should be earning." },
    { tag:"Career Advice",  date:"Apr 25, 2025", title:"The 5 skills every developer needs to stand out in 2025",               excerpt:"Beyond code: communication, system design, product thinking, data literacy, and cloud-native development are the differentiators hiring managers look for." },
    { tag:"Company News",   date:"Apr 20, 2025", title:"HireFlow reaches 100,000 successful placements milestone",               excerpt:"We're proud to announce that 100,000 candidates have found their next role through HireFlow. Here's what we learned along the way." },
  ];
  return (
    <Section title="Latest News" sub="Industry insights, career advice, and HireFlow updates.">
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:20 }}>
        {articles.map((a,i) => (
          <div key={i} className="job-card" style={{ animationDelay:`${i*0.06}s`, cursor:"default" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12, alignItems:"center" }}>
              <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:99, background:"var(--violet-bg)", color:"var(--violet-lt)", border:"1px solid rgba(124,92,252,.2)" }}>{a.tag}</span>
              <span style={{ fontSize:12, color:"var(--text3)" }}>{a.date}</span>
            </div>
            <h3 style={{ fontFamily:"var(--font-display)", fontSize:16, fontWeight:700, color:"var(--text)", lineHeight:1.3, marginBottom:10 }}>{a.title}</h3>
            <p style={{ fontSize:13.5, color:"var(--text2)", lineHeight:1.65 }}>{a.excerpt}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}


export function PostJobPage({ onNavigate }) {
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    jobType: "Full-time",
    description: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (!isAuthenticated) {
        setMessage("Please login first to post a job");
        setLoading(false);
        return;
      }

      const res = await fetch(apiUrl("/api/jobs"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setMessage("✓ Job posted!");
        setFormData({ title: "", company: "", location: "", salary: "", jobType: "Full-time", description: "" });
      } else {
        setMessage(`✗ ${await readApiError(res, "Failed to post job")}`);
      }
    } catch (err) {
      setMessage("✗ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Section title="Post a Job" sub="Log in first, then publish openings from this page.">
        <div style={{ maxWidth:520, margin:"0 auto", background:"var(--surface)", border:"1px solid var(--border2)", borderRadius:"var(--r-xl)", padding:"36px", textAlign:"center" }}>
          <p style={{ color:"var(--text2)", marginBottom:20 }}>Create an employer or admin account to post roles into the HireFlow jobs API.</p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <button className="btn btn--primary" onClick={() => onNavigate("login")}>Login</button>
            <button className="btn btn--outline" onClick={() => onNavigate("signup")}>Sign up</button>
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section title="Post a Job" sub="Reach thousands of qualified candidates across Africa and beyond.">
      <div style={{ maxWidth:560, margin:"0 auto", background:"var(--surface)", border:"1px solid var(--border2)", borderRadius:"var(--r-xl)", padding:"36px", animation:"fadeUp .4s ease both" }}>
        {message && (
          <div style={{ marginBottom:16, padding:12, background: message.includes("✓") ? "#10b98120" : "#ef444420", color: message.includes("✓") ? "#10b981" : "#ef4444", borderRadius:"var(--r-md)", fontSize:14 }}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:18 }}>
            <label style={{ fontSize:13, fontWeight:600, color:"var(--text2)", display:"block", marginBottom:7 }}>Job Title</label>
            <input type="text" name="title" placeholder="e.g. Senior Frontend Developer" value={formData.title} onChange={handleChange}
              style={{ width:"100%", height:44, padding:"0 14px", background:"var(--surface2)", border:"1.5px solid var(--border2)", borderRadius:"var(--r-md)", color:"var(--text)", fontSize:14, outline:"none", transition:"border-color .2s" }}
              onFocus={e => e.target.style.borderColor="var(--violet)"} onBlur={e => e.target.style.borderColor="var(--border2)"} />
          </div>
          <div style={{ marginBottom:18 }}>
            <label style={{ fontSize:13, fontWeight:600, color:"var(--text2)", display:"block", marginBottom:7 }}>Company Name</label>
            <input type="text" name="company" placeholder="e.g. Acme Corp" value={formData.company} onChange={handleChange}
              style={{ width:"100%", height:44, padding:"0 14px", background:"var(--surface2)", border:"1.5px solid var(--border2)", borderRadius:"var(--r-md)", color:"var(--text)", fontSize:14, outline:"none", transition:"border-color .2s" }}
              onFocus={e => e.target.style.borderColor="var(--violet)"} onBlur={e => e.target.style.borderColor="var(--border2)"} />
          </div>
          <div style={{ marginBottom:18 }}>
            <label style={{ fontSize:13, fontWeight:600, color:"var(--text2)", display:"block", marginBottom:7 }}>Location</label>
            <input type="text" name="location" placeholder="e.g. Nairobi, Kenya or Remote" value={formData.location} onChange={handleChange}
              style={{ width:"100%", height:44, padding:"0 14px", background:"var(--surface2)", border:"1.5px solid var(--border2)", borderRadius:"var(--r-md)", color:"var(--text)", fontSize:14, outline:"none", transition:"border-color .2s" }}
              onFocus={e => e.target.style.borderColor="var(--violet)"} onBlur={e => e.target.style.borderColor="var(--border2)"} />
          </div>
          <div style={{ marginBottom:18 }}>
            <label style={{ fontSize:13, fontWeight:600, color:"var(--text2)", display:"block", marginBottom:7 }}>Salary Range</label>
            <input type="text" name="salary" placeholder="e.g. KES 80k–120k" value={formData.salary} onChange={handleChange}
              style={{ width:"100%", height:44, padding:"0 14px", background:"var(--surface2)", border:"1.5px solid var(--border2)", borderRadius:"var(--r-md)", color:"var(--text)", fontSize:14, outline:"none", transition:"border-color .2s" }}
              onFocus={e => e.target.style.borderColor="var(--violet)"} onBlur={e => e.target.style.borderColor="var(--border2)"} />
          </div>
          <div style={{ marginBottom:18 }}>
            <label style={{ fontSize:13, fontWeight:600, color:"var(--text2)", display:"block", marginBottom:7 }}>Job Type</label>
            <select name="jobType" value={formData.jobType} onChange={handleChange}
              style={{ width:"100%", height:44, padding:"0 14px", background:"var(--surface2)", border:"1.5px solid var(--border2)", borderRadius:"var(--r-md)", color:"var(--text)", fontSize:14, outline:"none" }}>
              <option>Full-time</option><option>Contract</option><option>Part-time</option><option>Remote</option><option>Freelance</option>
            </select>
          </div>
          <div style={{ marginBottom:24 }}>
            <label style={{ fontSize:13, fontWeight:600, color:"var(--text2)", display:"block", marginBottom:7 }}>Description</label>
            <textarea name="description" placeholder="Describe the role, responsibilities, and requirements…" value={formData.description} onChange={handleChange} rows={5}
              style={{ width:"100%", padding:14, background:"var(--surface2)", border:"1.5px solid var(--border2)", borderRadius:"var(--r-md)", color:"var(--text)", fontSize:14, outline:"none", resize:"vertical", fontFamily:"var(--font-body)", lineHeight:1.65, transition:"border-color .2s" }}
              onFocus={e => e.target.style.borderColor="var(--violet)"} onBlur={e => e.target.style.borderColor="var(--border2)"} />
          </div>
          <button type="submit" className="btn btn--primary" style={{ width:"100%", justifyContent:"center", height:48, fontSize:15, cursor:"pointer" }}>
            {loading ? "Posting..." : "Post Job →"}
          </button>
        </form>
      </div>
    </Section>
  );
}


export function CVPostPage({ onNavigate }) {
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    linkedinUrl: "",
    currentRole: "",
    expectedSalary: "",
    file: null as File | null
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage("✗ File too large (max 5MB)");
        return;
      }
      setFormData(prev => ({ ...prev, file }));
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (!isAuthenticated) {
        setMessage("Please login first to upload CV");
        setLoading(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("fullName", formData.fullName);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("linkedinUrl", formData.linkedinUrl);
      formDataToSend.append("currentRole", formData.currentRole);
      formDataToSend.append("expectedSalary", formData.expectedSalary);
      if (formData.file) {
        formDataToSend.append("cvFile", formData.file);
      }

      const response = await fetch(apiUrl("/api/cv"), {
        method: "POST",
        headers: {
          ...authHeaders(),
        },
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error(await readApiError(response, "Failed to upload CV"));
      }

      setMessage("✓ CV uploaded successfully!");
      setFormData({ fullName: "", email: "", phone: "", linkedinUrl: "", currentRole: "", expectedSalary: "", file: null });

      setTimeout(() => setMessage(""), 3000);
    } catch (error: any) {
      setMessage("✗ Error uploading CV: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Section title="Upload Your CV" sub="Log in first so your CV is saved to your account.">
        <div style={{ maxWidth:520, margin:"0 auto", background:"var(--surface)", border:"1px solid var(--border2)", borderRadius:"var(--r-xl)", padding:"36px", textAlign:"center" }}>
          <p style={{ color:"var(--text2)", marginBottom:20 }}>After login, this page uploads your CV into the backend API for applications and admin review.</p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <button className="btn btn--primary" onClick={() => onNavigate("login")}>Login</button>
            <button className="btn btn--outline" onClick={() => onNavigate("signup")}>Sign up</button>
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section title="Upload Your CV" sub="Let companies find you. Upload your CV and get discovered by top recruiters.">
      <div style={{ maxWidth:520, margin:"0 auto", background:"var(--surface)", border:"1px solid var(--border2)", borderRadius:"var(--r-xl)", padding:"36px", animation:"fadeUp .4s ease both" }}>
        {message && (
          <div style={{ marginBottom:16, padding:12, background: message.includes("✓") ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: message.includes("✓") ? "#10b981" : "#ef4444", borderRadius:"var(--r-md)", fontSize:14 }}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {[
            { name: "fullName", label:"Full Name",       placeholder:"Athanas Mochama" },
            { name: "email", label:"Email Address",   placeholder:"you@example.com" },
            { name: "phone", label:"Phone Number",    placeholder:"+254 7XX XXX XXX" },
            { name: "linkedinUrl", label:"LinkedIn / Portfolio", placeholder:"https://linkedin.com/in/you" },
            { name: "currentRole", label:"Current Role",    placeholder:"e.g. Junior Developer" },
            { name: "expectedSalary", label:"Expected Salary", placeholder:"e.g. KES 80,000" },
          ].map(f => (
            <div key={f.name} style={{ marginBottom:16 }}>
              <label style={{ fontSize:13, fontWeight:600, color:"var(--text2)", display:"block", marginBottom:7 }}>{f.label}</label>
              <input
                type={f.name === "email" ? "email" : f.name === "linkedinUrl" ? "url" : "text"}
                name={f.name} placeholder={f.placeholder} value={formData[f.name as keyof typeof formData] as string}
                onChange={handleChange}
                style={{ width:"100%", height:44, padding:"0 14px", background:"var(--surface2)", border:"1.5px solid var(--border2)", borderRadius:"var(--r-md)", color:"var(--text)", fontSize:14, outline:"none", transition:"border-color .2s" }}
                onFocus={e => e.target.style.borderColor="var(--violet)"}
                onBlur={e => e.target.style.borderColor="var(--border2)"}
              />
            </div>
          ))}
          <div style={{ marginBottom:24, border:"2px dashed var(--border2)", borderRadius:"var(--r-lg)", padding:28, textAlign:"center" }}>
            <div style={{ fontSize:32, marginBottom:10 }}>📎</div>
            <p style={{ fontSize:14, color:"var(--text2)", marginBottom:6 }}>
              {formData.file ? `✓ ${formData.file.name}` : "Drag & drop your CV here"}
            </p>
            <p style={{ fontSize:12, color:"var(--text3)" }}>PDF, DOC or DOCX — max 5MB</p>
            <label className="btn btn--outline" style={{ marginTop:14, cursor:"pointer", display:"inline-block" }}>
              Choose File
              <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} style={{ display:"none" }} />
            </label>
          </div>
          <button type="submit" disabled={loading || !formData.file} className="btn btn--primary" style={{ width:"100%", justifyContent:"center", height:48, fontSize:15, opacity: loading || !formData.file ? 0.6 : 1 }}>
            {loading ? "Uploading..." : "Upload CV →"}
          </button>
        </form>
      </div>
    </Section>
  );
}
