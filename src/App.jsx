import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabase";

const C = {
  bg:"#F4F6FB", white:"#FFFFFF", border:"#E2E8F0",
  accent:"#1A6FE8", accentLight:"#EBF2FF",
  green:"#16A34A", greenLight:"#F0FDF4",
  red:"#DC2626", redLight:"#FEF2F2",
  gold:"#D97706", goldLight:"#FFFBEB",
  purple:"#7C3AED", purpleLight:"#F5F3FF",
  pink:"#EC4899", pinkLight:"#FDF2F8",
  teal:"#0D9488", tealLight:"#F0FDFA",
  text:"#1E293B", textMid:"#475569", textLight:"#94A3B8",
};

const fmt = (n) => new Intl.NumberFormat("es-AR",{style:"currency",currency:"ARS",maximumFractionDigits:0}).format(n||0);
const fmtUSD = (n,rate) => rate>0?`U$S ${((n||0)/rate).toLocaleString("es-AR",{maximumFractionDigits:0})}`:"—";
const hoy = () => new Date().toISOString().split("T")[0];

const CATEGORIAS = {
  comida:       {icono:"🍔",color:C.red,     label:"Comida"},
  transporte:   {icono:"🚗",color:C.accent,  label:"Transporte"},
  ocio:         {icono:"🎮",color:C.purple,  label:"Ocio"},
  impuestos:    {icono:"🏠",color:C.textMid, label:"Vivienda"},
  herramientas: {icono:"🔧",color:C.green,   label:"Herramientas"},
  trabajo:      {icono:"💼",color:C.gold,    label:"Trabajo"},
  gimnasio:     {icono:"💪",color:C.red,     label:"Gimnasio"},
  ropa:         {icono:"👕",color:C.purple,  label:"Ropa"},
  compras:      {icono:"🛍️",color:C.accent,  label:"Compras"},
  belleza:      {icono:"💅",color:C.pink,    label:"Belleza"},
  salud:        {icono:"🏥",color:C.teal,    label:"Salud"},
  mascotas:     {icono:"🐾",color:C.gold,    label:"Mascotas"},
  transferencia:{icono:"↕️",color:C.textMid, label:"Transferencia"},
  otro:         {icono:"📦",color:C.textLight,label:"Otro"},
};

const COLORES_META = [C.accent,C.green,C.purple,C.gold,C.red,C.pink,C.teal];
const ICONOS_META  = ["🎯","✈️","🏠","💻","🚗","👗","📚","🏋️","🎓","💍","🌴","🛡️","💳","🐾"];

const NAV_MOBILE = [
  {id:"inicio",    label:"Inicio",     icon:"🏠"},
  {id:"movimientos",label:"Gastos",   icon:"💸"},
  {id:"metas",     label:"Metas",      icon:"🎯"},
  {id:"compartido",label:"Compartido", icon:"🤝"},
  {id:"mas",       label:"Más",        icon:"⋯"},
];
const NAV_DESKTOP = [
  {id:"inicio",    label:"Inicio",       icon:"🏠"},
  {id:"movimientos",label:"Movimientos", icon:"💸"},
  {id:"metas",     label:"Metas",        icon:"🎯"},
  {id:"compartido",label:"Compartido",   icon:"🤝"},
  {id:"billeteras",label:"Billeteras",   icon:"👛"},
  {id:"servicios", label:"Servicios",    icon:"🔔"},
  {id:"perfil",    label:"Mi Perfil",    icon:"👤"},
];

// ─── BASE COMPONENTS ──────────────────────────────────────────────────────────
function Card({children,style={},onClick}){
  const[p,setP]=useState(false);
  return(
    <div onClick={onClick} onMouseDown={()=>onClick&&setP(true)} onMouseUp={()=>setP(false)} onMouseLeave={()=>setP(false)}
      style={{background:C.white,borderRadius:20,padding:20,boxShadow:p?"0 1px 4px #00000010":"0 2px 16px #00000009",border:`1px solid ${C.border}`,boxSizing:"border-box",cursor:onClick?"pointer":"default",transform:p?"scale(0.99)":"scale(1)",transition:"all 0.18s ease",...style}}>
      {children}
    </div>
  );
}

function Barra({pct,color,height=10}){
  const[w,setW]=useState(0);
  useEffect(()=>{const t=setTimeout(()=>setW(Math.min(pct||0,100)),80);return()=>clearTimeout(t);},[pct]);
  return(
    <div style={{background:C.border,borderRadius:999,height,overflow:"hidden"}}>
      <div style={{height:"100%",borderRadius:999,background:color,width:`${w}%`,transition:"width 1s cubic-bezier(.23,1,.32,1)"}}/>
    </div>
  );
}

