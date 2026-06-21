import { useState, useEffect, useMemo, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { storage } from "./storage.js";
import { App as CapacitorApp } from "@capacitor/app";

/* ═══ HELPERS ═══ */
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const todayStr = () => new Date().toISOString().slice(0, 10);
const numFmt = (n) => Math.abs(Math.round(n||0)).toString().replace(/\B(?=(\d{3})+(?!\d))/g," ") + " So'";
const dateFmt = (d) => { if(!d)return""; const[y,m,day]=d.split("-"); return`${day}.${m}.${y}`; };
const getBal = (cid,txs) => txs.filter(t=>t.contactId===cid).reduce((s,t)=>t.type==="zaym"?s+t.amount:s-t.amount,0);
const PAL = ["#6366F1","#F59E0B","#10B981","#8B5CF6","#3B82F6","#EC4899","#14B8A6","#F97316","#EF4444","#06B6D4"];
const randColor = () => PAL[Math.floor(Math.random()*PAL.length)];
const applyOp = (a,b,op) => { const r = op==="+"?a+b:op==="-"?a-b:op==="×"?a*b:(b!==0?a/b:0); return Math.round(r*1e6)/1e6; };

const Avt = ({contact,size}) => contact.photo
  ? <img src={contact.photo} style={{width:size,height:size,borderRadius:"50%",objectFit:"cover",display:"block",flexShrink:0}}/>
  : <div style={{width:size,height:size,borderRadius:"50%",background:contact.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.38,fontWeight:800,color:"#fff",flexShrink:0}}>{(contact.name||"?")[0].toUpperCase()}</div>;

const LabelChip = ({label,style}) => label
  ? <div style={{display:"inline-flex",alignItems:"center",gap:3,background:"#1A1A3A",color:"#818CF8",borderRadius:5,padding:"2px 8px",fontSize:11,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",...style}}>🏷 {label}</div>
  : null;

const IS = {width:"100%",padding:"12px 14px",background:"#0B0B10",border:"1px solid #222230",borderRadius:10,color:"#F1F5F9",fontSize:16,outline:"none",boxSizing:"border-box",marginTop:6,display:"block"};

/* ═══ CONTACT MODAL ═══ */
function ContactModal({contact,onSave,onClose}) {
  const [name,   setName]   = useState(contact?.name||"");
  const [surname,setSurname]= useState(contact?.surname||"");
  const [phone,  setPhone]  = useState(contact?.phone||"");
  const [label,  setLabel]  = useState(contact?.label||"");
  const [color,  setColor]  = useState(contact?.color||randColor());
  const [photo,  setPhoto]  = useState(contact?.photo||null);
  const [hover,  setHover]  = useState(false);
  const fRef = useRef();
  const isEdit=!!contact?.id, ok=name.trim().length>0;

  const handleFile = e => {
    const file=e.target.files[0]; if(!file) return;
    const r=new FileReader();
    r.onload=ev=>{const img=new Image();img.onload=()=>{const MAX=320;let w=img.width,h=img.height;if(w>MAX||h>MAX){const s=Math.min(MAX/w,MAX/h);w=Math.round(w*s);h=Math.round(h*s);}const c=document.createElement("canvas");c.width=w;c.height=h;c.getContext("2d").drawImage(img,0,0,w,h);setPhoto(c.toDataURL("image/jpeg",.78));};img.src=ev.target.result;};
    r.readAsDataURL(file);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.84)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:300}}>
      <div style={{background:"#16161F",borderRadius:"22px 22px 0 0",padding:"24px 20px 48px",width:"100%",maxWidth:480,boxSizing:"border-box",maxHeight:"92vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h3 style={{margin:0,fontSize:18,fontWeight:700,color:"#F1F5F9"}}>{isEdit?"Kontaktni tahrirlash":"Yangi kontakt"}</h3>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#6B7280",fontSize:26,cursor:"pointer",lineHeight:1,padding:"0 4px"}}>×</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:16}}>
          <div style={{position:"relative"}}>
            <div onClick={()=>fRef.current.click()} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
              style={{width:90,height:90,borderRadius:"50%",overflow:"hidden",cursor:"pointer",position:"relative",background:photo?"#000":color,border:photo?"3px solid #222230":`3px solid ${color}`,boxSizing:"border-box"}}>
              {photo?<img src={photo} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                :<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:32,fontWeight:800,color:"#fff",lineHeight:1}}>{name?name[0].toUpperCase():"👤"}</span></div>}
              <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",opacity:hover?1:0,transition:"opacity 0.18s"}}><span style={{fontSize:26}}>📷</span></div>
            </div>
            {photo&&<button onClick={e=>{e.stopPropagation();setPhoto(null);fRef.current.value="";}} style={{position:"absolute",top:1,right:1,background:"#EF4444",border:"2px solid #16161F",borderRadius:"50%",width:24,height:24,color:"#fff",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1,fontWeight:700}}>✕</button>}
          </div>
          <input ref={fRef} type="file" accept="image/*" onChange={handleFile} style={{display:"none"}}/>
          <div style={{fontSize:11,color:"#4B5563",marginTop:8}}>Rasmni bosib o'rnating</div>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:11,color:photo?"#3A3A4A":"#4B5563",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Avatar rangi {photo?"· rasm o'rnatilgan":""}</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",opacity:photo?0.35:1,pointerEvents:photo?"none":"auto"}}>
            {PAL.map(c=><div key={c} onClick={()=>setColor(c)} style={{width:32,height:32,borderRadius:"50%",background:c,cursor:"pointer",boxSizing:"border-box",border:color===c?"3px solid #fff":"3px solid transparent",transition:"border 0.12s"}}/>)}
          </div>
        </div>
        <label style={{fontSize:12,color:"#6B7280",textTransform:"uppercase",letterSpacing:1}}>Ism *</label>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Ismi" style={IS}/>
        <label style={{fontSize:12,color:"#6B7280",textTransform:"uppercase",letterSpacing:1,marginTop:14,display:"block"}}>Familiya</label>
        <input value={surname} onChange={e=>setSurname(e.target.value)} placeholder="Familiyasi" style={IS}/>
        <label style={{fontSize:12,color:"#6B7280",textTransform:"uppercase",letterSpacing:1,marginTop:14,display:"block"}}>Belgi</label>
        <input value={label} onChange={e=>setLabel(e.target.value)} placeholder="qo'shni, tog'a, ishchi, do'st..." style={IS}/>
        <label style={{fontSize:12,color:"#6B7280",textTransform:"uppercase",letterSpacing:1,marginTop:14,display:"block"}}>Telefon</label>
        <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+998 XX XXX XX XX" type="tel" style={IS}/>
        <button onClick={()=>{if(ok)onSave({...contact,name:name.trim(),surname:surname.trim(),phone:phone.trim(),label:label.trim(),color,photo});}}
          style={{width:"100%",padding:"15px",background:ok?"#6366F1":"#1E1E2A",color:"#fff",border:"none",borderRadius:12,fontWeight:700,cursor:ok?"pointer":"default",fontSize:16,marginTop:20}}>
          {isEdit?"Saqlash":"Qo'shish"}
        </button>
      </div>
    </div>
  );
}

