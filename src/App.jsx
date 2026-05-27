import { useState, useEffect, useRef } from "react";

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
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);

const CATEGORIAS = {
  comida:       { icono: "🍔", color: C.red,     label: "Comida"      },
  transporte:   { icono: "🚗", color: C.accent,  label: "Transporte"  },
  ocio:         { icono: "🎮", color: C.purple,  label: "Ocio"        },
  impuestos:    { icono: "🏠", color: C.textMid, label: "Vivienda"    },
  herramientas: { icono: "🔧", color: C.green,   label: "Servicios"   },
  trabajo:      { icono: "💼", color: C.gold,    label: "Trabajo"     },
  gimnasio:     { icono: "💪", color: C.red,     label: "Gimnasio"    },
  ropa:         { icono: "👕", color: C.purple,  label: "Ropa"        },
  compras:      { icono: "🛍️", color: C.accent,  label: "Compras"     },
  otro:         { icono: "📦", color: C.textLight,label: "Otro"       },
};

const INICIAL = {
  efectivo: 45000,
  banco: 280000,
  mercadoPago: 67500,
  ahorros: 120000,
  inversiones: 350000,
  deudas: 85000,
  gastosDelMes: 142000,
  ingresosDelMes: 310000,
  objetivoAhorro: 80000,
  transacciones: [
    { id: 1,  desc: "Sueldo",          monto: 250000, tipo: "ingreso", cat: "trabajo",       fecha: "2026-05-01", recurrente: true  },
    { id: 2,  desc: "Emprendimiento",  monto: 60000,  tipo: "ingreso", cat: "trabajo",       fecha: "2026-05-05", recurrente: false },
    { id: 3,  desc: "Alquiler",        monto: 55000,  tipo: "gasto",   cat: "impuestos",     fecha: "2026-05-01", recurrente: true  },
    { id: 4,  desc: "Supermercado",    monto: 18500,  tipo: "gasto",   cat: "comida",        fecha: "2026-05-03", recurrente: false },
    { id: 5,  desc: "Netflix",         monto: 4200,   tipo: "gasto",   cat: "ocio",          fecha: "2026-05-04", recurrente: true  },
    { id: 6,  desc: "Spotify",         monto: 1800,   tipo: "gasto",   cat: "ocio",          fecha: "2026-05-04", recurrente: true  },
    { id: 7,  desc: "Uber",            monto: 3200,   tipo: "gasto",   cat: "transporte",    fecha: "2026-05-06", recurrente: false },
    { id: 8,  desc: "Delivery Pizza",  monto: 4500,   tipo: "gasto",   cat: "comida",        fecha: "2026-05-07", recurrente: false },
    { id: 9,  desc: "Gimnasio",        monto: 8500,   tipo: "gasto",   cat: "gimnasio",      fecha: "2026-05-01", recurrente: true  },
    { id: 10, desc: "Delivery Sushi",  monto: 6800,   tipo: "gasto",   cat: "comida",        fecha: "2026-05-09", recurrente: false },
    { id: 11, desc: "Ropa Zara",       monto: 12000,  tipo: "gasto",   cat: "ropa",          fecha: "2026-05-11", recurrente: false },
    { id: 12, desc: "Internet",        monto: 5500,   tipo: "gasto",   cat: "herramientas",  fecha: "2026-05-10", recurrente: true  },
    { id: 13, desc: "Delivery Burger", monto: 3900,   tipo: "gasto",   cat: "comida",        fecha: "2026-05-13", recurrente: false },
    { id: 14, desc: "Adobe CC",        monto: 9800,   tipo: "gasto",   cat: "herramientas",  fecha: "2026-05-14", recurrente: true  },
  ],
  metas: [
    { id: 1, nombre: "Viaje a Europa",      icono: "✈️", objetivo: 800000, actual: 320000, color: C.accent  },
    { id: 2, nombre: "PC Gamer",            icono: "💻", objetivo: 300000, actual: 120000, color: C.purple  },
    { id: 3, nombre: "Fondo de Emergencia", icono: "🛡️", objetivo: 200000, actual: 120000, color: C.green   },
  ],
  gastosFijos: [
    { desc: "Alquiler",  monto: 55000, dia: 1  },
    { desc: "Gimnasio",  monto: 8500,  dia: 1  },
    { desc: "Netflix",   monto: 4200,  dia: 4  },
    { desc: "Spotify",   monto: 1800,  dia: 4  },
    { desc: "Internet",  monto: 5500,  dia: 10 },
    { desc: "Adobe CC",  monto: 9800,  dia: 14 },
  ],
};

