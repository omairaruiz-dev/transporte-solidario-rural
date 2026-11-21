import { useEffect, useState } from "react";

const VEREDAS = ["Morinda", "Santa Rosa", "Tetilla", "La Laja", "Santa Helena"];
const RUTAS = [...VEREDAS.map((v) => `Popayán Centro → ${v}`), ...VEREDAS.map((v) => `${v} → Popayán Centro`)];
const BASE = Array.from({ length: 8 }, (_, i) => {
  const h = 6 + i * 2;
  return { etiqueta: `${h % 12 || 12}:00 ${h >= 12 ? "PM" : "AM"}`, clave24: `${String(h).padStart(2, "0")}:00` };
});
const AUT = ["omaira.admin@transportesolidario.org", "conductor1@transportesolidario.org", "3207408467"];

const leer = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || "null") ?? d; } catch { return d; } };
const puedeEntrar = (u) => {
  if (!u) return false;
  if (["administrador", "admin", "conductor"].includes((u.rol || u.role || "").toString().trim().toLowerCase())) return true;
  const id = (u.email || u.correo || u.usuario || "").toString().trim().toLowerCase();
  const extra = (leer("usuarios_tsr", []) || [])
    .filter((x) => ["conductor", "administrador", "admin"].includes((x?.rol || "").toString().trim().toLowerCase()))
    .flatMap((x) => [x?.correo, x?.email, x?.telefono, x?.usuario]).filter(Boolean);
  return [...AUT, ...extra].map((x) => x.toString().trim().toLowerCase()).includes(id);
};
const a24 = (h = "14:00") => {
  const s = String(h).trim(), m12 = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i), m24 = s.match(/^(\d{1,2}):(\d{2})$/);
  if (m12) return `${String((Number(m12[1]) % 12) + (m12[3].toUpperCase() === "PM" ? 12 : 0)).padStart(2, "0")}:${m12[2]}`;
  return m24 ? `${String(Math.min(23, Number(m24[1]))).padStart(2, "0")}:${m24[2]}` : "14:00";
};
const etiqueta = (h) => {
  const c = a24(h), f = BASE.find((x) => x.clave24 === c);
  if (f) return f.etiqueta;
  const [hr, min] = c.split(":").map(Number);
  return `${hr % 12 || 12}:${String(min).padStart(2, "0")} ${hr >= 12 ? "PM" : "AM"} (${c})`;
};
const sinVereda = (r = "") => r.replace(/\s*\(\d{2}:\d{2}\)\s*$/, "").replace(/\bVereda\s+/gi, "").trim();
const veredaAlt = (r) => r.replace("→ ", "→ Vereda ").replace(/^([A-Za-zÁÉÍÓÚáéíóúÑñ ]+) →/, "Vereda $1 →");
const vencido = (v) => v?.fecha && new Date(`${v.fecha}T${a24(v.hora)}:00`) <= new Date();
const limpiar = (lista) => (Array.isArray(lista) ? lista : []).filter((v) => !vencido(v));

