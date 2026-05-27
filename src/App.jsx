import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabase";

// ─── COLORES ──────────────────────────────────────────────────────────────────
const C = {
  bg: "#F4F6FB",
  white: "#FFFFFF",
  border: "#E2E8F0",
  accent: "#1A6FE8",
  accentLight: "#EBF2FF",
  green: "#16A34A",
  greenLight: "#F0FDF4",
  red: "#DC2626",
  redLight: "#FEF2F2",
  gold: "#D97706",
  goldLight: "#FFFBEB",
  purple: "#7C3AED",
  purpleLight: "#F5F3FF",
  text: "#1E293B",
  textMid: "#475569",
  textLight: "#94A3B8",
};

const fmt = (n) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

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

// ─── COMPONENTES BASE ─────────────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{ background: C.white, borderRadius: 20, padding: 20, boxShadow: "0 2px 12px #00000010", border: `1px solid ${C.border}`, ...style }}>
      {children}
    </div>
  );
}

function Barra({ pct, color }) {
  return (
    <div style={{ background: C.border, borderRadius: 999, height: 10, overflow: "hidden" }}>
      <div style={{ height: "100%", borderRadius: 999, background: color, width: `${Math.min(pct, 100)}%`, transition: "width 0.8s ease" }} />
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

// ─── CAMPO EDITABLE (fuera de TabInicio para evitar el error) ─────────────────
function CampoEditable({ campo, label, icon, color, bg, balances, onGuardar }) {
  const [editando, setEditando] = useState(false);
  const [val, setVal] = useState("");
  return (
    <Card style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div style={{ width: 38, height: 38, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{icon}</div>
        <p style={{ color: C.textMid, fontSize: 13, fontWeight: 600 }}>{label}</p>
      </div>
      {editando ? (
        <div style={{ display: "flex", gap: 6 }}>
          <input autoFocus type="number" value={val} onChange={e => setVal(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { onGuardar(campo, val); setEditando(false); } }}
            style={{ flex: 1, padding: "8px 10px", fontSize: 14 }} />
          <button onClick={() => { onGuardar(campo, val); setEditando(false); }}
            style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 10, padding: "0 12px", cursor: "pointer", fontWeight: 700 }}>✓</button>
        </div>
      ) : (
        <p onClick={() => { setEditando(true); setVal(balances[campo] || ""); }}
          style={{ color, fontSize: 20, fontWeight: 800, cursor: "pointer" }} title="Tocá para editar">
          {fmt(balances[campo] || 0)} <span style={{ fontSize: 12, color: C.textLight }}>✏️</span>
        </p>
      )}
    </Card>
  );
}

// ─── PANTALLA DE LOGIN ────────────────────────────────────────────────────────
function PantallaLogin() {
  const [modo, setModo]       = useState("login");
  const [email, setEmail]     = useState("");
  const [pass, setPass]       = useState("");
  const [nombre, setNombre]   = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    if (modo === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) setError("Email o contraseña incorrectos.");
    } else {
      if (!nombre.trim()) { setError("Ingresá tu nombre."); setLoading(false); return; }
      const { error } = await supabase.auth.signUp({ email, password: pass, options: { data: { nombre } } });
      if (error) setError("Error al registrarse. Probá con otro email.");
      else setError("¡Cuenta creada! Revisá tu email para confirmar.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <p style={{ fontSize: 48, marginBottom: 8 }}>💰</p>
          <p style={{ fontWeight: 800, fontSize: 28, color: C.text }}>Mis Finanzas</p>
          <p style={{ color: C.textMid, fontSize: 15, marginTop: 4 }}>Tu dinero, bajo control</p>
        </div>
        <Card>
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {[["login", "Iniciar sesión"], ["registro", "Registrarse"]].map(([val, label]) => (
              <button key={val} onClick={() => { setModo(val); setError(""); }}
                style={{ flex: 1, padding: "11px", borderRadius: 12, border: `2px solid ${modo === val ? C.accent : C.border}`, background: modo === val ? C.accentLight : C.white, color: modo === val ? C.accent : C.textMid, fontFamily: "inherit", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                {label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {modo === "registro" && <input placeholder="Tu nombre" value={nombre} onChange={e => setNombre(e.target.value)} />}
            <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            <input placeholder="Contraseña" type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
            {error && <p style={{ color: error.includes("creada") ? C.green : C.red, fontSize: 13, fontWeight: 600 }}>{error}</p>}
            <button onClick={handleSubmit} disabled={loading}
              style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 14, padding: "14px", fontSize: 16, fontFamily: "inherit", fontWeight: 700, cursor: "pointer", opacity: loading ? 0.7 : 1, marginTop: 4 }}>
              {loading ? "Cargando..." : modo === "login" ? "Entrar" : "Crear cuenta"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── TAB INICIO ───────────────────────────────────────────────────────────────
function TabInicio({ transacciones, balances, setBalances, userId }) {
  const ingresos   = transacciones.filter(t => t.tipo === "ingreso").reduce((a, b) => a + b.monto, 0);
  const gastos     = transacciones.filter(t => t.tipo === "gasto").reduce((a, b) => a + b.monto, 0);
  const ahorrando  = ingresos - gastos;
  const ahorroPct  = ingresos > 0 ? Math.round((ahorrando / ingresos) * 100) : 0;
  const total      = (balances.efectivo || 0) + (balances.banco || 0) + (balances.mercadopago || 0) + (balances.ahorros || 0) + (balances.inversiones || 0);
  const patrimonio = total - (balances.deudas || 0);
  const objetivoPct = balances.objetivo > 0 ? Math.min(Math.round(((balances.ahorros || 0) / balances.objetivo) * 100), 100) : 0;
  const deliveries = transacciones.filter(t => t.tipo === "gasto" && t.descripcion.toLowerCase().includes("delivery"));
  const totalDeliv = deliveries.reduce((a, b) => a + b.monto, 0);
  const suscripciones = transacciones.filter(t => t.tipo === "gasto" && t.recurrente);
  const totalSusc  = suscripciones.reduce((a, b) => a + b.monto, 0);
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

  return (
    <div className="fade" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card style={{ background: `linear-gradient(135deg, ${C.accent} 0%, #1250c0 100%)`, border: "none" }}>
        <p style={{ color: "#ffffffaa", fontSize: 13, fontWeight: 600, marginBottom: 6, letterSpacing: 1 }}>TU PATRIMONIO TOTAL</p>
        <p style={{ color: "#fff", fontSize: 44, fontWeight: 800, lineHeight: 1 }}>{fmt(patrimonio)}</p>
        <p style={{ color: "#ffffffbb", fontSize: 14, marginTop: 6 }}>Total en cuentas: {fmt(total)}</p>
        <div style={{ display: "flex", marginTop: 20, borderTop: "1px solid #ffffff30", paddingTop: 16 }}>
          <div style={{ flex: 1 }}>
            <p style={{ color: "#ffffffaa", fontSize: 12 }}>Ingresos del mes</p>
            <p style={{ color: "#fff", fontSize: 20, fontWeight: 800, marginTop: 2 }}>+{fmt(ingresos)}</p>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: "#ffffffaa", fontSize: 12 }}>Gastos del mes</p>
            <p style={{ color: "#ffcccc", fontSize: 20, fontWeight: 800, marginTop: 2 }}>-{fmt(gastos)}</p>
          </div>
        </div>
      </Card>

      <p style={{ fontWeight: 700, fontSize: 17, paddingLeft: 4 }}>¿Dónde está tu plata? <span style={{ fontSize: 12, color: C.textLight, fontWeight: 500 }}>Tocá para editar</span></p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <CampoEditable campo="efectivo"    label="Efectivo"     icon="💵" color={C.gold}   bg={C.goldLight}   balances={balances} onGuardar={guardarBalance} />
        <CampoEditable campo="banco"       label="Banco"        icon="🏦" color={C.accent} bg={C.accentLight} balances={balances} onGuardar={guardarBalance} />
        <CampoEditable campo="mercadopago" label="Mercado Pago" icon="💳" color={C.green}  bg={C.greenLight}  balances={balances} onGuardar={guardarBalance} />
        <CampoEditable campo="ahorros"     label="Ahorros"      icon="🐷" color={C.purple} bg={C.purpleLight} balances={balances} onGuardar={guardarBalance} />
        <CampoEditable campo="inversiones" label="Inversiones"  icon="📈" color={C.gold}   bg={C.goldLight}   balances={balances} onGuardar={guardarBalance} />
        <CampoEditable campo="deudas"      label="Deudas"       icon="📉" color={C.red}    bg={C.redLight}    balances={balances} onGuardar={guardarBalance} />
      </div>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ fontWeight: 700, fontSize: 16 }}>🎯 Objetivo de ahorro</p>
          <p style={{ fontWeight: 800, fontSize: 18, color: C.green }}>{objetivoPct}%</p>
        </div>
        <Barra pct={objetivoPct} color={C.green} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
          <p style={{ color: C.textMid, fontSize: 13 }}>Ahorrado: <b style={{ color: C.text }}>{fmt(balances.ahorros || 0)}</b></p>
          <p style={{ color: C.textMid, fontSize: 13 }}>
            Meta: <b onClick={() => { setEditandoObj(true); setValObj(balances.objetivo || ""); }}
              style={{ color: C.accent, cursor: "pointer" }}>{fmt(balances.objetivo || 0)} ✏️</b>
          </p>
        </div>
        {editandoObj && (
          <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
            <input autoFocus type="number" value={valObj} onChange={e => setValObj(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { guardarBalance("objetivo", valObj); setEditandoObj(false); } }}
              placeholder="Objetivo de ahorro" style={{ flex: 1 }} />
            <button onClick={() => { guardarBalance("objetivo", valObj); setEditandoObj(false); }}
              style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 10, padding: "0 14px", cursor: "pointer", fontWeight: 700 }}>✓</button>
          </div>
        )}
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Card style={{ textAlign: "center", padding: 16 }}>
          <p style={{ color: C.textMid, fontSize: 13, marginBottom: 6 }}>Ahorrás por mes</p>
          <p style={{ fontSize: 24, fontWeight: 800, color: C.green }}>{fmt(ahorrando)}</p>
          <p style={{ color: C.textMid, fontSize: 12, marginTop: 4 }}>{ahorroPct}% de tus ingresos</p>
        </Card>
        <Card style={{ textAlign: "center", padding: 16 }}>
          <p style={{ color: C.textMid, fontSize: 13, marginBottom: 6 }}>Gasto diario</p>
          <p style={{ fontSize: 24, fontWeight: 800, color: C.gold }}>{fmt(gastoDiario)}</p>
          <p style={{ color: C.textMid, fontSize: 12, marginTop: 4 }}>promedio este mes</p>
        </Card>
      </div>

      {(totalDeliv > 0 || suscripciones.length > 0 || prediccion > 0) && (
        <>
          <p style={{ fontWeight: 700, fontSize: 17, paddingLeft: 4 }}>⚠️ Cosas a tener en cuenta</p>
          {totalDeliv > 0 && (
            <Card style={{ padding: 16, background: C.goldLight, border: `1.5px solid ${C.gold}30` }}>
              <p style={{ fontSize: 14, fontWeight: 500 }}>🛵 Gastaste {fmt(totalDeliv)} en deliveries este mes ({deliveries.length} pedidos).</p>
            </Card>
          )}
          {suscripciones.length > 0 && (
            <Card style={{ padding: 16, background: C.accentLight, border: `1.5px solid ${C.accent}30` }}>
              <p style={{ fontSize: 14, fontWeight: 500 }}>🔄 Tenés {suscripciones.length} suscripciones por {fmt(totalSusc)}/mes. ¿Usás todas?</p>
            </Card>
          )}
          {prediccion > 0 && (
            <Card style={{ padding: 16, background: C.redLight, border: `1.5px solid ${C.red}30` }}>
              <p style={{ fontSize: 14, fontWeight: 500 }}>📅 Si seguís así, gastarás {fmt(prediccion)} a fin de mes.</p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

// ─── TAB MOVIMIENTOS ──────────────────────────────────────────────────────────
function TabMovimientos({ transacciones, onEliminar }) {
  const [filtro, setFiltro] = useState("todos");
  const lista = transacciones.filter(t => filtro === "todos" || t.tipo === filtro);
  const gastosCat = {};
  transacciones.filter(t => t.tipo === "gasto").forEach(t => {
    gastosCat[t.cat] = (gastosCat[t.cat] || 0) + t.monto;
  });

  return (
    <div className="fade" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {Object.keys(gastosCat).length > 0 && (
        <>
          <p style={{ fontWeight: 700, fontSize: 17 }}>Gastos por categoría</p>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
            {Object.entries(gastosCat).sort((a, b) => b[1] - a[1]).map(([cat, tot]) => (
              <Card key={cat} style={{ minWidth: 110, padding: 14, textAlign: "center", flexShrink: 0 }}>
                <p style={{ fontSize: 26 }}>{CATEGORIAS[cat]?.icono || "📦"}</p>
                <p style={{ fontSize: 12, color: C.textMid, fontWeight: 600, marginTop: 4 }}>{CATEGORIAS[cat]?.label || cat}</p>
                <p style={{ fontSize: 15, fontWeight: 800, color: CATEGORIAS[cat]?.color || C.text, marginTop: 4 }}>{fmt(tot)}</p>
              </Card>
            ))}
          </div>
        </>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        {[["todos", "Todos"], ["gasto", "Gastos"], ["ingreso", "Ingresos"]].map(([val, label]) => (
          <button key={val} onClick={() => setFiltro(val)}
            style={{ flex: 1, padding: "11px 8px", borderRadius: 12, border: `2px solid ${filtro === val ? C.accent : C.border}`, background: filtro === val ? C.accentLight : C.white, color: filtro === val ? C.accent : C.textMid, fontFamily: "inherit", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            {label}
          </button>
        ))}
      </div>

      {lista.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 40 }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>📭</p>
          <p style={{ fontWeight: 700, fontSize: 16 }}>Sin movimientos todavía</p>
          <p style={{ color: C.textMid, fontSize: 14, marginTop: 6 }}>Tocá el + para agregar uno</p>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {lista.map(t => (
            <Card key={t.id} style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: 14, background: (CATEGORIAS[t.cat]?.color || C.accent) + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                {CATEGORIAS[t.cat]?.icono || "📦"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.descripcion}</p>
                <p style={{ color: C.textLight, fontSize: 12, marginTop: 3 }}>{t.fecha}{t.recurrente ? " · Fijo 🔄" : ""}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <p style={{ fontWeight: 800, fontSize: 16, color: t.tipo === "ingreso" ? C.green : C.red }}>
                  {t.tipo === "ingreso" ? "+" : "-"}{fmt(t.monto)}
                </p>
                <button onClick={() => { if (window.confirm(`¿Eliminás "${t.descripcion}"?`)) onEliminar(t.id); }}
                  style={{ fontSize: 11, color: C.textLight, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
                  🗑️ Eliminar
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TAB METAS ────────────────────────────────────────────────────────────────
function TabMetas({ transacciones, balances }) {
  const ingresos  = transacciones.filter(t => t.tipo === "ingreso").reduce((a, b) => a + b.monto, 0);
  const gastos    = transacciones.filter(t => t.tipo === "gasto").reduce((a, b) => a + b.monto, 0);
  const ahorrando = ingresos - gastos;
  const metas = [
    { nombre: "Objetivo de ahorro", icono: "🎯", objetivo: balances.objetivo || 0, actual: balances.ahorros || 0, color: C.green },
    { nombre: "Pagar deudas",       icono: "💳", objetivo: balances.deudas || 0,   actual: Math.min(ahorrando * 3, balances.deudas || 0), color: C.red },
  ];

  return (
    <div className="fade" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ fontWeight: 700, fontSize: 18 }}>Mis Metas</p>
      {metas.map((meta, i) => {
        const pct   = meta.objetivo > 0 ? Math.min(Math.round((meta.actual / meta.objetivo) * 100), 100) : 0;
        const falta = Math.max(0, meta.objetivo - meta.actual);
        const meses = ahorrando > 0 && falta > 0 ? Math.ceil(falta / ahorrando) : "—";
        return (
          <Card key={i}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: meta.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>{meta.icono}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 17 }}>{meta.nombre}</p>
                <p style={{ color: C.textMid, fontSize: 13, marginTop: 2 }}>Tiempo estimado: <b style={{ color: C.text }}>{meses} meses</b></p>
              </div>
              <p style={{ fontSize: 26, fontWeight: 800, color: meta.color }}>{pct}%</p>
            </div>
            <Barra pct={pct} color={meta.color} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
              <p style={{ color: C.textMid, fontSize: 13 }}>Actual: <b style={{ color: C.text }}>{fmt(meta.actual)}</b></p>
              <p style={{ color: C.textMid, fontSize: 13 }}>Falta: <b style={{ color: meta.color }}>{fmt(falta)}</b></p>
            </div>
            {pct >= 100 && <p style={{ color: C.green, fontWeight: 700, marginTop: 10 }}>🎉 ¡Meta cumplida!</p>}
          </Card>
        );
      })}
      <Card style={{ background: C.accentLight, border: `1.5px solid ${C.accent}30` }}>
        <p style={{ fontWeight: 700, fontSize: 15, color: C.accent, marginBottom: 8 }}>💡 Tu capacidad de ahorro</p>
        <p style={{ fontSize: 14, color: C.text }}>Ahorrás <b>{fmt(ahorrando)}</b> por mes.</p>
        <p style={{ fontSize: 14, color: C.textMid, marginTop: 6 }}>En un año podrías acumular: <b style={{ color: C.accent }}>{fmt(ahorrando * 12)}</b></p>
      </Card>
    </div>
  );
}

// ─── DETALLE ESPACIO ──────────────────────────────────────────────────────────
function DetalleEspacio({ espacio, userId, onClose }) {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [desc, setDesc]               = useState("");
  const [monto, setMonto]             = useState("");

  const cargarMovimientos = useCallback(async () => {
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

  const total     = movimientos.reduce((a, b) => a + b.monto, 0);
  const miTotal   = movimientos.filter(m => m.user_id === userId).reduce((a, b) => a + b.monto, 0);
  const otroTotal = total - miTotal;
  const objPct    = espacio.objetivo > 0 ? Math.min(Math.round((total / espacio.objetivo) * 100), 100) : 0;
  const sueldoPct = espacio.sueldo_acordado > 0 ? Math.min(Math.round((total / espacio.sueldo_acordado) * 100), 100) : 0;
  const mesActual = new Date().toISOString().slice(0, 7);
  const pagosMes  = movimientos.filter(m => m.fecha?.slice(0, 7) === mesActual);
  const totalMes  = pagosMes.reduce((a, b) => a + b.monto, 0);

  return (
    <div style={{ position: "fixed", inset: 0, background: C.bg, zIndex: 300, overflowY: "auto" }}>
      <div style={{ maxWidth: 500, margin: "0 auto", paddingBottom: 40 }}>
        <div style={{ background: C.white, borderBottom: `2px solid ${C.border}`, padding: "18px 20px", position: "sticky", top: 0, zIndex: 10, display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={onClose} style={{ width: 38, height: 38, borderRadius: 12, background: C.bg, border: "none", cursor: "pointer", fontSize: 20 }}>←</button>
          <div>
            <p style={{ fontWeight: 800, fontSize: 18 }}>{espacio.nombre}</p>
            <p style={{ color: C.accent, fontSize: 12, fontWeight: 700 }}>Código: {espacio.codigo}</p>
          </div>
        </div>

        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 16 }}>
          {espacio.tipo === "sueldo" ? (
            <Card style={{ background: `linear-gradient(135deg, ${C.gold} 0%, #b45309 100%)`, border: "none" }}>
              <p style={{ color: "#ffffffaa", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>TOTAL PAGADO</p>
              <p style={{ color: "#fff", fontSize: 40, fontWeight: 800 }}>{fmt(total)}</p>
              {espacio.sueldo_acordado > 0 && (
                <>
                  <p style={{ color: "#ffffffbb", fontSize: 14, marginTop: 6 }}>Acordado: {fmt(espacio.sueldo_acordado)}/mes</p>
                  <div style={{ marginTop: 12 }}>
                    <Barra pct={sueldoPct} color="#ffffff60" />
                    <p style={{ color: "#ffffffaa", fontSize: 12, marginTop: 6 }}>{sueldoPct}% del sueldo mensual pagado</p>
                  </div>
                </>
              )}
              <div style={{ display: "flex", marginTop: 16, borderTop: "1px solid #ffffff30", paddingTop: 12 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ color: "#ffffffaa", fontSize: 12 }}>Este mes</p>
                  <p style={{ color: "#fff", fontSize: 18, fontWeight: 800 }}>{fmt(totalMes)}</p>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: "#ffffffaa", fontSize: 12 }}>Pagos este mes</p>
                  <p style={{ color: "#fff", fontSize: 18, fontWeight: 800 }}>{pagosMes.length}</p>
                </div>
              </div>
            </Card>
          ) : (
            <Card style={{ background: `linear-gradient(135deg, ${C.accent} 0%, #1250c0 100%)`, border: "none" }}>
              <p style={{ color: "#ffffffaa", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>TOTAL ACUMULADO</p>
              <p style={{ color: "#fff", fontSize: 40, fontWeight: 800 }}>{fmt(total)}</p>
              {espacio.objetivo > 0 && (
                <>
                  <p style={{ color: "#ffffffbb", fontSize: 14, marginTop: 6 }}>Objetivo: {fmt(espacio.objetivo)}</p>
                  <div style={{ marginTop: 12 }}>
                    <Barra pct={objPct} color="#ffffff60" />
                    <p style={{ color: "#ffffffaa", fontSize: 12, marginTop: 6 }}>{objPct}% del objetivo</p>
                  </div>
                </>
              )}
              <div style={{ display: "flex", marginTop: 16, borderTop: "1px solid #ffffff30", paddingTop: 12 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ color: "#ffffffaa", fontSize: 12 }}>Mi aporte</p>
                  <p style={{ color: "#fff", fontSize: 18, fontWeight: 800 }}>{fmt(miTotal)}</p>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: "#ffffffaa", fontSize: 12 }}>Otro aporte</p>
                  <p style={{ color: "#fff", fontSize: 18, fontWeight: 800 }}>{fmt(otroTotal)}</p>
                </div>
              </div>
            </Card>
          )}

          <Card style={{ background: C.accentLight, border: `1.5px solid ${C.accent}30` }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: C.accent, marginBottom: 6 }}>🔗 Compartí este código</p>
            <p style={{ fontSize: 13, color: C.textMid }}>La otra persona entra → Compartido → Unirse → escribe:</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: C.accent, textAlign: "center", marginTop: 10, letterSpacing: 4 }}>{espacio.codigo}</p>
          </Card>

          <Card>
            <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>
              {espacio.tipo === "sueldo" ? "Registrar pago 💼" : "Agregar aporte 💰"}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input placeholder={espacio.tipo === "sueldo" ? "Ej: Pago semanal, Adelanto..." : "Ej: Aporte mayo..."} value={desc} onChange={e => setDesc(e.target.value)} />
              <input placeholder="Monto ($)" type="number" value={monto} onChange={e => setMonto(e.target.value)} />
              <button onClick={agregar}
                style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 14, padding: "13px", fontSize: 15, fontFamily: "inherit", fontWeight: 700, cursor: "pointer" }}>
                Guardar
              </button>
            </div>
          </Card>

          <p style={{ fontWeight: 700, fontSize: 17 }}>Historial</p>
          {loading ? <p style={{ color: C.textMid, textAlign: "center" }}>Cargando...</p> :
            movimientos.length === 0 ? (
              <Card style={{ textAlign: "center", padding: 30 }}>
                <p style={{ color: C.textMid }}>Sin movimientos todavía</p>
              </Card>
            ) : movimientos.map(m => (
              <Card key={m.id} style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: m.user_id === userId ? C.accentLight : C.goldLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                  {m.user_id === userId ? "👤" : "👥"}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: 14 }}>{m.descripcion}</p>
                  <p style={{ color: C.textLight, fontSize: 12, marginTop: 2 }}>{m.fecha} · {m.user_id === userId ? "Vos" : "Otro"}</p>
                </div>
                <p style={{ fontWeight: 800, fontSize: 16, color: C.green }}>+{fmt(m.monto)}</p>
              </Card>
            ))
          }
        </div>
      </div>
    </div>
  );
}

// ─── TAB COMPARTIDO ───────────────────────────────────────────────────────────
function TabCompartido({ userId }) {
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

  const cargarEspacios = useCallback(async () => {
    setLoading(true);
    const { data: miembros } = await supabase.from("espacio_miembros").select("espacio_id").eq("user_id", userId);
    const ids = (miembros || []).map(m => m.espacio_id);
    const { data: propios } = await supabase.from("espacios").select("*").eq("creado_por", userId);
    let compartidos = [];
    if (ids.length > 0) {
      const { data } = await supabase.from("espacios").select("*").in("id", ids);
      compartidos = data || [];
    }
    const todos = [...(propios || []), ...compartidos.filter(c => !(propios || []).find(p => p.id === c.id))];
    setEspacios(todos);
    setLoading(false);
  }, [userId]);

  useEffect(() => { cargarEspacios(); }, [cargarEspacios]);

  const crearEspacio = async () => {
    if (!nuevoNombre.trim()) return;
    const codigo = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data, error } = await supabase.from("espacios").insert({
      nombre: nuevoNombre, tipo: nuevoTipo, codigo,
      creado_por: userId,
      objetivo: parseFloat(nuevoObj) || 0,
      sueldo_acordado: parseFloat(nuevoSueldo) || 0,
    }).select().single();
    if (!error && data) {
      await supabase.from("espacio_miembros").insert({ espacio_id: data.id, user_id: userId, rol: "creador" });
      setModalNuevo(false);
      setNuevoNombre(""); setNuevoTipo("ahorro"); setNuevoObj(""); setNuevoSueldo("");
      cargarEspacios();
    }
  };

  const unirseEspacio = async () => {
    if (!codigoUnirse.trim()) return;
    const { data: espacio } = await supabase.from("espacios").select("*").eq("codigo", codigoUnirse.toUpperCase()).single();
    if (!espacio) { setMsgUnirse("Código no encontrado."); return; }
    const { data: yaEsta } = await supabase.from("espacio_miembros").select("id").eq("espacio_id", espacio.id).eq("user_id", userId).single();
    if (yaEsta) { setMsgUnirse("Ya sos miembro de este espacio."); return; }
    await supabase.from("espacio_miembros").insert({ espacio_id: espacio.id, user_id: userId, rol: "miembro" });
    setModalUnirse(false); setCodigoUnirse(""); setMsgUnirse("");
    cargarEspacios();
  };

  const iconoTipo = (tipo) => tipo === "sueldo" ? "💼" : tipo === "ahorro" ? "🐷" : "🤝";

  return (
    <div className="fade" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontWeight: 700, fontSize: 18 }}>Espacios Compartidos</p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setModalUnirse(true)}
            style={{ padding: "10px 14px", borderRadius: 12, border: `2px solid ${C.accent}`, background: C.accentLight, color: C.accent, fontFamily: "inherit", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            Unirse
          </button>
          <button onClick={() => setModalNuevo(true)}
            style={{ padding: "10px 14px", borderRadius: 12, border: "none", background: C.accent, color: "#fff", fontFamily: "inherit", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            + Nuevo
          </button>
        </div>
      </div>

      {loading ? <p style={{ color: C.textMid, textAlign: "center", padding: 40 }}>Cargando...</p> :
        espacios.length === 0 ? (
          <Card style={{ textAlign: "center", padding: 40 }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>🤝</p>
            <p style={{ fontWeight: 700, fontSize: 16 }}>Sin espacios todavía</p>
            <p style={{ color: C.textMid, fontSize: 14, marginTop: 6 }}>Creá uno o unite con un código</p>
          </Card>
        ) : espacios.map(e => (
          <Card key={e.id} style={{ cursor: "pointer" }} onClick={() => setModalDetalle(e)}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 50, height: 50, borderRadius: 16, background: C.accentLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
                {iconoTipo(e.tipo)}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 16 }}>{e.nombre}</p>
                <p style={{ color: C.textMid, fontSize: 13, marginTop: 2, textTransform: "capitalize" }}>
                  {e.tipo} · Código: <b style={{ color: C.accent }}>{e.codigo}</b>
                </p>
              </div>
              <p style={{ color: C.textLight, fontSize: 20 }}>›</p>
            </div>
          </Card>
        ))
      }

      {modalNuevo && (
        <div onClick={e => e.target === e.currentTarget && setModalNuevo(false)}
          style={{ position: "fixed", inset: 0, background: "#00000060", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{ background: C.white, borderRadius: "24px 24px 0 0", padding: 24, width: "100%", maxWidth: 500, animation: "fadeUp 0.3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <p style={{ fontWeight: 800, fontSize: 20 }}>Nuevo espacio</p>
              <button onClick={() => setModalNuevo(false)} style={{ width: 34, height: 34, borderRadius: 10, background: C.bg, border: "none", cursor: "pointer", fontSize: 18 }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input placeholder="Nombre (ej: Vacaciones 2026)" value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} />
              <select value={nuevoTipo} onChange={e => setNuevoTipo(e.target.value)}>
                <option value="ahorro">🐷 Ahorro compartido</option>
                <option value="sueldo">💼 Registro de sueldo</option>
                <option value="general">🤝 General</option>
              </select>
              {nuevoTipo === "ahorro" && <input placeholder="Objetivo de ahorro ($)" type="number" value={nuevoObj} onChange={e => setNuevoObj(e.target.value)} />}
              {nuevoTipo === "sueldo" && <input placeholder="Sueldo mensual acordado ($)" type="number" value={nuevoSueldo} onChange={e => setNuevoSueldo(e.target.value)} />}
              <button onClick={crearEspacio}
                style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 14, padding: "14px", fontSize: 16, fontFamily: "inherit", fontWeight: 700, cursor: "pointer" }}>
                Crear espacio
              </button>
            </div>
          </div>
        </div>
      )}

      {modalUnirse && (
        <div onClick={e => e.target === e.currentTarget && setModalUnirse(false)}
          style={{ position: "fixed", inset: 0, background: "#00000060", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{ background: C.white, borderRadius: "24px 24px 0 0", padding: 24, width: "100%", maxWidth: 500, animation: "fadeUp 0.3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <p style={{ fontWeight: 800, fontSize: 20 }}>Unirse a un espacio</p>
              <button onClick={() => { setModalUnirse(false); setMsgUnirse(""); }} style={{ width: 34, height: 34, borderRadius: 10, background: C.bg, border: "none", cursor: "pointer", fontSize: 18 }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input placeholder="Código del espacio (ej: ABC123)" value={codigoUnirse} onChange={e => setCodigoUnirse(e.target.value)} />
              {msgUnirse && <p style={{ color: C.red, fontSize: 13, fontWeight: 600 }}>{msgUnirse}</p>}
              <button onClick={unirseEspacio}
                style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 14, padding: "14px", fontSize: 16, fontFamily: "inherit", fontWeight: 700, cursor: "pointer" }}>
                Unirse
              </button>
            </div>
          </div>
        </div>
      )}

      {modalDetalle && (
        <DetalleEspacio espacio={modalDetalle} userId={userId} onClose={() => { setModalDetalle(null); cargarEspacios(); }} />
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
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  const cargarTransacciones = useCallback(async () => {
    if (!session) return;
    const mesActual = new Date().toISOString().slice(0, 7);
    const { data } = await supabase.from("transacciones").select("*")
      .eq("user_id", session.user.id)
      .gte("fecha", `${mesActual}-01`)
      .order("created_at", { ascending: false });
    setTransacciones(data || []);
  }, [session]);

  const cargarBalances = useCallback(async () => {
    if (!session) return;
    const { data } = await supabase.from("balances").select("*").eq("user_id", session.user.id).single();
    if (data) setBalances(data);
  }, [session]);

  useEffect(() => {
    if (session) { cargarTransacciones(); cargarBalances(); }
  }, [session, cargarTransacciones, cargarBalances]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [aiChat]);

  const agregarTx = async () => {
    if (!newTx.descripcion.trim() || !newTx.monto) return;
    const { data } = await supabase.from("transacciones").insert({
      user_id: session.user.id,
      descripcion: newTx.descripcion,
      monto: parseFloat(newTx.monto),
      tipo: newTx.tipo, cat: newTx.cat, recurrente: newTx.recurrente,
      fecha: new Date().toISOString().split("T")[0],
    }).select().single();
    if (data) setTransacciones(prev => [data, ...prev]);
    setNewTx({ descripcion: "", monto: "", tipo: "gasto", cat: "comida", recurrente: false });
    setModalAdd(false);
  };

  const eliminarTx = async (id) => {
    await supabase.from("transacciones").delete().eq("id", id);
    setTransacciones(prev => prev.filter(t => t.id !== id));
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
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
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
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 600,
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
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${C.bg}; color: ${C.text}; font-family: 'Plus Jakarta Sans', sans-serif; }
    ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(14px);} to { opacity:1; transform:translateY(0);} }
    @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.5} }
    @keyframes spin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    .fade { animation: fadeUp 0.3s ease both; }
    input, select { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px; padding: 13px 16px; border: 2px solid ${C.border}; border-radius: 14px; background: ${C.white}; color: ${C.text}; width: 100%; outline: none; transition: border-color 0.2s; }
    input:focus, select:focus { border-color: ${C.accent}; }
    select option { background: ${C.white}; }
  `;

  const NAV = [
    { id: "inicio",      label: "Inicio",      icon: "🏠" },
    { id: "movimientos", label: "Movimientos", icon: "💸" },
    { id: "metas",       label: "Metas",       icon: "🎯" },
    { id: "compartido",  label: "Compartido",  icon: "🤝" },
  ];

  const userNombre = session?.user?.user_metadata?.nombre || session?.user?.email?.split("@")[0] || "Vos";

  if (session === undefined) return <><style>{css}</style><Spinner /></>;
  if (!session) return <><style>{css}</style><PantallaLogin /></>;

  return (
    <>
      <style>{css}</style>
      <div style={{ maxWidth: 500, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column", background: C.bg }}>

        {/* HEADER */}
        <div style={{ background: C.white, borderBottom: `2px solid ${C.border}`, padding: "16px 20px", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 11, color: C.textLight, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>Mis Finanzas</p>
              <p style={{ fontWeight: 800, fontSize: 20, color: C.text, marginTop: 2 }}>Hola, {userNombre} 👋</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { setCompraRes(null); setModalCompra(true); }}
                style={{ height: 42, padding: "0 12px", borderRadius: 12, border: `2px solid ${C.border}`, background: C.white, cursor: "pointer", fontSize: 18 }}>🛒</button>
              <button onClick={() => setModalAI(true)}
                style={{ height: 42, padding: "0 12px", borderRadius: 12, border: `2px solid ${C.accent}`, background: C.accentLight, cursor: "pointer", fontSize: 18 }}>🤖</button>
              <button onClick={() => setModalAdd(true)}
                style={{ height: 42, padding: "0 16px", borderRadius: 12, background: C.accent, color: "#fff", border: "none", cursor: "pointer", fontSize: 22, fontWeight: 800 }}>+</button>
              <button onClick={() => supabase.auth.signOut()}
                style={{ height: 42, padding: "0 12px", borderRadius: 12, border: `2px solid ${C.border}`, background: C.white, cursor: "pointer", fontSize: 16 }} title="Cerrar sesión">🚪</button>
            </div>
          </div>
        </div>

        {/* CONTENIDO */}
        <div style={{ flex: 1, padding: "18px 16px 110px", overflowY: "auto" }}>
          {tab === "inicio"      && <TabInicio transacciones={transacciones} balances={balances} setBalances={setBalances} userId={session.user.id} />}
          {tab === "movimientos" && <TabMovimientos transacciones={transacciones} onEliminar={eliminarTx} />}
          {tab === "metas"       && <TabMetas transacciones={transacciones} balances={balances} />}
          {tab === "compartido"  && <TabCompartido userId={session.user.id} />}
        </div>

        {/* NAVEGACIÓN */}
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 500, background: C.white, borderTop: `2px solid ${C.border}`, display: "flex", zIndex: 50 }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)}
              style={{ flex: 1, padding: "12px 4px 14px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 22 }}>{n.icon}</span>
              <span style={{ fontSize: 10, fontFamily: "inherit", fontWeight: 700, color: tab === n.id ? C.accent : C.textLight }}>{n.label}</span>
              {tab === n.id && <div style={{ width: 20, height: 3, borderRadius: 99, background: C.accent }} />}
            </button>
          ))}
        </div>

        {/* ── MODAL AGREGAR ─────────────────────────────────────────────────── */}
        {modalAdd && (
          <div onClick={e => e.target === e.currentTarget && setModalAdd(false)}
            style={{ position: "fixed", inset: 0, background: "#00000060", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
            <div style={{ background: C.white, borderRadius: "24px 24px 0 0", padding: 24, width: "100%", maxWidth: 500, animation: "fadeUp 0.3s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
                <p style={{ fontWeight: 800, fontSize: 20 }}>Nuevo movimiento</p>
                <button onClick={() => setModalAdd(false)} style={{ width: 34, height: 34, borderRadius: 10, background: C.bg, border: "none", cursor: "pointer", fontSize: 18 }}>✕</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <input placeholder="¿En qué gastaste o de dónde ingresó?" value={newTx.descripcion} onChange={e => setNewTx({ ...newTx, descripcion: e.target.value })} />
                <input placeholder="Monto ($)" type="number" value={newTx.monto} onChange={e => setNewTx({ ...newTx, monto: e.target.value })} />
                <div style={{ display: "flex", gap: 10 }}>
                  {[["gasto", "💸 Gasto"], ["ingreso", "💰 Ingreso"]].map(([val, label]) => (
                    <button key={val} onClick={() => setNewTx({ ...newTx, tipo: val })}
                      style={{ flex: 1, padding: "13px 8px", border: `2px solid ${newTx.tipo === val ? (val === "gasto" ? C.red : C.green) : C.border}`, borderRadius: 14, background: newTx.tipo === val ? (val === "gasto" ? C.redLight : C.greenLight) : C.white, color: newTx.tipo === val ? (val === "gasto" ? C.red : C.green) : C.textMid, fontFamily: "inherit", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                      {label}
                    </button>
                  ))}
                </div>
                <select value={newTx.cat} onChange={e => setNewTx({ ...newTx, cat: e.target.value })}>
                  {Object.entries(CATEGORIAS).map(([k, v]) => <option key={k} value={k}>{v.icono} {v.label}</option>)}
                </select>
                <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: C.textMid, cursor: "pointer" }}>
                  <input type="checkbox" checked={newTx.recurrente} onChange={e => setNewTx({ ...newTx, recurrente: e.target.checked })} style={{ width: "auto", accentColor: C.accent }} />
                  🔄 Se repite todos los meses
                </label>
                <button onClick={agregarTx} style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 14, padding: "14px", fontSize: 16, fontFamily: "inherit", fontWeight: 700, cursor: "pointer" }}>
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL IA ──────────────────────────────────────────────────────── */}
        {modalAI && (
          <div onClick={e => e.target === e.currentTarget && setModalAI(false)}
            style={{ position: "fixed", inset: 0, background: "#00000060", zIndex: 200, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <div style={{ background: C.white, borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 500, margin: "0 auto", height: "80vh", display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "20px 20px 16px", borderBottom: `2px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: C.accentLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🤖</div>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: 16 }}>Asistente Financiero</p>
                    <p style={{ color: C.green, fontSize: 12, fontWeight: 700 }}>● En línea</p>
                  </div>
                </div>
                <button onClick={() => setModalAI(false)} style={{ width: 34, height: 34, borderRadius: 10, background: C.bg, border: "none", cursor: "pointer", fontSize: 18 }}>✕</button>
              </div>
              <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                {aiChat.map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                    <div style={{ maxWidth: "82%", padding: "13px 16px", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: m.role === "user" ? C.accent : C.bg, color: m.role === "user" ? "#fff" : C.text, fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap", fontWeight: 500 }}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {aiLoading && <div style={{ display: "flex" }}><div style={{ padding: "13px 16px", borderRadius: "18px 18px 18px 4px", background: C.bg, animation: "pulse 1s infinite", fontSize: 18 }}>💭</div></div>}
              </div>
              <div style={{ padding: "8px 14px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8, overflowX: "auto" }}>
                {["¿Estoy ahorrando bien?", "¿Cómo bajo mis gastos?", "Predicción fin de mes"].map(q => (
                  <button key={q} onClick={() => setAiInput(q)}
                    style={{ whiteSpace: "nowrap", padding: "8px 14px", borderRadius: 20, background: C.accentLight, border: `1.5px solid ${C.accent}40`, color: C.accent, fontFamily: "inherit", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
                    {q}
                  </button>
                ))}
              </div>
              <div style={{ padding: 14, borderTop: `2px solid ${C.border}`, display: "flex", gap: 10 }}>
                <input placeholder="Escribí tu consulta..." value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === "Enter" && enviarAI()} style={{ flex: 1 }} />
                <button onClick={enviarAI} style={{ padding: "0 18px", background: C.accent, color: "#fff", border: "none", borderRadius: 14, fontFamily: "inherit", fontWeight: 700, fontSize: 15, cursor: "pointer", opacity: aiLoading ? 0.6 : 1 }}>
                  Enviar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL COMPRA ──────────────────────────────────────────────────── */}
        {modalCompra && (
          <div onClick={e => e.target === e.currentTarget && (setModalCompra(false), setCompraRes(null))}
            style={{ position: "fixed", inset: 0, background: "#00000060", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
            <div style={{ background: C.white, borderRadius: "24px 24px 0 0", padding: 24, width: "100%", maxWidth: 500, animation: "fadeUp 0.3s ease", maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <p style={{ fontWeight: 800, fontSize: 20 }}>¿Me conviene comprarlo?</p>
                <button onClick={() => { setModalCompra(false); setCompraRes(null); }} style={{ width: 34, height: 34, borderRadius: 10, background: C.bg, border: "none", cursor: "pointer", fontSize: 18 }}>✕</button>
              </div>
              <p style={{ color: C.textMid, fontSize: 14, marginBottom: 20 }}>Analizá cualquier compra antes de hacerla.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                <input placeholder="¿Qué querés comprar?" value={compra.nombre} onChange={e => setCompra({ ...compra, nombre: e.target.value })} />
                <input placeholder="Precio ($)" type="number" value={compra.precio} onChange={e => setCompra({ ...compra, precio: e.target.value })} />
                <button onClick={analizarCompra} style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 14, padding: "14px", fontSize: 16, fontFamily: "inherit", fontWeight: 700, cursor: "pointer", opacity: compraLoading ? 0.7 : 1 }}>
                  {compraLoading ? "Analizando... 🧠" : "Analizar compra"}
                </button>
              </div>
              {compraRes && (
                <div style={{ animation: "fadeUp 0.35s ease" }}>
                  <div style={{ padding: 20, borderRadius: 18, textAlign: "center", marginBottom: 14, background: compraRes.veredicto === "COMPRAR" ? C.greenLight : compraRes.veredicto === "NO COMPRAR" ? C.redLight : C.goldLight, border: `2px solid ${compraRes.veredicto === "COMPRAR" ? C.green : compraRes.veredicto === "NO COMPRAR" ? C.red : C.gold}50` }}>
                    <p style={{ fontSize: 44, marginBottom: 8 }}>{compraRes.emoji}</p>
                    <p style={{ fontWeight: 800, fontSize: 26, color: compraRes.veredicto === "COMPRAR" ? C.green : compraRes.veredicto === "NO COMPRAR" ? C.red : C.gold }}>{compraRes.veredicto}</p>
                    <p style={{ color: C.textMid, fontSize: 14, marginTop: 8 }}>{compraRes.razon}</p>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                    <Card style={{ textAlign: "center", padding: 16, background: C.goldLight }}>
                      <p style={{ fontSize: 28, marginBottom: 4 }}>⏰</p>
                      <p style={{ fontWeight: 800, fontSize: 26, color: C.gold }}>{compraRes.horas}hs</p>
                      <p style={{ color: C.textMid, fontSize: 12, marginTop: 4 }}>de trabajo</p>
                    </Card>
                    <Card style={{ textAlign: "center", padding: 16, background: C.purpleLight }}>
                      <p style={{ fontSize: 28, marginBottom: 4 }}>📊</p>
                      <p style={{ fontWeight: 800, fontSize: 26, color: C.purple }}>{compraRes.pct}%</p>
                      <p style={{ color: C.textMid, fontSize: 12, marginTop: 4 }}>de tu ingreso</p>
                    </Card>
                  </div>
                  <Card style={{ background: C.accentLight, border: `1.5px solid ${C.accent}30` }}>
                    <p style={{ fontWeight: 700, fontSize: 15, color: C.accent, marginBottom: 8 }}>💡 Mi consejo</p>
                    <p style={{ fontSize: 14, color: C.textMid, lineHeight: 1.6 }}>{compraRes.consejo}</p>
                  </Card>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </>
  );
}
