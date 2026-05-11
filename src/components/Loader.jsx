// src/components/Loader.jsx

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
        <div style={{display:"flex",gap:13,alignItems:"center"}}>
          <div className="skel" style={{width:52,height:52,borderRadius:10,flexShrink:0}}/>
          <div>
            <div className="skel" style={{width:70,height:11,borderRadius:4,marginBottom:7}}/>
            <div className="skel" style={{width:140,height:16,borderRadius:4}}/>
          </div>
        </div>
        <div className="skel" style={{width:62,height:32,borderRadius:99}}/>
      </div>
      <div className="skel" style={{height:12,width:"92%",borderRadius:4,marginBottom:6}}/>
      <div className="skel" style={{height:12,width:"76%",borderRadius:4,marginBottom:6}}/>
      <div className="skel" style={{height:12,width:"60%",borderRadius:4,marginBottom:14}}/>
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {[52,62,44].map((w,i)=>(<div key={i} className="skel" style={{width:w,height:22,borderRadius:99}}/>))}
      </div>
      <div style={{height:1,background:"var(--border)",marginBottom:13}}/>
      <div style={{display:"flex",gap:14}}>
        <div className="skel" style={{height:12,width:"22%",borderRadius:4}}/>
        <div className="skel" style={{height:12,width:"18%",borderRadius:4}}/>
        <div className="skel" style={{height:22,width:60,borderRadius:99,marginLeft:"auto"}}/>
      </div>
    </div>
  );
}

function Loader() {
  return (
    <div className="loader-grid">
      {[1,2,3,4,5,6].map(n=><SkeletonCard key={n}/>)}
    </div>
  );
}

export default Loader;