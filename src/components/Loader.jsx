// src/components/Loader.jsx

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div style={{ display:"flex", gap:14, marginBottom:16 }}>
        <div className="skel" style={{ width:52, height:52, borderRadius:10, flexShrink:0 }} />
        <div style={{ flex:1 }}>
          <div className="skel" style={{ height:16, width:"60%", marginBottom:8, borderRadius:6 }} />
          <div className="skel" style={{ height:13, width:"40%", marginBottom:6, borderRadius:6 }} />
          <div className="skel" style={{ height:12, width:"30%", borderRadius:6 }} />
        </div>
        <div className="skel" style={{ width:70, height:24, borderRadius:99 }} />
      </div>
      <div className="skel" style={{ height:12, width:"90%", marginBottom:7, borderRadius:6 }} />
      <div className="skel" style={{ height:12, width:"75%", marginBottom:16, borderRadius:6 }} />
      <div style={{ display:"flex", gap:7, marginBottom:16 }}>
        {[55,65,48].map((w,i)=>( <div key={i} className="skel" style={{ width:w, height:24, borderRadius:99 }} /> ))}
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", paddingTop:12, borderTop:"1px solid var(--border)" }}>
        <div className="skel" style={{ height:12, width:"25%", borderRadius:6 }} />
        <div className="skel" style={{ height:30, width:80, borderRadius:99 }} />
      </div>
    </div>
  );
}

function Loader() {
  return (
    <div className="loader">
      <div className="skeleton">
        {[1,2,3,4,5].map(n => <SkeletonCard key={n} />)}
      </div>
    </div>
  );
}

export default Loader;