export default function GestionViajes() {
  if (!puedeEntrar(leer("usuario_tsr", null))) return <p style={{ padding: "2rem" }}>Acceso restringido.</p>;

  const [mapCupos, setMapCupos] = useState(() => leer("cupos_tsr", {}) || {});
  const [programados, setProgramados] = useState(() => {
    const v = limpiar(leer("viajes_tsr", []));
    localStorage.setItem("viajes_tsr", JSON.stringify(v));
    return v;
  });
  const [prog, setProg] = useState({ ruta: RUTAS[0], fecha: "2026-11-22", hora: "14:00", cupos: 2 });

  useEffect(() => localStorage.setItem("cupos_tsr", JSON.stringify(mapCupos)), [mapCupos]);
  useEffect(() => localStorage.setItem("viajes_tsr", JSON.stringify(programados)), [programados]);
  useEffect(() => {
    const sync = () => setProgramados((prev) => limpiar(prev.length ? prev : leer("viajes_tsr", [])));
    const id = setInterval(sync, 30000);
    window.addEventListener("storage", sync);
    return () => { clearInterval(id); window.removeEventListener("storage", sync); };
  }, []);

  const guardar = (e) => {
    e.preventDefault();
    const cupos = Math.max(0, Number(prog.cupos) || 0);
    const fecha = prog.fecha || "2026-11-22";
    const hora = a24(prog.hora);
    const sig = { ...mapCupos, [`${prog.ruta} | ${fecha} | ${hora}`]: cupos, [`${veredaAlt(prog.ruta)} | ${fecha} | ${hora}`]: cupos };
    setMapCupos(sig);
    localStorage.setItem("cupos_tsr", JSON.stringify(sig));
    window.dispatchEvent(new Event("storage"));
    const item = { id: Date.now(), ruta: prog.ruta, fecha, hora, cupos, cancelado: false };
    setProgramados((p) => limpiar([item, ...p.filter((v) => !(v.ruta === prog.ruta && v.fecha === fecha && a24(v.hora) === hora))]));
  };

  const cancelarViaje = (p) => {
    const hora = a24(p.hora);
    const sig = { ...mapCupos, [`${p.ruta} | ${p.fecha} | ${hora}`]: 0, [`${veredaAlt(p.ruta)} | ${p.fecha} | ${hora}`]: 0 };
    setMapCupos(sig);
    localStorage.setItem("cupos_tsr", JSON.stringify(sig));

    const sols = (leer("solicitudes_tsr", []) || []).map((s) =>
      sinVereda(s.ruta) === sinVereda(p.ruta) && s.fecha === p.fecha && a24(s.hora24 || s.hora) === hora
        ? { ...s, estado: "Viaje cancelado" }
        : s
    );
    localStorage.setItem("solicitudes_tsr", JSON.stringify(sols));
    setProgramados((prev) => prev.map((x) => (x.id === p.id ? { ...x, cupos: 0, cancelado: true } : x)));
    window.dispatchEvent(new Event("storage"));
  };

  const quitar = (p) => {
    const hora = a24(p.hora);
    const sig = { ...mapCupos };
    delete sig[`${p.ruta} | ${p.fecha} | ${hora}`];
    delete sig[`${veredaAlt(p.ruta)} | ${p.fecha} | ${hora}`];
    setMapCupos(sig);
    setProgramados((prev) => prev.filter((x) => x.id !== p.id));
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Programar viajes</h2>
      <form onSubmit={guardar} style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
        <select value={prog.ruta} onChange={(e) => setProg({ ...prog, ruta: e.target.value })}>{RUTAS.map((r) => <option key={r} value={r}>{r}</option>)}</select>
        <input type="date" value={prog.fecha} onChange={(e) => setProg({ ...prog, fecha: e.target.value })} />
        <input type="time" value={a24(prog.hora)} onChange={(e) => setProg({ ...prog, hora: e.target.value })} />
        <select value={a24(prog.hora)} onChange={(e) => setProg({ ...prog, hora: e.target.value })}>
          {BASE.map((h) => <option key={h.clave24} value={h.clave24}>{h.etiqueta}</option>)}
        </select>
        <input type="number" min="0" value={prog.cupos} onChange={(e) => setProg({ ...prog, cupos: e.target.value })} style={{ width: "75px" }} />
        <button type="submit" className="boton boton-verde">Guardar</button>
      </form>
      <ul style={{ marginTop: "14px" }}>
        {programados.map((p, i) => (
          <li key={p.id} style={{ marginTop: "8px" }}>
            <strong>Viaje {i + 1}:</strong> {p.ruta} — {p.fecha} · {etiqueta(p.hora)} — Cupos: <strong>{p.cupos}</strong>{" "}
            {p.cancelado && <strong style={{ color: "#b91c1c" }}>· Cancelado </strong>}
            <button type="button" onClick={() => setProg({ ...p, hora: a24(p.hora) })}>Editar</button>{" "}
            <button type="button" onClick={() => cancelarViaje(p)}>Cancelar viaje</button>{" "}
            <button type="button" onClick={() => quitar(p)}>Quitar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}