/* ═══ TRANSACTION MODAL (from detail view) ═══ */
function TransactionModal({initial,contact,onSave,onClose}) {
  const [type,  setType]  = useState(initial?.type||"qarz");
  const [amtRaw,setAmtRaw]= useState("");
  const [note,  setNote]  = useState("");
  const [date,  setDate]  = useState(todayStr());
  const amt=parseInt(amtRaw)||0, ok=amt>0;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.84)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:300}}>
      <div style={{background:"#16161F",borderRadius:"22px 22px 0 0",padding:"24px 20px 48px",width:"100%",maxWidth:480,boxSizing:"border-box"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {contact&&<Avt contact={contact} size={36}/>}
            <div><h3 style={{margin:0,fontSize:16,fontWeight:700,color:"#F1F5F9"}}>{contact?.name} {contact?.surname}</h3>{contact?.label&&<LabelChip label={contact.label} style={{marginTop:3,fontSize:10}}/>}</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#6B7280",fontSize:26,cursor:"pointer",lineHeight:1,padding:"0 4px"}}>×</button>
        </div>
        <div style={{display:"flex",background:"#0B0B10",borderRadius:10,padding:4,marginBottom:20}}>
          {[["qarz","− Qarz olish","#EF4444"],["zaym","+ Zaym berish","#22C55E"]].map(([t,l,c])=>(
            <button key={t} onClick={()=>setType(t)} style={{flex:1,padding:"11px",background:type===t?c:"transparent",color:type===t?"#fff":"#6B7280",border:"none",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:14,transition:"all 0.15s"}}>{l}</button>
          ))}
        </div>
        <label style={{fontSize:12,color:"#6B7280",textTransform:"uppercase",letterSpacing:1}}>Miqdor (So') *</label>
        <input value={amtRaw?amtRaw.replace(/\B(?=(\d{3})+(?!\d))/g," "):""} onChange={e=>setAmtRaw(e.target.value.replace(/\D/g,"").slice(0,12))} placeholder="0" inputMode="numeric"
          style={{...IS,fontSize:24,fontWeight:700,color:type==="zaym"?"#4ADE80":"#F87171"}}/>
        {amtRaw&&<div style={{fontSize:12,color:"#4B5563",marginTop:4,paddingLeft:2}}>{numFmt(amt)}</div>}
        <label style={{fontSize:12,color:"#6B7280",textTransform:"uppercase",letterSpacing:1,marginTop:14,display:"block"}}>Sana *</label>
        <input value={date} onChange={e=>setDate(e.target.value)} type="date" style={{...IS,colorScheme:"dark"}}/>
        <label style={{fontSize:12,color:"#6B7280",textTransform:"uppercase",letterSpacing:1,marginTop:14,display:"block"}}>Izoh</label>
        <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Ixtiyoriy izoh..." style={IS}/>
        <button onClick={()=>{if(ok)onSave({contactId:initial.contactId,type,amount:amt,note,date});}}
          style={{width:"100%",padding:"15px",background:ok?(type==="zaym"?"#22C55E":"#EF4444"):"#1E1E2A",color:"#fff",border:"none",borderRadius:12,fontWeight:700,cursor:ok?"pointer":"default",fontSize:16,marginTop:20}}>
          {type==="zaym"?"Zaym berish":"Qarz olish"}
        </button>
      </div>
    </div>
  );
}

/* ═══ QUICK ADD MODAL (from Qarzlar "+" – 2 steps) ═══ */
function QuickAddModal({cwb, onSave, onClose}) {
  const [step,   setStep]  = useState(1);
  const [search, setSrch]  = useState("");
  const [selC,   setSelC]  = useState(null);
  const [type,   setType]  = useState("qarz");
  const [amtRaw, setAmtRaw]= useState("");
  const [note,   setNote]  = useState("");
  const [date,   setDate]  = useState(todayStr());
  const amt=parseInt(amtRaw)||0, txOk=amt>0;

  const matched = cwb.filter(c=>{
    if(!search) return true;
    const q=search.toLowerCase();
    return c.name.toLowerCase().includes(q)||c.surname.toLowerCase().includes(q)||c.phone.includes(q)||(c.label||"").toLowerCase().includes(q);
  });

  const pick = (c) => { setSelC(c); setStep(2); };

  const pickNew = () => {
    if(!search.trim()) return;
    setSelC({id:"__new__",name:search.trim(),surname:"",phone:"",label:"",photo:null,color:randColor(),createdAt:todayStr()});
    setStep(2);
  };

  const handleSave = () => {
    if(!txOk||!selC) return;
    onSave({isNew:selC.id==="__new__",contact:selC,tx:{type,amount:amt,note,date}});
  };

  const OVR = {position:"fixed",inset:0,background:"rgba(0,0,0,0.84)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:300};
  const SHT = {background:"#16161F",borderRadius:"22px 22px 0 0",padding:"0",width:"100%",maxWidth:480,boxSizing:"border-box",maxHeight:"88vh",display:"flex",flexDirection:"column"};

  if(step===1) return (
    <div style={OVR}>
      <div style={SHT}>
        <div style={{padding:"20px 20px 0",flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <h3 style={{margin:0,fontSize:18,fontWeight:700,color:"#F1F5F9"}}>Kontakt tanlang</h3>
            <button onClick={onClose} style={{background:"none",border:"none",color:"#6B7280",fontSize:26,cursor:"pointer",lineHeight:1,padding:"0 4px"}}>×</button>
          </div>
          <div style={{position:"relative",marginBottom:4}}>
            <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",color:"#6B7280",fontSize:15,pointerEvents:"none"}}>🔍</span>
            <input value={search} onChange={e=>setSrch(e.target.value)} placeholder="Ism, belgi yoki telefon..." autoFocus
              style={{...IS,paddingLeft:38,marginTop:0}}/>
            {search&&<button onClick={()=>setSrch("")} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#6B7280",cursor:"pointer",fontSize:20,lineHeight:1}}>×</button>}
          </div>
          <div style={{fontSize:11,color:"#3A3A4A",padding:"4px 2px 10px"}}>{cwb.length} ta kontakt</div>
        </div>

        <div style={{overflowY:"auto",flex:1,padding:"0 20px 24px"}}>
          {search&&matched.length===0&&(
            <button onClick={pickNew} style={{width:"100%",padding:"14px",background:"#1B2D1B",border:"1px dashed #14532D",borderRadius:12,color:"#4ADE80",cursor:"pointer",fontSize:14,fontWeight:700,marginBottom:12,textAlign:"left"}}>
              ✚ &ldquo;{search}&rdquo; — yangi kontakt yaratib qarz/zaym yozish
            </button>
          )}
          {matched.map(c=>(
            <div key={c.id} onClick={()=>pick(c)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:"1px solid #1A1A28",cursor:"pointer"}}>
              <Avt contact={c} size={46}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:600,fontSize:15,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name} {c.surname}</div>
                {c.label&&<LabelChip label={c.label} style={{marginTop:3}}/>}
                <div style={{color:"#4B5563",fontSize:12,marginTop:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.phone}</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                {c.balance!==0
                  ?<div style={{fontSize:13,fontWeight:700,color:c.balance>0?"#4ADE80":"#F87171"}}>{c.balance>0?"+":"-"}{numFmt(c.balance)}</div>
                  :<div style={{fontSize:11,color:"#374151"}}>Hisob-kitob yo'q</div>}
              </div>
            </div>
          ))}
          {search&&matched.length>0&&(
            <button onClick={pickNew} style={{width:"100%",padding:"12px",background:"#0B0B10",border:"1px dashed #222230",borderRadius:10,color:"#818CF8",cursor:"pointer",fontSize:13,fontWeight:600,marginTop:12,textAlign:"left"}}>
              ✚ &ldquo;{search}&rdquo; nomli yangi kontakt yaratish
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div style={OVR}>
      <div style={{...SHT,maxHeight:"auto",padding:"0"}}>
        <div style={{padding:"20px 20px 24px",boxSizing:"border-box"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
            <button onClick={()=>setStep(1)} style={{background:"none",border:"none",color:"#F1F5F9",fontSize:22,cursor:"pointer",padding:"4px 6px 4px 0",lineHeight:1}}>←</button>
            {selC&&<Avt contact={selC} size={38}/>}
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:700,fontSize:16,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{selC?.name} {selC?.surname}</div>
              {selC?.id==="__new__"
                ?<div style={{fontSize:11,color:"#F59E0B",marginTop:2}}>✨ Yangi kontakt sifatida saqlanadi</div>
                :selC?.label&&<LabelChip label={selC.label} style={{marginTop:2,fontSize:10}}/>}
            </div>
            <button onClick={onClose} style={{background:"none",border:"none",color:"#6B7280",fontSize:26,cursor:"pointer",lineHeight:1,padding:"0 4px"}}>×</button>
          </div>

          <div style={{display:"flex",background:"#0B0B10",borderRadius:10,padding:4,marginBottom:20}}>
            {[["qarz","− Qarz olish","#EF4444"],["zaym","+ Zaym berish","#22C55E"]].map(([t,l,c])=>(
              <button key={t} onClick={()=>setType(t)} style={{flex:1,padding:"11px",background:type===t?c:"transparent",color:type===t?"#fff":"#6B7280",border:"none",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:14,transition:"all 0.15s"}}>{l}</button>
            ))}
          </div>

          <label style={{fontSize:12,color:"#6B7280",textTransform:"uppercase",letterSpacing:1}}>Miqdor (So') *</label>
          <input value={amtRaw?amtRaw.replace(/\B(?=(\d{3})+(?!\d))/g," "):""} onChange={e=>setAmtRaw(e.target.value.replace(/\D/g,"").slice(0,12))} placeholder="0" inputMode="numeric"
            style={{...IS,fontSize:24,fontWeight:700,color:type==="zaym"?"#4ADE80":"#F87171"}}/>
          {amtRaw&&<div style={{fontSize:12,color:"#4B5563",marginTop:4,paddingLeft:2}}>{numFmt(amt)}</div>}

          <label style={{fontSize:12,color:"#6B7280",textTransform:"uppercase",letterSpacing:1,marginTop:14,display:"block"}}>Sana *</label>
          <input value={date} onChange={e=>setDate(e.target.value)} type="date" style={{...IS,colorScheme:"dark"}}/>

          <label style={{fontSize:12,color:"#6B7280",textTransform:"uppercase",letterSpacing:1,marginTop:14,display:"block"}}>Izoh</label>
          <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Ixtiyoriy izoh..." style={IS}/>

          <button onClick={handleSave} style={{width:"100%",padding:"15px",background:txOk?(type==="zaym"?"#22C55E":"#EF4444"):"#1E1E2A",color:"#fff",border:"none",borderRadius:12,fontWeight:700,cursor:txOk?"pointer":"default",fontSize:16,marginTop:20}}>
            {type==="zaym"?"Zaym berish":"Qarz olish"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══ REMINDER MODAL ═══ */
function ReminderModal({contacts,onSave,onClose}) {
  const [title,setTitle]=useState(""), [cid,setCid]=useState(""), [date,setDate]=useState(todayStr());
  const ok=title.trim().length>0;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.84)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:300}}>
      <div style={{background:"#16161F",borderRadius:"22px 22px 0 0",padding:"24px 20px 48px",width:"100%",maxWidth:480,boxSizing:"border-box"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h3 style={{margin:0,fontSize:18,fontWeight:700,color:"#F1F5F9"}}>Eslatma qo'shish</h3>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#6B7280",fontSize:26,cursor:"pointer",lineHeight:1,padding:"0 4px"}}>×</button>
        </div>
        <label style={{fontSize:12,color:"#6B7280",textTransform:"uppercase",letterSpacing:1}}>Sarlavha *</label>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Eslatma matni..." style={IS}/>
        <label style={{fontSize:12,color:"#6B7280",textTransform:"uppercase",letterSpacing:1,marginTop:14,display:"block"}}>Kontakt (ixtiyoriy)</label>
        <select value={cid} onChange={e=>setCid(e.target.value)} style={{...IS,background:"#0B0B10"}}>
          <option value="">Kontakt tanlang...</option>
          {contacts.map(c=><option key={c.id} value={c.id}>{c.name} {c.surname}{c.label?" · "+c.label:""}</option>)}
        </select>
        <label style={{fontSize:12,color:"#6B7280",textTransform:"uppercase",letterSpacing:1,marginTop:14,display:"block"}}>Sana *</label>
        <input value={date} onChange={e=>setDate(e.target.value)} type="date" style={{...IS,colorScheme:"dark"}}/>
        <button onClick={()=>{if(ok)onSave({title:title.trim(),contactId:cid,date});}} style={{width:"100%",padding:"15px",background:ok?"#6366F1":"#1E1E2A",color:"#fff",border:"none",borderRadius:12,fontWeight:700,cursor:ok?"pointer":"default",fontSize:16,marginTop:20}}>Saqlash</button>
      </div>
    </div>
  );
}

/* ═══════════════════ MAIN APP ═══════════════════ */
export default function QarzDaftari() {
  const [contacts,  setContacts]  = useState([]);
  const [txs,       setTxs]       = useState([]);
  const [rems,      setRems]      = useState([]);
  const [loaded,    setLoaded]    = useState(false);
  const [tab,       setTab]       = useState("qarzlar");
  const [qSearch,   setQSearch]   = useState("");
  const [sortBy,    setSortBy]    = useState("date");
  const [filter,    setFilter]    = useState("all");
  const [kSearch,   setKSearch]   = useState("");
  const [kSortBy,   setKSortBy]   = useState("name");
  const [selId,     setSelId]     = useState(null);
  const [editContact,setEditContact]=useState(null);
  const [addTx,     setAddTx]     = useState(null);
  const [addQuickTx,setAddQuickTx]= useState(false);
  const [showRem,   setShowRem]   = useState(false);
  const [period,    setPeriod]    = useState("monthly");
  const [cDisp,setCDisp]=useState("0"),[cPrev,setCPrev]=useState(null),[cOp,setCOp]=useState(null),[cFresh,setCFresh]=useState(true),[cExpr,setCExpr]=useState("");
  const [cLastOp,setCLastOp]=useState(null),[cLastVal,setCLastVal]=useState(null);

  /* storage */
  useEffect(()=>{
    (async()=>{
      try{const r=await storage.get("c");if(r?.value)setContacts(JSON.parse(r.value));}catch(e){}
      try{const r=await storage.get("t");if(r?.value)setTxs(JSON.parse(r.value));}catch(e){}
      try{const r=await storage.get("r");if(r?.value)setRems(JSON.parse(r.value));}catch(e){}
      setLoaded(true);
    })();
  },[]);
  useEffect(()=>{if(loaded)storage.set("c",JSON.stringify(contacts)).catch(()=>{});},[contacts,loaded]);
  useEffect(()=>{if(loaded)storage.set("t",JSON.stringify(txs)).catch(()=>{});},[txs,loaded]);
  useEffect(()=>{if(loaded)storage.set("r",JSON.stringify(rems)).catch(()=>{});},[rems,loaded]);

  /* Android orqaga tugmasi: ilovani yopish o'rniga ichkarida orqaga qaytaradi */
  useEffect(()=>{
    const listenerPromise = CapacitorApp.addListener("backButton", () => {
      if (editContact !== null) { setEditContact(null); return; }
      if (addTx)      { setAddTx(null); return; }
      if (addQuickTx) { setAddQuickTx(false); return; }
      if (showRem)    { setShowRem(false); return; }
      if (selId)      { setSelId(null); return; }
      if (tab !== "qarzlar") { setTab("qarzlar"); return; }
      CapacitorApp.exitApp();
    });
    return () => { listenerPromise.then(h => h.remove()).catch(()=>{}); };
  }, [editContact, addTx, addQuickTx, showRem, selId, tab]);

  /* computed */
  const cwb = useMemo(()=>contacts.map(c=>{
    const ct=txs.filter(t=>t.contactId===c.id);
    const bal=ct.reduce((s,t)=>t.type==="zaym"?s+t.amount:s-t.amount,0);
    const lastDate=ct.length?ct.reduce((b,t)=>t.date>b?t.date:b,"0"):c.createdAt;
    return{...c,balance:bal,lastDate};
  }),[contacts,txs]);

  const qFiltered = useMemo(()=>{
    let list=cwb.filter(c=>c.balance!==0);
    if(qSearch){const q=qSearch.toLowerCase();list=list.filter(c=>c.name.toLowerCase().includes(q)||c.surname.toLowerCase().includes(q)||c.phone.includes(q)||(c.label||"").toLowerCase().includes(q));}
    if(filter==="menga") list=list.filter(c=>c.balance>0);
    if(filter==="ularga")list=list.filter(c=>c.balance<0);
    return[...list].sort((a,b)=>sortBy==="name"?(a.name+" "+a.surname).localeCompare(b.name+" "+b.surname):sortBy==="amount"?Math.abs(b.balance)-Math.abs(a.balance):b.lastDate.localeCompare(a.lastDate));
  },[cwb,qSearch,filter,sortBy]);

  const kFiltered = useMemo(()=>{
    let list=cwb;
    if(kSearch){const q=kSearch.toLowerCase();list=list.filter(c=>c.name.toLowerCase().includes(q)||c.surname.toLowerCase().includes(q)||c.phone.includes(q)||(c.label||"").toLowerCase().includes(q));}
    return[...list].sort((a,b)=>kSortBy==="name"?(a.name+" "+a.surname).localeCompare(b.name+" "+b.surname):kSortBy==="amount"?Math.abs(b.balance)-Math.abs(a.balance):b.lastDate.localeCompare(a.lastDate));
  },[cwb,kSearch,kSortBy]);

  const totalZ=useMemo(()=>txs.filter(t=>t.type==="zaym").reduce((s,t)=>s+t.amount,0),[txs]);
  const totalQ=useMemo(()=>txs.filter(t=>t.type==="qarz").reduce((s,t)=>s+t.amount,0),[txs]);
  const pendRem=useMemo(()=>rems.filter(r=>!r.done).length,[rems]);

  const statsData=useMemo(()=>{
    const MN=["Yan","Fev","Mar","Apr","May","Iyn","Iyl","Avg","Sen","Okt","Noy","Dek"];
    const now=new Date(todayStr());const bkts=[];
    if(period==="daily"){for(let i=6;i>=0;i--){const d=new Date(now);d.setDate(d.getDate()-i);const k=d.toISOString().split("T")[0];bkts.push({label:String(d.getDate()).padStart(2,"0")+"."+String(d.getMonth()+1).padStart(2,"0"),match:t=>t.date===k});}}
    else if(period==="weekly"){for(let i=7;i>=0;i--){const d=new Date(now);d.setDate(d.getDate()-i*7);const s=new Date(d);s.setDate(d.getDate()-((d.getDay()+6)%7));const e=new Date(s);e.setDate(s.getDate()+6);const sS=s.toISOString().split("T")[0],eS=e.toISOString().split("T")[0];bkts.push({label:String(s.getDate())+"-"+String(e.getDate()),match:t=>t.date>=sS&&t.date<=eS});}}
    else if(period==="monthly"){for(let i=5;i>=0;i--){const d=new Date(now);d.setMonth(d.getMonth()-i);const k=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");bkts.push({label:MN[d.getMonth()],match:t=>t.date.startsWith(k)});}}
    else{for(let i=2;i>=0;i--){const y=String(now.getFullYear()-i);bkts.push({label:y,match:t=>t.date.startsWith(y)});}}
    return bkts.map(b=>{const bt=txs.filter(b.match);return{name:b.label,qarz:Math.round(bt.filter(t=>t.type==="qarz").reduce((s,t)=>s+t.amount,0)/100000)/10,zaym:Math.round(bt.filter(t=>t.type==="zaym").reduce((s,t)=>s+t.amount,0)/100000)/10};});
  },[txs,period]);

  /* actions */
  const saveContact = d=>{if(d.id)setContacts(cs=>cs.map(c=>c.id===d.id?{...c,...d}:c));else setContacts(cs=>[...cs,{...d,id:uid(),createdAt:todayStr()}]);setEditContact(null);};
  const delContact  = id=>{setContacts(cs=>cs.filter(c=>c.id!==id));setTxs(ts=>ts.filter(t=>t.contactId!==id));setSelId(null);};
  const addTxFn     = d=>{setTxs(ts=>[...ts,{...d,id:uid()}]);setAddTx(null);};
  const delTx       = id=>setTxs(ts=>ts.filter(t=>t.id!==id));
  const saveRem     = d=>{setRems(rs=>[...rs,{...d,id:uid(),done:false}]);setShowRem(false);};
  const toggleRem   = id=>setRems(rs=>rs.map(r=>r.id===id?{...r,done:!r.done}:r));
  const delRem      = id=>setRems(rs=>rs.filter(r=>r.id!==id));

  const handleQuickSave = ({isNew,contact,tx})=>{
    let cid;
    if(isNew){const nid=uid();setContacts(cs=>[...cs,{...contact,id:nid}]);cid=nid;}
    else{cid=contact.id;}
    setTxs(ts=>[...ts,{...tx,contactId:cid,id:uid()}]);
    setAddQuickTx(false);
  };

  /* calc — to'liq qaytadan yozilgan: zanjirli amallar (5+3+2=) endi to'g'ri ishlaydi */
  const calc=key=>{
    if(key==="C"){setCDisp("0");setCPrev(null);setCOp(null);setCFresh(true);setCExpr("");setCLastOp(null);setCLastVal(null);return;}
    if(key==="±"){setCDisp(d=>d.startsWith("-")?d.slice(1):d==="0"?"0":"-"+d);return;}
    if(key==="%"){setCDisp(d=>{const n=parseFloat(d);return isNaN(n)?d:String(n/100);});return;}
    if(["+","-","×","÷"].includes(key)){
      const cur=parseFloat(cDisp)||0;
      if(cOp!==null&&!cFresh){
        const result=applyOp(cPrev,cur,cOp);
        setCPrev(result);setCDisp(String(result));setCExpr(numFmt(result)+" "+key);
      }else{
        setCPrev(cur);setCExpr(numFmt(cur)+" "+key);
      }
      setCOp(key);setCFresh(true);setCLastOp(null);setCLastVal(null);
      return;
    }
    if(key==="="){
      const cur=parseFloat(cDisp)||0;
      if(cOp!==null&&cPrev!==null){
        const result=applyOp(cPrev,cur,cOp);
        setCDisp(String(result));setCLastOp(cOp);setCLastVal(cur);setCPrev(null);setCOp(null);setCFresh(true);setCExpr("");
      }else if(cLastOp!==null&&cLastVal!==null){
        const result=applyOp(cur,cLastVal,cLastOp);
        setCDisp(String(result));setCFresh(true);
      }
      return;
    }
    if(key==="⌫"){
      setCDisp(d=>{const neg=d.startsWith("-");const body=neg?d.slice(1):d;if(body.length<=1)return"0";const next=body.slice(0,-1);return neg?"-"+next:next;});
      return;
    }
    if(key==="."){if(cFresh){setCDisp("0.");setCFresh(false);return;}if(!cDisp.includes("."))setCDisp(d=>d+".");return;}
    if(cFresh){setCDisp(key);setCFresh(false);setCLastOp(null);setCLastVal(null);}else setCDisp(d=>d==="0"?key:d.length<14?d+key:d);
  };
  const cFmt=()=>{const n=parseFloat(cDisp);if(isNaN(n))return cDisp;const hasDot=cDisp.includes(".");const dec=hasDot?cDisp.split(".")[1]:null;const ip=Math.floor(Math.abs(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g," ");return(n<0?"-":"")+ip+(dec!==null?"."+dec:"");};
  const cFS=()=>{const l=cFmt().length;return l<=8?40:l<=12?30:l<=16?22:18;};

  /* detail */
  const selContact=selId?contacts.find(c=>c.id===selId):null;
  const selTxs=selContact?txs.filter(t=>t.contactId===selId).sort((a,b)=>b.date.localeCompare(a.date)):[];
  const selBal=selContact?getBal(selId,txs):0;

  if(!loaded) return(
    <div style={{background:"#0B0B10",height:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"-apple-system,sans-serif"}}>
      <div style={{fontSize:52,marginBottom:16}}>💸</div>
      <div style={{color:"#6B7280",fontSize:15}}>Yuklanmoqda...</div>
    </div>
  );

  /* ═══ CONTACT DETAIL ═══ */
  if(selId&&selContact) return(
    <div style={{background:"#0B0B10",minHeight:"100vh",color:"#F1F5F9",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",maxWidth:480,margin:"0 auto"}}>
      <style>{`*{box-sizing:border-box;}select option{background:#16161F;}`}</style>
      <div style={{background:"#16161F",padding:"16px",display:"flex",alignItems:"center",gap:10,position:"sticky",top:0,zIndex:20,borderBottom:"1px solid #222230"}}>
        <button onClick={()=>setSelId(null)} style={{background:"none",border:"none",color:"#F1F5F9",fontSize:22,cursor:"pointer",padding:"4px 6px 4px 0",lineHeight:1}}>←</button>
        <Avt contact={selContact} size={40}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:700,fontSize:16,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{selContact.name} {selContact.surname}</div>
          <div style={{fontSize:12,color:selBal>=0?"#4ADE80":"#F87171",marginTop:1}}>{selBal>=0?"Sizga qarzdor":"Siz qarzdorsiz"}: {selBal>=0?"+":"-"}{numFmt(selBal)}</div>
        </div>
        <button onClick={()=>setEditContact(selContact)} style={{background:"none",border:"none",color:"#818CF8",fontSize:20,cursor:"pointer",padding:6}}>✎</button>
        <button onClick={()=>{if(window.confirm("Kontaktni o'chirasizmi?\nBarcha tranzaksiyalar ham o'chiriladi."))delContact(selId);}} style={{background:"none",border:"none",color:"#F87171",fontSize:18,cursor:"pointer",padding:6}}>🗑</button>
      </div>
      <div style={{background:"#16161F",padding:"20px 16px",marginBottom:8,borderBottom:"1px solid #222230"}}>
        <div style={{display:"flex",gap:16,alignItems:"flex-start",marginBottom:16}}>
          <Avt contact={selContact} size={76}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:20,fontWeight:700,lineHeight:1.3}}>{selContact.name} {selContact.surname}</div>
            {selContact.label&&<LabelChip label={selContact.label} style={{marginTop:7,fontSize:12}}/>}
            {selContact.phone&&<div style={{color:"#9CA3AF",marginTop:8,fontSize:14}}>📞 {selContact.phone}</div>}
            <div style={{color:"#3A3A4A",fontSize:12,marginTop:5}}>Qo'shilgan: {dateFmt(selContact.createdAt)}</div>
          </div>
        </div>
        <div style={{padding:"14px 16px",background:"#0B0B10",borderRadius:14,border:`1px solid ${selBal!==0?(selBal>=0?"#14532D":"#7F1D1D"):"#222230"}`,textAlign:"center"}}>
          <div style={{fontSize:11,color:"#4B5563",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>UMUMIY BALANS</div>
          <div style={{fontSize:30,fontWeight:800,color:selBal>0?"#4ADE80":selBal<0?"#F87171":"#6B7280",letterSpacing:-1}}>{selBal>0?"+":selBal<0?"-":""}{numFmt(selBal)}</div>
          <div style={{fontSize:12,color:"#4B5563",marginTop:5}}>{selTxs.length} ta tranzaksiya{selBal===0?" · Hisob-kitob tugallangan":""}</div>
        </div>
      </div>
      <div style={{padding:"12px 16px",display:"flex",gap:10}}>
        <button onClick={()=>setAddTx({contactId:selId,type:"qarz"})} style={{flex:1,padding:"14px",background:"#2D1B1B",border:"1px solid #7F1D1D",color:"#F87171",borderRadius:14,fontWeight:700,cursor:"pointer",fontSize:15}}>− Qarz olish</button>
        <button onClick={()=>setAddTx({contactId:selId,type:"zaym"})} style={{flex:1,padding:"14px",background:"#1B2D1B",border:"1px solid #14532D",color:"#4ADE80",borderRadius:14,fontWeight:700,cursor:"pointer",fontSize:15}}>+ Zaym berish</button>
      </div>
      <div style={{padding:"4px 16px 100px"}}>
        <div style={{color:"#4B5563",fontSize:11,textTransform:"uppercase",letterSpacing:1,marginBottom:12,paddingLeft:2}}>TRANZAKSIYALAR</div>
        {selTxs.length===0&&<div style={{textAlign:"center",color:"#4B5563",padding:"50px 0"}}><div style={{fontSize:40,marginBottom:10}}>📝</div><div>Hali tranzaksiya yo'q</div></div>}
        {selTxs.map(tx=>(
          <div key={tx.id} style={{background:"#16161F",borderRadius:14,padding:"14px",marginBottom:10,display:"flex",alignItems:"center",gap:12,border:"1px solid #222230"}}>
            <div style={{width:44,height:44,borderRadius:"50%",background:tx.type==="zaym"?"#1B2D1B":"#2D1B1B",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:800,color:tx.type==="zaym"?"#4ADE80":"#F87171",flexShrink:0}}>{tx.type==="zaym"?"↓":"↑"}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                <div style={{fontSize:16,fontWeight:700,color:tx.type==="zaym"?"#4ADE80":"#F87171"}}>{tx.type==="zaym"?"+":"-"}{numFmt(tx.amount)}</div>
                <div style={{fontSize:12,color:"#6B7280",flexShrink:0}}>{dateFmt(tx.date)}</div>
              </div>
              {tx.note&&<div style={{fontSize:13,color:"#9CA3AF",marginTop:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tx.note}</div>}
              <div style={{fontSize:11,color:"#374151",marginTop:3}}>{tx.type==="zaym"?"💚 Zaym":"🔴 Qarz"}</div>
            </div>
            <button onClick={()=>{if(window.confirm("Tranzaksiyani o'chirasizmi?"))delTx(tx.id);}} style={{background:"none",border:"none",color:"#374151",cursor:"pointer",fontSize:18,flexShrink:0,padding:4,lineHeight:1}}>✕</button>
          </div>
        ))}
      </div>
      {editContact&&<ContactModal contact={editContact} onSave={saveContact} onClose={()=>setEditContact(null)}/>}
      {addTx&&<TransactionModal initial={addTx} contact={selContact} onSave={addTxFn} onClose={()=>setAddTx(null)}/>}
    </div>
  );

  /* ═══ CONTACT ROW (shared) ═══ */
  const ContactRow = ({c, showBadge=true}) => (
    <div onClick={()=>setSelId(c.id)} style={{background:"#16161F",borderRadius:14,padding:"13px 14px",marginBottom:9,display:"flex",alignItems:"center",gap:13,cursor:"pointer",border:"1px solid #222230"}}>
      <div style={{position:"relative",flexShrink:0}}>
        <Avt contact={c} size={52}/>
        {showBadge&&<div style={{position:"absolute",bottom:1,right:1,width:13,height:13,borderRadius:"50%",background:c.balance>0?"#22C55E":c.balance<0?"#EF4444":"#4B5563",border:"2px solid #16161F"}}/>}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontWeight:600,fontSize:15,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name} {c.surname}</div>
        {c.label&&<LabelChip label={c.label} style={{marginTop:4}}/>}
        <div style={{color:"#4B5563",fontSize:12,marginTop:c.label?4:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.phone}</div>
      </div>
      <div style={{textAlign:"right",flexShrink:0}}>
        {c.balance!==0
          ?<><div style={{fontSize:14,fontWeight:700,color:c.balance>=0?"#4ADE80":"#F87171"}}>{c.balance>=0?"+":"-"}{numFmt(c.balance)}</div><div style={{fontSize:11,color:"#4B5563",marginTop:3}}>{dateFmt(c.lastDate)}</div></>
          :<div style={{fontSize:11,color:"#374151"}}>Hisob-kitob yo'q</div>}
      </div>
    </div>
  );

  /* ═══ TAB: QARZLAR ═══ */
  const renderQarzlar = () => (
    <div style={{padding:"12px 16px 100px"}}>
      <div style={{position:"relative",marginBottom:10}}>
        <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",color:"#6B7280",fontSize:15,pointerEvents:"none"}}>🔍</span>
        <input value={qSearch} onChange={e=>setQSearch(e.target.value)} placeholder="Qidirish (isim, belgi...)" style={{...IS,paddingLeft:38,marginTop:0}}/>
        {qSearch&&<button onClick={()=>setQSearch("")} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#6B7280",cursor:"pointer",fontSize:20,lineHeight:1}}>×</button>}
      </div>
      <div style={{display:"flex",gap:6,marginBottom:8}}>
        {[["all","Barchasi"],["menga","Menga 💚"],["ularga","Ularga 🔴"]].map(([k,l])=>(
          <button key={k} onClick={()=>setFilter(k)} style={{flex:1,padding:"8px 2px",background:filter===k?"#6366F1":"#16161F",color:filter===k?"#fff":"#6B7280",border:filter===k?"none":"1px solid #222230",borderRadius:8,cursor:"pointer",fontSize:11,fontWeight:filter===k?700:400,transition:"all 0.15s"}}>{l}</button>
        ))}
      </div>
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {[["date","📅 Sana"],["name","🔤 A-Z"],["amount","💰 Miqdor"]].map(([k,l])=>(
          <button key={k} onClick={()=>setSortBy(k)} style={{flex:1,padding:"7px 2px",background:"none",color:sortBy===k?"#818CF8":"#4B5563",border:sortBy===k?"1px solid #818CF8":"1px solid #222230",borderRadius:8,cursor:"pointer",fontSize:11,fontWeight:sortBy===k?700:400,transition:"all 0.15s"}}>{l}</button>
        ))}
      </div>
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        <div style={{flex:1,background:"#0D1F0D",borderRadius:12,padding:"11px 13px",border:"1px solid #14532D"}}>
          <div style={{fontSize:10,color:"#4B5563",textTransform:"uppercase",letterSpacing:1}}>Menga (zaym)</div>
          <div style={{fontSize:14,fontWeight:700,color:"#4ADE80",marginTop:4}}>+{numFmt(totalZ)}</div>
        </div>
        <div style={{flex:1,background:"#1F0D0D",borderRadius:12,padding:"11px 13px",border:"1px solid #7F1D1D"}}>
          <div style={{fontSize:10,color:"#4B5563",textTransform:"uppercase",letterSpacing:1}}>Ularga (qarz)</div>
          <div style={{fontSize:14,fontWeight:700,color:"#F87171",marginTop:4}}>-{numFmt(totalQ)}</div>
        </div>
      </div>
      {qFiltered.length===0&&(
        <div style={{textAlign:"center",color:"#4B5563",padding:"60px 0"}}>
          <div style={{fontSize:48,marginBottom:12}}>💸</div>
          <div style={{fontSize:16,marginBottom:6}}>{qSearch||filter!=="all"?"Topilmadi":"Faol qarz yoki zaym yo'q"}</div>
          <div style={{fontSize:13,color:"#3A3A4A"}}>{qSearch||filter!=="all"?"Boshqa qidiruv kiriting":"+ tugmani bosib qarz/zaym qo'shing"}</div>
        </div>
      )}
      {qFiltered.map(c=><ContactRow key={c.id} c={c}/>)}
    </div>
  );

  /* ═══ TAB: KONTAKTLAR ═══ */
  const renderKontaktlar = () => {
    const withDebt=kFiltered.filter(c=>c.balance!==0);
    const noDebt  =kFiltered.filter(c=>c.balance===0);
    return (
      <div style={{padding:"12px 16px 100px"}}>
        <div style={{position:"relative",marginBottom:10}}>
          <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",color:"#6B7280",fontSize:15,pointerEvents:"none"}}>🔍</span>
          <input value={kSearch} onChange={e=>setKSearch(e.target.value)} placeholder="Qidirish (isim, belgi...)" style={{...IS,paddingLeft:38,marginTop:0}}/>
          {kSearch&&<button onClick={()=>setKSearch("")} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#6B7280",cursor:"pointer",fontSize:20,lineHeight:1}}>×</button>}
        </div>
        <div style={{display:"flex",gap:6,marginBottom:14}}>
          {[["name","🔤 A-Z"],["date","📅 Sana"],["amount","💰 Miqdor"]].map(([k,l])=>(
            <button key={k} onClick={()=>setKSortBy(k)} style={{flex:1,padding:"7px 2px",background:"none",color:kSortBy===k?"#818CF8":"#4B5563",border:kSortBy===k?"1px solid #818CF8":"1px solid #222230",borderRadius:8,cursor:"pointer",fontSize:11,fontWeight:kSortBy===k?700:400,transition:"all 0.15s"}}>{l}</button>
          ))}
        </div>
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          <div style={{flex:1,background:"#16161F",borderRadius:10,padding:"10px 12px",border:"1px solid #222230",textAlign:"center"}}>
            <div style={{fontSize:10,color:"#4B5563",textTransform:"uppercase",letterSpacing:1}}>Jami kontakt</div>
            <div style={{fontSize:18,fontWeight:700,color:"#F1F5F9",marginTop:3}}>{cwb.length}</div>
          </div>
          <div style={{flex:1,background:"#16161F",borderRadius:10,padding:"10px 12px",border:"1px solid #222230",textAlign:"center"}}>
            <div style={{fontSize:10,color:"#4B5563",textTransform:"uppercase",letterSpacing:1}}>Faol qarz/zaym</div>
            <div style={{fontSize:18,fontWeight:700,color:"#818CF8",marginTop:3}}>{cwb.filter(c=>c.balance!==0).length}</div>
          </div>
          <div style={{flex:1,background:"#16161F",borderRadius:10,padding:"10px 12px",border:"1px solid #222230",textAlign:"center"}}>
            <div style={{fontSize:10,color:"#4B5563",textTransform:"uppercase",letterSpacing:1}}>Hisob-kitob</div>
            <div style={{fontSize:18,fontWeight:700,color:"#22C55E",marginTop:3}}>{cwb.filter(c=>c.balance===0).length}</div>
          </div>
        </div>

        {kFiltered.length===0&&(
          <div style={{textAlign:"center",color:"#4B5563",padding:"60px 0"}}>
            <div style={{fontSize:48,marginBottom:12}}>👥</div>
            <div style={{fontSize:16,marginBottom:6}}>{kSearch?"Topilmadi":"Kontakt yo'q"}</div>
            <div style={{fontSize:13}}>{kSearch?"Boshqa qidiruv kiriting":"+ Yangi tugmani bosing"}</div>
          </div>
        )}

        {withDebt.length>0&&<>
          <div style={{fontSize:10,color:"#4B5563",textTransform:"uppercase",letterSpacing:1,marginBottom:10,paddingLeft:2}}>FAOL QARZ / ZAYM ({withDebt.length})</div>
          {withDebt.map(c=><ContactRow key={c.id} c={c}/>)}
        </>}

        {noDebt.length>0&&<>
          <div style={{fontSize:10,color:"#374151",textTransform:"uppercase",letterSpacing:1,margin:"16px 0 10px",paddingLeft:2}}>HISOB-KITOB TUGALLANGAN ({noDebt.length})</div>
          {noDebt.map(c=><ContactRow key={c.id} c={c} showBadge={false}/>)}
        </>}
      </div>
    );
  };

  /* ═══ TAB: ESLATMALAR ═══ */
  const renderEslatmalar = () => {
    const today = todayStr();
    const sorted=[...rems].sort((a,b)=>a.done!==b.done?a.done?1:-1:a.date.localeCompare(b.date));
    return(
      <div style={{padding:"12px 16px 100px"}}>
        {sorted.length===0&&<div style={{textAlign:"center",color:"#4B5563",padding:"60px 0"}}><div style={{fontSize:48,marginBottom:12}}>🔔</div><div style={{fontSize:16,marginBottom:6}}>Eslatma yo'q</div><div style={{fontSize:13}}>+ Yangi tugmani bosing</div></div>}
        {sorted.map(r=>{
          const rc=contacts.find(c=>c.id===r.contactId);
          const over=!r.done&&r.date<today,isToday=r.date===today&&!r.done;
          return(
            <div key={r.id} style={{background:"#16161F",borderRadius:14,padding:"14px",marginBottom:10,display:"flex",gap:12,alignItems:"flex-start",opacity:r.done?0.5:1,border:`1px solid ${over?"#7F1D1D":isToday?"#14532D":"#222230"}`}}>
              <button onClick={()=>toggleRem(r.id)} style={{width:26,height:26,borderRadius:7,border:`2px solid ${r.done?"#22C55E":"#374151"}`,background:r.done?"#22C55E":"none",cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:14,marginTop:1,transition:"all 0.15s"}}>{r.done?"✓":""}</button>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:600,fontSize:15,textDecoration:r.done?"line-through":"none",color:r.done?"#6B7280":"#F1F5F9"}}>{r.title}</div>
                {rc&&<div style={{display:"flex",alignItems:"center",gap:8,marginTop:5}}><Avt contact={rc} size={20}/><span style={{fontSize:13,color:"#818CF8"}}>{rc.name} {rc.surname}</span>{rc.label&&<LabelChip label={rc.label} style={{fontSize:10}}/>}</div>}
                <div style={{fontSize:12,marginTop:5,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                  <span style={{color:over?"#F87171":"#6B7280"}}>📅 {dateFmt(r.date)}</span>
                  {over&&<span style={{background:"#2D1B1B",color:"#F87171",borderRadius:4,padding:"2px 6px",fontSize:10,fontWeight:700}}>MUDDATI O'TGAN</span>}
                  {isToday&&<span style={{background:"#1B2D1B",color:"#4ADE80",borderRadius:4,padding:"2px 6px",fontSize:10,fontWeight:700}}>BUGUN</span>}
                </div>
              </div>
              <button onClick={()=>delRem(r.id)} style={{background:"none",border:"none",color:"#374151",cursor:"pointer",fontSize:18,flexShrink:0,padding:4,lineHeight:1}}>✕</button>
            </div>
          );
        })}
      </div>
    );
  };

  /* ═══ TAB: HISOBOTLAR ═══ */
  const renderHisobotlar = () => {
    const net=totalZ-totalQ;
    const top5=[...cwb].filter(c=>c.balance!==0).sort((a,b)=>Math.abs(b.balance)-Math.abs(a.balance)).slice(0,5);
    return(
      <div style={{padding:"12px 16px 100px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <div style={{background:"#0D1F0D",borderRadius:14,padding:"14px",border:"1px solid #14532D"}}><div style={{fontSize:10,color:"#4B5563",textTransform:"uppercase",letterSpacing:1}}>Zaymlar (menga)</div><div style={{fontSize:16,fontWeight:800,color:"#4ADE80",marginTop:6,lineHeight:1.2}}>+{numFmt(totalZ)}</div></div>
          <div style={{background:"#1F0D0D",borderRadius:14,padding:"14px",border:"1px solid #7F1D1D"}}><div style={{fontSize:10,color:"#4B5563",textTransform:"uppercase",letterSpacing:1}}>Qarzlar (ularga)</div><div style={{fontSize:16,fontWeight:800,color:"#F87171",marginTop:6,lineHeight:1.2}}>-{numFmt(totalQ)}</div></div>
          <div style={{background:net>=0?"#0D1F0D":"#1F0D0D",borderRadius:14,padding:"14px",border:`1px solid ${net>=0?"#14532D":"#7F1D1D"}`,gridColumn:"1/-1"}}><div style={{fontSize:10,color:"#4B5563",textTransform:"uppercase",letterSpacing:1}}>Net balans</div><div style={{fontSize:24,fontWeight:800,color:net>=0?"#4ADE80":"#F87171",marginTop:6,letterSpacing:-0.5}}>{net>=0?"+":"-"}{numFmt(net)}</div><div style={{fontSize:12,color:"#4B5563",marginTop:4}}>{net>=0?"Ko'proq zaym berdingiz":"Ko'proq qarz oldingiz"}</div></div>
        </div>
        <div style={{display:"flex",background:"#16161F",borderRadius:10,padding:4,marginBottom:12,border:"1px solid #222230"}}>
          {[["daily","Kunlik"],["weekly","Haftalik"],["monthly","Oylik"],["yearly","Yillik"]].map(([k,l])=>(
            <button key={k} onClick={()=>setPeriod(k)} style={{flex:1,padding:"8px 0",background:period===k?"#6366F1":"none",color:period===k?"#fff":"#6B7280",border:"none",borderRadius:8,cursor:"pointer",fontSize:10,fontWeight:period===k?700:400,transition:"all 0.15s"}}>{l}</button>
          ))}
        </div>
        <div style={{background:"#16161F",borderRadius:14,padding:"14px 4px 12px",marginBottom:14,border:"1px solid #222230"}}>
          <div style={{fontSize:10,color:"#4B5563",paddingLeft:12,marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>QARZ / ZAYM (mln So')</div>
          <ResponsiveContainer width="100%" height={160}><BarChart data={statsData} barCategoryGap="30%" barGap={3}><CartesianGrid strokeDasharray="3 3" stroke="#1A1A28" vertical={false}/><XAxis dataKey="name" tick={{fontSize:9,fill:"#4B5563"}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:9,fill:"#4B5563"}} axisLine={false} tickLine={false} width={26}/><Tooltip contentStyle={{background:"#16161F",border:"1px solid #222230",borderRadius:8,color:"#F1F5F9",fontSize:11}} formatter={(v,n)=>[v.toFixed(1)+" mln",n==="qarz"?"Qarz":"Zaym"]}/><Bar dataKey="qarz" fill="#EF4444" radius={[4,4,0,0]}/><Bar dataKey="zaym" fill="#22C55E" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer>
          <div style={{display:"flex",justifyContent:"center",gap:20,marginTop:6}}>{[["#EF4444","Qarz"],["#22C55E","Zaym"]].map(([c,l])=><div key={l} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#6B7280"}}><div style={{width:10,height:10,borderRadius:2,background:c}}/>{l}</div>)}</div>
        </div>
        <div style={{background:"#16161F",borderRadius:14,padding:"14px 16px",border:"1px solid #222230"}}>
          <div style={{fontSize:10,color:"#4B5563",textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>TOP KONTAKTLAR</div>
          {top5.length===0&&<div style={{color:"#4B5563",textAlign:"center",padding:"20px 0"}}>Faol qarz/zaym yo'q</div>}
          {top5.map((c,i)=>(
            <div key={c.id} onClick={()=>setSelId(c.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:i<top5.length-1?"1px solid #222230":"none",cursor:"pointer"}}>
              <div style={{color:"#4B5563",fontSize:12,fontWeight:700,width:18,flexShrink:0}}>{i+1}.</div>
              <Avt contact={c} size={34}/>
              <div style={{flex:1,minWidth:0}}><div style={{fontWeight:600,fontSize:14,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name} {c.surname}</div>{c.label&&<LabelChip label={c.label} style={{marginTop:3,fontSize:10}}/>}</div>
              <div style={{fontSize:14,fontWeight:700,color:c.balance>=0?"#4ADE80":"#F87171",flexShrink:0}}>{c.balance>=0?"+":"-"}{numFmt(c.balance)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* ═══ TAB: KALKULYATOR ═══ */
  const renderKalkulyator = () => {
    const keys=["C","±","%","÷","7","8","9","×","4","5","6","-","1","2","3","+","0",".","⌫","="];
    return(
      <div style={{padding:"12px 16px 100px"}}>
        <div style={{background:"#16161F",borderRadius:16,padding:"20px",marginBottom:12,minHeight:116,border:"1px solid #222230"}}>
          {cExpr&&<div style={{color:"#4B5563",fontSize:13,textAlign:"right",marginBottom:6}}>{cExpr}</div>}
          <div style={{color:"#F1F5F9",fontSize:cFS(),fontWeight:700,textAlign:"right",wordBreak:"break-all",lineHeight:1.15}}>{cFmt()}</div>
          {parseFloat(cDisp)!==0&&!isNaN(parseFloat(cDisp))&&<div style={{color:"#6B7280",fontSize:12,textAlign:"right",marginTop:8}}>= {numFmt(Math.abs(parseFloat(cDisp)))}</div>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:12}}>
          {keys.map((k,i)=>{const isOp=["+","-","×","÷"].includes(k),isEq=k==="=",isSp=["±","%","⌫"].includes(k),isC=k==="C";return(<button key={i} onClick={()=>calc(k)} style={{padding:"20px 0",border:"none",borderRadius:14,cursor:"pointer",fontSize:isEq?24:20,fontWeight:700,background:isEq?"#6366F1":isOp?"#1E2348":isC?"#2D1B1B":isSp?"#1E1E2A":"#16161F",color:isEq?"#fff":isOp?"#818CF8":isC?"#F87171":isSp?"#9CA3AF":"#F1F5F9",border:isOp?"1px solid #2D3575":isC?"1px solid #4B1A1A":"1px solid #222230"}}>{k}</button>);} )}
        </div>
        <div style={{background:"#16161F",borderRadius:14,padding:14,border:"1px solid #222230"}}>
          <div style={{fontSize:10,color:"#4B5563",textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>TEZKOR MIQDORLAR</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {[50000,100000,500000,1000000,5000000,10000000,50000000,100000000].map(n=>(
              <button key={n} onClick={()=>{setCDisp(String(n));setCFresh(false);}} style={{padding:"8px 12px",background:"#0B0B10",color:"#818CF8",border:"1px solid #222230",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600}}>{n>=1000000?(n/1000000)+"M":n>=1000?(n/1000)+"K":n}</button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  /* ═══ NAVIGATION (5 tabs) ═══ */
  const TABS=[
    {k:"qarzlar",    icon:"💸", label:"Qarz"},
    {k:"kontaktlar", icon:"👥", label:"Kontakt"},
    {k:"eslatmalar", icon:"🔔", label:"Eslatma"},
    {k:"hisobotlar", icon:"📊", label:"Hisobot"},
    {k:"kalkulyator",icon:"🧮", label:"Hisob"},
  ];

  return(
    <div style={{background:"#0B0B10",minHeight:"100vh",color:"#F1F5F9",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",maxWidth:480,margin:"0 auto"}}>
      <style>{`*{box-sizing:border-box;}input[type=date]::-webkit-calendar-picker-indicator{filter:invert(0.5);}select option{background:#16161F;}::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:#222230;border-radius:2px;}`}</style>

      <div style={{background:"#16161F",padding:"16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:20,borderBottom:"1px solid #222230"}}>
        <div style={{fontSize:18,fontWeight:800,letterSpacing:-0.3}}>
          {tab==="qarzlar"&&"💸 Qarzlar"}
          {tab==="kontaktlar"&&"👥 Kontaktlar"}
          {tab==="eslatmalar"&&"🔔 Eslatmalar"}
          {tab==="hisobotlar"&&"📊 Hisobotlar"}
          {tab==="kalkulyator"&&"🧮 Kalkulyator"}
        </div>
        <div style={{display:"flex",gap:8}}>
          {tab==="qarzlar"&&<button onClick={()=>setAddQuickTx(true)} style={{background:"#6366F1",border:"none",color:"#fff",borderRadius:10,padding:"8px 16px",cursor:"pointer",fontWeight:700,fontSize:14}}>＋ Qarz/Zaym</button>}
          {tab==="kontaktlar"&&<button onClick={()=>setEditContact({})} style={{background:"#6366F1",border:"none",color:"#fff",borderRadius:10,padding:"8px 16px",cursor:"pointer",fontWeight:700,fontSize:14}}>＋ Yangi</button>}
          {tab==="eslatmalar"&&<button onClick={()=>setShowRem(true)} style={{background:"#6366F1",border:"none",color:"#fff",borderRadius:10,padding:"8px 16px",cursor:"pointer",fontWeight:700,fontSize:14}}>＋ Yangi</button>}
        </div>
      </div>

      {tab==="qarzlar"    &&renderQarzlar()}
      {tab==="kontaktlar" &&renderKontaktlar()}
      {tab==="eslatmalar" &&renderEslatmalar()}
      {tab==="hisobotlar" &&renderHisobotlar()}
      {tab==="kalkulyator"&&renderKalkulyator()}

      <nav style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"#16161F",borderTop:"1px solid #222230",display:"flex",zIndex:20}}>
        {TABS.map(({k,icon,label})=>(
          <button key={k} onClick={()=>setTab(k)} style={{flex:1,padding:"9px 0 7px",background:"none",border:"none",color:tab===k?"#6366F1":"#4B5563",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,position:"relative"}}>
            <div style={{position:"relative"}}>
              <span style={{fontSize:20}}>{icon}</span>
              {k==="eslatmalar"&&pendRem>0&&<div style={{position:"absolute",top:-4,right:-6,background:"#EF4444",color:"#fff",borderRadius:"50%",minWidth:15,height:15,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,padding:"0 2px"}}>{pendRem}</div>}
            </div>
            <span style={{fontSize:8,fontWeight:tab===k?700:400,letterSpacing:0.1}}>{label}</span>
          </button>
        ))}
      </nav>

      {editContact!==null&&<ContactModal contact={editContact} onSave={saveContact} onClose={()=>setEditContact(null)}/>}
      {addTx&&<TransactionModal initial={addTx} contact={contacts.find(c=>c.id===addTx?.contactId)} onSave={addTxFn} onClose={()=>setAddTx(null)}/>}
      {addQuickTx&&<QuickAddModal cwb={cwb} onSave={handleQuickSave} onClose={()=>setAddQuickTx(false)}/>}
      {showRem&&<ReminderModal contacts={contacts} onSave={saveRem} onClose={()=>setShowRem(false)}/>}
    </div>
  );
}
