import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabase";

const C = {
  bg: "#F4F6FB", white: "#FFFFFF", border: "#E2E8F0",
  accent: "#1A6FE8", accentLight: "#EBF2FF",
  green: "#16A34A", greenLight: "#F0FDF4",
  red: "#DC2626", redLight: "#FEF2F2",
  gold: "#D97706", goldLight: "#FFFBEB",
  purple: "#7C3AED", purpleLight: "#F5F3FF",
  text: "#1E293B", textMid: "#475569", textLight: "#94A3B8",
};

const fmt = (n) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n || 0);

const CATEGORIAS = {
  comida:       { icono: "🍔", color: C.red,      label: "Comida"      },
  transporte:   { icono: "🚗", color: C.accent,   label: "Transporte"  },
  ocio:         { icono: "🎮", color: C.purple,   label: "Ocio"        },
  impuestos:    { icono: "🏠", color: C.textMid,  label: "Vivienda"    },
  herramientas: { icono: "🔧", color: C.green,    label: "Servicios"   },
  trabajo:      { icono: "💼", color: C.gold,     label: "Trabajo"     },
  gimnasio:     { icono: "💪", color: C.red,      label: "Gimnasio"    },
  ropa:         { icono: "👕", color: C.purple,   label: "Ropa"        },
  compras:      { icono: "🛍️", color: C.accent,   label: "Compras"     },
  otro:         { icono: "📦", color: C.textLight, label: "Otro"       },
};

const NAV_MOBILE = [
  { id: "inicio",      label: "Inicio",      icon: "🏠" },
  { id: "movimientos", label: "Movimientos", icon: "💸" },
  { id: "metas",       label: "Metas",       icon: "🎯" },
  { id: "compartido",  label: "Compartido",  icon: "🤝" },
  { id: "perfil",      label: "Perfil",      icon: "👤" },
];

const NAV_DESKTOP = [
  { id: "inicio",      label: "Inicio",      icon: "🏠" },
  { id: "movimientos", label: "Movimientos", icon: "💸" },
  { id: "metas",       label: "Metas",       icon: "🎯" },
  { id: "compartido",  label: "Compartido",  icon: "🤝" },
  { id: "perfil",      label: "Mi Perfil",   icon: "👤" },
];

// ─── COMPONENTES BASE ─────────────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{ background: C.white, borderRadius: 20, padding: 20, boxShadow: "0 2px 12px #00000008", border: `1px solid ${C.border}`, boxSizing: "border-box", ...style }}>
      {children}
    </div>
  );
}