// ─── COMPONENTES REUTILIZABLES ────────────────────────────────────────────────
function Barra({ pct, color }) {
  return (
    <div style={{ background: C.border, borderRadius: 999, height: 10, overflow: "hidden" }}>
      <div style={{
        height: "100%", borderRadius: 999, background: color,
        width: `${Math.min(pct, 100)}%`, transition: "width 0.8s ease",
      }} />
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: C.white, borderRadius: 20, padding: 20,
      boxShadow: "0 2px 12px #00000010", border: `1px solid ${C.border}`,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── TAB INICIO ───────────────────────────────────────────────────────────────
function TabInicio({ data, ahorrando, ahorroPct, objetivoPct, gastoDiario, prediccion, totalDeliv, deliveries, suscripciones, totalSusc }) {
  return (
    <div className="fade" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Hero patrimonio */}
      <Card style={{ background: `linear-gradient(135deg, ${C.accent} 0%, #1250c0 100%)`, border: "none" }}>
        <p style={{ color: "#ffffffaa", fontSize: 13, fontWeight: 600, marginBottom: 6, letterSpacing: 1 }}>TU PATRIMONIO TOTAL</p>
        <p style={{ color: "#fff", fontSize: 44, fontWeight: 800, lineHeight: 1 }}>
          {fmt(data.efectivo + data.banco + data.mercadoPago + data.ahorros + data.inversiones - data.deudas)}
        </p>
        <p style={{ color: "#ffffffbb", fontSize: 14, marginTop: 6 }}>
          Total en cuentas: {fmt(data.efectivo + data.banco + data.mercadoPago + data.ahorros + data.inversiones)}
        </p>
        <div style={{ display: "flex", marginTop: 20, borderTop: "1px solid #ffffff30", paddingTop: 16 }}>
          <div style={{ flex: 1 }}>
            <p style={{ color: "#ffffffaa", fontSize: 12 }}>Ingresos del mes</p>
            <p style={{ color: "#fff", fontSize: 20, fontWeight: 800, marginTop: 2 }}>+{fmt(data.ingresosDelMes)}</p>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: "#ffffffaa", fontSize: 12 }}>Gastos del mes</p>
            <p style={{ color: "#ffcccc", fontSize: 20, fontWeight: 800, marginTop: 2 }}>-{fmt(data.gastosDelMes)}</p>
          </div>
        </div>
      </Card>

      {/* Dónde está tu plata */}
      <p style={{ fontWeight: 700, fontSize: 17, paddingLeft: 4 }}>¿Dónde está tu plata?</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          { label: "Efectivo",     val: data.efectivo,    icon: "💵", color: C.gold,   bg: C.goldLight   },
          { label: "Banco",        val: data.banco,        icon: "🏦", color: C.accent, bg: C.accentLight },
          { label: "Mercado Pago", val: data.mercadoPago,  icon: "💳", color: C.green,  bg: C.greenLight  },
          { label: "Ahorros",      val: data.ahorros,      icon: "🐷", color: C.purple, bg: C.purpleLight },
          { label: "Inversiones",  val: data.inversiones,  icon: "📈", color: C.gold,   bg: C.goldLight   },
          { label: "Deudas",       val: data.deudas,       icon: "📉", color: C.red,    bg: C.redLight    },
        ].map((w, i) => (
          <Card key={i} style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: w.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{w.icon}</div>
              <p style={{ color: C.textMid, fontSize: 13, fontWeight: 600 }}>{w.label}</p>
            </div>
            <p style={{ color: w.color, fontSize: 20, fontWeight: 800 }}>{fmt(w.val)}</p>
          </Card>
        ))}
      </div>

      {/* Objetivo de ahorro */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ fontWeight: 700, fontSize: 16 }}>🎯 Objetivo de ahorro</p>
          <p style={{ fontWeight: 800, fontSize: 18, color: C.green }}>{objetivoPct}%</p>
        </div>
        <Barra pct={objetivoPct} color={C.green} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
          <p style={{ color: C.textMid, fontSize: 13 }}>Ahorrado: <b style={{ color: C.text }}>{fmt(data.ahorros)}</b></p>
          <p style={{ color: C.textMid, fontSize: 13 }}>Meta: <b style={{ color: C.text }}>{fmt(data.objetivoAhorro)}</b></p>
        </div>
        {objetivoPct >= 100
          ? <p style={{ color: C.green, fontWeight: 700, marginTop: 10 }}>🎉 ¡Superaste tu objetivo este mes!</p>
          : <p style={{ color: C.textMid, fontSize: 13, marginTop: 10 }}>Te falta un <b style={{ color: C.accent }}>{100 - objetivoPct}%</b> para llegar a tu meta.</p>
        }
      </Card>

      {/* Resumen rápido */}
      <p style={{ fontWeight: 700, fontSize: 17, paddingLeft: 4 }}>Resumen del mes</p>
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

      {/* Alertas */}
      <p style={{ fontWeight: 700, fontSize: 17, paddingLeft: 4 }}>⚠️ Cosas a tener en cuenta</p>
      {[
        { icon: "🛵", text: `Gastaste ${fmt(totalDeliv)} en deliveries este mes (${deliveries.length} pedidos).`,          color: C.gold,   bg: C.goldLight   },
        { icon: "🔄", text: `Tenés ${suscripciones.length} suscripciones por ${fmt(totalSusc)}/mes. ¿Usás todas?`,        color: C.accent, bg: C.accentLight },
        { icon: "📅", text: `Si seguís así, gastarás ${fmt(prediccion)} a fin de mes.`,                                    color: C.red,    bg: C.redLight    },
      ].map((a, i) => (
        <Card key={i} style={{ padding: 16, background: a.bg, border: `1.5px solid ${a.color}30` }}>
          <p style={{ fontSize: 14, fontWeight: 500 }}><span style={{ marginRight: 8 }}>{a.icon}</span>{a.text}</p>
        </Card>
      ))}
    </div>
  );
}

