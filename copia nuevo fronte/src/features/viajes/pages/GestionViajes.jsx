import { useEffect, useState } from "react";

const VEREDAS = ["Morinda", "Santa Rosa", "Tetilla", "La Laja", "Santa Helena"];
const RUTAS = [...VEREDAS.map((v) => `Popayán Centro → ${v}`), ...VEREDAS.map((v) => `${v} → Popayán Centro`)];
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
const h24 = (h = "14:00") => {
  const m12 = h.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (m12) return `${String((Number(m12[1]) % 12) + (m12[3].toUpperCase() === "PM" ? 12 : 0)).padStart(2, "0")}:${m12[2]}`;
  const m24 = h.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m24) return "14:00";
  const hr = Number(m24[1]);
  return `${String(hr >= 1 && hr <= 8 ? hr + 12 : hr).padStart(2, "0")}:${m24[2]}`;
};
const veredaAlt = (r) => r.replace("→ ", "→ Vereda ").replace(/^([A-Za-zÁÉÍÓÚáéíóúÑñ ]+) →/, "Vereda $1 →");

export default function GestionViajes() {
  if (!puedeEntrar(leer("usuario_tsr", null))) return <p style={{ padding: "2rem" }}>Acceso restringido.</p>;

  const [mapCupos, setMapCupos] = useState(() => leer("cupos_tsr", {}) || {});
  const [programados, setProgramados] = useState(() => leer("viajes_tsr", []) || []);
  const [prog, setProg] = useState({ ruta: RUTAS[0], fecha: "2026-11-22", hora: "14:00", cupos: 2 });

  useEffect(() => localStorage.setItem("cupos_tsr", JSON.stringify(mapCupos)), [mapCupos]);
  useEffect(() => localStorage.setItem("viajes_tsr", JSON.stringify(programados)), [programados]);

  const guardar = (e) => {
    e.preventDefault();
    const cupos = Math.max(0, Number(prog.cupos) || 0);
    const fecha = prog.fecha || "2026-11-22";
    const hora = h24(prog.hora);
    const sig = { ...mapCupos, [`${prog.ruta} | ${fecha} | ${hora}`]: cupos, [`${veredaAlt(prog.ruta)} | ${fecha} | ${hora}`]: cupos };
    setMapCupos(sig);
    localStorage.setItem("cupos_tsr", JSON.stringify(sig));
    window.dispatchEvent(new Event("storage"));
    const item = { id: Date.now(), ...prog, fecha, hora, cupos };
    setProgramados((p) => [item, ...p.filter((v) => !(v.ruta === prog.ruta && v.fecha === fecha && h24(v.hora) === hora))]);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Programar viajes</h2>
      <form onSubmit={guardar} style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <select value={prog.ruta} onChange={(e) => setProg({ ...prog, ruta: e.target.value })}>{RUTAS.map((r) => <option key={r} value={r}>{r}</option>)}</select>
        <input type="date" value={prog.fecha} onChange={(e) => setProg({ ...prog, fecha: e.target.value })} />
        <input value={prog.hora} onChange={(e) => setProg({ ...prog, hora: e.target.value })} style={{ width: "85px" }} />
        <input type="number" min="0" value={prog.cupos} onChange={(e) => setProg({ ...prog, cupos: e.target.value })} style={{ width: "75px" }} />
        <button type="submit" className="boton boton-verde">Guardar</button>
      </form>
      <ul style={{ marginTop: "14px" }}>
        {programados.map((p, i) => (
          <li key={p.id} style={{ marginTop: "8px" }}>
            <strong>Viaje {i + 1}:</strong> {p.ruta} — {p.fecha} · {p.hora} — Cupos: <strong>{p.cupos}</strong>{" "}
            <button type="button" onClick={() => setProg(p)}>Editar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}