function Barra({ pct, color }) {
  return (
    <div style={{ background: C.border, borderRadius: 999, height: 10, overflow: "hidden" }}>
      <div style={{ height: "100%", borderRadius: 999, background: color, width: `${Math.min(pct || 0, 100)}%`, transition: "width 0.8s ease" }} />
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: C.bg }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 48, height: 48, border: `4px solid ${C.border}`, borderTop: `4px solid ${C.accent}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ color: C.textMid, fontWeight: 600 }}>Cargando...</p>
      </div>
    </div>
  );
}

function Modal({ children, onClose, title }) {
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, background: "#00000065", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: C.white, borderRadius: 24, padding: 28, width: "100%", maxWidth: 480, boxShadow: "0 20px 60px #00000025", animation: "popIn 0.25s ease", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <p style={{ fontWeight: 800, fontSize: 20, color: C.text }}>{title}</p>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, background: C.bg, border: "none", cursor: "pointer", fontSize: 17, color: C.textMid, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function CampoEditable({ campo, label, icon, color, bg, balances, onGuardar }) {
  const [editando, setEditando] = useState(false);
  const [val, setVal] = useState("");
  return (
    <Card style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{icon}</div>
        <p style={{ color: C.textMid, fontSize: 12, fontWeight: 600 }}>{label}</p>
      </div>
      {editando ? (
        <div style={{ display: "flex", gap: 6 }}>
          <input autoFocus type="number" value={val} onChange={e => setVal(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { onGuardar(campo, val); setEditando(false); } }}
            style={{ flex: 1, padding: "8px 10px", fontSize: 14 }} />
          <button onClick={() => { onGuardar(campo, val); setEditando(false); }}
            style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 10, padding: "0 12px", cursor: "pointer", fontWeight: 700, flexShrink: 0 }}>✓</button>
        </div>
      ) : (
        <p onClick={() => { setEditando(true); setVal(balances[campo] || ""); }}
          style={{ color, fontSize: 18, fontWeight: 800, cursor: "pointer", wordBreak: "break-all" }}>
          {fmt(balances[campo] || 0)} <span style={{ fontSize: 11, color: C.textLight }}>✏️</span>
        </p>
      )}
    </Card>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function PantallaLogin() {
  const [modo, setModo]       = useState("login");
  const [email, setEmail]     = useState("");
  const [pass, setPass]       = useState("");
  const [nombre, setNombre]   = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    if (modo === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) setError("Email o contraseña incorrectos.");
    } else {
      if (!nombre.trim()) { setError("Ingresá tu nombre."); setLoading(false); return; }
      const { error } = await supabase.auth.signUp({ email, password: pass, options: { data: { nombre } } });
      if (error) setError("Error al registrarse. Probá con otro email.");
      else setError("¡Cuenta creada! Ya podés iniciar sesión.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, #EBF2FF 0%, #F4F6FB 50%, #F0FDF4 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 80, height: 80, borderRadius: 24, background: `linear-gradient(135deg, ${C.accent}, #1250c0)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, margin: "0 auto 16px", boxShadow: `0 12px 32px ${C.accent}40` }}>💰</div>
          <p style={{ fontWeight: 800, fontSize: 30, color: C.text }}>Mis Finanzas</p>
          <p style={{ color: C.textMid, fontSize: 15, marginTop: 6 }}>Tu dinero, bajo control</p>
        </div>
        <Card style={{ padding: 28, boxShadow: "0 8px 32px #00000012" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 24, background: C.bg, borderRadius: 14, padding: 4 }}>
            {[["login", "Iniciar sesión"], ["registro", "Registrarse"]].map(([val, label]) => (
              <button key={val} onClick={() => { setModo(val); setError(""); }}
                style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: modo === val ? C.white : "transparent", color: modo === val ? C.accent : C.textMid, fontFamily: "inherit", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: modo === val ? "0 2px 8px #00000010" : "none", transition: "all 0.2s" }}>
                {label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {modo === "registro" && <input placeholder="Tu nombre" value={nombre} onChange={e => setNombre(e.target.value)} />}
            <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            <input placeholder="Contraseña" type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
            {error && (
              <div style={{ padding: "10px 14px", borderRadius: 12, background: error.includes("creada") ? C.greenLight : C.redLight, border: `1px solid ${error.includes("creada") ? C.green : C.red}30` }}>
                <p style={{ color: error.includes("creada") ? C.green : C.red, fontSize: 13, fontWeight: 600 }}>{error}</p>
              </div>
            )}
            <button onClick={handleSubmit} disabled={loading}
              style={{ background: `linear-gradient(135deg, ${C.accent}, #1250c0)`, color: "#fff", border: "none", borderRadius: 14, padding: "15px", fontSize: 15, fontFamily: "inherit", fontWeight: 700, cursor: "pointer", opacity: loading ? 0.7 : 1, marginTop: 4, boxShadow: `0 8px 20px ${C.accent}40` }}>
              {loading ? "Cargando..." : modo === "login" ? "Entrar →" : "Crear cuenta →"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── TAB PERFIL ───────────────────────────────────────────────────────────────
function TabPerfil({ session, balances, setBalances, onCerrarSesion }) {
  const [nombre, setNombre]         = useState(balances.nombre_usuario || session?.user?.user_metadata?.nombre || "");
  const [editNombre, setEditNombre] = useState(false);
  const [guardando, setGuardando]   = useState(false);
  const [exito, setExito]           = useState(false);

  const guardarNombre = async () => {
    if (!nombre.trim()) return;
    setGuardando(true);
    const nuevos = { ...balances, nombre_usuario: nombre.trim() };
    await supabase.from("balances").upsert({ user_id: session.user.id, ...nuevos });
    setBalances(nuevos);
    await supabase.auth.updateUser({ data: { nombre: nombre.trim() } });
    setGuardando(false);
    setEditNombre(false);
    setExito(true);
    setTimeout(() => setExito(false), 2500);
  };

  const nombreMostrar = balances.nombre_usuario || session?.user?.user_metadata?.nombre || session?.user?.email?.split("@")[0] || "Usuario";
  const inicial = nombreMostrar.charAt(0).toUpperCase();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 600 }}>
      <p style={{ fontWeight: 800, fontSize: 22 }}>Mi Perfil</p>

      {/* Avatar y nombre */}
      <Card style={{ padding: 28, textAlign: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg, ${C.accent}, #1250c0)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 800, color: "#fff", margin: "0 auto 16px" }}>
          {inicial}
        </div>
        <p style={{ fontWeight: 800, fontSize: 22, color: C.text }}>{nombreMostrar}</p>
        <p style={{ color: C.textMid, fontSize: 14, marginTop: 4 }}>{session?.user?.email}</p>
        {exito && <p style={{ color: C.green, fontWeight: 600, fontSize: 13, marginTop: 10 }}>✓ Nombre actualizado</p>}
      </Card>

      {/* Cambiar nombre */}
      <Card>
        <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>✏️ Cambiar nombre</p>
        {editNombre ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input value={nombre} onChange={e => setNombre(e.target.value)}
              placeholder="Tu nombre" autoFocus
              onKeyDown={e => e.key === "Enter" && guardarNombre()} />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setEditNombre(false)}
                style={{ flex: 1, padding: "12px", borderRadius: 14, border: `2px solid ${C.border}`, background: C.white, color: C.textMid, fontFamily: "inherit", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                Cancelar
              </button>
              <button onClick={guardarNombre} disabled={guardando}
                style={{ flex: 2, padding: "12px", borderRadius: 14, border: "none", background: C.accent, color: "#fff", fontFamily: "inherit", fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: guardando ? 0.7 : 1 }}>
                {guardando ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ color: C.textMid, fontSize: 13 }}>Nombre actual</p>
              <p style={{ fontWeight: 700, fontSize: 16, marginTop: 2 }}>{nombreMostrar}</p>
            </div>
            <button onClick={() => setEditNombre(true)}
              style={{ padding: "10px 18px", borderRadius: 12, border: `2px solid ${C.accent}`, background: C.accentLight, color: C.accent, fontFamily: "inherit", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              Cambiar
            </button>
          </div>
        )}
      </Card>

      {/* Info cuenta */}
      <Card>
        <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>📧 Información de cuenta</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
          <p style={{ color: C.textMid, fontSize: 13 }}>Email</p>
          <p style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{session?.user?.email}</p>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0" }}>
          <p style={{ color: C.textMid, fontSize: 13 }}>Miembro desde</p>
          <p style={{ fontWeight: 600, fontSize: 14, color: C.text }}>
            {new Date(session?.user?.created_at).toLocaleDateString("es-AR", { month: "long", year: "numeric" })}
          </p>
        </div>
      </Card>

      {/* Cerrar sesión */}
      <button onClick={onCerrarSesion}
        style={{ padding: "14px", borderRadius: 16, border: `2px solid ${C.red}30`, background: C.redLight, color: C.red, fontFamily: "inherit", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
        🚪 Cerrar sesión
      </button>
    </div>
  );
}

// ─── TAB INICIO ───────────────────────────────────────────────────────────────
function TabInicio({ transacciones, balances, setBalances, userId, historial, isMobile }) {
  const ingresos    = transacciones.filter(t => t.tipo === "ingreso").reduce((a, b) => a + b.monto, 0);
  const gastos      = transacciones.filter(t => t.tipo === "gasto").reduce((a, b) => a + b.monto, 0);
  const ahorrando   = ingresos - gastos;
  const ahorroPct   = ingresos > 0 ? Math.round((ahorrando / ingresos) * 100) : 0;
  const total       = (balances.efectivo || 0) + (balances.banco || 0) + (balances.mercadopago || 0) + (balances.ahorros || 0) + (balances.inversiones || 0);
  const patrimonio  = total - (balances.deudas || 0);
  const objetivoPct = balances.objetivo > 0 ? Math.min(Math.round(((balances.ahorros || 0) / balances.objetivo) * 100), 100) : 0;
  const deliveries  = transacciones.filter(t => t.tipo === "gasto" && t.descripcion?.toLowerCase().includes("delivery"));
  const totalDeliv  = deliveries.reduce((a, b) => a + b.monto, 0);
  const suscripciones = transacciones.filter(t => t.tipo === "gasto" && t.recurrente);
  const totalSusc   = suscripciones.reduce((a, b) => a + b.monto, 0);
  const gastoDiario = gastos > 0 ? Math.round(gastos / new Date().getDate()) : 0;
  const prediccion  = Math.round(gastoDiario * 31);
  const [editandoObj, setEditandoObj] = useState(false);
  const [valObj, setValObj] = useState("");

  const guardarBalance = async (campo, valor) => {
    const nuevo = parseFloat(valor);
    if (isNaN(nuevo)) return;
    const nuevos = { ...balances, [campo]: nuevo };
    setBalances(nuevos);
    await supabase.from("balances").upsert({ user_id: userId, ...nuevos });
  };

  const cols = isMobile ? "1fr 1fr" : "1fr 1fr 1fr";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card style={{ background: `linear-gradient(135deg, ${C.accent} 0%, #1250c0 100%)`, border: "none", boxShadow: `0 8px 32px ${C.accent}40` }}>
        <p style={{ color: "#ffffffaa", fontSize: 12, fontWeight: 600, marginBottom: 6, letterSpacing: 1 }}>TU PATRIMONIO TOTAL</p>
        <p style={{ color: "#fff", fontSize: isMobile ? 36 : 48, fontWeight: 800, lineHeight: 1 }}>{fmt(patrimonio)}</p>
        <p style={{ color: "#ffffffbb", fontSize: 13, marginTop: 6 }}>Total en cuentas: {fmt(total)}</p>
        <div style={{ display: "flex", gap: 32, marginTop: 16, borderTop: "1px solid #ffffff30", paddingTop: 14 }}>
          <div><p style={{ color: "#ffffffaa", fontSize: 11 }}>Ingresos del mes</p><p style={{ color: "#fff", fontSize: 18, fontWeight: 800, marginTop: 2 }}>+{fmt(ingresos)}</p></div>
          <div><p style={{ color: "#ffffffaa", fontSize: 11 }}>Gastos del mes</p><p style={{ color: "#ffcccc", fontSize: 18, fontWeight: 800, marginTop: 2 }}>-{fmt(gastos)}</p></div>
          <div><p style={{ color: "#ffffffaa", fontSize: 11 }}>Ahorro mensual</p><p style={{ color: "#ccffcc", fontSize: 18, fontWeight: 800, marginTop: 2 }}>{fmt(ahorrando)}</p></div>
        </div>
      </Card>

      <p style={{ fontWeight: 700, fontSize: 16 }}>¿Dónde está tu plata? <span style={{ fontSize: 11, color: C.textLight, fontWeight: 500 }}>Tocá para editar</span></p>
      <div style={{ display: "grid", gridTemplateColumns: cols, gap: 10 }}>
        <CampoEditable campo="efectivo"    label="Efectivo"     icon="💵" color={C.gold}   bg={C.goldLight}   balances={balances} onGuardar={guardarBalance} />
        <CampoEditable campo="banco"       label="Banco"        icon="🏦" color={C.accent} bg={C.accentLight} balances={balances} onGuardar={guardarBalance} />
        <CampoEditable campo="mercadopago" label="Mercado Pago" icon="💳" color={C.green}  bg={C.greenLight}  balances={balances} onGuardar={guardarBalance} />
        <CampoEditable campo="ahorros"     label="Ahorros"      icon="🐷" color={C.purple} bg={C.purpleLight} balances={balances} onGuardar={guardarBalance} />
        <CampoEditable campo="inversiones" label="Inversiones"  icon="📈" color={C.gold}   bg={C.goldLight}   balances={balances} onGuardar={guardarBalance} />
        <CampoEditable campo="deudas"      label="Deudas"       icon="📉" color={C.red}    bg={C.redLight}    balances={balances} onGuardar={guardarBalance} />
      </div>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ fontWeight: 700, fontSize: 15 }}>🎯 Objetivo de ahorro</p>
          <p style={{ fontWeight: 800, fontSize: 17, color: C.green }}>{objetivoPct}%</p>
        </div>
        <Barra pct={objetivoPct} color={C.green} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, flexWrap: "wrap", gap: 4 }}>
          <p style={{ color: C.textMid, fontSize: 12 }}>Ahorrado: <b style={{ color: C.text }}>{fmt(balances.ahorros || 0)}</b></p>
          <p style={{ color: C.textMid, fontSize: 12 }}>Meta: <b onClick={() => { setEditandoObj(true); setValObj(balances.objetivo || ""); }} style={{ color: C.accent, cursor: "pointer" }}>{fmt(balances.objetivo || 0)} ✏️</b></p>
        </div>
        {editandoObj && (
          <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
            <input autoFocus type="number" value={valObj} onChange={e => setValObj(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { guardarBalance("objetivo", valObj); setEditandoObj(false); } }}
              placeholder="Objetivo de ahorro" style={{ flex: 1 }} />
            <button onClick={() => { guardarBalance("objetivo", valObj); setEditandoObj(false); }}
              style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 10, padding: "0 14px", cursor: "pointer", fontWeight: 700, flexShrink: 0 }}>✓</button>
          </div>
        )}
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr 1fr", gap: 10 }}>
        {[
          { label: "Ahorrás/mes", val: fmt(ahorrando), sub: `${ahorroPct}% ingresos`, color: C.green },
          { label: "Gasto diario", val: fmt(gastoDiario), sub: "promedio", color: C.gold },
          { label: "Predicción mes", val: fmt(prediccion), sub: "en gastos", color: C.red },
          { label: "Ahorro anual", val: fmt(ahorrando * 12), sub: "proyectado", color: C.accent },
        ].map((s, i) => (
          <Card key={i} style={{ textAlign: "center", padding: 14 }}>
            <p style={{ color: C.textMid, fontSize: 12, marginBottom: 6 }}>{s.label}</p>
            <p style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.val}</p>
            <p style={{ color: C.textMid, fontSize: 11, marginTop: 4 }}>{s.sub}</p>
          </Card>
        ))}
      </div>

      {(totalDeliv > 0 || suscripciones.length > 0) && (
        <>
          <p style={{ fontWeight: 700, fontSize: 16 }}>⚠️ Alertas</p>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
            {totalDeliv > 0 && (
              <Card style={{ padding: 14, background: C.goldLight, border: `1.5px solid ${C.gold}30` }}>
                <p style={{ fontSize: 13, fontWeight: 600 }}>🛵 Deliveries este mes</p>
                <p style={{ fontSize: 20, fontWeight: 800, color: C.gold, marginTop: 4 }}>{fmt(totalDeliv)}</p>
                <p style={{ fontSize: 11, color: C.textMid, marginTop: 2 }}>{deliveries.length} pedidos</p>
              </Card>
            )}
            {suscripciones.length > 0 && (
              <Card style={{ padding: 14, background: C.accentLight, border: `1.5px solid ${C.accent}30` }}>
                <p style={{ fontSize: 13, fontWeight: 600 }}>🔄 Suscripciones activas</p>
                <p style={{ fontSize: 20, fontWeight: 800, color: C.accent, marginTop: 4 }}>{fmt(totalSusc)}/mes</p>
                <p style={{ fontSize: 11, color: C.textMid, marginTop: 2 }}>{suscripciones.length} suscripciones</p>
              </Card>
            )}
          </div>
        </>
      )}

      {historial.length > 0 && (
        <>
          <p style={{ fontWeight: 700, fontSize: 16 }}>📊 Historial mensual</p>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 10 }}>
            {historial.map((h, i) => (
              <Card key={i} style={{ padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <p style={{ fontWeight: 700, fontSize: 13 }}>{h.mes}</p>
                  <p style={{ fontSize: 12, color: h.ahorro >= 0 ? C.green : C.red, fontWeight: 700 }}>{h.ahorro >= 0 ? "+" : ""}{fmt(h.ahorro)}</p>
                </div>
                <p style={{ fontSize: 11, color: C.textMid }}>Ingresos: <b style={{ color: C.green }}>{fmt(h.ingresos)}</b></p>
                <p style={{ fontSize: 11, color: C.textMid, marginTop: 2 }}>Gastos: <b style={{ color: C.red }}>{fmt(h.gastos)}</b></p>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── TAB MOVIMIENTOS ──────────────────────────────────────────────────────────
function TabMovimientos({ transacciones, onEliminar, isMobile }) {
  const [filtro, setFiltro] = useState("todos");
  const lista = transacciones.filter(t => filtro === "todos" || t.tipo === filtro);
  const gastosCat = {};
  transacciones.filter(t => t.tipo === "gasto").forEach(t => { gastosCat[t.cat] = (gastosCat[t.cat] || 0) + t.monto; });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {Object.keys(gastosCat).length > 0 && (
        <>
          <p style={{ fontWeight: 700, fontSize: 16 }}>Gastos por categoría</p>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(3, 1fr)" : "repeat(5, 1fr)", gap: 10 }}>
            {Object.entries(gastosCat).sort((a, b) => b[1] - a[1]).map(([cat, tot]) => (
              <Card key={cat} style={{ padding: 12, textAlign: "center" }}>
                <p style={{ fontSize: 22 }}>{CATEGORIAS[cat]?.icono || "📦"}</p>
                <p style={{ fontSize: 11, color: C.textMid, fontWeight: 600, marginTop: 4 }}>{CATEGORIAS[cat]?.label || cat}</p>
                <p style={{ fontSize: 13, fontWeight: 800, color: CATEGORIAS[cat]?.color || C.text, marginTop: 4 }}>{fmt(tot)}</p>
              </Card>
            ))}
          </div>
        </>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        {[["todos", "Todos"], ["gasto", "Gastos"], ["ingreso", "Ingresos"]].map(([val, label]) => (
          <button key={val} onClick={() => setFiltro(val)}
            style={{ flex: 1, padding: "10px 4px", borderRadius: 12, border: `2px solid ${filtro === val ? C.accent : C.border}`, background: filtro === val ? C.accentLight : C.white, color: filtro === val ? C.accent : C.textMid, fontFamily: "inherit", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            {label}
          </button>
        ))}
      </div>
      {lista.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 40 }}>
          <p style={{ fontSize: 36, marginBottom: 12 }}>📭</p>
          <p style={{ fontWeight: 700, fontSize: 15 }}>Sin movimientos todavía</p>
          <p style={{ color: C.textMid, fontSize: 13, marginTop: 6 }}>Tocá el + para agregar uno</p>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
          {lista.map(t => (
            <Card key={t.id} style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: (CATEGORIAS[t.cat]?.color || C.accent) + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                {CATEGORIAS[t.cat]?.icono || "📦"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.descripcion}</p>
                <p style={{ color: C.textLight, fontSize: 11, marginTop: 2 }}>{t.fecha}{t.recurrente ? " · Fijo 🔄" : ""}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                <p style={{ fontWeight: 800, fontSize: 14, color: t.tipo === "ingreso" ? C.green : C.red }}>{t.tipo === "ingreso" ? "+" : "-"}{fmt(t.monto)}</p>
                <button onClick={() => { if (window.confirm(`¿Eliminás "${t.descripcion}"?`)) onEliminar(t.id); }}
                  style={{ fontSize: 10, color: C.textLight, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>🗑️ Eliminar</button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TAB METAS ────────────────────────────────────────────────────────────────
function TabMetas({ transacciones, balances, isMobile }) {
  const ingresos  = transacciones.filter(t => t.tipo === "ingreso").reduce((a, b) => a + b.monto, 0);
  const gastos    = transacciones.filter(t => t.tipo === "gasto").reduce((a, b) => a + b.monto, 0);
  const ahorrando = ingresos - gastos;
  const metas = [
    { nombre: "Objetivo de ahorro", icono: "🎯", objetivo: balances.objetivo || 0, actual: balances.ahorros || 0, color: C.green },
    { nombre: "Pagar deudas", icono: "💳", objetivo: balances.deudas || 0, actual: Math.min(ahorrando * 3, balances.deudas || 0), color: C.red },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ fontWeight: 700, fontSize: 18 }}>Mis Metas</p>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
        {metas.map((meta, i) => {
          const pct   = meta.objetivo > 0 ? Math.min(Math.round((meta.actual / meta.objetivo) * 100), 100) : 0;
          const falta = Math.max(0, meta.objetivo - meta.actual);
          const meses = ahorrando > 0 && falta > 0 ? Math.ceil(falta / ahorrando) : "—";
          return (
            <Card key={i}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: meta.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>{meta.icono}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 15 }}>{meta.nombre}</p>
                  <p style={{ color: C.textMid, fontSize: 12, marginTop: 2 }}>~{meses} meses</p>
                </div>
                <p style={{ fontSize: 24, fontWeight: 800, color: meta.color, flexShrink: 0 }}>{pct}%</p>
              </div>
              <Barra pct={pct} color={meta.color} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, flexWrap: "wrap", gap: 4 }}>
                <p style={{ color: C.textMid, fontSize: 12 }}>Actual: <b style={{ color: C.text }}>{fmt(meta.actual)}</b></p>
                <p style={{ color: C.textMid, fontSize: 12 }}>Falta: <b style={{ color: meta.color }}>{fmt(falta)}</b></p>
              </div>
              {pct >= 100 && <p style={{ color: C.green, fontWeight: 700, marginTop: 10 }}>🎉 ¡Meta cumplida!</p>}
            </Card>
          );
        })}
      </div>
      <Card style={{ background: C.accentLight, border: `1.5px solid ${C.accent}30` }}>
        <p style={{ fontWeight: 700, fontSize: 14, color: C.accent, marginBottom: 8 }}>💡 Tu capacidad de ahorro</p>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 8 }}>
          <p style={{ fontSize: 13, color: C.text }}>Ahorrás <b>{fmt(ahorrando)}</b>/mes</p>
          <p style={{ fontSize: 13, color: C.text }}>En un año: <b style={{ color: C.accent }}>{fmt(ahorrando * 12)}</b></p>
        </div>
      </Card>
    </div>
  );
}

// ─── DETALLE ESPACIO ──────────────────────────────────────────────────────────
function DetalleEspacio({ espacio, userId, onClose, isMobile }) {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [desc, setDesc]               = useState("");
  const [monto, setMonto]             = useState("");
  const [copiado, setCopiado]         = useState(false);

  const cargarMovimientos = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("espacio_movimientos").select("*")
      .eq("espacio_id", espacio.id).order("created_at", { ascending: false });
    setMovimientos(data || []);
    setLoading(false);
  }, [espacio.id]);

  useEffect(() => { cargarMovimientos(); }, [cargarMovimientos]);

  const agregar = async () => {
    if (!desc.trim() || !monto) return;
    await supabase.from("espacio_movimientos").insert({
      espacio_id: espacio.id, user_id: userId,
      descripcion: desc, monto: parseFloat(monto),
      tipo: "aporte", fecha: new Date().toISOString().split("T")[0],
    });
    setDesc(""); setMonto("");
    cargarMovimientos();
  };

  const copiarCodigo = () => {
    navigator.clipboard.writeText(espacio.codigo).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  };

  const total     = movimientos.reduce((a, b) => a + b.monto, 0);
  const miTotal   = movimientos.filter(m => m.user_id === userId).reduce((a, b) => a + b.monto, 0);
  const otroTotal = total - miTotal;
  const objPct    = espacio.objetivo > 0 ? Math.min(Math.round((total / espacio.objetivo) * 100), 100) : 0;
  const sueldoPct = espacio.sueldo_acordado > 0 ? Math.min(Math.round((total / espacio.sueldo_acordado) * 100), 100) : 0;
  const mesActual = new Date().toISOString().slice(0, 7);
  const pagosMes  = movimientos.filter(m => m.fecha?.slice(0, 7) === mesActual);
  const totalMes  = pagosMes.reduce((a, b) => a + b.monto, 0);

  return (
    <div style={{ position: "fixed", inset: 0, background: C.bg, zIndex: 300, overflowY: "auto", overflowX: "hidden" }}>
      <div style={{ maxWidth: isMobile ? "100%" : 900, margin: "0 auto", paddingBottom: 40 }}>
        <div style={{ background: C.white, borderBottom: `2px solid ${C.border}`, padding: "16px 20px", position: "sticky", top: 0, zIndex: 10, display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={onClose} style={{ width: 38, height: 38, borderRadius: 12, background: C.bg, border: "none", cursor: "pointer", fontSize: 20, flexShrink: 0 }}>←</button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 800, fontSize: 17, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{espacio.nombre}</p>
          </div>
          <button onClick={copiarCodigo}
            style={{ padding: "9px 16px", borderRadius: 12, border: `2px solid ${copiado ? C.green : C.accent}`, background: copiado ? C.greenLight : C.accentLight, color: copiado ? C.green : C.accent, fontFamily: "inherit", fontWeight: 700, fontSize: 13, cursor: "pointer", flexShrink: 0, transition: "all 0.2s" }}>
            {copiado ? "✓ Copiado!" : `📋 ${espacio.codigo}`}
          </button>
        </div>

        <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {espacio.tipo === "sueldo" ? (
              <Card style={{ background: `linear-gradient(135deg, ${C.gold} 0%, #b45309 100%)`, border: "none" }}>
                <p style={{ color: "#ffffffaa", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>TOTAL PAGADO</p>
                <p style={{ color: "#fff", fontSize: 38, fontWeight: 800 }}>{fmt(total)}</p>
                {espacio.sueldo_acordado > 0 && (<><p style={{ color: "#ffffffbb", fontSize: 13, marginTop: 6 }}>Acordado: {fmt(espacio.sueldo_acordado)}/mes</p><div style={{ marginTop: 10 }}><Barra pct={sueldoPct} color="#ffffff60" /><p style={{ color: "#ffffffaa", fontSize: 11, marginTop: 6 }}>{sueldoPct}% del sueldo mensual</p></div></>)}
                <div style={{ display: "flex", gap: 32, marginTop: 14, borderTop: "1px solid #ffffff30", paddingTop: 12 }}>
                  <div><p style={{ color: "#ffffffaa", fontSize: 11 }}>Este mes</p><p style={{ color: "#fff", fontSize: 18, fontWeight: 800 }}>{fmt(totalMes)}</p></div>
                  <div><p style={{ color: "#ffffffaa", fontSize: 11 }}>Pagos este mes</p><p style={{ color: "#fff", fontSize: 18, fontWeight: 800 }}>{pagosMes.length}</p></div>
                </div>
              </Card>
            ) : (
              <Card style={{ background: `linear-gradient(135deg, ${C.accent} 0%, #1250c0 100%)`, border: "none" }}>
                <p style={{ color: "#ffffffaa", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>TOTAL ACUMULADO</p>
                <p style={{ color: "#fff", fontSize: 38, fontWeight: 800 }}>{fmt(total)}</p>
                {espacio.objetivo > 0 && (<><p style={{ color: "#ffffffbb", fontSize: 13, marginTop: 6 }}>Objetivo: {fmt(espacio.objetivo)}</p><div style={{ marginTop: 10 }}><Barra pct={objPct} color="#ffffff60" /><p style={{ color: "#ffffffaa", fontSize: 11, marginTop: 6 }}>{objPct}% del objetivo</p></div></>)}
                <div style={{ display: "flex", gap: 32, marginTop: 14, borderTop: "1px solid #ffffff30", paddingTop: 12 }}>
                  <div><p style={{ color: "#ffffffaa", fontSize: 11 }}>Mi aporte</p><p style={{ color: "#fff", fontSize: 18, fontWeight: 800 }}>{fmt(miTotal)}</p></div>
                  <div><p style={{ color: "#ffffffaa", fontSize: 11 }}>Otro aporte</p><p style={{ color: "#fff", fontSize: 18, fontWeight: 800 }}>{fmt(otroTotal)}</p></div>
                </div>
              </Card>
            )}
            <Card>
              <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>{espacio.tipo === "sueldo" ? "Registrar pago 💼" : "Agregar aporte 💰"}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input placeholder={espacio.tipo === "sueldo" ? "Ej: Pago semanal, Adelanto..." : "Ej: Aporte mayo..."} value={desc} onChange={e => setDesc(e.target.value)} />
                <input placeholder="Monto ($)" type="number" value={monto} onChange={e => setMonto(e.target.value)} />
                <button onClick={agregar} style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 14, padding: "13px", fontSize: 14, fontFamily: "inherit", fontWeight: 700, cursor: "pointer" }}>Guardar</button>
              </div>
            </Card>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ fontWeight: 700, fontSize: 16 }}>Historial</p>
            {loading ? <p style={{ color: C.textMid, textAlign: "center", padding: 20 }}>Cargando...</p> :
              movimientos.length === 0 ? <Card style={{ textAlign: "center", padding: 30 }}><p style={{ color: C.textMid }}>Sin movimientos todavía</p></Card> :
              movimientos.map(m => (
                <Card key={m.id} style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: m.user_id === userId ? C.accentLight : C.goldLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{m.user_id === userId ? "👤" : "👥"}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.descripcion}</p>
                    <p style={{ color: C.textLight, fontSize: 11, marginTop: 2 }}>{m.fecha} · {m.user_id === userId ? "Vos" : "Otro"}</p>
                  </div>
                  <p style={{ fontWeight: 800, fontSize: 14, color: C.green, flexShrink: 0 }}>+{fmt(m.monto)}</p>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TAB COMPARTIDO ───────────────────────────────────────────────────────────
function TabCompartido({ userId, isMobile }) {
  const [espacios, setEspacios]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [modalNuevo, setModalNuevo]     = useState(false);
  const [modalUnirse, setModalUnirse]   = useState(false);
  const [modalDetalle, setModalDetalle] = useState(null);
  const [nuevoNombre, setNuevoNombre]   = useState("");
  const [nuevoTipo, setNuevoTipo]       = useState("ahorro");
  const [nuevoObj, setNuevoObj]         = useState("");
  const [nuevoSueldo, setNuevoSueldo]   = useState("");
  const [codigoUnirse, setCodigoUnirse] = useState("");
  const [msgUnirse, setMsgUnirse]       = useState("");
  const [creando, setCreando]           = useState(false);
  const [uniendose, setUniendose]       = useState(false);

  const cargarEspacios = useCallback(async () => {
    setLoading(true);
    try {
      const { data: miembros } = await supabase.from("espacio_miembros").select("espacio_id").eq("user_id", userId);
      const ids = (miembros || []).map(m => m.espacio_id);
      const { data: propios } = await supabase.from("espacios").select("*").eq("creado_por", userId);
      let compartidos = [];
      if (ids.length > 0) {
        const { data } = await supabase.from("espacios").select("*").in("id", ids);
        compartidos = (data || []).filter(c => !(propios || []).find(p => p.id === c.id));
      }
      setEspacios([...(propios || []), ...compartidos]);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [userId]);

  useEffect(() => { cargarEspacios(); }, [cargarEspacios]);

  const crearEspacio = async () => {
    if (!nuevoNombre.trim() || creando) return;
    setCreando(true);
    try {
      const codigo = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { data, error } = await supabase.from("espacios").insert({
        nombre: nuevoNombre, tipo: nuevoTipo, codigo, creado_por: userId,
        objetivo: parseFloat(nuevoObj) || 0, sueldo_acordado: parseFloat(nuevoSueldo) || 0,
      }).select().single();
      if (error) { alert("Error: " + error.message); setCreando(false); return; }
      await supabase.from("espacio_miembros").insert({ espacio_id: data.id, user_id: userId, rol: "creador" });
      setModalNuevo(false);
      setNuevoNombre(""); setNuevoTipo("ahorro"); setNuevoObj(""); setNuevoSueldo("");
      await cargarEspacios();
    } catch (e) { alert("Error inesperado"); }
    setCreando(false);
  };

  const unirseEspacio = async () => {
    if (!codigoUnirse.trim() || uniendose) return;
    setUniendose(true);
    setMsgUnirse("");
    try {
      const codigoLimpio = codigoUnirse.trim().toUpperCase();
      const { data: espacio, error: errEsp } = await supabase
        .from("espacios").select("*").eq("codigo", codigoLimpio).maybeSingle();
      if (errEsp || !espacio) { setMsgUnirse("Código no encontrado. Verificá que esté bien escrito."); setUniendose(false); return; }
      const { data: yaEsta } = await supabase.from("espacio_miembros").select("id")
        .eq("espacio_id", espacio.id).eq("user_id", userId).maybeSingle();
      if (yaEsta) { setMsgUnirse("Ya sos miembro de este espacio."); setUniendose(false); return; }
      const { error: errM } = await supabase.from("espacio_miembros").insert({ espacio_id: espacio.id, user_id: userId, rol: "miembro" });
      if (errM) { setMsgUnirse("Error al unirse: " + errM.message); setUniendose(false); return; }
      setModalUnirse(false); setCodigoUnirse(""); setMsgUnirse("");
      await cargarEspacios();
    } catch (e) { setMsgUnirse("Error inesperado."); }
    setUniendose(false);
  };

  const iconoTipo = (tipo) => tipo === "sueldo" ? "💼" : tipo === "ahorro" ? "🐷" : "🤝";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontWeight: 700, fontSize: 17 }}>Espacios Compartidos</p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { setMsgUnirse(""); setCodigoUnirse(""); setModalUnirse(true); }}
            style={{ padding: "10px 16px", borderRadius: 12, border: `2px solid ${C.accent}`, background: C.accentLight, color: C.accent, fontFamily: "inherit", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            Unirse
          </button>
          <button onClick={() => setModalNuevo(true)}
            style={{ padding: "10px 16px", borderRadius: 12, border: "none", background: C.accent, color: "#fff", fontFamily: "inherit", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            + Nuevo
          </button>
        </div>
      </div>

      {loading ? <p style={{ color: C.textMid, textAlign: "center", padding: 40 }}>Cargando...</p> :
        espacios.length === 0 ? (
          <Card style={{ textAlign: "center", padding: 40 }}>
            <p style={{ fontSize: 36, marginBottom: 12 }}>🤝</p>
            <p style={{ fontWeight: 700, fontSize: 15 }}>Sin espacios todavía</p>
            <p style={{ color: C.textMid, fontSize: 13, marginTop: 6 }}>Creá uno o unite con un código</p>
          </Card>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 12 }}>
            {espacios.map(e => (
              <Card key={e.id} style={{ cursor: "pointer" }} onClick={() => setModalDetalle(e)}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 14, background: C.accentLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{iconoTipo(e.tipo)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.nombre}</p>
                    <p style={{ color: C.textMid, fontSize: 12, marginTop: 2, textTransform: "capitalize" }}>{e.tipo} · <b style={{ color: C.accent }}>{e.codigo}</b></p>
                  </div>
                  <p style={{ color: C.textLight, fontSize: 18, flexShrink: 0 }}>›</p>
                </div>
              </Card>
            ))}
          </div>
        )
      }

      {modalNuevo && (
        <Modal title="✨ Nuevo espacio" onClose={() => setModalNuevo(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input placeholder="Nombre (ej: Vacaciones 2026)" value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} />
            <select value={nuevoTipo} onChange={e => setNuevoTipo(e.target.value)}>
              <option value="ahorro">🐷 Ahorro compartido</option>
              <option value="sueldo">💼 Registro de sueldo</option>
              <option value="general">🤝 General</option>
            </select>
            {nuevoTipo === "ahorro" && <input placeholder="Objetivo de ahorro ($)" type="number" value={nuevoObj} onChange={e => setNuevoObj(e.target.value)} />}
            {nuevoTipo === "sueldo" && <input placeholder="Sueldo mensual acordado ($)" type="number" value={nuevoSueldo} onChange={e => setNuevoSueldo(e.target.value)} />}
            <button onClick={crearEspacio} disabled={creando}
              style={{ background: `linear-gradient(135deg, ${C.accent}, #1250c0)`, color: "#fff", border: "none", borderRadius: 14, padding: "14px", fontSize: 15, fontFamily: "inherit", fontWeight: 700, cursor: "pointer", opacity: creando ? 0.7 : 1, boxShadow: `0 6px 20px ${C.accent}40` }}>
              {creando ? "Creando..." : "Crear espacio 🚀"}
            </button>
          </div>
        </Modal>
      )}

      {modalUnirse && (
        <Modal title="🔑 Unirse a un espacio" onClose={() => setModalUnirse(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ color: C.textMid, fontSize: 14 }}>Ingresá el código que te compartieron:</p>
            <div style={{ background: C.bg, borderRadius: 16, padding: "20px 16px", textAlign: "center" }}>
              <input
                placeholder="ABC123"
                value={codigoUnirse}
                onChange={e => setCodigoUnirse(e.target.value.toUpperCase())}
                style={{ textTransform: "uppercase", letterSpacing: 8, fontSize: 28, fontWeight: 800, textAlign: "center", border: `2px solid ${C.border}`, borderRadius: 14, background: C.white }}
              />
            </div>
            {msgUnirse && (
              <div style={{ padding: "10px 14px", borderRadius: 12, background: msgUnirse.includes("miembro") ? C.goldLight : C.redLight }}>
                <p style={{ color: msgUnirse.includes("miembro") ? C.gold : C.red, fontSize: 13, fontWeight: 600 }}>{msgUnirse}</p>
              </div>
            )}
            <button onClick={unirseEspacio} disabled={uniendose}
              style={{ background: `linear-gradient(135deg, ${C.accent}, #1250c0)`, color: "#fff", border: "none", borderRadius: 14, padding: "14px", fontSize: 15, fontFamily: "inherit", fontWeight: 700, cursor: "pointer", opacity: uniendose ? 0.7 : 1, boxShadow: `0 6px 20px ${C.accent}40` }}>
              {uniendose ? "Verificando..." : "Unirse →"}
            </button>
          </div>
        </Modal>
      )}

      {modalDetalle && (
        <DetalleEspacio espacio={modalDetalle} userId={userId} isMobile={isMobile}
          onClose={() => { setModalDetalle(null); cargarEspacios(); }} />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// APP PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [session, setSession]             = useState(undefined);
  const [tab, setTab]                     = useState("inicio");
  const [transacciones, setTransacciones] = useState([]);
  const [balances, setBalances]           = useState({});
  const [historial, setHistorial]         = useState([]);
  const [isMobile, setIsMobile]           = useState(window.innerWidth < 768);
  const [modalAdd, setModalAdd]           = useState(false);
  const [modalAI, setModalAI]             = useState(false);
  const [modalCompra, setModalCompra]     = useState(false);
  const [newTx, setNewTx]                 = useState({ descripcion: "", monto: "", tipo: "gasto", cat: "comida", recurrente: false });
  const [compra, setCompra]               = useState({ nombre: "", precio: "" });
  const [compraRes, setCompraRes]         = useState(null);
  const [compraLoading, setCompraLoading] = useState(false);
  const [aiChat, setAiChat]               = useState([{ role: "assistant", text: "¡Hola! Soy tu asistente financiero 😊\n\n¿Qué querés saber sobre tus finanzas?" }]);
  const [aiInput, setAiInput]             = useState("");
  const [aiLoading, setAiLoading]         = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  const cargarTransacciones = useCallback(async () => {
    if (!session) return;
    const mesActual = new Date().toISOString().slice(0, 7);
    const { data } = await supabase.from("transacciones").select("*")
      .eq("user_id", session.user.id).gte("fecha", `${mesActual}-01`)
      .order("created_at", { ascending: false });
    setTransacciones(data || []);
  }, [session]);

  const cargarBalances = useCallback(async () => {
    if (!session) return;
    const { data } = await supabase.from("balances").select("*").eq("user_id", session.user.id).maybeSingle();
    if (data) setBalances(data);
  }, [session]);

  const cargarHistorial = useCallback(async () => {
    if (!session) return;
    const { data } = await supabase.from("historial_mensual").select("*")
      .eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(6);
    if (data) setHistorial(data);
  }, [session]);

  const verificarCierreMes = useCallback(async () => {
    if (!session) return;
    const hoy = new Date();
    const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
    if (hoy.getDate() !== ultimoDia) return;
    const mesActual = hoy.toISOString().slice(0, 7);
    const { data: yaGuardado } = await supabase.from("historial_mensual").select("id")
      .eq("user_id", session.user.id).eq("mes", mesActual).maybeSingle();
    if (yaGuardado) return;
    const { data: txs } = await supabase.from("transacciones").select("*")
      .eq("user_id", session.user.id).gte("fecha", `${mesActual}-01`);
    const ing = (txs || []).filter(t => t.tipo === "ingreso").reduce((a, b) => a + b.monto, 0);
    const gas = (txs || []).filter(t => t.tipo === "gasto").reduce((a, b) => a + b.monto, 0);
    const nombreMes = hoy.toLocaleString("es-AR", { month: "long", year: "numeric" });
    await supabase.from("historial_mensual").insert({ user_id: session.user.id, mes: nombreMes, ingresos: ing, gastos: gas, ahorro: ing - gas });
    cargarHistorial();
  }, [session, cargarHistorial]);

  useEffect(() => {
    if (session) { cargarTransacciones(); cargarBalances(); cargarHistorial(); verificarCierreMes(); }
  }, [session, cargarTransacciones, cargarBalances, cargarHistorial, verificarCierreMes]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [aiChat]);

  const agregarTx = async () => {
    if (!newTx.descripcion.trim() || !newTx.monto) return;
    const { data } = await supabase.from("transacciones").insert({
      user_id: session.user.id, descripcion: newTx.descripcion,
      monto: parseFloat(newTx.monto), tipo: newTx.tipo, cat: newTx.cat,
      recurrente: newTx.recurrente, fecha: new Date().toISOString().split("T")[0],
    }).select().single();
    if (data) setTransacciones(prev => [data, ...prev]);
    setNewTx({ descripcion: "", monto: "", tipo: "gasto", cat: "comida", recurrente: false });
    setModalAdd(false);
  };

  const eliminarTx = async (id) => {
    await supabase.from("transacciones").delete().eq("id", id);
    setTransacciones(prev => prev.filter(t => t.id !== id));
  };

  const cerrarSesion = async () => {
    if (window.confirm("¿Querés cerrar sesión?")) await supabase.auth.signOut();
  };

  const ingresos  = transacciones.filter(t => t.tipo === "ingreso").reduce((a, b) => a + b.monto, 0);
  const gastos    = transacciones.filter(t => t.tipo === "gasto").reduce((a, b) => a + b.monto, 0);
  const ahorrando = ingresos - gastos;

  const enviarAI = async () => {
    if (!aiInput.trim() || aiLoading) return;
    const msg = aiInput.trim();
    setAiInput("");
    setAiChat(prev => [...prev, { role: "user", text: msg }]);
    setAiLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: `Sos un asesor financiero amigable. Hablás en español rioplatense.
Datos: Ingresos: ${fmt(ingresos)}, Gastos: ${fmt(gastos)}, Ahorrando: ${fmt(ahorrando)}/mes.
Balances: Efectivo ${fmt(balances.efectivo||0)}, Banco ${fmt(balances.banco||0)}, MercadoPago ${fmt(balances.mercadopago||0)}, Ahorros ${fmt(balances.ahorros||0)}, Deudas ${fmt(balances.deudas||0)}.
Respondé simple, claro y con emojis. Máximo 3 párrafos.`,
          messages: [...aiChat.slice(1).map(m => ({ role: m.role, content: m.text })), { role: "user", content: msg }],
        }),
      });
      const d = await res.json();
      setAiChat(prev => [...prev, { role: "assistant", text: d.content?.[0]?.text || "No pude responder." }]);
    } catch {
      setAiChat(prev => [...prev, { role: "assistant", text: "Hubo un error. Intentá de nuevo." }]);
    }
    setAiLoading(false);
  };

  const analizarCompra = async () => {
    if (!compra.nombre.trim() || !compra.precio || compraLoading) return;
    setCompraLoading(true);
    const precio = parseFloat(compra.precio);
    const horas  = ingresos > 0 ? Math.round(precio / (ingresos / 160)) : 0;
    const pct    = ingresos > 0 ? Math.round((precio / ingresos) * 100) : 0;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 600,
          system: `Asesor financiero. Respondé SOLO con JSON sin markdown: {"veredicto":"COMPRAR|ESPERAR|NO COMPRAR","emoji":"","razon":"frase corta","consejo":"consejo práctico"}`,
          messages: [{ role: "user", content: `Gana ${fmt(ingresos)}/mes, ahorra ${fmt(ahorrando)}/mes. Quiere comprar: ${compra.nombre} por ${fmt(precio)} (${horas}hs de trabajo, ${pct}% del ingreso).` }],
        }),
      });
      const d = await res.json();
      const parsed = JSON.parse((d.content?.[0]?.text || "{}").replace(/```json|```/g, "").trim());
      setCompraRes({ ...parsed, precio, horas, pct });
    } catch {
      setCompraRes({ veredicto: "ESPERAR", emoji: "⏸️", razon: `Son ${horas} horas de trabajo.`, consejo: "Esperá 48hs antes de decidir.", precio, horas, pct });
    }
    setCompraLoading(false);
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { overflow-x: hidden; }
    body { background: ${C.bg}; color: ${C.text}; font-family: 'Plus Jakarta Sans', sans-serif; }
    ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(12px);} to { opacity:1; transform:translateY(0);} }
    @keyframes popIn  { from { opacity:0; transform:scale(0.95);} to { opacity:1; transform:scale(1);} }
    @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.5} }
    @keyframes spin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    input, select { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px; padding: 12px 14px; border: 2px solid ${C.border}; border-radius: 14px; background: ${C.white}; color: ${C.text}; width: 100%; outline: none; transition: border-color 0.2s; }
    input:focus, select:focus { border-color: ${C.accent}; }
    select option { background: ${C.white}; }
  `;

  const userNombre = balances.nombre_usuario || session?.user?.user_metadata?.nombre || session?.user?.email?.split("@")[0] || "Vos";

  if (session === undefined) return <><style>{css}</style><Spinner /></>;
  if (!session) return <><style>{css}</style><PantallaLogin /></>;

  const renderContenido = () => {
    switch(tab) {
      case "inicio":      return <TabInicio transacciones={transacciones} balances={balances} setBalances={setBalances} userId={session.user.id} historial={historial} isMobile={isMobile} />;
      case "movimientos": return <TabMovimientos transacciones={transacciones} onEliminar={eliminarTx} isMobile={isMobile} />;
      case "metas":       return <TabMetas transacciones={transacciones} balances={balances} isMobile={isMobile} />;
      case "compartido":  return <TabCompartido userId={session.user.id} isMobile={isMobile} />;
      case "perfil":      return <TabPerfil session={session} balances={balances} setBalances={setBalances} onCerrarSesion={cerrarSesion} />;
      default:            return null;
    }
  };

  const renderModales = () => (
    <>
      {modalAdd && (
        <Modal title="➕ Nuevo movimiento" onClose={() => setModalAdd(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input placeholder="¿En qué gastaste o de dónde ingresó?" value={newTx.descripcion} onChange={e => setNewTx({ ...newTx, descripcion: e.target.value })} />
            <input placeholder="Monto ($)" type="number" value={newTx.monto} onChange={e => setNewTx({ ...newTx, monto: e.target.value })} />
            <div style={{ display: "flex", gap: 10 }}>
              {[["gasto", "💸 Gasto"], ["ingreso", "💰 Ingreso"]].map(([val, label]) => (
                <button key={val} onClick={() => setNewTx({ ...newTx, tipo: val })}
                  style={{ flex: 1, padding: "12px", border: `2px solid ${newTx.tipo === val ? (val === "gasto" ? C.red : C.green) : C.border}`, borderRadius: 14, background: newTx.tipo === val ? (val === "gasto" ? C.redLight : C.greenLight) : C.white, color: newTx.tipo === val ? (val === "gasto" ? C.red : C.green) : C.textMid, fontFamily: "inherit", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                  {label}
                </button>
              ))}
            </div>
            <select value={newTx.cat} onChange={e => setNewTx({ ...newTx, cat: e.target.value })}>
              {Object.entries(CATEGORIAS).map(([k, v]) => <option key={k} value={k}>{v.icono} {v.label}</option>)}
            </select>
            <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: C.textMid, cursor: "pointer" }}>
              <input type="checkbox" checked={newTx.recurrente} onChange={e => setNewTx({ ...newTx, recurrente: e.target.checked })} style={{ width: "auto", accentColor: C.accent }} />
              🔄 Se repite todos los meses
            </label>
            <button onClick={agregarTx} style={{ background: `linear-gradient(135deg, ${C.accent}, #1250c0)`, color: "#fff", border: "none", borderRadius: 14, padding: "14px", fontSize: 15, fontFamily: "inherit", fontWeight: 700, cursor: "pointer", boxShadow: `0 6px 20px ${C.accent}40` }}>
              Guardar
            </button>
          </div>
        </Modal>
      )}

      {modalAI && (
        <div onClick={e => e.target === e.currentTarget && setModalAI(false)}
          style={{ position: "fixed", inset: 0, background: "#00000065", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: C.white, borderRadius: 24, width: "100%", maxWidth: 520, height: "75vh", maxHeight: 680, display: "flex", flexDirection: "column", boxShadow: "0 20px 60px #00000025", animation: "popIn 0.25s ease" }}>
            <div style={{ padding: "18px 20px", borderBottom: `2px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: C.accentLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🤖</div>
                <div>
                  <p style={{ fontWeight: 800, fontSize: 15 }}>Asistente Financiero</p>
                  <p style={{ color: C.green, fontSize: 11, fontWeight: 700 }}>● En línea</p>
                </div>
              </div>
              <button onClick={() => setModalAI(false)} style={{ width: 34, height: 34, borderRadius: 10, background: C.bg, border: "none", cursor: "pointer", fontSize: 17 }}>✕</button>
            </div>
            <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              {aiChat.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "82%", padding: "12px 14px", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: m.role === "user" ? C.accent : C.bg, color: m.role === "user" ? "#fff" : C.text, fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap", fontWeight: 500 }}>
                    {m.text}
                  </div>
                </div>
              ))}
              {aiLoading && <div style={{ display: "flex" }}><div style={{ padding: "12px 14px", borderRadius: "18px 18px 18px 4px", background: C.bg, animation: "pulse 1s infinite", fontSize: 16 }}>💭</div></div>}
            </div>
            <div style={{ padding: "8px 14px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8, overflowX: "auto", flexShrink: 0 }}>
              {["¿Estoy ahorrando bien?", "¿Cómo bajo mis gastos?", "Predicción fin de mes"].map(q => (
                <button key={q} onClick={() => setAiInput(q)}
                  style={{ whiteSpace: "nowrap", padding: "7px 12px", borderRadius: 20, background: C.accentLight, border: `1.5px solid ${C.accent}40`, color: C.accent, fontFamily: "inherit", fontSize: 11, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
                  {q}
                </button>
              ))}
            </div>
            <div style={{ padding: 14, borderTop: `2px solid ${C.border}`, display: "flex", gap: 8, flexShrink: 0 }}>
              <input placeholder="Escribí tu consulta..." value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === "Enter" && enviarAI()} style={{ flex: 1 }} />
              <button onClick={enviarAI} style={{ padding: "0 18px", background: C.accent, color: "#fff", border: "none", borderRadius: 14, fontFamily: "inherit", fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: aiLoading ? 0.6 : 1, flexShrink: 0 }}>Enviar</button>
            </div>
          </div>
        </div>
      )}

      {modalCompra && (
        <Modal title="🛒 ¿Me conviene comprarlo?" onClose={() => { setModalCompra(false); setCompraRes(null); }}>
          <p style={{ color: C.textMid, fontSize: 13, marginBottom: 16 }}>Analizá cualquier compra antes de hacerla.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 14 }}>
            <input placeholder="¿Qué querés comprar?" value={compra.nombre} onChange={e => setCompra({ ...compra, nombre: e.target.value })} />
            <input placeholder="Precio ($)" type="number" value={compra.precio} onChange={e => setCompra({ ...compra, precio: e.target.value })} />
            <button onClick={analizarCompra} style={{ background: `linear-gradient(135deg, ${C.accent}, #1250c0)`, color: "#fff", border: "none", borderRadius: 14, padding: "13px", fontSize: 15, fontFamily: "inherit", fontWeight: 700, cursor: "pointer", opacity: compraLoading ? 0.7 : 1, boxShadow: `0 6px 20px ${C.accent}40` }}>
              {compraLoading ? "Analizando... 🧠" : "Analizar compra"}
            </button>
          </div>
          {compraRes && (
            <div style={{ animation: "fadeUp 0.3s ease" }}>
              <div style={{ padding: 18, borderRadius: 18, textAlign: "center", marginBottom: 12, background: compraRes.veredicto === "COMPRAR" ? C.greenLight : compraRes.veredicto === "NO COMPRAR" ? C.redLight : C.goldLight, border: `2px solid ${compraRes.veredicto === "COMPRAR" ? C.green : compraRes.veredicto === "NO COMPRAR" ? C.red : C.gold}40` }}>
                <p style={{ fontSize: 40, marginBottom: 8 }}>{compraRes.emoji}</p>
                <p style={{ fontWeight: 800, fontSize: 22, color: compraRes.veredicto === "COMPRAR" ? C.green : compraRes.veredicto === "NO COMPRAR" ? C.red : C.gold }}>{compraRes.veredicto}</p>
                <p style={{ color: C.textMid, fontSize: 13, marginTop: 8 }}>{compraRes.razon}</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                <Card style={{ textAlign: "center", padding: 14, background: C.goldLight }}>
                  <p style={{ fontSize: 22, marginBottom: 4 }}>⏰</p>
                  <p style={{ fontWeight: 800, fontSize: 22, color: C.gold }}>{compraRes.horas}hs</p>
                  <p style={{ color: C.textMid, fontSize: 11, marginTop: 4 }}>de trabajo</p>
                </Card>
                <Card style={{ textAlign: "center", padding: 14, background: C.purpleLight }}>
                  <p style={{ fontSize: 22, marginBottom: 4 }}>📊</p>
                  <p style={{ fontWeight: 800, fontSize: 22, color: C.purple }}>{compraRes.pct}%</p>
                  <p style={{ color: C.textMid, fontSize: 11, marginTop: 4 }}>de tu ingreso</p>
                </Card>
              </div>
              <Card style={{ background: C.accentLight, border: `1.5px solid ${C.accent}30` }}>
                <p style={{ fontWeight: 700, fontSize: 13, color: C.accent, marginBottom: 6 }}>💡 Mi consejo</p>
                <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.6 }}>{compraRes.consejo}</p>
              </Card>
            </div>
          )}
        </Modal>
      )}
    </>
  );

  // ── DESKTOP ────────────────────────────────────────────────────────────────
  if (!isMobile) {
    return (
      <>
        <style>{css}</style>
        <div style={{ display: "flex", minHeight: "100vh", background: C.bg }}>
          <div style={{ width: 250, background: C.white, borderRight: `2px solid ${C.border}`, display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 50 }}>
            <div style={{ padding: "24px 20px", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: `linear-gradient(135deg, ${C.accent}, #1250c0)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 10 }}>💰</div>
              <p style={{ fontWeight: 800, fontSize: 16, color: C.text }}>Mis Finanzas</p>
              <p style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>Hola, {userNombre} 👋</p>
            </div>
            <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
              {NAV_DESKTOP.map(n => (
                <button key={n.id} onClick={() => setTab(n.id)}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 14, border: "none", background: tab === n.id ? C.accentLight : "transparent", color: tab === n.id ? C.accent : C.textMid, fontFamily: "inherit", fontWeight: 700, fontSize: 14, cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
                  <span style={{ fontSize: 20 }}>{n.icon}</span>{n.label}
                  {tab === n.id && <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: C.accent }} />}
                </button>
              ))}
            </nav>
            <div style={{ padding: "16px 12px", borderTop: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={() => setModalAI(true)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 14, border: `2px solid ${C.accent}`, background: C.accentLight, color: C.accent, fontFamily: "inherit", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                🤖 Asesor IA
              </button>
              <button onClick={() => { setCompraRes(null); setModalCompra(true); }}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 14, border: `2px solid ${C.border}`, background: C.white, color: C.textMid, fontFamily: "inherit", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                🛒 ¿Me conviene?
              </button>
            </div>
          </div>
          <div style={{ marginLeft: 250, flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ background: C.white, borderBottom: `2px solid ${C.border}`, padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 40 }}>
              <p style={{ fontWeight: 800, fontSize: 20, color: C.text }}>
                {NAV_DESKTOP.find(n => n.id === tab)?.icon} {NAV_DESKTOP.find(n => n.id === tab)?.label}
              </p>
              <button onClick={() => setModalAdd(true)}
                style={{ padding: "10px 24px", borderRadius: 14, background: `linear-gradient(135deg, ${C.accent}, #1250c0)`, color: "#fff", border: "none", fontFamily: "inherit", fontWeight: 700, fontSize: 15, cursor: "pointer", boxShadow: `0 4px 14px ${C.accent}40` }}>
                + Agregar movimiento
              </button>
            </div>
            <div style={{ flex: 1, padding: "24px 32px 40px", overflowY: "auto" }}>
              {renderContenido()}
            </div>
          </div>
        </div>
        {renderModales()}
      </>
    );
  }

  // ── MÓVIL ──────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{css}</style>
      <div style={{ maxWidth: "100%", minHeight: "100vh", display: "flex", flexDirection: "column", background: C.bg, overflowX: "hidden" }}>
        <div style={{ background: C.white, borderBottom: `2px solid ${C.border}`, padding: "14px 16px", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 10, color: C.textLight, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>Mis Finanzas</p>
              <p style={{ fontWeight: 800, fontSize: 17, color: C.text, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Hola, {userNombre} 👋</p>
            </div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <button onClick={() => { setCompraRes(null); setModalCompra(true); }}
                style={{ height: 40, width: 40, borderRadius: 12, border: `2px solid ${C.border}`, background: C.white, cursor: "pointer", fontSize: 17 }}>🛒</button>
              <button onClick={() => setModalAI(true)}
                style={{ height: 40, width: 40, borderRadius: 12, border: `2px solid ${C.accent}`, background: C.accentLight, cursor: "pointer", fontSize: 17 }}>🤖</button>
              <button onClick={() => setModalAdd(true)}
                style={{ height: 40, width: 40, borderRadius: 12, background: `linear-gradient(135deg, ${C.accent}, #1250c0)`, color: "#fff", border: "none", cursor: "pointer", fontSize: 22, fontWeight: 800 }}>+</button>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, padding: "14px 12px 100px", overflowY: "auto", overflowX: "hidden" }}>
          {renderContenido()}
        </div>
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: C.white, borderTop: `2px solid ${C.border}`, display: "flex", zIndex: 50, paddingBottom: "env(safe-area-inset-bottom)" }}>
          {NAV_MOBILE.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)}
              style={{ flex: 1, padding: "10px 2px 12px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <span style={{ fontSize: 20 }}>{n.icon}</span>
              <span style={{ fontSize: 9, fontFamily: "inherit", fontWeight: 700, color: tab === n.id ? C.accent : C.textLight }}>{n.label}</span>
              {tab === n.id && <div style={{ width: 16, height: 3, borderRadius: 99, background: C.accent }} />}
            </button>
          ))}
        </div>
        {renderModales()}
      </div>
    </>
  );
}