// ─── TAB MOVIMIENTOS ──────────────────────────────────────────────────────────
function TabMovimientos({ data, gastosCat, eliminarTx }) {
  const [filtro, setFiltro] = useState("todos");
  const lista = data.transacciones.filter(t => filtro === "todos" || t.tipo === filtro);

  return (
    <div className="fade" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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

      <div style={{ display: "flex", gap: 10 }}>
        {[["todos", "Todos"], ["gasto", "Gastos"], ["ingreso", "Ingresos"]].map(([val, label]) => (
          <button key={val} onClick={() => setFiltro(val)}
            style={{ flex: 1, padding: "11px 8px", borderRadius: 12, border: `2px solid ${filtro === val ? C.accent : C.border}`, background: filtro === val ? C.accentLight : C.white, color: filtro === val ? C.accent : C.textMid, fontFamily: "inherit", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.18s" }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {lista.map(t => (
          <Card key={t.id} style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: (CATEGORIAS[t.cat]?.color || C.accent) + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
              {CATEGORIAS[t.cat]?.icono || "📦"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.desc}</p>
              <p style={{ color: C.textLight, fontSize: 12, marginTop: 3 }}>{t.fecha}{t.recurrente ? " · Fijo mensual 🔄" : ""}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
              <p style={{ fontWeight: 800, fontSize: 16, color: t.tipo === "ingreso" ? C.green : C.red }}>
                {t.tipo === "ingreso" ? "+" : "-"}{fmt(t.monto)}
              </p>
              <button
                onClick={() => {
                  if (window.confirm(`¿Eliminás "${t.desc}"?`)) eliminarTx(t.id);
                }}
                style={{ fontSize: 11, color: C.textLight, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
                🗑️ Eliminar
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── TAB METAS ────────────────────────────────────────────────────────────────
function TabMetas({ data, ahorrando, setData }) {
  return (
    <div className="fade" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontWeight: 700, fontSize: 18 }}>Mis Metas</p>
        <button
          style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 14, padding: "10px 18px", fontSize: 14, fontFamily: "inherit", fontWeight: 700, cursor: "pointer" }}
          onClick={() => {
            const nombre = prompt("¿Para qué querés ahorrar?");
            if (!nombre) return;
            const objetivo = parseFloat(prompt("¿Cuánto necesitás? ($)") || "0");
            if (!objetivo) return;
            setData(prev => ({ ...prev, metas: [...prev.metas, { id: Date.now(), nombre, icono: "🎯", objetivo, actual: 0, color: C.accent }] }));
          }}>
          + Nueva meta
        </button>
      </div>

      {data.metas.map(meta => {
        const pct = Math.min(Math.round((meta.actual / meta.objetivo) * 100), 100);
        const falta = meta.objetivo - meta.actual;
        const meses = ahorrando > 0 ? Math.ceil(falta / ahorrando) : "—";
        return (
          <Card key={meta.id}>
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
              <p style={{ color: C.textMid, fontSize: 13 }}>Acumulado: <b style={{ color: C.text }}>{fmt(meta.actual)}</b></p>
              <p style={{ color: C.textMid, fontSize: 13 }}>Falta: <b style={{ color: meta.color }}>{fmt(falta)}</b></p>
            </div>
            {pct >= 100 && <p style={{ color: C.green, fontWeight: 700, marginTop: 10, fontSize: 15 }}>🎉 ¡Meta cumplida!</p>}
            {pct >= 75 && pct < 100 && <p style={{ color: C.gold, fontWeight: 600, marginTop: 10, fontSize: 14 }}>¡Casi llegás! Solo te falta un {100 - pct}% más.</p>}
          </Card>
        );
      })}

      <Card style={{ background: C.accentLight, border: `1.5px solid ${C.accent}30` }}>
        <p style={{ fontWeight: 700, fontSize: 15, color: C.accent, marginBottom: 10 }}>💡 Tu capacidad de ahorro actual</p>
        <p style={{ color: C.text, fontSize: 14 }}>Ahorrás <b>{fmt(ahorrando)}</b> por mes. Con ese ritmo podés:</p>
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          {data.metas.map(m => {
            const meses = ahorrando > 0 ? Math.ceil((m.objetivo - m.actual) / ahorrando) : "—";
            return (
              <p key={m.id} style={{ fontSize: 14, color: C.textMid }}>
                {m.icono} {m.nombre}: <b style={{ color: C.text }}>{meses} meses</b>
              </p>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ─── TAB CALENDARIO ───────────────────────────────────────────────────────────
function TabCalendario({ data }) {
  const hoy = new Date().getDate();
  const totalFijo = data.gastosFijos.reduce((a, b) => a + b.monto, 0);
  return (
    <div className="fade" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ fontWeight: 700, fontSize: 18 }}>Vencimientos del mes</p>
      <p style={{ color: C.textMid, fontSize: 14 }}>Tus pagos fijos ordenados por fecha.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data.gastosFijos.sort((a, b) => a.dia - b.dia).map((g, i) => {
          const diasHasta = g.dia >= hoy ? g.dia - hoy : 30 - hoy + g.dia;
          const col   = diasHasta === 0 ? C.red : diasHasta <= 5 ? C.gold : C.green;
          const badge = diasHasta === 0 ? "¡Hoy!" : diasHasta === 1 ? "Mañana" : `En ${diasHasta} días`;
          return (
            <Card key={i} style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 14, borderLeft: `5px solid ${col}`, borderRadius: "0 16px 16px 0" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: col + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ fontWeight: 800, fontSize: 16, color: col }}>{g.dia}</p>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 15 }}>{g.desc}</p>
                <p style={{ color: C.textLight, fontSize: 12, marginTop: 2 }}>Día {g.dia} de cada mes</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontWeight: 800, fontSize: 16 }}>{fmt(g.monto)}</p>
                <p style={{ fontSize: 12, fontWeight: 700, color: col, marginTop: 2 }}>{badge}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <Card style={{ background: C.redLight, border: `1.5px solid ${C.red}30` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontWeight: 700, fontSize: 15 }}>Total gastos fijos</p>
          <p style={{ fontWeight: 800, fontSize: 18, color: C.red }}>{fmt(totalFijo)}</p>
        </div>
        <p style={{ color: C.textMid, fontSize: 13, marginTop: 8 }}>
          Después de pagar todo, te quedan <b style={{ color: C.green }}>{fmt(data.ingresosDelMes - totalFijo)}</b> libres.
        </p>
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// APP PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [data, setData]               = useState(INICIAL);
  const [tab, setTab]                 = useState("inicio");
  const [modalAdd, setModalAdd]       = useState(false);
  const [modalAI, setModalAI]         = useState(false);
  const [modalCompra, setModalCompra] = useState(false);
  const [newTx, setNewTx]             = useState({ desc: "", monto: "", tipo: "gasto", cat: "comida", recurrente: false });
  const [compra, setCompra]           = useState({ nombre: "", precio: "" });
  const [compraRes, setCompraRes]     = useState(null);
  const [compraLoading, setCompraLoading] = useState(false);
  const [aiChat, setAiChat]           = useState([
    { role: "assistant", text: "¡Hola! Soy tu asistente financiero 😊\n\nPuedo analizar tus finanzas y ayudarte a tomar mejores decisiones. ¿Qué querés saber?" },
  ]);
  const [aiInput, setAiInput]         = useState("");
  const [aiLoading, setAiLoading]     = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [aiChat]);

  // ── Cálculos ───────────────────────────────────────────────────────────────
  const total       = data.efectivo + data.banco + data.mercadoPago + data.ahorros + data.inversiones;
  const patrimonio  = total - data.deudas;
  const ahorrando   = data.ingresosDelMes - data.gastosDelMes;
  const ahorroPct   = Math.round((ahorrando / data.ingresosDelMes) * 100);
  const objetivoPct = Math.min(Math.round((data.ahorros / data.objetivoAhorro) * 100), 100);
  const gastoDiario = Math.round(data.gastosDelMes / 27);
  const prediccion  = Math.round(gastoDiario * 31);
  const deliveries  = data.transacciones.filter(t => t.tipo === "gasto" && t.desc.toLowerCase().includes("delivery"));
  const totalDeliv  = deliveries.reduce((a, b) => a + b.monto, 0);
  const suscripciones = data.transacciones.filter(t => t.tipo === "gasto" && t.recurrente);
  const totalSusc   = suscripciones.reduce((a, b) => a + b.monto, 0);
  const gastosCat   = {};
  data.transacciones.filter(t => t.tipo === "gasto").forEach(t => {
    gastosCat[t.cat] = (gastosCat[t.cat] || 0) + t.monto;
  });

const eliminarTx = (id) => {
    const tx = data.transacciones.find(t => t.id === id);
    if (!tx) return;
    setData(prev => ({
      ...prev,
      transacciones: prev.transacciones.filter(t => t.id !== id),
      gastosDelMes:   tx.tipo === "gasto"   ? prev.gastosDelMes   - tx.monto : prev.gastosDelMes,
      ingresosDelMes: tx.tipo === "ingreso" ? prev.ingresosDelMes - tx.monto : prev.ingresosDelMes,
    }));
  };

  // ── Agregar transacción ────────────────────────────────────────────────────
  const agregarTx = () => {
    if (!newTx.desc.trim() || !newTx.monto) return;
    const monto = parseFloat(newTx.monto);
    setData(prev => ({
      ...prev,
      transacciones: [{ ...newTx, id: Date.now(), monto, fecha: new Date().toISOString().split("T")[0] }, ...prev.transacciones],
      gastosDelMes:   newTx.tipo === "gasto"   ? prev.gastosDelMes   + monto : prev.gastosDelMes,
      ingresosDelMes: newTx.tipo === "ingreso" ? prev.ingresosDelMes + monto : prev.ingresosDelMes,
    }));
    setNewTx({ desc: "", monto: "", tipo: "gasto", cat: "comida", recurrente: false });
    setModalAdd(false);
  };

  // ── Chat IA ────────────────────────────────────────────────────────────────
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
          system: `Sos un asesor financiero amigable y claro. Hablás en español rioplatense.
Datos del usuario:
- Patrimonio: ${fmt(patrimonio)}
- Efectivo: ${fmt(data.efectivo)}, Banco: ${fmt(data.banco)}, Mercado Pago: ${fmt(data.mercadoPago)}
- Ahorros: ${fmt(data.ahorros)}, Inversiones: ${fmt(data.inversiones)}, Deudas: ${fmt(data.deudas)}
- Ingresos: ${fmt(data.ingresosDelMes)}, Gastos: ${fmt(data.gastosDelMes)}, Ahorrando: ${fmt(ahorrando)}/mes (${ahorroPct}%)
- Delivery: ${fmt(totalDeliv)}, Suscripciones: ${fmt(totalSusc)}/mes
- Predicción fin de mes: ${fmt(prediccion)}
Respondé de forma simple, clara y con emojis. Máximo 3 párrafos cortos.`,
          messages: [
            ...aiChat.slice(1).map(m => ({ role: m.role, content: m.text })),
            { role: "user", content: msg },
          ],
        }),
      });
      const d = await res.json();
      setAiChat(prev => [...prev, { role: "assistant", text: d.content?.[0]?.text || "No pude responder, intentá de nuevo." }]);
    } catch {
      setAiChat(prev => [...prev, { role: "assistant", text: "Hubo un error. Intentá de nuevo." }]);
    }
    setAiLoading(false);
  };

  // ── Analizador anti-impulso ────────────────────────────────────────────────
  const analizarCompra = async () => {
    if (!compra.nombre.trim() || !compra.precio || compraLoading) return;
    setCompraLoading(true);
    const precio = parseFloat(compra.precio);
    const horas  = Math.round(precio / (data.ingresosDelMes / 160));
    const pct    = Math.round((precio / data.ingresosDelMes) * 100);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 600,
          system: `Sos un asesor financiero. Respondé SOLO con JSON válido sin markdown:
{"veredicto":"COMPRAR|ESPERAR|NO COMPRAR","emoji":"","razon":"frase corta y clara","consejo":"consejo práctico corto"}`,
          messages: [{
            role: "user",
            content: `El usuario gana ${fmt(data.ingresosDelMes)}/mes, ahorra ${fmt(ahorrando)}/mes y tiene ${fmt(data.ahorros)} ahorrados.
Quiere comprar: ${compra.nombre} por ${fmt(precio)} (${horas} horas de trabajo, ${pct}% de su ingreso mensual).`,
          }],
        }),
      });
      const d = await res.json();
      const text = d.content?.[0]?.text || "{}";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setCompraRes({ ...parsed, precio, horas, pct });
    } catch {
      setCompraRes({ veredicto: "ESPERAR", emoji: "⏸️", razon: `Son ${horas} horas de trabajo (${pct}% de tu ingreso).`, consejo: "Esperá 48 hs antes de decidir.", precio, horas, pct });
    }
    setCompraLoading(false);
  };

  // ── Estilos globales ───────────────────────────────────────────────────────
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${C.bg}; color: ${C.text}; font-family: 'Plus Jakarta Sans', sans-serif; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(14px);} to { opacity:1; transform:translateY(0);} }
    @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.5} }
    .fade { animation: fadeUp 0.3s ease both; }
    input, select { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px; padding: 13px 16px; border: 2px solid ${C.border}; border-radius: 14px; background: ${C.white}; color: ${C.text}; width: 100%; outline: none; transition: border-color 0.2s; }
    input:focus, select:focus { border-color: ${C.accent}; }
    select option { background: ${C.white}; }
  `;

  const NAV = [
    { id: "inicio",       label: "Inicio",       icon: "🏠" },
    { id: "movimientos",  label: "Movimientos",  icon: "💸" },
    { id: "metas",        label: "Metas",        icon: "🎯" },
    { id: "calendario",   label: "Vencimientos", icon: "📅" },
  ];

  return (
    <>
      <style>{css}</style>
      <div style={{ maxWidth: 500, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column", background: C.bg }}>

        {/* HEADER */}
        <div style={{ background: C.white, borderBottom: `2px solid ${C.border}`, padding: "18px 20px", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 11, color: C.textLight, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>Mi App de Finanzas</p>
              <p style={{ fontWeight: 800, fontSize: 22, color: C.text, marginTop: 2 }}>Buen día 👋</p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => { setCompraRes(null); setModalCompra(true); }}
                style={{ height: 44, padding: "0 14px", borderRadius: 12, border: `2px solid ${C.border}`, background: C.white, cursor: "pointer", fontSize: 20 }}
                title="¿Puedo comprar esto?">🛒
              </button>
              <button
                onClick={() => setModalAI(true)}
                style={{ height: 44, padding: "0 14px", borderRadius: 12, border: `2px solid ${C.accent}`, background: C.accentLight, cursor: "pointer", fontSize: 20 }}
                title="Hablar con IA">🤖
              </button>
              <button
                onClick={() => setModalAdd(true)}
                style={{ height: 44, padding: "0 18px", borderRadius: 12, background: C.accent, color: "#fff", border: "none", cursor: "pointer", fontSize: 22, fontWeight: 800 }}>+
              </button>
            </div>
          </div>
        </div>

        {/* CONTENIDO */}
        <div style={{ flex: 1, padding: "18px 16px 110px", overflowY: "auto" }}>
          {tab === "inicio" && (
            <TabInicio
              data={data} ahorrando={ahorrando} ahorroPct={ahorroPct}
              objetivoPct={objetivoPct} gastoDiario={gastoDiario} prediccion={prediccion}
              totalDeliv={totalDeliv} deliveries={deliveries}
              suscripciones={suscripciones} totalSusc={totalSusc} setData={setData}
            />
          )}
          {tab === "movimientos" && <TabMovimientos data={data} gastosCat={gastosCat} eliminarTx={eliminarTx} />}
          {tab === "metas"       && <TabMetas data={data} ahorrando={ahorrando} setData={setData} />}
          {tab === "calendario"  && <TabCalendario data={data} />}
        </div>

        {/* NAVEGACIÓN */}
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 500, background: C.white, borderTop: `2px solid ${C.border}`, display: "flex", zIndex: 50 }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)}
              style={{ flex: 1, padding: "12px 4px 14px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 24 }}>{n.icon}</span>
              <span style={{ fontSize: 11, fontFamily: "inherit", fontWeight: 700, color: tab === n.id ? C.accent : C.textLight }}>{n.label}</span>
              {tab === n.id && <div style={{ width: 20, height: 3, borderRadius: 99, background: C.accent }} />}
            </button>
          ))}
        </div>

        {/* ── MODAL AGREGAR ─────────────────────────────────────────────────── */}
        {modalAdd && (
          <div onClick={e => e.target === e.currentTarget && setModalAdd(false)}
            style={{ position: "fixed", inset: 0, background: "#00000060", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
            <div style={{ background: C.white, borderRadius: "24px 24px 0 0", padding: 24, width: "100%", maxWidth: 500, boxShadow: "0 -8px 40px #00000020", animation: "fadeUp 0.3s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
                <p style={{ fontWeight: 800, fontSize: 20 }}>Nuevo movimiento</p>
                <button onClick={() => setModalAdd(false)} style={{ width: 34, height: 34, borderRadius: 10, background: C.bg, border: "none", cursor: "pointer", fontSize: 18, color: C.textMid }}>✕</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <input placeholder="¿En qué gastaste o de dónde ingresó?" value={newTx.desc} onChange={e => setNewTx({ ...newTx, desc: e.target.value })} />
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
                  {Object.entries(CATEGORIAS).map(([k, v]) => (
                    <option key={k} value={k}>{v.icono} {v.label}</option>
                  ))}
                </select>
                <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: C.textMid, cursor: "pointer" }}>
                  <input type="checkbox" checked={newTx.recurrente} onChange={e => setNewTx({ ...newTx, recurrente: e.target.checked })} style={{ width: "auto", accentColor: C.accent }} />
                  🔄 Se repite todos los meses
                </label>
                <button onClick={agregarTx} style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 14, padding: "14px", fontSize: 16, fontFamily: "inherit", fontWeight: 700, cursor: "pointer", marginTop: 4 }}>
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
            <div style={{ background: C.white, borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 500, margin: "0 auto", height: "80vh", display: "flex", flexDirection: "column", boxShadow: "0 -8px 40px #00000020", animation: "fadeUp 0.3s ease" }}>
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
                {aiLoading && (
                  <div style={{ display: "flex" }}>
                    <div style={{ padding: "13px 16px", borderRadius: "18px 18px 18px 4px", background: C.bg, animation: "pulse 1s infinite", fontSize: 18 }}>💭</div>
                  </div>
                )}
              </div>
              <div style={{ padding: "8px 14px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8, overflowX: "auto" }}>
                {["¿Estoy ahorrando bien?", "¿Cómo bajo mis gastos?", "¿Puedo pagar mis deudas?", "Predicción fin de mes"].map(q => (
                  <button key={q} onClick={() => setAiInput(q)}
                    style={{ whiteSpace: "nowrap", padding: "8px 14px", borderRadius: 20, background: C.accentLight, border: `1.5px solid ${C.accent}40`, color: C.accent, fontFamily: "inherit", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
                    {q}
                  </button>
                ))}
              </div>
              <div style={{ padding: 14, borderTop: `2px solid ${C.border}`, display: "flex", gap: 10 }}>
                <input placeholder="Escribí tu consulta aquí..." value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === "Enter" && enviarAI()} style={{ flex: 1 }} />
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
            <div style={{ background: C.white, borderRadius: "24px 24px 0 0", padding: 24, width: "100%", maxWidth: 500, boxShadow: "0 -8px 40px #00000020", animation: "fadeUp 0.3s ease", maxHeight: "90vh", overflowY: "auto" }}>
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
                    <p style={{ color: C.textMid, fontSize: 14, marginTop: 8, lineHeight: 1.5 }}>{compraRes.razon}</p>
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