function Spinner(){
  return(
    <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh",background:C.bg}}>
      <div style={{textAlign:"center"}}>
        <div style={{width:48,height:48,border:`4px solid ${C.border}`,borderTop:`4px solid ${C.accent}`,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 16px"}}/>
        <p style={{color:C.textMid,fontWeight:600}}>Cargando...</p>
      </div>
    </div>
  );
}

function Modal({children,onClose,title,maxWidth=500}){
  useEffect(()=>{
    const h=(e)=>{if(e.key==="Escape")onClose();};
    document.addEventListener("keydown",h);
    return()=>document.removeEventListener("keydown",h);
  },[onClose]);
  return(
    <div onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{position:"fixed",inset:0,background:"#00000070",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:C.white,borderRadius:24,padding:26,width:"100%",maxWidth,boxShadow:"0 24px 64px #00000030",animation:"popIn 0.22s ease",boxSizing:"border-box",maxHeight:"92vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <p style={{fontWeight:800,fontSize:18,color:C.text}}>{title}</p>
          <button onClick={onClose} style={{width:34,height:34,borderRadius:10,background:C.bg,border:"none",cursor:"pointer",fontSize:17,color:C.textMid}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function BtnPrimary({children,onClick,disabled,color,style={}}){
  const[h,setH]=useState(false);
  const bg=color||C.accent;
  return(
    <button onClick={onClick} disabled={disabled} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{background:`linear-gradient(135deg,${bg},${bg}cc)`,color:"#fff",border:"none",borderRadius:14,padding:"14px",fontSize:15,fontFamily:"inherit",fontWeight:700,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.7:1,boxShadow:h?`0 8px 24px ${bg}50`:`0 4px 14px ${bg}30`,transform:h?"translateY(-1px)":"none",transition:"all 0.18s",width:"100%",...style}}>
      {children}
    </button>
  );
}

function Input({label,placeholder,value,onChange,type="text",min,max,style={}}){
  return(
    <div style={{display:"flex",flexDirection:"column",gap:4}}>
      {label&&<p style={{color:C.textMid,fontSize:12,fontWeight:600}}>{label}</p>}
      <input type={type} placeholder={placeholder} value={value} onChange={onChange} min={min} max={max}
        style={{fontFamily:"Plus Jakarta Sans",fontSize:15,padding:"12px 14px",border:`2px solid ${C.border}`,borderRadius:14,background:C.white,color:C.text,width:"100%",outline:"none",transition:"border-color 0.2s",...style}}
        onFocus={e=>e.target.style.borderColor=C.accent}
        onBlur={e=>e.target.style.borderColor=C.border}
      />
    </div>
  );
}

// ─── DONUT INTERACTIVO ────────────────────────────────────────────────────────
function DonutChart({data,size=160}){
  const[hover,setHover]=useState(null);
  const total=data.reduce((a,b)=>a+b.val,0);
  if(!total) return <div style={{width:size,height:size,borderRadius:"50%",background:C.border,display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:C.textLight,fontSize:12}}>Sin datos</p></div>;
  let angle=-90;
  const slices=data.map((d,i)=>{
    const pct=d.val/total;
    const a1=angle*Math.PI/180; angle+=pct*360;
    const a2=angle*Math.PI/180;
    const r=size/2-14;
    const x1=size/2+r*Math.cos(a1),y1=size/2+r*Math.sin(a1);
    const x2=size/2+r*Math.cos(a2),y2=size/2+r*Math.sin(a2);
    return{path:`M${size/2} ${size/2} L${x1} ${y1} A${r} ${r} 0 ${pct>0.5?1:0} 1 ${x2} ${y2}Z`,color:d.color,label:d.label,val:d.val,pct:Math.round(pct*100),i};
  });
  const hov=hover!==null?slices[hover]:null;
  return(
    <div style={{position:"relative",width:size,height:size}}>
      <svg width={size} height={size} style={{filter:"drop-shadow(0 4px 12px #00000015)"}}>
        {slices.map((s,i)=>(
          <path key={i} d={s.path} fill={hover===i?s.color:s.color+"cc"}
            style={{transition:"all 0.2s",cursor:"pointer",transform:hover===i?"scale(1.04)":"scale(1)",transformOrigin:`${size/2}px ${size/2}px`}}
            onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(null)}/>
        ))}
        <circle cx={size/2} cy={size/2} r={size/2*0.52} fill={C.white}/>
        {hov?(
          <>
            <text x={size/2} y={size/2-8} textAnchor="middle" fontSize={10} fill={C.textMid} fontFamily="Plus Jakarta Sans">{hov.label}</text>
            <text x={size/2} y={size/2+10} textAnchor="middle" fontSize={16} fontWeight="800" fill={hov.color} fontFamily="Plus Jakarta Sans">{hov.pct}%</text>
          </>
        ):(
          <text x={size/2} y={size/2+5} textAnchor="middle" fontSize={11} fill={C.textMid} fontFamily="Plus Jakarta Sans">Total</text>
        )}
      </svg>
    </div>
  );
}

function BarChartInteractivo({items,maxH=100}){
  const[hover,setHover]=useState(null);
  const max=Math.max(...items.map(i=>Math.abs(i.val)),1);
  return(
    <div style={{display:"flex",alignItems:"flex-end",gap:6,height:maxH+36,paddingBottom:24,position:"relative"}}>
      {items.map((item,i)=>{
        const h=Math.max((Math.abs(item.val)/max)*maxH,4);
        const color=item.color||(item.val>=0?C.green:C.red);
        const isH=hover===i;
        return(
          <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2,position:"relative"}}
            onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(null)}>
            {isH&&(
              <div style={{position:"absolute",bottom:h+26,background:C.text,color:"#fff",fontSize:10,fontWeight:700,padding:"3px 7px",borderRadius:6,whiteSpace:"nowrap",zIndex:10,animation:"fadeUp 0.15s ease"}}>
                {fmt(item.val)}
              </div>
            )}
            <div style={{width:"100%",height:h,background:isH?color:color+"99",borderRadius:"5px 5px 0 0",transition:"all 0.3s ease",boxShadow:isH?`0 4px 12px ${color}40`:"none",cursor:"pointer"}}/>
            <p style={{fontSize:9,color:C.textMid,fontWeight:600,position:"absolute",bottom:4,textAlign:"center",width:"100%"}}>{item.label}</p>
          </div>
        );
      })}
    </div>
  );
}

// ─── CAMPANITA ────────────────────────────────────────────────────────────────
function Campanita({notifs,onMarcarLeidas}){
  const[open,setOpen]=useState(false);
  const ref=useRef(null);
  const sinLeer=notifs.filter(n=>!n.leida).length;
  useEffect(()=>{
    const h=(e)=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};
    document.addEventListener("mousedown",h);
    document.addEventListener("touchstart",h);
    return()=>{document.removeEventListener("mousedown",h);document.removeEventListener("touchstart",h);};
  },[]);
  return(
    <div ref={ref} style={{position:"relative"}}>
      <button onClick={()=>{setOpen(!open);if(!open&&sinLeer>0)onMarcarLeidas();}}
        style={{width:40,height:40,borderRadius:12,border:`2px solid ${sinLeer>0?C.gold:C.border}`,background:sinLeer>0?C.goldLight:C.white,cursor:"pointer",fontSize:18,position:"relative",transition:"all 0.2s"}}>
        🔔
        {sinLeer>0&&<span style={{position:"absolute",top:-6,right:-6,width:18,height:18,borderRadius:"50%",background:C.red,color:"#fff",fontSize:10,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid #fff"}}>{sinLeer}</span>}
      </button>
      {open&&(
        <div style={{position:"fixed",top:70,right:8,left:8,maxWidth:340,margin:"0 auto",background:C.white,borderRadius:18,boxShadow:"0 8px 32px #00000025",border:`1px solid ${C.border}`,zIndex:1000,overflow:"hidden",animation:"popIn 0.2s ease"}}>
          <div style={{padding:"14px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <p style={{fontWeight:700,fontSize:14}}>Notificaciones</p>
            <button onClick={()=>setOpen(false)} style={{background:"none",border:"none",cursor:"pointer",fontSize:16,color:C.textMid}}>✕</button>
          </div>
          {notifs.length===0?(
            <p style={{padding:20,color:C.textMid,fontSize:13,textAlign:"center"}}>Sin notificaciones 🎉</p>
          ):notifs.slice(0,10).map(n=>(
            <div key={n.id} style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,background:n.leida?C.white:C.accentLight+"60"}}>
              <p style={{fontWeight:600,fontSize:13}}>{n.titulo}</p>
              <p style={{color:C.textMid,fontSize:12,marginTop:2}}>{n.mensaje}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MENÚ MÁS (MÓVIL) ────────────────────────────────────────────────────────
function MenuMas({setTab,onCerrarSesion}){
  const opciones=[
    {id:"billeteras",label:"Billeteras",icon:"👛"},
    {id:"servicios", label:"Servicios",  icon:"🔔"},
    {id:"perfil",    label:"Mi Perfil",  icon:"👤"},
  ];
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12,padding:"8px 0"}}>
      <p style={{fontWeight:800,fontSize:20,paddingLeft:4}}>Más opciones</p>
      {opciones.map(o=>(
        <Card key={o.id} onClick={()=>setTab(o.id)} style={{padding:"16px 18px",display:"flex",alignItems:"center",gap:14}}>
          <span style={{fontSize:26}}>{o.icon}</span>
          <p style={{fontWeight:700,fontSize:16}}>{o.label}</p>
          <p style={{marginLeft:"auto",color:C.textLight,fontSize:20}}>›</p>
        </Card>
      ))}
      <button onClick={onCerrarSesion} style={{padding:"14px",borderRadius:16,border:`2px solid ${C.red}30`,background:C.redLight,color:C.red,fontFamily:"inherit",fontWeight:700,fontSize:15,cursor:"pointer"}}>🚪 Cerrar sesión</button>
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function PantallaLogin(){
  const[modo,setModo]=useState("login");
  const[email,setEmail]=useState("");
  const[pass,setPass]=useState("");
  const[nombre,setNombre]=useState("");
  const[error,setError]=useState("");
  const[loading,setLoading]=useState(false);
  const submit=async()=>{
    setError("");setLoading(true);
    if(modo==="login"){
      const{error}=await supabase.auth.signInWithPassword({email,password:pass});
      if(error)setError("Email o contraseña incorrectos.");
    }else{
      if(!nombre.trim()){setError("Ingresá tu nombre.");setLoading(false);return;}
      const{error}=await supabase.auth.signUp({email,password:pass,options:{data:{nombre}}});
      if(error)setError("Error al registrarse.");
      else setError("¡Cuenta creada! Ya podés iniciar sesión.");
    }
    setLoading(false);
  };
  return(
    <div style={{minHeight:"100vh",background:`linear-gradient(135deg,#EBF2FF 0%,#F4F6FB 50%,#F0FDF4 100%)`,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{width:"100%",maxWidth:420,animation:"fadeUp 0.4s ease"}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{width:80,height:80,borderRadius:24,background:`linear-gradient(135deg,${C.accent},#1250c0)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:38,margin:"0 auto 16px",boxShadow:`0 12px 32px ${C.accent}40`,animation:"float 3s ease infinite"}}>💰</div>
          <p style={{fontWeight:800,fontSize:30,color:C.text}}>Mis Finanzas</p>
          <p style={{color:C.textMid,fontSize:15,marginTop:6}}>Tu dinero, bajo control</p>
        </div>
        <Card style={{padding:28,boxShadow:"0 8px 40px #00000014"}}>
          <div style={{display:"flex",gap:4,marginBottom:24,background:C.bg,borderRadius:14,padding:4}}>
            {[["login","Iniciar sesión"],["registro","Registrarse"]].map(([val,label])=>(
              <button key={val} onClick={()=>{setModo(val);setError("");}}
                style={{flex:1,padding:"10px",borderRadius:10,border:"none",background:modo===val?C.white:"transparent",color:modo===val?C.accent:C.textMid,fontFamily:"inherit",fontWeight:700,fontSize:14,cursor:"pointer",boxShadow:modo===val?"0 2px 8px #00000012":"none",transition:"all 0.2s"}}>
                {label}
              </button>
            ))}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {modo==="registro"&&<input placeholder="Tu nombre" value={nombre} onChange={e=>setNombre(e.target.value)} style={{fontFamily:"inherit",fontSize:15,padding:"12px 14px",border:`2px solid ${C.border}`,borderRadius:14,background:C.white,color:C.text,width:"100%",outline:"none"}}/>}
            <input placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} style={{fontFamily:"inherit",fontSize:15,padding:"12px 14px",border:`2px solid ${C.border}`,borderRadius:14,background:C.white,color:C.text,width:"100%",outline:"none"}}/>
            <input placeholder="Contraseña" type="password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} style={{fontFamily:"inherit",fontSize:15,padding:"12px 14px",border:`2px solid ${C.border}`,borderRadius:14,background:C.white,color:C.text,width:"100%",outline:"none"}}/>
            {error&&<div style={{padding:"10px 14px",borderRadius:12,background:error.includes("creada")?C.greenLight:C.redLight}}><p style={{color:error.includes("creada")?C.green:C.red,fontSize:13,fontWeight:600}}>{error}</p></div>}
            <BtnPrimary onClick={submit} disabled={loading}>{loading?"Cargando...":modo==="login"?"Entrar →":"Crear cuenta →"}</BtnPrimary>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── TAB INICIO ───────────────────────────────────────────────────────────────
function TabInicio({transacciones,billeteras,balances,setBalances,userId,historial,isMobile,usdRate,espacios}){
  const[ocultar,setOcultar]=useState(false);
  const[periodo,setPeriodo]=useState("mensual");
  const[moneda,setMoneda]=useState("ARS");
  const[editObj,setEditObj]=useState(false);
  const[valObj,setValObj]=useState("");

  const now=new Date();
  const fechaTx=(t)=>{
    // Use fecha_custom if set, otherwise fecha. Add T12:00 to avoid timezone issues.
    const raw=t.fecha_custom||t.fecha||"";
    return raw.length===10?new Date(raw+"T12:00:00"):new Date(raw);
  };
  const todayStr=now.toISOString().slice(0,10);
  const filtrar=(txs)=>txs.filter(t=>{
    const d=fechaTx(t);
    const dStr=(t.fecha_custom||t.fecha||"").slice(0,10);
    if(periodo==="diario") return dStr===todayStr;
    if(periodo==="semanal"){const diff=(now-d)/86400000;return diff>=0&&diff<=7;}
    if(periodo==="mensual") return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();
    return d.getFullYear()===now.getFullYear();
  });

  const txF=filtrar(transacciones);
  const ingresos=txF.filter(t=>t.tipo==="ingreso").reduce((a,b)=>a+b.monto,0);
  const gastos=txF.filter(t=>t.tipo==="gasto").reduce((a,b)=>a+b.monto,0);
  const totalBill=billeteras.reduce((a,b)=>a+(parseFloat(b.saldo)||0),0);

  // Calcular aportes de espacios compartidos (ahorros suman, sueldos pagados restan)
  const aportesCompartidos=espacios.reduce((total,esp)=>{
    if(!esp.movimientos) return total;
    const sum=esp.movimientos.filter(m=>m.user_id===userId).reduce((a,b)=>a+b.monto,0);
    if(esp.tipo==="sueldo") return total-sum; // sueldo pagado por vos resta
    return total+sum;
  },0);

  const patrimonio=totalBill+(parseFloat(balances.inversiones)||0)-(parseFloat(balances.deudas)||0);
  const objPct=balances.objetivo>0?Math.min(Math.round((totalBill/balances.objetivo)*100),100):0;
  const ahorro=ingresos-gastos;
  const ahorroPct=ingresos>0?Math.round((ahorro/ingresos)*100):0;
  const fmtV=(n)=>moneda==="USD"?fmtUSD(n,usdRate):fmt(n);

  const guardarBalance=async(campo,valor)=>{
    const nuevo=parseFloat(valor);if(isNaN(nuevo))return;
    const nuevos={...balances,[campo]:nuevo};setBalances(nuevos);
    await supabase.from("balances").upsert({user_id:userId,...nuevos});
  };

  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <Card style={{background:`linear-gradient(135deg,${C.accent} 0%,#1250c0 100%)`,border:"none",boxShadow:`0 8px 32px ${C.accent}40`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
          <p style={{color:"#ffffffaa",fontSize:12,fontWeight:600,letterSpacing:1}}>PATRIMONIO TOTAL</p>
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>setMoneda(moneda==="ARS"?"USD":"ARS")}
              style={{padding:"4px 10px",borderRadius:8,border:"1px solid #ffffff40",background:"#ffffff20",color:"#fff",fontFamily:"inherit",fontWeight:700,fontSize:11,cursor:"pointer"}}>
              {moneda==="ARS"?"USD":"ARS"}
            </button>
            <button onClick={()=>setOcultar(!ocultar)}
              style={{width:28,height:28,borderRadius:8,border:"none",background:"#ffffff20",color:"#fff",cursor:"pointer",fontSize:14}}>
              {ocultar?"👁️":"🙈"}
            </button>
          </div>
        </div>
        <p style={{color:"#fff",fontSize:isMobile?34:46,fontWeight:800,lineHeight:1,filter:ocultar?"blur(12px)":"none",transition:"filter 0.3s"}}>
          {fmtV(patrimonio)}
        </p>
        {moneda==="USD"&&usdRate>0&&<p style={{color:"#ffffffaa",fontSize:11,marginTop:4}}>Cotización: {fmt(usdRate)}/USD</p>}
        <div style={{display:"flex",gap:4,marginTop:14,background:"#ffffff15",borderRadius:12,padding:3}}>
          {[["diario","Hoy"],["semanal","Semana"],["mensual","Mes"],["anual","Año"]].map(([v,l])=>(
            <button key={v} onClick={()=>setPeriodo(v)}
              style={{flex:1,padding:"6px 4px",borderRadius:9,border:"none",background:periodo===v?"#fff":"transparent",color:periodo===v?C.accent:"#ffffffbb",fontFamily:"inherit",fontWeight:700,fontSize:11,cursor:"pointer",transition:"all 0.2s"}}>
              {l}
            </button>
          ))}
        </div>
        <div style={{display:"flex",gap:24,marginTop:14,borderTop:"1px solid #ffffff30",paddingTop:12}}>
          <div><p style={{color:"#ffffffaa",fontSize:11}}>Ingresos</p><p style={{color:"#ccffcc",fontSize:17,fontWeight:800}}>{ocultar?"••••":fmtV(ingresos)}</p></div>
          <div><p style={{color:"#ffffffaa",fontSize:11}}>Gastos</p><p style={{color:"#ffcccc",fontSize:17,fontWeight:800}}>{ocultar?"••••":fmtV(gastos)}</p></div>
          <div><p style={{color:"#ffffffaa",fontSize:11}}>Ahorro</p><p style={{color:"#fff",fontSize:17,fontWeight:800}}>{ocultar?"••••":fmtV(ahorro)}</p></div>
        </div>
      </Card>

      {billeteras.length===0?(
        <Card style={{padding:16,background:C.goldLight,border:`1.5px solid ${C.gold}30`}}>
          <p style={{fontSize:14,fontWeight:600,color:C.gold}}>👛 No tenés billeteras cargadas</p>
          <p style={{fontSize:13,color:C.textMid,marginTop:4}}>Andá a <b>Más → Billeteras</b> y agregá tus cuentas para ver el patrimonio real.</p>
        </Card>
      ):(
        <>
          <p style={{fontWeight:700,fontSize:16}}>💰 Mis billeteras</p>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(3,1fr)",gap:10}}>
            {billeteras.map(b=>(
              <Card key={b.id} style={{padding:14}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><span style={{fontSize:20}}>{b.icono}</span><p style={{color:C.textMid,fontSize:12,fontWeight:600}}>{b.nombre}</p></div>
                <p style={{fontWeight:800,fontSize:18,color:C.accent}}>{ocultar?"••••":fmt(b.saldo)}</p>
              </Card>
            ))}
          </div>
        </>
      )}

      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <p style={{fontWeight:700,fontSize:15}}>🎯 Objetivo de ahorro</p>
          <p style={{fontWeight:800,fontSize:17,color:C.green}}>{objPct}%</p>
        </div>
        <Barra pct={objPct} color={C.green}/>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:10,flexWrap:"wrap",gap:4}}>
          <p style={{color:C.textMid,fontSize:12}}>Ahorrado: <b>{fmt(totalBill)}</b></p>
          <p style={{color:C.textMid,fontSize:12}}>Meta: <b onClick={()=>{setEditObj(true);setValObj(balances.objetivo||"");}} style={{color:C.accent,cursor:"pointer"}}>{fmt(balances.objetivo||0)} ✏️</b></p>
        </div>
        {editObj&&(
          <div style={{display:"flex",gap:6,marginTop:10}}>
            <input type="number" value={valObj} onChange={e=>setValObj(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){guardarBalance("objetivo",valObj);setEditObj(false);}}} placeholder="Objetivo" style={{flex:1,fontFamily:"inherit",fontSize:15,padding:"10px 12px",border:`2px solid ${C.accent}`,borderRadius:12,outline:"none"}}/>
            <button onClick={()=>{guardarBalance("objetivo",valObj);setEditObj(false);}} style={{background:C.accent,color:"#fff",border:"none",borderRadius:10,padding:"0 14px",cursor:"pointer",fontWeight:700}}>✓</button>
          </div>
        )}
      </Card>

      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)",gap:10}}>
        {[
          {label:"Ahorrás",val:fmtV(ahorro),sub:`${ahorroPct}% del ingreso`,color:C.green},
          {label:"Total ingresos",val:fmtV(ingresos),sub:periodo==="diario"?"hoy":periodo==="semanal"?"esta semana":periodo==="mensual"?"este mes":"este año",color:C.accent},
          {label:"Deudas",val:fmtV(balances.deudas||0),sub:"pendiente",color:C.red},
          {label:"Inversiones",val:fmtV(balances.inversiones||0),sub:"total",color:C.purple},
        ].map((s,i)=>(
          <Card key={i} style={{textAlign:"center",padding:14}}>
            <p style={{color:C.textMid,fontSize:12,marginBottom:6}}>{s.label}</p>
            <p style={{fontSize:17,fontWeight:800,color:s.color}}>{ocultar?"••••":s.val}</p>
            <p style={{color:C.textMid,fontSize:11,marginTop:4}}>{s.sub}</p>
          </Card>
        ))}
      </div>

      {/* Detalle por dia cuando se selecciona Hoy */}
      {periodo==="diario"&&(
        <Card>
          <p style={{fontWeight:700,fontSize:15,marginBottom:14}}>📅 Detalle de hoy — {now.toLocaleDateString("es-AR",{weekday:"long",day:"numeric",month:"long"})}</p>
          {txF.length===0?(
            <p style={{color:C.textMid,fontSize:13,textAlign:"center",padding:16}}>Sin movimientos hoy</p>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {txF.map(t=>(
                <div key={t.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:14,background:t.tipo==="ingreso"?C.greenLight:C.redLight}}>
                  <span style={{fontSize:20}}>{CATEGORIAS[t.cat]?.icono||"📦"}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontWeight:600,fontSize:13,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t.descripcion}</p>
                    <p style={{fontSize:11,color:C.textMid}}>{CATEGORIAS[t.cat]?.label||t.cat}</p>
                  </div>
                  <p style={{fontWeight:800,fontSize:15,color:t.tipo==="ingreso"?C.green:C.red,flexShrink:0}}>
                    {t.tipo==="ingreso"?"+":"-"}{fmt(t.monto)}
                  </p>
                </div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",marginTop:8,paddingTop:10,borderTop:`1px solid ${C.border}`}}>
                <p style={{fontSize:13,color:C.textMid}}>Ingresos: <b style={{color:C.green}}>{fmt(ingresos)}</b></p>
                <p style={{fontSize:13,color:C.textMid}}>Gastos: <b style={{color:C.red}}>{fmt(gastos)}</b></p>
                <p style={{fontSize:13,color:C.textMid}}>Neto: <b style={{color:ahorro>=0?C.green:C.red}}>{ahorro>=0?"+":""}{fmt(ahorro)}</b></p>
              </div>
            </div>
          )}
        </Card>
      )}

      {historial.length>0&&(
        <>
          <p style={{fontWeight:700,fontSize:16}}>📊 Historial mensual</p>
          <Card><BarChartInteractivo items={historial.slice(0,6).reverse().map(h=>({val:h.ahorro,label:h.mes?.slice(0,3)||""}))} /></Card>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr 1fr",gap:10}}>
            {historial.map((h,i)=>(
              <Card key={i} style={{padding:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <p style={{fontWeight:700,fontSize:13,textTransform:"capitalize"}}>{h.mes}</p>
                  <p style={{fontSize:12,color:h.ahorro>=0?C.green:C.red,fontWeight:700}}>{h.ahorro>=0?"+":""}{fmt(h.ahorro)}</p>
                </div>
                <p style={{fontSize:11,color:C.textMid}}>💚 Ingresos: <b style={{color:C.green}}>{fmt(h.ingresos)}</b></p>
                <p style={{fontSize:11,color:C.textMid,marginTop:3}}>❤️ Gastos: <b style={{color:C.red}}>{fmt(h.gastos)}</b></p>
                {h.patrimonio>0&&<p style={{fontSize:11,color:C.textMid,marginTop:3}}>💙 Patrimonio cierre: <b style={{color:C.accent}}>{fmt(h.patrimonio)}</b></p>}
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── TAB MOVIMIENTOS ──────────────────────────────────────────────────────────
function TabMovimientos({transacciones,setTransacciones,billeteras,setBilleteras,isMobile}){
  const[filtro,setFiltro]=useState("todos");
  const[grafico,setGrafico]=useState("torta");
  const[verGraf,setVerGraf]=useState(false);
  const[editando,setEditando]=useState(null);
  const[editData,setEditData]=useState({});

  const lista=transacciones.filter(t=>filtro==="todos"||t.tipo===filtro);
  const gastosCat={};
  transacciones.filter(t=>t.tipo==="gasto").forEach(t=>{gastosCat[t.cat]=(gastosCat[t.cat]||0)+t.monto;});
  const totalG=Object.values(gastosCat).reduce((a,b)=>a+b,0);
  const donutData=Object.entries(gastosCat).map(([cat,val])=>({val,color:CATEGORIAS[cat]?.color||C.textLight,label:CATEGORIAS[cat]?.label||cat}));
  const billMap={};billeteras.forEach(b=>{billMap[b.id]=b;});

  const guardarEdicion=async()=>{
    if(!editando||!editData.descripcion||!editData.monto)return;
    await supabase.from("transacciones").update({descripcion:editData.descripcion,monto:parseFloat(editData.monto),cat:editData.cat,tipo:editData.tipo,fecha_custom:editData.fecha_custom||editData.fecha}).eq("id",editando);
    setTransacciones(prev=>prev.map(t=>t.id===editando?{...t,...editData,monto:parseFloat(editData.monto)}:t));
    setEditando(null);
  };

  const eliminarTx=async(t)=>{
    if(!window.confirm(`¿Eliminás "${t.descripcion}"?`))return;
    if(t.billetera_id){
      const bw=billeteras.find(b=>b.id===t.billetera_id);
      if(bw){const ns=t.tipo==="ingreso"?bw.saldo-t.monto:bw.saldo+t.monto;await supabase.from("billeteras").update({saldo:ns}).eq("id",bw.id);setBilleteras(prev=>prev.map(b=>b.id===bw.id?{...b,saldo:ns}:b));}
    }
    await supabase.from("transacciones").delete().eq("id",t.id);
    setTransacciones(prev=>prev.filter(x=>x.id!==t.id));
  };

  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {Object.keys(gastosCat).length>0&&(
        <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <p style={{fontWeight:700,fontSize:16}}>Distribución de gastos</p>
            <div style={{display:"flex",gap:6}}>
              {[["torta","🥧"],["barras","📊"]].map(([v,e])=>(
                <button key={v} onClick={()=>{setGrafico(v);setVerGraf(true);}}
                  style={{width:36,height:36,borderRadius:10,border:`2px solid ${grafico===v&&verGraf?C.accent:C.border}`,background:grafico===v&&verGraf?C.accentLight:C.white,cursor:"pointer",fontSize:16}}>
                  {e}
                </button>
              ))}
              <button onClick={()=>setVerGraf(!verGraf)}
                style={{padding:"0 12px",height:36,borderRadius:10,border:`2px solid ${C.border}`,background:C.white,color:C.textMid,fontFamily:"inherit",fontWeight:600,fontSize:12,cursor:"pointer"}}>
                {verGraf?"Ocultar":"Ver"}
              </button>
            </div>
          </div>
          {verGraf&&(
            <Card style={{animation:"fadeUp 0.3s ease"}}>
              {grafico==="torta"?(
                <div style={{display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
                  <DonutChart data={donutData} size={isMobile?140:180}/>
                  <div style={{flex:1,minWidth:140,display:"flex",flexDirection:"column",gap:8}}>
                    {Object.entries(gastosCat).sort((a,b)=>b[1]-a[1]).map(([cat,val])=>(
                      <div key={cat} style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{width:10,height:10,borderRadius:"50%",background:CATEGORIAS[cat]?.color||C.textLight,flexShrink:0}}/>
                        <p style={{fontSize:12,color:C.textMid,flex:1}}>{CATEGORIAS[cat]?.label||cat}</p>
                        <p style={{fontSize:12,fontWeight:700}}>{Math.round((val/totalG)*100)}%</p>
                        <p style={{fontSize:11,color:C.textMid}}>{fmt(val)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ):(
                <BarChartInteractivo items={Object.entries(gastosCat).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([cat,val])=>({val,label:CATEGORIAS[cat]?.icono||"📦",color:CATEGORIAS[cat]?.color}))} maxH={100}/>
              )}
            </Card>
          )}
          <div style={{display:"grid",gridTemplateColumns:isMobile?"repeat(3,1fr)":"repeat(5,1fr)",gap:10}}>
            {Object.entries(gastosCat).sort((a,b)=>b[1]-a[1]).map(([cat,tot])=>(
              <Card key={cat} style={{padding:12,textAlign:"center"}}>
                <p style={{fontSize:22}}>{CATEGORIAS[cat]?.icono||"📦"}</p>
                <p style={{fontSize:11,color:C.textMid,fontWeight:600,marginTop:4}}>{CATEGORIAS[cat]?.label||cat}</p>
                <p style={{fontSize:13,fontWeight:800,color:CATEGORIAS[cat]?.color||C.text,marginTop:4}}>{fmt(tot)}</p>
              </Card>
            ))}
          </div>
        </>
      )}

      <div style={{display:"flex",gap:8}}>
        {[["todos","Todos"],["gasto","Gastos"],["ingreso","Ingresos"]].map(([val,label])=>(
          <button key={val} onClick={()=>setFiltro(val)}
            style={{flex:1,padding:"10px 4px",borderRadius:12,border:`2px solid ${filtro===val?C.accent:C.border}`,background:filtro===val?C.accentLight:C.white,color:filtro===val?C.accent:C.textMid,fontFamily:"inherit",fontWeight:700,fontSize:13,cursor:"pointer"}}>
            {label}
          </button>
        ))}
      </div>

      {lista.length===0?(
        <Card style={{textAlign:"center",padding:40}}>
          <p style={{fontSize:36,marginBottom:12}}>📭</p>
          <p style={{fontWeight:700,fontSize:15}}>Sin movimientos todavía</p>
          <p style={{color:C.textMid,fontSize:13,marginTop:6}}>Tocá el + para agregar uno</p>
        </Card>
      ):(
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:10}}>
          {lista.map(t=>{
            const bw=t.billetera_id?billMap[t.billetera_id]:null;
            return(
              <Card key={t.id} style={{padding:"12px 14px"}}>
                {editando===t.id?(
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    <input value={editData.descripcion||""} onChange={e=>setEditData({...editData,descripcion:e.target.value})} placeholder="Descripción" style={{fontFamily:"inherit",fontSize:14,padding:"10px 12px",border:`2px solid ${C.border}`,borderRadius:12,outline:"none",width:"100%"}}/>
                    <input type="number" value={editData.monto||""} onChange={e=>setEditData({...editData,monto:e.target.value})} placeholder="Monto" style={{fontFamily:"inherit",fontSize:14,padding:"10px 12px",border:`2px solid ${C.border}`,borderRadius:12,outline:"none",width:"100%"}}/>
                    <input type="date" value={editData.fecha_custom||editData.fecha||""} onChange={e=>setEditData({...editData,fecha_custom:e.target.value})} style={{fontFamily:"inherit",fontSize:14,padding:"10px 12px",border:`2px solid ${C.border}`,borderRadius:12,outline:"none",width:"100%",textAlign:"center"}}/>
                    <select value={editData.cat||"otro"} onChange={e=>setEditData({...editData,cat:e.target.value})} style={{fontFamily:"inherit",fontSize:14,padding:"10px 12px",border:`2px solid ${C.border}`,borderRadius:12,outline:"none",width:"100%",background:C.white}}>
                      {Object.entries(CATEGORIAS).map(([k,v])=><option key={k} value={k}>{v.icono} {v.label}</option>)}
                    </select>
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={()=>setEditando(null)} style={{flex:1,padding:"10px",borderRadius:12,border:`2px solid ${C.border}`,background:C.white,fontFamily:"inherit",fontWeight:700,fontSize:13,cursor:"pointer",color:C.textMid}}>Cancelar</button>
                      <BtnPrimary onClick={guardarEdicion} style={{flex:2,padding:"10px",fontSize:13}}>Guardar</BtnPrimary>
                    </div>
                  </div>
                ):(
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:42,height:42,borderRadius:12,background:(CATEGORIAS[t.cat]?.color||C.accent)+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{CATEGORIAS[t.cat]?.icono||"📦"}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontWeight:700,fontSize:14,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t.descripcion}</p>
                      <p style={{color:C.textLight,fontSize:11,marginTop:2}}>{t.fecha_custom||t.fecha}{bw&&<span style={{marginLeft:6}}>{bw.icono} {bw.nombre}</span>}{t.recurrente&&" · 🔄"}</p>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
                      <p style={{fontWeight:800,fontSize:14,color:t.tipo==="ingreso"?C.green:C.red}}>{t.tipo==="ingreso"?"+":"-"}{fmt(t.monto)}</p>
                      <div style={{display:"flex",gap:6}}>
                        <button onClick={()=>{setEditando(t.id);setEditData({...t});}} style={{fontSize:11,color:C.accent,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>✏️</button>
                        <button onClick={()=>eliminarTx(t)} style={{fontSize:11,color:C.textLight,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>🗑️</button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── META CARD ────────────────────────────────────────────────────────────────
function MetaCard({meta,ahorrando,onAbonar,onEliminar,onEditar}){
  const[abonar,setAbonar]=useState("");
  const[showAbonar,setShowAbonar]=useState(false);
  const pct=meta.objetivo>0?Math.min(Math.round((meta.actual/meta.objetivo)*100),100):0;
  const falta=Math.max(0,meta.objetivo-meta.actual);
  const meses=ahorrando>0&&falta>0?Math.ceil(falta/ahorrando):"—";
  const dias=meta.fecha_limite?Math.ceil((new Date(meta.fecha_limite)-new Date())/86400000):null;
  const urgente=dias!==null&&dias<=7&&dias>=0;
  const vencido=dias!==null&&dias<0;
  return(
    <Card>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
        <div style={{width:48,height:48,borderRadius:14,background:meta.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>{meta.icono}</div>
        <div style={{flex:1,minWidth:0}}>
          <p style={{fontWeight:700,fontSize:15}}>{meta.nombre}</p>
          <p style={{color:C.textMid,fontSize:12,marginTop:2,textTransform:"capitalize"}}>{meta.tipo} · ~{meses} meses</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
          <p style={{fontSize:22,fontWeight:800,color:meta.color}}>{pct}%</p>
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>onEditar(meta)} style={{fontSize:11,color:C.accent,background:"none",border:"none",cursor:"pointer"}}>✏️</button>
            <button onClick={()=>onEliminar(meta.id)} style={{fontSize:11,color:C.textLight,background:"none",border:"none",cursor:"pointer"}}>🗑️</button>
          </div>
        </div>
      </div>
      <Barra pct={pct} color={meta.color}/>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:10,flexWrap:"wrap",gap:4}}>
        <p style={{color:C.textMid,fontSize:12}}>Abonado: <b>{fmt(meta.actual)}</b></p>
        <p style={{color:C.textMid,fontSize:12}}>Falta: <b style={{color:meta.color}}>{fmt(falta)}</b></p>
      </div>
      {meta.cuota_mensual>0&&<p style={{color:C.textMid,fontSize:12,marginTop:4}}>Cuota mensual: <b>{fmt(meta.cuota_mensual)}</b></p>}
      {dias!==null&&(
        <div style={{marginTop:8,padding:"8px 12px",borderRadius:10,background:vencido?C.redLight:urgente?C.goldLight:C.greenLight,display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:14}}>{vencido?"❗":urgente?"⚠️":"📅"}</span>
          <p style={{fontSize:12,fontWeight:600,color:vencido?C.red:urgente?C.gold:C.green}}>
            {vencido?`Venció hace ${Math.abs(dias)} días`:dias===0?"¡Vence hoy!":`Faltan ${dias} días`}
          </p>
        </div>
      )}
      {pct>=100?(
        <p style={{color:C.green,fontWeight:700,marginTop:10,fontSize:14}}>🎉 ¡Meta cumplida!</p>
      ):showAbonar?(
        <div style={{display:"flex",gap:8,marginTop:10}}>
          <input autoFocus type="number" value={abonar} onChange={e=>setAbonar(e.target.value)} placeholder="Monto ($)" onKeyDown={e=>{if(e.key==="Enter"){onAbonar(meta,abonar);setAbonar("");setShowAbonar(false);}}} style={{flex:1,fontFamily:"inherit",fontSize:14,padding:"10px 12px",border:`2px solid ${C.accent}`,borderRadius:12,outline:"none"}}/>
          <button onClick={()=>{onAbonar(meta,abonar);setAbonar("");setShowAbonar(false);}} style={{background:meta.color,color:"#fff",border:"none",borderRadius:10,padding:"0 14px",cursor:"pointer",fontWeight:700}}>✓</button>
          <button onClick={()=>setShowAbonar(false)} style={{background:C.bg,border:"none",borderRadius:10,padding:"0 12px",cursor:"pointer",color:C.textMid}}>✕</button>
        </div>
      ):(
        <button onClick={()=>setShowAbonar(true)} style={{marginTop:10,padding:"9px",borderRadius:12,border:`2px solid ${meta.color}40`,background:meta.color+"10",color:meta.color,fontFamily:"inherit",fontWeight:700,fontSize:13,cursor:"pointer",width:"100%"}}>
          {meta.tipo==="deuda"?"💳 Registrar pago":"💰 Agregar ahorro"}
        </button>
      )}
    </Card>
  );
}

// ─── TAB METAS ────────────────────────────────────────────────────────────────
function TabMetas({userId,transacciones,billeteras,balances,isMobile}){
  const[metas,setMetas]=useState([]);
  const[loading,setLoading]=useState(true);
  const[modalNueva,setModalNueva]=useState(false);
  const[editMeta,setEditMeta]=useState(null);
  const FORM_DEFAULT={nombre:"",tipo:"ahorro",objetivo:0,cuota_mensual:0,fecha_limite:"",icono:"🎯",color:C.accent};
  const[form,setForm]=useState(FORM_DEFAULT);

  const cargar=useCallback(async()=>{
    setLoading(true);
    const{data}=await supabase.from("metas").select("*").eq("user_id",userId).order("created_at");
    setMetas(data||[]);setLoading(false);
  },[userId]);

  useEffect(()=>{cargar();},[cargar]);

  const ingresos=transacciones.filter(t=>t.tipo==="ingreso").reduce((a,b)=>a+b.monto,0);
  const gastos=transacciones.filter(t=>t.tipo==="gasto").reduce((a,b)=>a+b.monto,0);
  const ahorrando=ingresos-gastos;

  const crearOMeta=async()=>{
    if(!form.nombre.trim())return;
    if(editMeta){
      await supabase.from("metas").update({...form,objetivo:parseFloat(form.objetivo)||0,cuota_mensual:parseFloat(form.cuota_mensual)||0}).eq("id",editMeta.id);
      setMetas(prev=>prev.map(m=>m.id===editMeta.id?{...m,...form,objetivo:parseFloat(form.objetivo)||0,cuota_mensual:parseFloat(form.cuota_mensual)||0}:m));
    }else{
      const{data}=await supabase.from("metas").insert({user_id:userId,...form,objetivo:parseFloat(form.objetivo)||0,cuota_mensual:parseFloat(form.cuota_mensual)||0}).select().single();
      if(data)setMetas(prev=>[...prev,data]);
    }
    setModalNueva(false);setEditMeta(null);setForm(FORM_DEFAULT);
  };

  const abonarMeta=async(meta,monto)=>{
    const nuevo=Math.min(meta.actual+(parseFloat(monto)||0),meta.objetivo);
    await supabase.from("metas").update({actual:nuevo}).eq("id",meta.id);
    setMetas(prev=>prev.map(m=>m.id===meta.id?{...m,actual:nuevo}:m));
  };

  const eliminarMeta=async(id)=>{
    if(!window.confirm("¿Eliminás esta meta?"))return;
    await supabase.from("metas").delete().eq("id",id);
    setMetas(prev=>prev.filter(m=>m.id!==id));
  };

  const abrirEditar=(meta)=>{
    setEditMeta(meta);
    setForm({nombre:meta.nombre,tipo:meta.tipo,objetivo:meta.objetivo,cuota_mensual:meta.cuota_mensual||0,fecha_limite:meta.fecha_limite||"",icono:meta.icono,color:meta.color});
    setModalNueva(true);
  };

  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <p style={{fontWeight:800,fontSize:20}}>Mis Metas</p>
        <button onClick={()=>{setEditMeta(null);setForm(FORM_DEFAULT);setModalNueva(true);}} style={{padding:"10px 18px",borderRadius:12,border:"none",background:C.accent,color:"#fff",fontFamily:"inherit",fontWeight:700,fontSize:13,cursor:"pointer"}}>+ Nueva meta</button>
      </div>

      {loading?<p style={{color:C.textMid,textAlign:"center",padding:30}}>Cargando...</p>:
        metas.length===0?(
          <Card style={{textAlign:"center",padding:40}}>
            <p style={{fontSize:36,marginBottom:12}}>🎯</p>
            <p style={{fontWeight:700,fontSize:15}}>Sin metas todavía</p>
            <p style={{color:C.textMid,fontSize:13,marginTop:6}}>Creá una meta de ahorro o una deuda</p>
          </Card>
        ):(
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:14}}>
            {metas.map(meta=>(
              <MetaCard key={meta.id} meta={meta} ahorrando={ahorrando} onAbonar={abonarMeta} onEliminar={eliminarMeta} onEditar={abrirEditar}/>
            ))}
          </div>
        )
      }

      <Card style={{background:C.accentLight,border:`1.5px solid ${C.accent}30`}}>
        <p style={{fontWeight:700,fontSize:14,color:C.accent,marginBottom:8}}>💡 Capacidad de ahorro</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <p style={{fontSize:13}}>Ahorrás <b>{fmt(ahorrando)}</b>/mes</p>
          <p style={{fontSize:13}}>Anual: <b style={{color:C.accent}}>{fmt(ahorrando*12)}</b></p>
        </div>
      </Card>

      {modalNueva&&(
        <Modal title={editMeta?"✏️ Editar meta":"✨ Nueva meta"} onClose={()=>{setModalNueva(false);setEditMeta(null);setForm(FORM_DEFAULT);}}>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{display:"flex",gap:8}}>
              {[["ahorro","🐷 Ahorro"],["deuda","💳 Deuda"]].map(([v,l])=>(
                <button key={v} onClick={()=>setForm({...form,tipo:v})}
                  style={{flex:1,padding:"11px",border:`2px solid ${form.tipo===v?C.accent:C.border}`,borderRadius:14,background:form.tipo===v?C.accentLight:C.white,color:form.tipo===v?C.accent:C.textMid,fontFamily:"inherit",fontWeight:700,fontSize:14,cursor:"pointer"}}>
                  {l}
                </button>
              ))}
            </div>
            <input value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} placeholder={form.tipo==="ahorro"?"¿Para qué querés ahorrar?":"¿Qué deuda tenés?"} style={{fontFamily:"inherit",fontSize:15,padding:"12px 14px",border:`2px solid ${C.border}`,borderRadius:14,outline:"none",width:"100%"}}/>
            <input type="number" value={form.objetivo||""} onChange={e=>setForm({...form,objetivo:e.target.value})} placeholder="Monto total ($)" style={{fontFamily:"inherit",fontSize:15,padding:"12px 14px",border:`2px solid ${C.border}`,borderRadius:14,outline:"none",width:"100%"}}/>
            {form.tipo==="deuda"&&<input type="number" value={form.cuota_mensual||""} onChange={e=>setForm({...form,cuota_mensual:e.target.value})} placeholder="Cuota mensual ($)" style={{fontFamily:"inherit",fontSize:15,padding:"12px 14px",border:`2px solid ${C.border}`,borderRadius:14,outline:"none",width:"100%"}}/>}
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              <p style={{color:C.textMid,fontSize:12}}>📅 {form.tipo==="deuda"?"Fecha de vencimiento":"Fecha objetivo"} (opcional)</p>
              <input type="date" value={form.fecha_limite} onChange={e=>setForm({...form,fecha_limite:e.target.value})} style={{fontFamily:"inherit",fontSize:15,padding:"12px 14px",border:`2px solid ${C.border}`,borderRadius:14,outline:"none",width:"100%",textAlign:"center",background:C.white,color:C.text}}/>
            </div>
            <div>
              <p style={{color:C.textMid,fontSize:12,marginBottom:6}}>Ícono</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {ICONOS_META.map(ic=>(
                  <button key={ic} onClick={()=>setForm({...form,icono:ic})} style={{width:40,height:40,borderRadius:10,border:`2px solid ${form.icono===ic?C.accent:C.border}`,background:form.icono===ic?C.accentLight:C.white,fontSize:20,cursor:"pointer"}}>{ic}</button>
                ))}
              </div>
            </div>
            <div>
              <p style={{color:C.textMid,fontSize:12,marginBottom:6}}>Color</p>
              <div style={{display:"flex",gap:8}}>
                {COLORES_META.map(col=>(
                  <button key={col} onClick={()=>setForm({...form,color:col})} style={{width:32,height:32,borderRadius:"50%",background:col,border:`3px solid ${form.color===col?"#1E293B":col}`,cursor:"pointer"}}/>
                ))}
              </div>
            </div>
            <BtnPrimary onClick={crearOMeta} color={form.color}>{editMeta?"Guardar cambios":"Crear meta"}</BtnPrimary>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── TAB SERVICIOS ────────────────────────────────────────────────────────────
function TabServicios({userId,isMobile}){
  const[servicios,setServicios]=useState([]);
  const[loading,setLoading]=useState(true);
  const[modal,setModal]=useState(false);
  const[editServ,setEditServ]=useState(null);
  const FORM_DEFAULT={nombre:"",monto:0,dia_pago:1,icono:"📋",division:"",invitados:[]};
  const[form,setForm]=useState(FORM_DEFAULT);
  const[codigoInv,setCodigoInv]=useState("");

  const cargar=useCallback(async()=>{
    setLoading(true);
    const{data}=await supabase.from("servicios").select("*").eq("user_id",userId).order("dia_pago");
    setServicios(data||[]);setLoading(false);
  },[userId]);

  useEffect(()=>{cargar();},[cargar]);

  const crearOEditar=async()=>{
    if(!form.nombre.trim())return;
    if(editServ){
      await supabase.from("servicios").update({nombre:form.nombre,monto:parseFloat(form.monto)||0,dia_pago:parseInt(form.dia_pago)||1,icono:form.icono}).eq("id",editServ.id);
      setServicios(prev=>prev.map(s=>s.id===editServ.id?{...s,...form,monto:parseFloat(form.monto)||0,dia_pago:parseInt(form.dia_pago)||1}:s));
    }else{
      const{data}=await supabase.from("servicios").insert({user_id:userId,...form,monto:parseFloat(form.monto)||0,dia_pago:parseInt(form.dia_pago)||1}).select().single();
      if(data)setServicios(prev=>[...prev,data]);
    }
    setModal(false);setEditServ(null);setForm(FORM_DEFAULT);
  };

  const eliminar=async(id)=>{
    if(!window.confirm("¿Eliminás este servicio?"))return;
    await supabase.from("servicios").delete().eq("id",id);
    setServicios(prev=>prev.filter(s=>s.id!==id));
  };

  const abrirEditar=(s)=>{
    setEditServ(s);
    setForm({nombre:s.nombre,monto:s.monto,dia_pago:s.dia_pago,icono:s.icono,division:s.division||"",invitados:[]});
    setModal(true);
  };

  const hoyDia=new Date().getDate();
  const total=servicios.reduce((a,b)=>a+b.monto,0);

  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <p style={{fontWeight:800,fontSize:20}}>Servicios y recordatorios</p>
        <button onClick={()=>{setEditServ(null);setForm(FORM_DEFAULT);setModal(true);}} style={{padding:"10px 18px",borderRadius:12,border:"none",background:C.accent,color:"#fff",fontFamily:"inherit",fontWeight:700,fontSize:13,cursor:"pointer"}}>+ Nuevo</button>
      </div>
      {total>0&&(
        <Card style={{background:`linear-gradient(135deg,${C.red},#b91c1c)`,border:"none"}}>
          <p style={{color:"#ffffffaa",fontSize:12,fontWeight:600,marginBottom:6}}>TOTAL MENSUAL EN SERVICIOS</p>
          <p style={{color:"#fff",fontSize:32,fontWeight:800}}>{fmt(total)}</p>
        </Card>
      )}
      {loading?<p style={{color:C.textMid,textAlign:"center",padding:30}}>Cargando...</p>:
        servicios.length===0?(
          <Card style={{textAlign:"center",padding:40}}>
            <p style={{fontSize:36,marginBottom:12}}>🔔</p>
            <p style={{fontWeight:700,fontSize:15}}>Sin servicios todavía</p>
            <p style={{color:C.textMid,fontSize:13,marginTop:6}}>Agregá tus pagos fijos para recibir recordatorios</p>
          </Card>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {servicios.map(s=>{
              const diasHasta=s.dia_pago>=hoyDia?s.dia_pago-hoyDia:30-hoyDia+s.dia_pago;
              const col=diasHasta===0?C.red:diasHasta<=3?C.gold:C.green;
              return(
                <Card key={s.id} style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:14,borderLeft:`4px solid ${col}`}}>
                  <div style={{width:44,height:44,borderRadius:12,background:col+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{s.icono}</div>
                  <div style={{flex:1}}>
                    <p style={{fontWeight:700,fontSize:15}}>{s.nombre}</p>
                    <p style={{color:C.textMid,fontSize:12,marginTop:2}}>Día {s.dia_pago} de cada mes{s.division?" · "+s.division:""}</p>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <p style={{fontWeight:800,fontSize:16}}>{fmt(s.monto)}</p>
                    <p style={{fontSize:11,fontWeight:700,color:col,marginTop:2}}>{diasHasta===0?"¡Hoy!":diasHasta===1?"Mañana":`En ${diasHasta}d`}</p>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:4}}>
                    <button onClick={()=>abrirEditar(s)} style={{fontSize:13,color:C.accent,background:"none",border:"none",cursor:"pointer"}}>✏️</button>
                    <button onClick={()=>eliminar(s.id)} style={{fontSize:13,color:C.textLight,background:"none",border:"none",cursor:"pointer"}}>🗑️</button>
                  </div>
                </Card>
              );
            })}
          </div>
        )
      }
      {modal&&(
        <Modal title={editServ?"✏️ Editar servicio":"🔔 Nuevo servicio"} onClose={()=>{setModal(false);setEditServ(null);setForm(FORM_DEFAULT);}}>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:4}}>
              {["📋","💡","💧","📺","📱","🌐","🏋️","🏥","🎵","🚗","🏠","📦","🔥","❄️"].map(e=>(
                <button key={e} onClick={()=>setForm({...form,icono:e})} style={{width:40,height:40,borderRadius:10,border:`2px solid ${form.icono===e?C.accent:C.border}`,background:form.icono===e?C.accentLight:C.white,fontSize:20,cursor:"pointer"}}>{e}</button>
              ))}
            </div>
            <input value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} placeholder="Nombre del servicio" style={{fontFamily:"inherit",fontSize:15,padding:"12px 14px",border:`2px solid ${C.border}`,borderRadius:14,outline:"none",width:"100%"}}/>
            <input type="number" value={form.monto||""} onChange={e=>setForm({...form,monto:e.target.value})} placeholder="Monto mensual ($)" style={{fontFamily:"inherit",fontSize:15,padding:"12px 14px",border:`2px solid ${C.border}`,borderRadius:14,outline:"none",width:"100%"}}/>
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              <p style={{color:C.textMid,fontSize:12}}>Día del mes que vence:</p>
              <input type="number" min="1" max="31" value={form.dia_pago} onChange={e=>setForm({...form,dia_pago:e.target.value})} style={{fontFamily:"inherit",fontSize:15,padding:"12px 14px",border:`2px solid ${C.border}`,borderRadius:14,outline:"none",width:"100%",textAlign:"center",background:C.white,color:C.text}}/>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              <p style={{color:C.textMid,fontSize:12,fontWeight:600}}>🤝 ¿Compartís este gasto? (opcional)</p>
              <div style={{display:"flex",gap:8}}>
                {[["","Solo yo"],["mitad","Mitad c/u"],["turnos","Por turnos"]].map(([v,l])=>(
                  <button key={v} onClick={()=>setForm({...form,division:v})}
                    style={{flex:1,padding:"10px 4px",borderRadius:12,border:`2px solid ${form.division===v?C.accent:C.border}`,background:form.division===v?C.accentLight:C.white,color:form.division===v?C.accent:C.textMid,fontFamily:"inherit",fontWeight:700,fontSize:12,cursor:"pointer"}}>
                    {l}
                  </button>
                ))}
              </div>
              {form.division&&(
                <div style={{padding:12,borderRadius:12,background:C.accentLight,border:`1px solid ${C.accent}30`}}>
                  <p style={{fontSize:13,color:C.textMid}}>
                    {form.division==="mitad"?`Cada uno paga ${fmt((parseFloat(form.monto)||0)/2)}/mes`:"Un mes pagás vos, el siguiente la otra persona."}
                  </p>
                  <p style={{fontSize:12,color:C.textMid,marginTop:6}}>📲 Compartí el código de la app para que la otra persona se una y reciba notificaciones también.</p>
                </div>
              )}
            </div>
            <BtnPrimary onClick={crearOEditar}>{editServ?"Guardar cambios":"Agregar servicio"}</BtnPrimary>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── TAB BILLETERAS ───────────────────────────────────────────────────────────
function TabBilleteras({billeteras,setBilleteras,userId}){
  const[modal,setModal]=useState(false);
  const[editBill,setEditBill]=useState(null);
  const[form,setForm]=useState({nombre:"",icono:"💳",saldo:0});
  const total=billeteras.reduce((a,b)=>a+(b.saldo||0),0);
  const DEFAULTS=[{nombre:"Efectivo",icono:"💵"},{nombre:"Mercado Pago",icono:"💳"},{nombre:"Banco",icono:"🏦"},{nombre:"Uala",icono:"🟣"},{nombre:"Brubank",icono:"🔵"},{nombre:"Naranja X",icono:"🟠"}];

  const crearOEditar=async()=>{
    if(!form.nombre.trim())return;
    if(editBill){
      await supabase.from("billeteras").update({nombre:form.nombre,icono:form.icono,saldo:parseFloat(form.saldo)||0}).eq("id",editBill.id);
      setBilleteras(prev=>prev.map(b=>b.id===editBill.id?{...b,...form,saldo:parseFloat(form.saldo)||0}:b));
    }else{
      const{data}=await supabase.from("billeteras").insert({user_id:userId,...form,saldo:parseFloat(form.saldo)||0}).select().single();
      if(data)setBilleteras(prev=>[...prev,data]);
    }
    setModal(false);setEditBill(null);setForm({nombre:"",icono:"💳",saldo:0});
  };

  const eliminar=async(id)=>{
    if(!window.confirm("¿Eliminar esta billetera?"))return;
    await supabase.from("billeteras").delete().eq("id",id);
    setBilleteras(prev=>prev.filter(b=>b.id!==id));
  };

  const abrirEditar=(b)=>{
    setEditBill(b);setForm({nombre:b.nombre,icono:b.icono,saldo:b.saldo});setModal(true);
  };

  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <p style={{fontWeight:800,fontSize:20}}>Mis Billeteras</p>
        <button onClick={()=>{setEditBill(null);setForm({nombre:"",icono:"💳",saldo:0});setModal(true);}} style={{padding:"10px 18px",borderRadius:12,border:"none",background:C.accent,color:"#fff",fontFamily:"inherit",fontWeight:700,fontSize:13,cursor:"pointer"}}>+ Nueva</button>
      </div>
      <Card style={{background:`linear-gradient(135deg,${C.accent},#1250c0)`,border:"none"}}>
        <p style={{color:"#ffffffaa",fontSize:12,fontWeight:600,marginBottom:6}}>TOTAL EN BILLETERAS</p>
        <p style={{color:"#fff",fontSize:36,fontWeight:800}}>{fmt(total)}</p>
      </Card>
      {billeteras.length===0?(
        <Card style={{textAlign:"center",padding:36}}>
          <p style={{fontSize:36,marginBottom:12}}>👛</p>
          <p style={{fontWeight:700,fontSize:15,marginBottom:12}}>Agregá tus billeteras rápido:</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center"}}>
            {DEFAULTS.map((b,i)=>(
              <button key={i} onClick={async()=>{const{data}=await supabase.from("billeteras").insert({user_id:userId,nombre:b.nombre,icono:b.icono,saldo:0}).select().single();if(data)setBilleteras(prev=>[...prev,data]);}} style={{padding:"8px 14px",borderRadius:20,border:`1.5px solid ${C.border}`,background:C.white,fontFamily:"inherit",fontWeight:600,fontSize:13,cursor:"pointer"}}>{b.icono} {b.nombre}</button>
            ))}
          </div>
        </Card>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {billeteras.map(b=>(
            <Card key={b.id} style={{padding:"16px 18px",display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:46,height:46,borderRadius:14,background:C.accentLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{b.icono}</div>
              <div style={{flex:1}}><p style={{fontWeight:700,fontSize:15}}>{b.nombre}</p><p style={{color:C.textMid,fontSize:13}}>Saldo actual</p></div>
              <p style={{fontWeight:800,fontSize:18,color:C.accent}}>{fmt(b.saldo)}</p>
              <div style={{display:"flex",flexDirection:"column",gap:4}}>
                <button onClick={()=>abrirEditar(b)} style={{fontSize:13,color:C.accent,background:"none",border:"none",cursor:"pointer"}}>✏️</button>
                <button onClick={()=>eliminar(b.id)} style={{fontSize:13,color:C.textLight,background:"none",border:"none",cursor:"pointer"}}>🗑️</button>
              </div>
            </Card>
          ))}
        </div>
      )}
      {modal&&(
        <Modal title={editBill?"✏️ Editar billetera":"➕ Nueva Billetera"} onClose={()=>{setModal(false);setEditBill(null);}}>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {["💵","💳","🏦","🟣","🔵","🟠","💜","🟢","💰","🏧"].map(e=>(
                <button key={e} onClick={()=>setForm({...form,icono:e})} style={{width:44,height:44,borderRadius:12,border:`2px solid ${form.icono===e?C.accent:C.border}`,background:form.icono===e?C.accentLight:C.white,fontSize:22,cursor:"pointer"}}>{e}</button>
              ))}
            </div>
            <input value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} placeholder="Nombre" style={{fontFamily:"inherit",fontSize:15,padding:"12px 14px",border:`2px solid ${C.border}`,borderRadius:14,outline:"none",width:"100%"}}/>
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              <p style={{color:C.textMid,fontSize:12}}>Saldo actual ($):</p>
              <input type="number" value={form.saldo||""} onChange={e=>setForm({...form,saldo:e.target.value})} placeholder="0" style={{fontFamily:"inherit",fontSize:15,padding:"12px 14px",border:`2px solid ${C.border}`,borderRadius:14,outline:"none",width:"100%",textAlign:"center",background:C.white,color:C.text}}/>
            </div>
            <BtnPrimary onClick={crearOEditar}>{editBill?"Guardar cambios":"Crear billetera"}</BtnPrimary>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── DETALLE ESPACIO ──────────────────────────────────────────────────────────
function DetalleEspacio({espacio,userId,puedeEditar,onClose,isMobile,onUpdate}){
  const[movimientos,setMovimientos]=useState([]);
  const[miembros,setMiembros]=useState([]);
  const[miMiembro,setMiMiembro]=useState(null);
  const[loading,setLoading]=useState(true);
  const[desc,setDesc]=useState("");
  const[monto,setMonto]=useState("");
  const[fecha,setFecha]=useState(hoy());
  const[copiado,setCopiado]=useState(false);
  const[periodoVer,setPeriodoVer]=useState("todo");
  const[editMov,setEditMov]=useState(null);
  const[editMovData,setEditMovData]=useState({});
  const[editEspacio,setEditEspacio]=useState(false);
  const[editNombre,setEditNombre]=useState(espacio.nombre);
  const[editObj,setEditObj]=useState(espacio.objetivo||0);
  const[configBilletera,setConfigBilletera]=useState(false);
  const[billeteraDestId,setBilleteraDestId]=useState("");
  const[billeteraDestNombre,setBilleteraDestNombre]=useState("");
  const[billeteraDestIcono,setBilleteraDestIcono]=useState("💳");
  const[billeterasReceptor,setBilleterasReceptor]=useState([]);

  const cargarTodo=useCallback(async()=>{
    setLoading(true);
    const[{data:movs},{data:miemb}]=await Promise.all([
      supabase.from("espacio_movimientos").select("*").eq("espacio_id",espacio.id).order("fecha",{ascending:false}),
      supabase.from("espacio_miembros").select("*").eq("espacio_id",espacio.id),
    ]);
    setMovimientos(movs||[]);
    setMiembros(miemb||[]);
    const yo=(miemb||[]).find(m=>m.user_id===userId);
    setMiMiembro(yo||null);
    if(yo?.billetera_destino_nombre){
      setBilleteraDestNombre(yo.billetera_destino_nombre);
      setBilleteraDestIcono(yo.billetera_destino_icono||"💳");
      setBilleteraDestId(yo.billetera_destino_id||"");
    }
    // Cargar billeteras del usuario actual (para el receptor)
    const{data:myBills}=await supabase.from("billeteras").select("*").eq("user_id",userId).order("created_at");
    setBilleterasReceptor(myBills||[]);
    setLoading(false);
  },[espacio.id,userId]);

  useEffect(()=>{cargarTodo();},[cargarTodo]);

  const agregar=async()=>{
    if(!desc.trim()||!monto)return;
    const userMeta=await supabase.auth.getUser();
    const nombreU=userMeta.data?.user?.user_metadata?.nombre||userMeta.data?.user?.email?.split("@")[0]||"Vos";
    const montoN=parseFloat(monto);
    await supabase.from("espacio_movimientos").insert({
      espacio_id:espacio.id,user_id:userId,descripcion:desc,
      monto:montoN,tipo:"aporte",fecha,nombre_usuario:nombreU,es_ingreso_receptor:false,
    });

    // Si es sueldo, notificar al receptor para que actualice su billetera
    if(espacio.tipo==="sueldo"){
      // Buscar el miembro receptor (no creador)
      const receptor=miembros.find(m=>m.user_id!==userId&&m.rol==="miembro");
      if(receptor){
        // Crear notificación para el receptor
        await supabase.from("notificaciones").insert({
          user_id:receptor.user_id,
          titulo:"💼 Nuevo pago de sueldo",
          mensaje:`Recibiste ${fmt(montoN)} - "${desc}". ${receptor.billetera_destino_nombre?`Se agregó a tu ${receptor.billetera_destino_icono||"💳"} ${receptor.billetera_destino_nombre}`:"Configurá tu billetera de cobro en el espacio compartido."}`,
        });
        // Si el receptor tiene billetera configurada, actualizar su saldo por ID
        const billId=receptor.billetera_destino_id||null;
        if(billId){
          const{data:bwData}=await supabase.from("billeteras").select("*").eq("id",billId).single();
          if(bwData){
            // Sumar al saldo de la billetera del receptor
            await supabase.from("billeteras").update({saldo:bwData.saldo+montoN}).eq("id",billId);
            // Crear transacción de ingreso en la cuenta del receptor
            await supabase.from("transacciones").insert({
              user_id:receptor.user_id,
              descripcion:`Sueldo: ${desc}`,
              monto:montoN,
              tipo:"ingreso",
              cat:"trabajo",
              recurrente:false,
              fecha,
              fecha_custom:fecha,
              billetera_id:billId,
            });
          }
        }
      }
    }

    setDesc("");setMonto("");setFecha(hoy());
    cargarTodo();
    if(onUpdate)onUpdate();
  };

  const guardarBilleteraDestino=async()=>{
    if(!billeteraDestId)return;
    const bw=billeterasReceptor.find(b=>b.id===billeteraDestId);
    if(!bw)return;
    await supabase.from("espacio_miembros")
      .update({
        billetera_destino_nombre:bw.nombre,
        billetera_destino_icono:bw.icono,
        billetera_destino_id:bw.id,
      })
      .eq("espacio_id",espacio.id).eq("user_id",userId);
    setBilleteraDestNombre(bw.nombre);
    setBilleteraDestIcono(bw.icono);
    setMiMiembro(prev=>({...prev,billetera_destino_nombre:bw.nombre,billetera_destino_icono:bw.icono,billetera_destino_id:bw.id}));
    setConfigBilletera(false);
    if(onUpdate)onUpdate();
  };

  const procesarPagosPendientes=async(billId)=>{
    if(!billId)return;
    const{data:bwData}=await supabase.from("billeteras").select("*").eq("id",billId).single();
    if(!bwData)return;
    // Buscar pagos del espacio que NO tienen transaccion en la cuenta del receptor
    const{data:pagos}=await supabase.from("espacio_movimientos").select("*").eq("espacio_id",espacio.id);
    if(!pagos||pagos.length===0)return;
    // Buscar transacciones ya creadas para este espacio
    const{data:txExistentes}=await supabase.from("transacciones")
      .select("*").eq("user_id",userId).eq("cat","trabajo").like("descripcion","Sueldo:%");
    const descExistentes=new Set((txExistentes||[]).map(t=>t.descripcion));
    let totalSumado=0;
    for(const pago of pagos){
      const descKey=`Sueldo: ${pago.descripcion}`;
      if(!descExistentes.has(descKey)){
        // Este pago no fue procesado aun
        await supabase.from("transacciones").insert({
          user_id:userId,
          descripcion:descKey,
          monto:pago.monto,
          tipo:"ingreso",
          cat:"trabajo",
          recurrente:false,
          fecha:pago.fecha,
          fecha_custom:pago.fecha,
          billetera_id:billId,
        });
        totalSumado+=pago.monto;
      }
    }
    if(totalSumado>0){
      await supabase.from("billeteras").update({saldo:bwData.saldo+totalSumado}).eq("id",billId);
      alert(`✅ Se procesaron ${fmt(totalSumado)} de pagos pendientes. Ya aparecen en tu billetera y patrimonio.`);
      if(onUpdate)onUpdate();
    }else{
      alert("✅ Todos los pagos ya estaban procesados.");
    }
  };

  const guardarEditMov=async()=>{
    if(!editMov)return;
    await supabase.from("espacio_movimientos").update({descripcion:editMovData.descripcion,monto:parseFloat(editMovData.monto),fecha:editMovData.fecha}).eq("id",editMov);
    setMovimientos(prev=>prev.map(m=>m.id===editMov?{...m,...editMovData,monto:parseFloat(editMovData.monto)}:m));
    setEditMov(null);
  };

  const eliminarMov=async(id)=>{
    if(!window.confirm("¿Eliminás este movimiento?"))return;
    await supabase.from("espacio_movimientos").delete().eq("id",id);
    setMovimientos(prev=>prev.filter(m=>m.id!==id));
    if(onUpdate)onUpdate();
  };

  const guardarEspacio=async()=>{
    await supabase.from("espacios").update({nombre:editNombre,objetivo:parseFloat(editObj)||0}).eq("id",espacio.id);
    espacio.nombre=editNombre;espacio.objetivo=parseFloat(editObj)||0;
    setEditEspacio(false);if(onUpdate)onUpdate();
  };

  const eliminarEspacio=async()=>{
    if(!window.confirm("¿Eliminás este espacio? Se eliminarán todos los movimientos."))return;
    await supabase.from("espacio_movimientos").delete().eq("espacio_id",espacio.id);
    await supabase.from("espacio_miembros").delete().eq("espacio_id",espacio.id);
    await supabase.from("espacios").delete().eq("id",espacio.id);
    onClose();if(onUpdate)onUpdate();
  };

  const salirEspacio=async()=>{
    if(!window.confirm("¿Salís de este espacio?"))return;
    await supabase.from("espacio_miembros").delete().eq("espacio_id",espacio.id).eq("user_id",userId);
    onClose();if(onUpdate)onUpdate();
  };

  const copiarCodigo=()=>{navigator.clipboard.writeText(espacio.codigo).then(()=>{setCopiado(true);setTimeout(()=>setCopiado(false),2000);});};

  const filtrarMov=(movs)=>{
    const now=new Date();
    return movs.filter(m=>{
      const d=new Date(m.fecha);
      if(periodoVer==="semana")return (now-d)/86400000<=7;
      if(periodoVer==="mes")return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();
      if(periodoVer==="anio")return d.getFullYear()===now.getFullYear();
      return true;
    });
  };

  const movF=filtrarMov(movimientos);
  const total=movF.reduce((a,b)=>a+b.monto,0);
  const miTotal=movF.filter(m=>m.user_id===userId).reduce((a,b)=>a+b.monto,0);
  const otroTotal=total-miTotal;
  const objPct=espacio.objetivo>0?Math.min(Math.round((movimientos.reduce((a,b)=>a+b.monto,0)/espacio.objetivo)*100),100):0;
  const mesActual=new Date().toISOString().slice(0,7);
  const movsMes=movimientos.filter(m=>m.fecha?.slice(0,7)===mesActual);
  const totalMes=movsMes.reduce((a,b)=>a+b.monto,0);
  const esCreador=espacio.creado_por===userId;

  // Agrupar pagos por mes para sueldo
  const pagosPorMes={};
  movimientos.forEach(m=>{
    const mes=m.fecha?.slice(0,7)||"";
    if(!pagosPorMes[mes]) pagosPorMes[mes]={total:0,movs:[]};
    pagosPorMes[mes].total+=m.monto;
    pagosPorMes[mes].movs.push(m);
  });
  const mesesOrdenados=Object.keys(pagosPorMes).sort().reverse();

  // Para sueldo: totales por dia en el mes actual
  const pagosPorDia={};
  movsMes.forEach(m=>{
    const d=m.fecha;
    pagosPorDia[d]=(pagosPorDia[d]||0)+m.monto;
  });

  // Nombre legible de mes
  const nombreMes=(mesStr)=>{
    if(!mesStr) return "";
    const[y,mo]=mesStr.split("-");
    return new Date(parseInt(y),parseInt(mo)-1,1).toLocaleString("es-AR",{month:"long",year:"numeric"});
  };

  return(
    <div style={{position:"fixed",inset:0,background:C.bg,zIndex:300,overflowY:"auto"}}>
      <div style={{maxWidth:isMobile?"100%":900,margin:"0 auto",paddingBottom:40}}>
        {/* Header */}
        <div style={{background:C.white,borderBottom:`2px solid ${C.border}`,padding:"16px 20px",position:"sticky",top:0,zIndex:10,display:"flex",alignItems:"center",gap:14}}>
          <button onClick={onClose} style={{width:38,height:38,minWidth:38,borderRadius:12,background:C.bg,border:"none",cursor:"pointer",fontSize:20,display:"flex",alignItems:"center",justifyContent:"center"}}>←</button>
          <div style={{flex:1,minWidth:0}}>
            {editEspacio?(
              <input value={editNombre} onChange={e=>setEditNombre(e.target.value)} style={{fontFamily:"inherit",fontSize:16,fontWeight:800,border:`2px solid ${C.accent}`,borderRadius:10,padding:"4px 10px",outline:"none",width:"100%",background:C.white,color:C.text}}/>
            ):(
              <p style={{fontWeight:800,fontSize:17,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{espacio.nombre}</p>
            )}
            {!puedeEditar&&<p style={{color:C.gold,fontSize:11,fontWeight:700}}>👁️ Solo lectura</p>}
          </div>
          <div style={{display:"flex",gap:6,flexShrink:0}}>
            {esCreador&&(editEspacio?(
              <>
                <button onClick={guardarEspacio} style={{padding:"8px 12px",borderRadius:10,border:"none",background:C.green,color:"#fff",fontFamily:"inherit",fontWeight:700,fontSize:12,cursor:"pointer"}}>✓ Guardar</button>
                <button onClick={()=>setEditEspacio(false)} style={{padding:"8px 12px",borderRadius:10,border:`2px solid ${C.border}`,background:C.white,color:C.textMid,fontFamily:"inherit",fontWeight:700,fontSize:12,cursor:"pointer"}}>✕</button>
              </>
            ):(
              <button onClick={()=>setEditEspacio(true)} style={{padding:"8px 12px",borderRadius:10,border:`2px solid ${C.accent}`,background:C.accentLight,color:C.accent,fontFamily:"inherit",fontWeight:700,fontSize:12,cursor:"pointer"}}>✏️</button>
            ))}
            <button onClick={copiarCodigo}
              style={{padding:"9px 12px",borderRadius:12,border:`2px solid ${copiado?C.green:C.accent}`,background:copiado?C.greenLight:C.accentLight,color:copiado?C.green:C.accent,fontFamily:"inherit",fontWeight:700,fontSize:12,cursor:"pointer",transition:"all 0.2s"}}>
              {copiado?"✓":"📋"} {espacio.codigo}
            </button>
          </div>
        </div>

        <div style={{padding:"16px 20px",display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:16}}>
          {/* Columna izquierda */}
          <div style={{display:"flex",flexDirection:"column",gap:14}}>

            {/* Tarjeta resumen */}
            <Card style={{background:`linear-gradient(135deg,${espacio.tipo==="sueldo"?C.gold:C.accent},${espacio.tipo==="sueldo"?"#b45309":"#1250c0"})`,border:"none"}}>
              <p style={{color:"#ffffffaa",fontSize:11,fontWeight:600,marginBottom:6}}>{espacio.tipo==="sueldo"?"PAGADO ESTE MES":"TOTAL ACUMULADO"}</p>
              <p style={{color:"#fff",fontSize:36,fontWeight:800}}>{fmt(espacio.tipo==="sueldo"?totalMes:total)}</p>
              {espacio.tipo==="sueldo"&&(
                <p style={{color:"#ffffffbb",fontSize:13,marginTop:4}}>
                  {new Date().toLocaleString("es-AR",{month:"long",year:"numeric"})}
                </p>
              )}
              {espacio.objetivo>0&&espacio.tipo!=="sueldo"&&(
                <>
                  <p style={{color:"#ffffffbb",fontSize:13,marginTop:6}}>Objetivo: {fmt(espacio.objetivo)}</p>
                  <div style={{marginTop:10}}><Barra pct={objPct} color="#ffffff60"/><p style={{color:"#ffffffaa",fontSize:11,marginTop:4}}>{objPct}% del objetivo</p></div>
                </>
              )}
              {editEspacio&&espacio.tipo==="ahorro"&&(
                <div style={{marginTop:10}}>
                  <p style={{color:"#ffffffaa",fontSize:11,marginBottom:4}}>Editar objetivo:</p>
                  <input type="number" value={editObj} onChange={e=>setEditObj(e.target.value)} style={{fontFamily:"inherit",fontSize:14,padding:"8px 12px",border:"1px solid #ffffff40",borderRadius:10,background:"#ffffff20",color:"#fff",width:"100%",outline:"none"}}/>
                </div>
              )}
              <div style={{display:"flex",gap:0,marginTop:14,borderTop:"1px solid #ffffff30",paddingTop:12}}>
                <div style={{flex:1}}>
                  <p style={{color:"#ffffffaa",fontSize:11}}>{espacio.tipo==="sueldo"?"Total histórico":"Mi aporte"}</p>
                  <p style={{color:"#fff",fontSize:16,fontWeight:800}}>{fmt(espacio.tipo==="sueldo"?movimientos.reduce((a,b)=>a+b.monto,0):miTotal)}</p>
                </div>
                {espacio.tipo==="sueldo"&&(
                  <div style={{flex:1}}>
                    <p style={{color:"#ffffffaa",fontSize:11}}>Pagos este mes</p>
                    <p style={{color:"#fff",fontSize:16,fontWeight:800}}>{movsMes.length} pagos</p>
                  </div>
                )}
                {espacio.tipo!=="sueldo"&&(
                  <div style={{flex:1}}>
                    <p style={{color:"#ffffffaa",fontSize:11}}>Otro aporte</p>
                    <p style={{color:"#fff",fontSize:16,fontWeight:800}}>{fmt(otroTotal)}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Config billetera de cobro (para receptor de sueldo = no creador) */}
            {espacio.tipo==="sueldo"&&!esCreador&&(
              <Card style={{border:`1.5px solid ${C.gold}30`,background:C.goldLight}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <p style={{fontWeight:700,fontSize:14,color:C.gold}}>💳 Billetera de cobro</p>
                  <button onClick={()=>setConfigBilletera(!configBilletera)}
                    style={{padding:"6px 12px",borderRadius:10,border:`2px solid ${C.gold}`,background:C.white,color:C.gold,fontFamily:"inherit",fontWeight:700,fontSize:12,cursor:"pointer"}}>
                    {configBilletera?"✕ Cerrar":"⚙️ Configurar"}
                  </button>
                </div>
                {miMiembro?.billetera_destino_nombre?(
                  <div>
                    <p style={{fontSize:13,color:C.textMid}}>Tus pagos van a: <b style={{color:C.gold}}>{miMiembro.billetera_destino_icono} {miMiembro.billetera_destino_nombre}</b></p>
                    <button onClick={()=>procesarPagosPendientes(miMiembro.billetera_destino_id||"")}
                      style={{marginTop:10,padding:"10px 14px",borderRadius:12,border:`2px solid ${C.gold}`,background:C.white,color:C.gold,fontFamily:"inherit",fontWeight:700,fontSize:13,cursor:"pointer",width:"100%"}}>
                      🔄 Procesar pagos anteriores pendientes
                    </button>
                  </div>
                ):(
                  <p style={{fontSize:13,color:C.textMid}}>⚠️ Configurá dónde querés recibir tus pagos. Cuando el empleador registre un pago, se te sumará automáticamente.</p>
                )}
                {configBilletera&&(
                  <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:8}}>
                    {billeterasReceptor.length===0?(
                      <div style={{padding:10,borderRadius:12,background:C.redLight}}>
                        <p style={{fontSize:13,color:C.red,fontWeight:600}}>⚠️ No tenés billeteras creadas. Andá a Más → Billeteras y creá una primero.</p>
                      </div>
                    ):(
                      <>
                        <p style={{fontSize:12,color:C.textMid}}>Elegí en cuál billetera querés recibir tus pagos:</p>
                        <div style={{display:"flex",flexDirection:"column",gap:8}}>
                          {billeterasReceptor.map(b=>(
                            <button key={b.id} onClick={()=>setBilleteraDestId(b.id)}
                              style={{padding:"12px 16px",borderRadius:14,border:`2px solid ${billeteraDestId===b.id?C.gold:C.border}`,background:billeteraDestId===b.id?C.goldLight:C.white,fontFamily:"inherit",fontWeight:700,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",gap:10,textAlign:"left",transition:"all 0.15s",boxShadow:billeteraDestId===b.id?`0 0 0 3px ${C.gold}20`:"none"}}>
                              <span style={{fontSize:22}}>{b.icono}</span>
                              <div style={{flex:1}}>
                                <p style={{fontWeight:700,fontSize:14,color:billeteraDestId===b.id?C.gold:C.text}}>{b.nombre}</p>
                                <p style={{fontSize:12,color:C.textMid}}>Saldo actual: {fmt(b.saldo)}</p>
                              </div>
                              {billeteraDestId===b.id&&<span style={{fontSize:18,color:C.gold}}>✓</span>}
                            </button>
                          ))}
                        </div>
                        <button onClick={guardarBilleteraDestino} disabled={!billeteraDestId}
                          style={{padding:"12px",borderRadius:12,border:"none",background:billeteraDestId?C.gold:"#ccc",color:"#fff",fontFamily:"inherit",fontWeight:700,fontSize:14,cursor:billeteraDestId?"pointer":"not-allowed"}}>
                          Guardar billetera de cobro
                        </button>
                      </>
                    )}
                  </div>
                )}
              </Card>
            )}

            {/* Participantes */}
            {miembros.length>0&&(
              <Card>
                <p style={{fontWeight:700,fontSize:14,marginBottom:12}}>👥 Participantes</p>
                {miembros.map((m,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                    <div style={{width:36,height:36,borderRadius:"50%",background:m.user_id===userId?C.accentLight:C.goldLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>
                      {m.user_id===userId?"👤":"👥"}
                    </div>
                    <div style={{flex:1}}>
                      <p style={{fontWeight:600,fontSize:13}}>{m.user_id===userId?"Vos":(m.nombre_usuario||"Participante")}</p>
                      <p style={{color:C.textMid,fontSize:11}}>{m.rol==="creador"?espacio.tipo==="sueldo"?"Empleador":"Creador":"Miembro"} · {m.puede_editar!==false?"Puede editar":"Solo lectura"}</p>
                      {m.billetera_destino_nombre&&<p style={{color:C.gold,fontSize:11,marginTop:2}}>{m.billetera_destino_icono} Cobro en: {m.billetera_destino_nombre}</p>}
                    </div>
                    {m.user_id===userId&&<span style={{fontSize:10,color:C.accent,fontWeight:700,background:C.accentLight,padding:"2px 8px",borderRadius:20}}>Vos</span>}
                  </div>
                ))}
              </Card>
            )}

            {/* Formulario agregar (solo creador en sueldo) */}
            {esCreador&&(
              <Card>
                <p style={{fontWeight:700,fontSize:15,marginBottom:12}}>{espacio.tipo==="sueldo"?"💼 Registrar pago":"💰 Agregar aporte"}</p>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder={espacio.tipo==="sueldo"?"Ej: Pago semanal, Adelanto...":"Ej: Aporte mayo..."} style={{fontFamily:"inherit",fontSize:15,padding:"12px 14px",border:`2px solid ${C.border}`,borderRadius:14,outline:"none",width:"100%",background:C.white,color:C.text}}/>
                  <input type="number" value={monto} onChange={e=>setMonto(e.target.value)} placeholder="Monto ($)" style={{fontFamily:"inherit",fontSize:15,padding:"12px 14px",border:`2px solid ${C.border}`,borderRadius:14,outline:"none",width:"100%",background:C.white,color:C.text}}/>
                  <div style={{display:"flex",flexDirection:"column",gap:4}}>
                    <p style={{color:C.textMid,fontSize:12}}>📅 Fecha:</p>
                    <input type="date" value={fecha} onChange={e=>setFecha(e.target.value)} style={{fontFamily:"inherit",fontSize:15,padding:"12px 14px",border:`2px solid ${C.border}`,borderRadius:14,outline:"none",width:"100%",textAlign:"center",background:C.white,color:C.text}}/>
                  </div>
                  {espacio.tipo==="sueldo"&&(
                    <div style={{padding:10,borderRadius:12,background:C.goldLight,border:`1px solid ${C.gold}30`}}>
                      <p style={{fontSize:12,color:C.textMid}}>
                        {miembros.find(m=>m.user_id!==userId&&m.billetera_destino_nombre)
                          ?`✅ Al guardar, se sumará automáticamente a ${miembros.find(m=>m.user_id!==userId).billetera_destino_icono||"💳"} ${miembros.find(m=>m.user_id!==userId).billetera_destino_nombre} del receptor.`
                          :"⚠️ El receptor aún no configuró su billetera de cobro. Se le notificará igual."}
                      </p>
                    </div>
                  )}
                  <BtnPrimary onClick={agregar}>{espacio.tipo==="sueldo"?"Registrar pago 💼":"Guardar aporte 💰"}</BtnPrimary>
                </div>
              </Card>
            )}

            {!esCreador&&espacio.tipo!=="sueldo"&&(
              <Card style={{background:C.goldLight,border:`1.5px solid ${C.gold}30`}}>
                <p style={{fontWeight:600,fontSize:14,color:C.gold}}>👁️ Solo lectura</p>
                <p style={{color:C.textMid,fontSize:13,marginTop:6}}>Podés ver los movimientos pero no editarlos.</p>
              </Card>
            )}

            {/* Botones salir/eliminar */}
            <div style={{display:"flex",gap:8}}>
              {!esCreador&&<button onClick={salirEspacio} style={{flex:1,padding:"12px",borderRadius:14,border:`2px solid ${C.gold}30`,background:C.goldLight,color:C.gold,fontFamily:"inherit",fontWeight:700,fontSize:13,cursor:"pointer"}}>🚪 Salir del espacio</button>}
              {esCreador&&<button onClick={eliminarEspacio} style={{flex:1,padding:"12px",borderRadius:14,border:`2px solid ${C.red}30`,background:C.redLight,color:C.red,fontFamily:"inherit",fontWeight:700,fontSize:13,cursor:"pointer"}}>🗑️ Eliminar espacio</button>}
            </div>
          </div>

          {/* Columna derecha - historial */}
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <p style={{fontWeight:700,fontSize:16}}>Historial</p>
              <div style={{display:"flex",gap:4,background:C.bg,borderRadius:10,padding:3}}>
                {[["todo","Todo"],["mes","Mes"],["semana","Sem"],["anio","Año"]].map(([v,l])=>(
                  <button key={v} onClick={()=>setPeriodoVer(v)}
                    style={{padding:"5px 8px",borderRadius:7,border:"none",background:periodoVer===v?C.white:"transparent",color:periodoVer===v?C.accent:C.textMid,fontFamily:"inherit",fontWeight:700,fontSize:11,cursor:"pointer",transition:"all 0.2s"}}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Historial por mes (sueldo) */}
            {espacio.tipo==="sueldo"&&mesesOrdenados.length>0&&(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {mesesOrdenados.map(mes=>{
                  const dataMes=pagosPorMes[mes];
                  const esMesActual=mes===mesActual;
                  const pagosDia={};
                  dataMes.movs.forEach(m=>{pagosDia[m.fecha]=(pagosDia[m.fecha]||0)+m.monto;});
                  const[abierto,setAbierto]=useState(esMesActual);
                  return(
                    <Card key={mes} style={{padding:0,overflow:"hidden",border:esMesActual?`2px solid ${C.gold}`:undefined}}>
                      <button onClick={()=>setAbierto(!abierto)}
                        style={{width:"100%",padding:"14px 16px",background:esMesActual?C.goldLight:C.white,border:"none",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",fontFamily:"inherit"}}>
                        <div style={{textAlign:"left"}}>
                          <p style={{fontWeight:700,fontSize:14,color:esMesActual?C.gold:C.text,textTransform:"capitalize"}}>{esMesActual?"📅 Este mes — ":""}{nombreMes(mes)}</p>
                          <p style={{fontSize:12,color:C.textMid,marginTop:2}}>{dataMes.movs.length} pagos</p>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <p style={{fontWeight:800,fontSize:16,color:esMesActual?C.gold:C.text}}>{fmt(dataMes.total)}</p>
                          <p style={{fontSize:12,color:C.textMid}}>{abierto?"▲":"▼"}</p>
                        </div>
                      </button>
                      {abierto&&(
                        <div style={{padding:"0 16px 14px",display:"flex",flexDirection:"column",gap:6}}>
                          {Object.entries(pagosDia).sort().reverse().map(([d,v])=>(
                            <div key={d} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 10px",borderRadius:10,background:C.bg}}>
                              <p style={{fontSize:12,color:C.textMid}}>{new Date(d+"T12:00:00").toLocaleDateString("es-AR",{weekday:"long",day:"numeric",month:"short"})}</p>
                              <p style={{fontSize:13,fontWeight:700,color:C.gold}}>+{fmt(v)}</p>
                            </div>
                          ))}
                          <div style={{display:"flex",justifyContent:"space-between",paddingTop:8,borderTop:`1px solid ${C.border}`}}>
                            <p style={{fontSize:12,color:C.textMid,fontWeight:600}}>Total del mes:</p>
                            <p style={{fontSize:13,fontWeight:800,color:esMesActual?C.gold:C.text}}>{fmt(dataMes.total)}</p>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}

            {loading?<p style={{color:C.textMid,textAlign:"center",padding:20}}>Cargando...</p>:
              movF.length===0?<Card style={{textAlign:"center",padding:30}}><p style={{color:C.textMid}}>Sin movimientos en este período</p></Card>:
              movF.map(m=>(
                <Card key={m.id} style={{padding:"12px 14px",animation:"fadeUp 0.2s ease"}}>
                  {editMov===m.id?(
                    <div style={{display:"flex",flexDirection:"column",gap:8}}>
                      <input value={editMovData.descripcion||""} onChange={e=>setEditMovData({...editMovData,descripcion:e.target.value})} style={{fontFamily:"inherit",fontSize:14,padding:"8px 12px",border:`2px solid ${C.border}`,borderRadius:10,outline:"none",width:"100%",background:C.white,color:C.text}}/>
                      <input type="number" value={editMovData.monto||""} onChange={e=>setEditMovData({...editMovData,monto:e.target.value})} style={{fontFamily:"inherit",fontSize:14,padding:"8px 12px",border:`2px solid ${C.border}`,borderRadius:10,outline:"none",width:"100%",background:C.white,color:C.text}}/>
                      <input type="date" value={editMovData.fecha||""} onChange={e=>setEditMovData({...editMovData,fecha:e.target.value})} style={{fontFamily:"inherit",fontSize:14,padding:"8px 12px",border:`2px solid ${C.border}`,borderRadius:10,outline:"none",width:"100%",textAlign:"center",background:C.white,color:C.text}}/>
                      <div style={{display:"flex",gap:8}}>
                        <button onClick={()=>setEditMov(null)} style={{flex:1,padding:"8px",borderRadius:10,border:`2px solid ${C.border}`,background:C.white,fontFamily:"inherit",fontWeight:700,fontSize:12,cursor:"pointer",color:C.textMid}}>Cancelar</button>
                        <button onClick={guardarEditMov} style={{flex:2,padding:"8px",borderRadius:10,border:"none",background:C.accent,color:"#fff",fontFamily:"inherit",fontWeight:700,fontSize:12,cursor:"pointer"}}>Guardar</button>
                      </div>
                    </div>
                  ):(
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:38,height:38,borderRadius:10,background:m.user_id===userId?C.accentLight:C.goldLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>
                        {m.user_id===userId?"👤":"👥"}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{fontWeight:600,fontSize:13,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.descripcion}</p>
                        <p style={{color:C.textLight,fontSize:11,marginTop:2}}>
                          {new Date(m.fecha+"T12:00:00").toLocaleDateString("es-AR",{weekday:"short",day:"numeric",month:"short"})}
                          {" · "}{m.user_id===userId?"Vos":(m.nombre_usuario||"Otro")}
                        </p>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
                        <p style={{fontWeight:800,fontSize:14,color:C.green}}>+{fmt(m.monto)}</p>
                        {(m.user_id===userId||esCreador)&&(
                          <div style={{display:"flex",gap:6}}>
                            <button onClick={()=>{setEditMov(m.id);setEditMovData({descripcion:m.descripcion,monto:m.monto,fecha:m.fecha});}} style={{fontSize:11,color:C.accent,background:"none",border:"none",cursor:"pointer"}}>✏️</button>
                            <button onClick={()=>eliminarMov(m.id)} style={{fontSize:11,color:C.textLight,background:"none",border:"none",cursor:"pointer"}}>🗑️</button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}
// ─── TAB COMPARTIDO ───────────────────────────────────────────────────────────
function TabCompartido({userId,isMobile}){
  const[espacios,setEspacios]=useState([]);
  const[roles,setRoles]=useState({});
  const[loading,setLoading]=useState(true);
  const[modalNuevo,setModalNuevo]=useState(false);
  const[modalUnirse,setModalUnirse]=useState(false);
  const[detalle,setDetalle]=useState(null);
  const[form,setForm]=useState({nombre:"",tipo:"ahorro",objetivo:0});
  const[codigoUnirse,setCodigo]=useState("");
  const[msgUnirse,setMsg]=useState("");
  const[creando,setCreando]=useState(false);
  const[uniendose,setUniendose]=useState(false);

  const cargar=useCallback(async()=>{
    setLoading(true);
    try{
      const{data:miembros}=await supabase.from("espacio_miembros").select("espacio_id,puede_editar,rol").eq("user_id",userId);
      const ids=(miembros||[]).map(m=>m.espacio_id);
      const rolesMap={};
      (miembros||[]).forEach(m=>{rolesMap[m.espacio_id]={puede_editar:m.puede_editar!==false,rol:m.rol};});
      const{data:propios}=await supabase.from("espacios").select("*").eq("creado_por",userId);
      (propios||[]).forEach(e=>{rolesMap[e.id]={puede_editar:true,rol:"creador"};});
      let compartidos=[];
      if(ids.length>0){
        const{data}=await supabase.from("espacios").select("*").in("id",ids);
        compartidos=(data||[]).filter(c=>!(propios||[]).find(p=>p.id===c.id));
      }
      setEspacios([...(propios||[]),...compartidos]);
      setRoles(rolesMap);
    }catch(e){console.error(e);}
    setLoading(false);
  },[userId]);

  useEffect(()=>{cargar();},[cargar]);

  const crear=async()=>{
    if(!form.nombre.trim()||creando)return;
    setCreando(true);
    try{
      const codigo=Math.random().toString(36).substring(2,8).toUpperCase();
      const userMeta=await supabase.auth.getUser();
      const nombreU=userMeta.data?.user?.user_metadata?.nombre||userMeta.data?.user?.email?.split("@")[0]||"";
      const{data,error}=await supabase.from("espacios").insert({nombre:form.nombre,tipo:form.tipo,codigo,creado_por:userId,objetivo:parseFloat(form.objetivo)||0}).select().single();
      if(error){alert("Error: "+error.message);setCreando(false);return;}
      await supabase.from("espacio_miembros").insert({espacio_id:data.id,user_id:userId,rol:"creador",puede_editar:true,nombre_usuario:nombreU});
      setModalNuevo(false);setForm({nombre:"",tipo:"ahorro",objetivo:0});await cargar();
    }catch(e){alert("Error inesperado");}
    setCreando(false);
  };

  const unirse=async()=>{
    if(!codigoUnirse.trim()||uniendose)return;
    setUniendose(true);setMsg("");
    try{
      const cod=codigoUnirse.trim().toUpperCase();
      const{data:esp,error:errE}=await supabase.from("espacios").select("*").eq("codigo",cod).maybeSingle();
      if(errE||!esp){setMsg("Código no encontrado.");setUniendose(false);return;}
      const{data:ya}=await supabase.from("espacio_miembros").select("id").eq("espacio_id",esp.id).eq("user_id",userId).maybeSingle();
      if(ya){setMsg("Ya sos miembro.");setUniendose(false);return;}
      const puedeEditar=esp.tipo!=="sueldo";
      const userMeta=await supabase.auth.getUser();
      const nombreU=userMeta.data?.user?.user_metadata?.nombre||userMeta.data?.user?.email?.split("@")[0]||"";
      await supabase.from("espacio_miembros").insert({espacio_id:esp.id,user_id:userId,rol:"miembro",puede_editar:puedeEditar,nombre_usuario:nombreU});
      setModalUnirse(false);setCodigo("");setMsg("");await cargar();
    }catch(e){setMsg("Error inesperado.");}
    setUniendose(false);
  };

  const iconoTipo=(tipo)=>tipo==="sueldo"?"💼":tipo==="ahorro"?"🐷":"🤝";

  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <p style={{fontWeight:700,fontSize:17}}>Espacios Compartidos</p>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>{setMsg("");setCodigo("");setModalUnirse(true);}} style={{padding:"10px 14px",borderRadius:12,border:`2px solid ${C.accent}`,background:C.accentLight,color:C.accent,fontFamily:"inherit",fontWeight:700,fontSize:13,cursor:"pointer"}}>Unirse</button>
          <button onClick={()=>setModalNuevo(true)} style={{padding:"10px 14px",borderRadius:12,border:"none",background:C.accent,color:"#fff",fontFamily:"inherit",fontWeight:700,fontSize:13,cursor:"pointer"}}>+ Nuevo</button>
        </div>
      </div>

      {loading?<p style={{color:C.textMid,textAlign:"center",padding:40}}>Cargando...</p>:
        espacios.length===0?(
          <Card style={{textAlign:"center",padding:40}}>
            <p style={{fontSize:36,marginBottom:12}}>🤝</p>
            <p style={{fontWeight:700,fontSize:15}}>Sin espacios todavía</p>
            <p style={{color:C.textMid,fontSize:13,marginTop:6}}>Creá uno o unite con un código</p>
          </Card>
        ):(
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr 1fr",gap:12}}>
            {espacios.map(e=>{
              const rol=roles[e.id];
              return(
                <Card key={e.id} onClick={()=>setDetalle(e)}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:46,height:46,borderRadius:14,background:C.accentLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{iconoTipo(e.tipo)}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontWeight:700,fontSize:14,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{e.nombre}</p>
                      <p style={{color:C.textMid,fontSize:12,marginTop:2}}><b style={{color:C.accent}}>{e.codigo}</b>{rol&&!rol.puede_editar&&<span style={{marginLeft:6,color:C.gold,fontSize:10}}>👁️</span>}</p>
                    </div>
                    <p style={{color:C.textLight,fontSize:18}}>›</p>
                  </div>
                </Card>
              );
            })}
          </div>
        )
      }

      {modalNuevo&&(
        <Modal title="✨ Nuevo espacio compartido" onClose={()=>setModalNuevo(false)}>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <input value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} placeholder="Nombre (ej: Vacaciones 2026)" style={{fontFamily:"inherit",fontSize:15,padding:"12px 14px",border:`2px solid ${C.border}`,borderRadius:14,outline:"none",width:"100%"}}/>
            <select value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})} style={{fontFamily:"inherit",fontSize:15,padding:"12px 14px",border:`2px solid ${C.border}`,borderRadius:14,background:C.white,color:C.text,width:"100%",outline:"none"}}>
              <option value="ahorro">🐷 Ahorro compartido</option>
              <option value="sueldo">💼 Sueldo (vos pagás, otro cobra)</option>
              <option value="general">🤝 General</option>
            </select>
            {form.tipo==="sueldo"&&<div style={{padding:12,borderRadius:12,background:C.goldLight}}><p style={{fontSize:13,color:C.textMid}}>💡 El que se una solo podrá <b>ver</b> los pagos, no editarlos.</p></div>}
            {form.tipo==="ahorro"&&<input type="number" value={form.objetivo||""} onChange={e=>setForm({...form,objetivo:e.target.value})} placeholder="Objetivo de ahorro ($)" style={{fontFamily:"inherit",fontSize:15,padding:"12px 14px",border:`2px solid ${C.border}`,borderRadius:14,outline:"none",width:"100%"}}/>}
            <BtnPrimary onClick={crear} disabled={creando}>{creando?"Creando...":"Crear espacio 🚀"}</BtnPrimary>
          </div>
        </Modal>
      )}

      {modalUnirse&&(
        <Modal title="🔑 Unirse a un espacio" onClose={()=>setModalUnirse(false)}>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <p style={{color:C.textMid,fontSize:14}}>Ingresá el código que te compartieron:</p>
            <div style={{background:C.bg,borderRadius:16,padding:"16px"}}>
              <input value={codigoUnirse} onChange={e=>setCodigo(e.target.value.toUpperCase())} placeholder="ABC123" style={{fontFamily:"inherit",fontSize:26,fontWeight:800,padding:"12px 14px",border:`2px solid ${C.border}`,borderRadius:14,outline:"none",width:"100%",textAlign:"center",letterSpacing:8,textTransform:"uppercase"}}/>
            </div>
            {msgUnirse&&<div style={{padding:"10px 14px",borderRadius:12,background:C.redLight}}><p style={{color:C.red,fontSize:13,fontWeight:600}}>{msgUnirse}</p></div>}
            <BtnPrimary onClick={unirse} disabled={uniendose}>{uniendose?"Verificando...":"Unirse →"}</BtnPrimary>
          </div>
        </Modal>
      )}

      {detalle&&<DetalleEspacio espacio={detalle} userId={userId} puedeEditar={roles[detalle.id]?.puede_editar!==false} isMobile={isMobile} onClose={()=>setDetalle(null)} onUpdate={cargar}/>}
    </div>
  );
}

// ─── TAB PERFIL ───────────────────────────────────────────────────────────────
function TabPerfil({session,balances,setBalances,onCerrarSesion}){
  const[nombre,setNombre]=useState(balances.nombre_usuario||session?.user?.user_metadata?.nombre||"");
  const[editNombre,setEdit]=useState(false);
  const[guardando,setGuardando]=useState(false);
  const[exito,setExito]=useState(false);
  const guardar=async()=>{
    if(!nombre.trim())return;setGuardando(true);
    const nuevos={...balances,nombre_usuario:nombre.trim()};
    await supabase.from("balances").upsert({user_id:session.user.id,...nuevos});
    setBalances(nuevos);await supabase.auth.updateUser({data:{nombre:nombre.trim()}});
    setGuardando(false);setEdit(false);setExito(true);setTimeout(()=>setExito(false),2500);
  };
  const nombreMostrar=balances.nombre_usuario||session?.user?.user_metadata?.nombre||session?.user?.email?.split("@")[0]||"Usuario";
  return(
    <div style={{display:"flex",flexDirection:"column",gap:20,maxWidth:600}}>
      <p style={{fontWeight:800,fontSize:22}}>Mi Perfil</p>
      <Card style={{padding:28,textAlign:"center"}}>
        <div style={{width:80,height:80,borderRadius:"50%",background:`linear-gradient(135deg,${C.accent},#1250c0)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,fontWeight:800,color:"#fff",margin:"0 auto 16px"}}>{nombreMostrar.charAt(0).toUpperCase()}</div>
        <p style={{fontWeight:800,fontSize:22}}>{nombreMostrar}</p>
        <p style={{color:C.textMid,fontSize:14,marginTop:4}}>{session?.user?.email}</p>
        {exito&&<p style={{color:C.green,fontWeight:600,fontSize:13,marginTop:10}}>✓ Nombre actualizado</p>}
      </Card>
      <Card>
        <p style={{fontWeight:700,fontSize:16,marginBottom:14}}>✏️ Cambiar nombre</p>
        {editNombre?(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <input value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Tu nombre" autoFocus onKeyDown={e=>e.key==="Enter"&&guardar()} style={{fontFamily:"inherit",fontSize:15,padding:"12px 14px",border:`2px solid ${C.accent}`,borderRadius:14,outline:"none",width:"100%"}}/>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setEdit(false)} style={{flex:1,padding:"12px",borderRadius:14,border:`2px solid ${C.border}`,background:C.white,color:C.textMid,fontFamily:"inherit",fontWeight:700,fontSize:14,cursor:"pointer"}}>Cancelar</button>
              <BtnPrimary onClick={guardar} disabled={guardando} style={{flex:2}}>{guardando?"Guardando...":"Guardar"}</BtnPrimary>
            </div>
          </div>
        ):(
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><p style={{color:C.textMid,fontSize:13}}>Nombre actual</p><p style={{fontWeight:700,fontSize:16,marginTop:2}}>{nombreMostrar}</p></div>
            <button onClick={()=>setEdit(true)} style={{padding:"10px 18px",borderRadius:12,border:`2px solid ${C.accent}`,background:C.accentLight,color:C.accent,fontFamily:"inherit",fontWeight:700,fontSize:13,cursor:"pointer"}}>Cambiar</button>
          </div>
        )}
      </Card>
      <Card>
        <p style={{fontWeight:700,fontSize:16,marginBottom:14}}>📧 Información</p>
        <div style={{padding:"12px 0",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between"}}>
          <p style={{color:C.textMid,fontSize:13}}>Email</p><p style={{fontWeight:600,fontSize:14}}>{session?.user?.email}</p>
        </div>
        <div style={{padding:"12px 0",display:"flex",justifyContent:"space-between"}}>
          <p style={{color:C.textMid,fontSize:13}}>Miembro desde</p><p style={{fontWeight:600,fontSize:14}}>{new Date(session?.user?.created_at).toLocaleDateString("es-AR",{month:"long",year:"numeric"})}</p>
        </div>
      </Card>
      <button onClick={onCerrarSesion} style={{padding:"14px",borderRadius:16,border:`2px solid ${C.red}30`,background:C.redLight,color:C.red,fontFamily:"inherit",fontWeight:700,fontSize:15,cursor:"pointer"}}>🚪 Cerrar sesión</button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// APP PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export default function App(){
  const[session,setSession]=useState(undefined);
  const[tab,setTab]=useState("inicio");
  const[transacciones,setTransacciones]=useState([]);
  const[billeteras,setBilleteras]=useState([]);
  const[balances,setBalances]=useState({});
  const[historial,setHistorial]=useState([]);
  const[notifs,setNotifs]=useState([]);
  const[espacios,setEspacios]=useState([]);
  const[usdRate,setUsdRate]=useState(0);
  const[isMobile,setIsMobile]=useState(window.innerWidth<768);
  const[modalAdd,setModalAdd]=useState(false);
  const[modalAI,setModalAI]=useState(false);
  const[modalCompra,setModalCompra]=useState(false);
  const[newTx,setNewTx]=useState({descripcion:"",monto:"",tipo:"gasto",cat:"comida",recurrente:false,fecha:hoy(),billetera_id:""});
  const[compra,setCompra]=useState({nombre:"",precio:""});
  const[compraRes,setCompraRes]=useState(null);
  const[compraLoading,setCompraLoading]=useState(false);
  const[aiChat,setAiChat]=useState([{role:"assistant",text:"¡Hola! Soy tu asistente financiero 😊\n\n¿Qué querés saber sobre tus finanzas?"}]);
  const[aiInput,setAiInput]=useState("");
  const[aiLoading,setAiLoading]=useState(false);
  const chatRef=useRef(null);

  useEffect(()=>{const h=()=>setIsMobile(window.innerWidth<768);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h);},[]);
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>setSession(session));
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>setSession(s));
    return()=>subscription.unsubscribe();
  },[]);
  useEffect(()=>{fetch("https://api.exchangerate-api.com/v4/latest/USD").then(r=>r.json()).then(d=>setUsdRate(d.rates?.ARS||0)).catch(()=>setUsdRate(1200));},[]);

  const cargarTransacciones=useCallback(async()=>{
    if(!session)return;
    const{data}=await supabase.from("transacciones").select("*").eq("user_id",session.user.id).order("created_at",{ascending:false}).limit(200);
    setTransacciones(data||[]);
  },[session]);

  const cargarBilleteras=useCallback(async()=>{
    if(!session)return;
    const{data}=await supabase.from("billeteras").select("*").eq("user_id",session.user.id).order("created_at");
    setBilleteras(data||[]);
  },[session]);

  const cargarBalances=useCallback(async()=>{
    if(!session)return;
    const{data}=await supabase.from("balances").select("*").eq("user_id",session.user.id).maybeSingle();
    if(data)setBalances(data);
  },[session]);

  const cargarHistorial=useCallback(async()=>{
    if(!session)return;
    const{data}=await supabase.from("historial_mensual").select("*").eq("user_id",session.user.id).order("created_at",{ascending:false}).limit(6);
    if(data)setHistorial(data);
  },[session]);

  const cargarNotifs=useCallback(async()=>{
    if(!session)return;
    const{data}=await supabase.from("notificaciones").select("*").eq("user_id",session.user.id).order("created_at",{ascending:false}).limit(20);
    setNotifs(data||[]);
  },[session]);

  const generarNotifs=useCallback(async()=>{
    if(!session)return;
    const hoyDia=new Date().getDate();
    const{data:servicios}=await supabase.from("servicios").select("*").eq("user_id",session.user.id).eq("activo",true);
    for(const s of(servicios||[])){
      const diasHasta=s.dia_pago>=hoyDia?s.dia_pago-hoyDia:30-hoyDia+s.dia_pago;
      if(diasHasta<=3){
        const montoNotif=s.division==="mitad"?s.monto/2:s.monto;
        const msg=`${s.nombre} vence ${diasHasta===0?"hoy":diasHasta===1?"mañana":`en ${diasHasta} días`}. ${s.division==="mitad"?`Tu parte: ${fmt(montoNotif)}`:`Total: ${fmt(montoNotif)}`}`;
        const{data:ya}=await supabase.from("notificaciones").select("id").eq("user_id",session.user.id).ilike("mensaje",`%${s.nombre}%`).gte("created_at",new Date().toISOString().slice(0,10)).maybeSingle();
        if(!ya)await supabase.from("notificaciones").insert({user_id:session.user.id,titulo:"🔔 Servicio por vencer",mensaje:msg});
      }
    }
    const{data:metas}=await supabase.from("metas").select("*").eq("user_id",session.user.id);
    for(const m of(metas||[])){
      if(!m.fecha_limite)continue;
      const dias=Math.ceil((new Date(m.fecha_limite)-new Date())/86400000);
      if(dias<=7&&dias>=0){
        const{data:ya}=await supabase.from("notificaciones").select("id").eq("user_id",session.user.id).ilike("mensaje",`%${m.nombre}%`).gte("created_at",new Date().toISOString().slice(0,10)).maybeSingle();
        if(!ya)await supabase.from("notificaciones").insert({user_id:session.user.id,titulo:"🎯 Meta por vencer",mensaje:`"${m.nombre}" vence en ${dias} días. Falta: ${fmt(Math.max(0,m.objetivo-m.actual))}`});
      }
    }
    cargarNotifs();
  },[session,cargarNotifs]);

  const verificarCierreMes=useCallback(async()=>{
    if(!session)return;
    const hoyD=new Date();
    const ultimoDia=new Date(hoyD.getFullYear(),hoyD.getMonth()+1,0).getDate();
    if(hoyD.getDate()!==ultimoDia)return;
    const mesActual=hoyD.toISOString().slice(0,7);
    const{data:ya}=await supabase.from("historial_mensual").select("id").eq("user_id",session.user.id).eq("mes",mesActual).maybeSingle();
    if(ya)return;
    const{data:txs}=await supabase.from("transacciones").select("*").eq("user_id",session.user.id).gte("fecha",`${mesActual}-01`);
    const ing=(txs||[]).filter(t=>t.tipo==="ingreso").reduce((a,b)=>a+b.monto,0);
    const gas=(txs||[]).filter(t=>t.tipo==="gasto").reduce((a,b)=>a+b.monto,0);
    // Guardar saldo de billeteras al cierre
    const{data:bills}=await supabase.from("billeteras").select("*").eq("user_id",session.user.id);
    const totalBillCierre=(bills||[]).reduce((a,b)=>a+(parseFloat(b.saldo)||0),0);
    const{data:bals}=await supabase.from("balances").select("*").eq("user_id",session.user.id).maybeSingle();
    const patrimonioCierre=totalBillCierre+(parseFloat(bals?.inversiones)||0)-(parseFloat(bals?.deudas)||0);
    const nombreMes=hoyD.toLocaleString("es-AR",{month:"long",year:"numeric"});
    await supabase.from("historial_mensual").insert({
      user_id:session.user.id,
      mes:nombreMes,
      ingresos:ing,
      gastos:gas,
      ahorro:ing-gas,
      patrimonio:patrimonioCierre,
    });
    cargarHistorial();
  },[session,cargarHistorial]);

  useEffect(()=>{
    if(session){cargarTransacciones();cargarBilleteras();cargarBalances();cargarHistorial();cargarNotifs();generarNotifs();verificarCierreMes();}
  },[session,cargarTransacciones,cargarBilleteras,cargarBalances,cargarHistorial,cargarNotifs,generarNotifs,verificarCierreMes]);

  useEffect(()=>{if(chatRef.current)chatRef.current.scrollTop=chatRef.current.scrollHeight;},[aiChat]);

  const agregarTx=async()=>{
    if(!newTx.descripcion.trim()||!newTx.monto)return;
    if(billeteras.length>0&&!newTx.billetera_id){alert("Seleccioná de qué billetera es este movimiento");return;}
    const monto=parseFloat(newTx.monto);
    const{data}=await supabase.from("transacciones").insert({
      user_id:session.user.id,descripcion:newTx.descripcion,monto,tipo:newTx.tipo,cat:newTx.cat,
      recurrente:newTx.recurrente,fecha:newTx.fecha||hoy(),fecha_custom:newTx.fecha,billetera_id:newTx.billetera_id||null,
    }).select().single();
    if(data){
      setTransacciones(prev=>[data,...prev]);
      if(newTx.billetera_id){
        const bw=billeteras.find(b=>b.id===newTx.billetera_id);
        if(bw){const ns=newTx.tipo==="ingreso"?bw.saldo+monto:bw.saldo-monto;await supabase.from("billeteras").update({saldo:ns}).eq("id",bw.id);setBilleteras(prev=>prev.map(b=>b.id===bw.id?{...b,saldo:ns}:b));}
      }
    }
    setNewTx({descripcion:"",monto:"",tipo:"gasto",cat:"comida",recurrente:false,fecha:hoy(),billetera_id:""});
    setModalAdd(false);
  };

  const cerrarSesion=async()=>{if(window.confirm("¿Querés cerrar sesión?"))await supabase.auth.signOut();};
  const marcarLeidas=async()=>{await supabase.from("notificaciones").update({leida:true}).eq("user_id",session.user.id).eq("leida",false);setNotifs(prev=>prev.map(n=>({...n,leida:true})));};

  const ingresos=transacciones.filter(t=>t.tipo==="ingreso").reduce((a,b)=>a+b.monto,0);
  const gastos=transacciones.filter(t=>t.tipo==="gasto").reduce((a,b)=>a+b.monto,0);
  const ahorrando=ingresos-gastos;

  const enviarAI=async()=>{
    if(!aiInput.trim()||aiLoading)return;
    const msg=aiInput.trim();setAiInput("");
    setAiChat(prev=>[...prev,{role:"user",text:msg}]);setAiLoading(true);
    try{
      const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:`Asesor financiero amigable. Español rioplatense. Ingresos: ${fmt(ingresos)}, Gastos: ${fmt(gastos)}, Ahorro: ${fmt(ahorrando)}/mes. Billeteras: ${billeteras.map(b=>`${b.nombre}: ${fmt(b.saldo)}`).join(", ")}. Simple, claro, con emojis. Máx 3 párrafos.`,messages:[...aiChat.slice(1).map(m=>({role:m.role,content:m.text})),{role:"user",content:msg}]})});
      const d=await res.json();
      setAiChat(prev=>[...prev,{role:"assistant",text:d.content?.[0]?.text||"No pude responder."}]);
    }catch{setAiChat(prev=>[...prev,{role:"assistant",text:"Error. Intentá de nuevo."}]);}
    setAiLoading(false);
  };

  const analizarCompra=async()=>{
    if(!compra.nombre.trim()||!compra.precio||compraLoading)return;
    setCompraLoading(true);
    const precio=parseFloat(compra.precio);
    const horas=ingresos>0?Math.round(precio/(ingresos/160)):0;
    const pct=ingresos>0?Math.round((precio/ingresos)*100):0;
    try{
      const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,system:`Asesor financiero. Respondé SOLO con este JSON exacto sin markdown ni texto extra: {"veredicto":"COMPRAR|ESPERAR|NO COMPRAR","emoji":"emoji aqui","razon":"una frase corta explicando por qué","consejo":"un consejo práctico concreto de 2 oraciones"}`,messages:[{role:"user",content:`El usuario gana ${fmt(ingresos)}/mes y ahorra ${fmt(ahorrando)}/mes. Quiere comprar: ${compra.nombre} por ${fmt(precio)} (equivale a ${horas} horas de trabajo y es el ${pct}% de su ingreso mensual). ¿Le conviene?`}]})});
      const d=await res.json();
      const text=(d.content?.[0]?.text||"{}").replace(/```json|```/g,"").trim();
      const parsed=JSON.parse(text);
      setCompraRes({...parsed,precio,horas,pct});
    }catch{setCompraRes({veredicto:"ESPERAR",emoji:"⏸️",razon:`Son ${horas} horas de trabajo (${pct}% de tu ingreso).`,consejo:"Esperá 48 horas antes de decidir. Si seguís queriendo comprarlo, entonces probablemente lo necesitás.",precio,horas,pct});}
    setCompraLoading(false);
  };

  const css=`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    html,body{overflow-x:hidden;}
    body{background:${C.bg};color:${C.text};font-family:'Plus Jakarta Sans',sans-serif;}
    ::-webkit-scrollbar{width:6px;}::-webkit-scrollbar-thumb{background:${C.border};border-radius:4px;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes popIn{from{opacity:0;transform:scale(0.94)}to{opacity:1;transform:scale(1)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
    @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
    select{font-family:'Plus Jakarta Sans',sans-serif;font-size:15px;padding:12px 14px;border:2px solid ${C.border};border-radius:14px;background:${C.white};color:${C.text};width:100%;outline:none;transition:border-color 0.2s;}
    select:focus{border-color:${C.accent};}
    select option{background:${C.white};}
    input[type="date"]{background:${C.white}!important;color:${C.text}!important;text-align:center;-webkit-appearance:none;appearance:none;}
    input[type="date"]::-webkit-calendar-picker-indicator{opacity:0.6;cursor:pointer;}
  `;

  const userNombre=balances.nombre_usuario||session?.user?.user_metadata?.nombre||session?.user?.email?.split("@")[0]||"Vos";

  if(session===undefined)return <><style>{css}</style><Spinner/></>;
  if(!session)return <><style>{css}</style><PantallaLogin/></>;

  const renderContenido=()=>{
    switch(tab){
      case "inicio":      return <TabInicio transacciones={transacciones} billeteras={billeteras} balances={balances} setBalances={setBalances} userId={session.user.id} historial={historial} isMobile={isMobile} usdRate={usdRate} espacios={espacios}/>;
      case "movimientos": return <TabMovimientos transacciones={transacciones} setTransacciones={setTransacciones} billeteras={billeteras} setBilleteras={setBilleteras} isMobile={isMobile}/>;
      case "metas":       return <TabMetas userId={session.user.id} transacciones={transacciones} billeteras={billeteras} balances={balances} isMobile={isMobile}/>;
      case "compartido":  return <TabCompartido userId={session.user.id} isMobile={isMobile}/>;
      case "billeteras":  return <TabBilleteras billeteras={billeteras} setBilleteras={setBilleteras} userId={session.user.id}/>;
      case "servicios":   return <TabServicios userId={session.user.id} isMobile={isMobile}/>;
      case "perfil":      return <TabPerfil session={session} balances={balances} setBalances={setBalances} onCerrarSesion={cerrarSesion}/>;
      case "mas":         return <MenuMas setTab={setTab} onCerrarSesion={cerrarSesion}/>;
      default: return null;
    }
  };

  const renderModales=()=>(
    <>
      {modalAdd&&(
        <Modal title="➕ Nuevo movimiento" onClose={()=>setModalAdd(false)}>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <input value={newTx.descripcion} onChange={e=>setNewTx({...newTx,descripcion:e.target.value})} placeholder="¿En qué gastaste o de dónde ingresó?" style={{fontFamily:"inherit",fontSize:15,padding:"12px 14px",border:`2px solid ${C.border}`,borderRadius:14,outline:"none",width:"100%"}}/>
            <input type="number" value={newTx.monto} onChange={e=>setNewTx({...newTx,monto:e.target.value})} placeholder="Monto ($)" style={{fontFamily:"inherit",fontSize:15,padding:"12px 14px",border:`2px solid ${C.border}`,borderRadius:14,outline:"none",width:"100%"}}/>
            <div style={{display:"flex",gap:8}}>
              {[["gasto","💸 Gasto"],["ingreso","💰 Ingreso"],["transferencia","↕️ Transf."]].map(([val,label])=>(
                <button key={val} onClick={()=>setNewTx({...newTx,tipo:val,cat:val==="transferencia"?"transferencia":newTx.cat})}
                  style={{flex:1,padding:"10px 4px",border:`2px solid ${newTx.tipo===val?(val==="gasto"?C.red:val==="ingreso"?C.green:C.purple):C.border}`,borderRadius:14,background:newTx.tipo===val?(val==="gasto"?C.redLight:val==="ingreso"?C.greenLight:C.purpleLight):C.white,color:newTx.tipo===val?(val==="gasto"?C.red:val==="ingreso"?C.green:C.purple):C.textMid,fontFamily:"inherit",fontWeight:700,fontSize:12,cursor:"pointer"}}>
                  {label}
                </button>
              ))}
            </div>
            {newTx.tipo!=="transferencia"&&(
              <select value={newTx.cat} onChange={e=>setNewTx({...newTx,cat:e.target.value})}>
                {Object.entries(CATEGORIAS).map(([k,v])=><option key={k} value={k}>{v.icono} {v.label}</option>)}
              </select>
            )}
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              <p style={{color:C.textMid,fontSize:12}}>📅 Fecha:</p>
              <input type="date" value={newTx.fecha} onChange={e=>setNewTx({...newTx,fecha:e.target.value})} style={{fontFamily:"inherit",fontSize:15,padding:"12px 14px",border:`2px solid ${C.border}`,borderRadius:14,outline:"none",width:"100%",textAlign:"center",background:C.white,color:C.text}}/>
            </div>
            <div>
              <p style={{color:C.text,fontSize:14,fontWeight:700,marginBottom:8}}>
                👛 {newTx.tipo==="ingreso"?"¿A qué billetera entra la plata?":"¿De qué billetera sale la plata?"}
              </p>
              {billeteras.length===0?(
                <div style={{padding:12,borderRadius:12,background:C.goldLight,border:`1px solid ${C.gold}30`}}>
                  <p style={{fontSize:13,color:C.gold,fontWeight:600}}>⚠️ Primero creá una billetera en Más → Billeteras</p>
                </div>
              ):(
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {billeteras.map(b=>(
                    <button key={b.id} onClick={()=>setNewTx({...newTx,billetera_id:b.id})}
                      style={{padding:"10px 16px",borderRadius:14,border:`2px solid ${newTx.billetera_id===b.id?C.accent:C.border}`,background:newTx.billetera_id===b.id?C.accentLight:C.white,color:newTx.billetera_id===b.id?C.accent:C.textMid,fontFamily:"inherit",fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:8,transition:"all 0.15s",boxShadow:newTx.billetera_id===b.id?`0 0 0 3px ${C.accent}20`:"none"}}>
                      <span style={{fontSize:20}}>{b.icono}</span>
                      <span>{b.nombre}</span>
                      {newTx.billetera_id===b.id&&<span style={{fontSize:14,color:C.accent}}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <label style={{display:"flex",alignItems:"center",gap:10,fontSize:13,color:C.textMid,cursor:"pointer"}}>
              <input type="checkbox" checked={newTx.recurrente} onChange={e=>setNewTx({...newTx,recurrente:e.target.checked})} style={{width:"auto",accentColor:C.accent}}/>
              🔄 Se repite todos los meses
            </label>
            <BtnPrimary onClick={agregarTx}>Guardar</BtnPrimary>
          </div>
        </Modal>
      )}

      {modalAI&&(
        <div onClick={e=>e.target===e.currentTarget&&setModalAI(false)} style={{position:"fixed",inset:0,background:"#00000070",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{background:C.white,borderRadius:24,width:"100%",maxWidth:520,height:"75vh",maxHeight:680,display:"flex",flexDirection:"column",boxShadow:"0 24px 64px #00000030",animation:"popIn 0.22s ease"}}>
            <div style={{padding:"18px 20px",borderBottom:`2px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:42,height:42,borderRadius:12,background:C.accentLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,animation:"float 3s ease infinite"}}>🤖</div>
                <div><p style={{fontWeight:800,fontSize:15}}>Asistente Financiero</p><p style={{color:C.green,fontSize:11,fontWeight:700}}>● En línea</p></div>
              </div>
              <button onClick={()=>setModalAI(false)} style={{width:34,height:34,borderRadius:10,background:C.bg,border:"none",cursor:"pointer",fontSize:17}}>✕</button>
            </div>
            <div ref={chatRef} style={{flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:10}}>
              {aiChat.map((m,i)=>(
                <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",animation:"fadeUp 0.2s ease"}}>
                  <div style={{maxWidth:"82%",padding:"12px 14px",borderRadius:m.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",background:m.role==="user"?C.accent:C.bg,color:m.role==="user"?"#fff":C.text,fontSize:13,lineHeight:1.6,whiteSpace:"pre-wrap",fontWeight:500}}>{m.text}</div>
                </div>
              ))}
              {aiLoading&&<div style={{display:"flex"}}><div style={{padding:"12px 14px",borderRadius:"18px 18px 18px 4px",background:C.bg,animation:"pulse 1s infinite",fontSize:16}}>💭</div></div>}
            </div>
            <div style={{padding:"8px 14px",borderTop:`1px solid ${C.border}`,display:"flex",gap:8,overflowX:"auto",flexShrink:0}}>
              {["¿Estoy ahorrando bien?","¿Cómo bajo mis gastos?","Predicción fin de mes"].map(q=>(
                <button key={q} onClick={()=>setAiInput(q)} style={{whiteSpace:"nowrap",padding:"7px 12px",borderRadius:20,background:C.accentLight,border:`1.5px solid ${C.accent}40`,color:C.accent,fontFamily:"inherit",fontSize:11,fontWeight:700,cursor:"pointer",flexShrink:0}}>{q}</button>
              ))}
            </div>
            <div style={{padding:14,borderTop:`2px solid ${C.border}`,display:"flex",gap:8,flexShrink:0}}>
              <input value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&enviarAI()} placeholder="Escribí tu consulta..." style={{flex:1,fontFamily:"inherit",fontSize:15,padding:"10px 14px",border:`2px solid ${C.border}`,borderRadius:14,outline:"none"}}/>
              <button onClick={enviarAI} style={{padding:"0 18px",background:C.accent,color:"#fff",border:"none",borderRadius:14,fontFamily:"inherit",fontWeight:700,fontSize:14,cursor:"pointer",opacity:aiLoading?0.6:1,flexShrink:0}}>Enviar</button>
            </div>
          </div>
        </div>
      )}

      {modalCompra&&(
        <Modal title="🛒 ¿Me conviene comprarlo?" onClose={()=>{setModalCompra(false);setCompraRes(null);}} maxWidth={480}>
          <p style={{color:C.textMid,fontSize:13,marginBottom:16}}>Analizá cualquier compra antes de hacerla.</p>
          <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:14}}>
            <input value={compra.nombre} onChange={e=>setCompra({...compra,nombre:e.target.value})} placeholder="¿Qué querés comprar?" style={{fontFamily:"inherit",fontSize:15,padding:"12px 14px",border:`2px solid ${C.border}`,borderRadius:14,outline:"none",width:"100%"}}/>
            <input type="number" value={compra.precio} onChange={e=>setCompra({...compra,precio:e.target.value})} placeholder="Precio ($)" style={{fontFamily:"inherit",fontSize:15,padding:"12px 14px",border:`2px solid ${C.border}`,borderRadius:14,outline:"none",width:"100%"}}/>
            <BtnPrimary onClick={analizarCompra} disabled={compraLoading}>{compraLoading?"Analizando... 🧠":"Analizar compra"}</BtnPrimary>
          </div>
          {compraRes&&(
            <div style={{animation:"fadeUp 0.3s ease"}}>
              <div style={{padding:18,borderRadius:18,textAlign:"center",marginBottom:12,background:compraRes.veredicto==="COMPRAR"?C.greenLight:compraRes.veredicto==="NO COMPRAR"?C.redLight:C.goldLight,border:`2px solid ${compraRes.veredicto==="COMPRAR"?C.green:compraRes.veredicto==="NO COMPRAR"?C.red:C.gold}40`}}>
                <p style={{fontSize:40,marginBottom:8}}>{compraRes.emoji}</p>
                <p style={{fontWeight:800,fontSize:22,color:compraRes.veredicto==="COMPRAR"?C.green:compraRes.veredicto==="NO COMPRAR"?C.red:C.gold}}>{compraRes.veredicto}</p>
                <p style={{color:C.textMid,fontSize:13,marginTop:8,lineHeight:1.5}}>{compraRes.razon}</p>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                <Card style={{textAlign:"center",padding:14,background:C.goldLight}}>
                  <p style={{fontSize:22,marginBottom:4}}>⏰</p>
                  <p style={{fontWeight:800,fontSize:22,color:C.gold}}>{compraRes.horas}hs</p>
                  <p style={{color:C.textMid,fontSize:11,marginTop:4}}>de trabajo</p>
                </Card>
                <Card style={{textAlign:"center",padding:14,background:C.purpleLight}}>
                  <p style={{fontSize:22,marginBottom:4}}>📊</p>
                  <p style={{fontWeight:800,fontSize:22,color:C.purple}}>{compraRes.pct}%</p>
                  <p style={{color:C.textMid,fontSize:11,marginTop:4}}>de tu ingreso</p>
                </Card>
              </div>
              <Card style={{background:compraRes.veredicto==="COMPRAR"?C.greenLight:compraRes.veredicto==="NO COMPRAR"?C.redLight:C.goldLight,border:`1.5px solid ${compraRes.veredicto==="COMPRAR"?C.green:compraRes.veredicto==="NO COMPRAR"?C.red:C.gold}30`,padding:16}}>
                <p style={{fontWeight:700,fontSize:13,color:compraRes.veredicto==="COMPRAR"?C.green:compraRes.veredicto==="NO COMPRAR"?C.red:C.gold,marginBottom:8}}>💡 Mi consejo</p>
                <p style={{fontSize:14,color:C.text,lineHeight:1.6}}>{compraRes.consejo}</p>
              </Card>
            </div>
          )}
        </Modal>
      )}
    </>
  );

  const headerBtns=(
    <div style={{display:"flex",gap:6,flexShrink:0,alignItems:"center"}}>
      <Campanita notifs={notifs} onMarcarLeidas={marcarLeidas}/>
      <button onClick={()=>{setCompraRes(null);setModalCompra(true);}} style={{width:40,height:40,borderRadius:12,border:`2px solid ${C.border}`,background:C.white,cursor:"pointer",fontSize:17,display:"flex",alignItems:"center",justifyContent:"center"}}>🛒</button>
      <button onClick={()=>setModalAI(true)} style={{width:40,height:40,borderRadius:12,border:`2px solid ${C.accent}`,background:C.accentLight,cursor:"pointer",fontSize:17,display:"flex",alignItems:"center",justifyContent:"center"}}>🤖</button>
      <button onClick={()=>setModalAdd(true)} style={{width:40,height:40,borderRadius:12,background:`linear-gradient(135deg,${C.accent},#1250c0)`,color:"#fff",border:"none",cursor:"pointer",fontSize:22,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
    </div>
  );

  if(!isMobile){
    return(
      <>
        <style>{css}</style>
        <div style={{display:"flex",minHeight:"100vh",background:C.bg}}>
          <div style={{width:250,background:C.white,borderRight:`2px solid ${C.border}`,display:"flex",flexDirection:"column",position:"fixed",top:0,left:0,height:"100vh",zIndex:50}}>
            <div style={{padding:"22px 20px",borderBottom:`1px solid ${C.border}`}}>
              <div style={{width:44,height:44,borderRadius:14,background:`linear-gradient(135deg,${C.accent},#1250c0)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,marginBottom:10,animation:"float 3s ease infinite"}}>💰</div>
              <p style={{fontWeight:800,fontSize:16}}>Mis Finanzas</p>
              <p style={{fontSize:12,color:C.textMid,marginTop:2}}>Hola, {userNombre} 👋</p>
            </div>
            <nav style={{flex:1,padding:"14px 12px",display:"flex",flexDirection:"column",gap:2,overflowY:"auto"}}>
              {NAV_DESKTOP.map(n=>(
                <button key={n.id} onClick={()=>setTab(n.id)}
                  style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderRadius:14,border:"none",background:tab===n.id?C.accentLight:"transparent",color:tab===n.id?C.accent:C.textMid,fontFamily:"inherit",fontWeight:700,fontSize:14,cursor:"pointer",textAlign:"left",transition:"all 0.2s"}}>
                  <span style={{fontSize:20}}>{n.icon}</span>{n.label}
                  {tab===n.id&&<div style={{marginLeft:"auto",width:6,height:6,borderRadius:"50%",background:C.accent}}/>}
                </button>
              ))}
            </nav>
          </div>
          <div style={{marginLeft:250,flex:1,display:"flex",flexDirection:"column"}}>
            <div style={{background:C.white,borderBottom:`2px solid ${C.border}`,padding:"16px 32px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:40}}>
              <p style={{fontWeight:800,fontSize:20}}>{NAV_DESKTOP.find(n=>n.id===tab)?.icon} {NAV_DESKTOP.find(n=>n.id===tab)?.label}</p>
              {headerBtns}
            </div>
            <div style={{flex:1,padding:"24px 32px 40px",overflowY:"auto"}}>{renderContenido()}</div>
          </div>
        </div>
        {renderModales()}
      </>
    );
  }

  return(
    <>
      <style>{css}</style>
      <div style={{maxWidth:"100%",minHeight:"100vh",display:"flex",flexDirection:"column",background:C.bg,overflowX:"hidden"}}>
        <div style={{background:C.white,borderBottom:`2px solid ${C.border}`,padding:"14px 16px",position:"sticky",top:0,zIndex:50}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
            <div style={{minWidth:0}}>
              <p style={{fontSize:10,color:C.textLight,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase"}}>Mis Finanzas</p>
              <p style={{fontWeight:800,fontSize:17,marginTop:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>Hola, {userNombre} 👋</p>
            </div>
            {headerBtns}
          </div>
        </div>
        <div style={{flex:1,padding:"14px 12px 100px",overflowY:"auto",overflowX:"hidden"}}>{renderContenido()}</div>
        <div style={{position:"fixed",bottom:0,left:0,right:0,background:C.white,borderTop:`2px solid ${C.border}`,display:"flex",zIndex:50,paddingBottom:"env(safe-area-inset-bottom)"}}>
          {NAV_MOBILE.map(n=>(
            <button key={n.id} onClick={()=>setTab(n.id)}
              style={{flex:1,padding:"10px 2px 12px",background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
              <span style={{fontSize:20}}>{n.icon}</span>
              <span style={{fontSize:9,fontFamily:"inherit",fontWeight:700,color:tab===n.id?C.accent:C.textLight}}>{n.label}</span>
              {tab===n.id&&<div style={{width:16,height:3,borderRadius:99,background:C.accent}}/>}
            </button>
          ))}
        </div>
        {renderModales()}
      </div>
    </>
  );
}