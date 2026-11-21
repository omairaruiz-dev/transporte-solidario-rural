import { Link } from 'react-router-dom'

const leerCupos = () => {
  try { return JSON.parse(localStorage.getItem('cupos_tsr') || '{}') } catch { return {} }
}

const a24 = (h = '') => {
  const m12 = h.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (m12) return `${String((Number(m12[1]) % 12) + (m12[3].toUpperCase() === 'PM' ? 12 : 0)).padStart(2, '0')}:${m12[2]}`
  const m24 = h.trim().match(/^(\d{1,2}):(\d{2})$/)
  return m24 ? `${String(Number(m24[1])).padStart(2, '0')}:${m24[2]}` : ''
}

export default function TarjetaViaje({ v, regreso }) {
  const destino = (v.destino || v.vereda || '').trim()
  const ruta = regreso ? `${destino} → Popayán Centro` : `Popayán Centro → ${destino}`
  const hora24 = a24(regreso ? (v.horaRegreso || v.hora || '') : (v.hora || ''))
  const fecha = regreso ? (v.fechaRegreso || v.fecha || '') : (v.fecha || '')
  const mapaCupos = leerCupos()

  const sinV = ruta.replace(/\bVereda\s+/gi, '')
  const conV = ruta.replace('→ ', '→ Vereda ').replace(/^([A-Za-zÁÉÍÓÚáéíóúÑñ ]+) →/, 'Vereda $1 →')
  const rutas = [ruta, sinV, conV]

  let cupos = v.cupos
  for (const r of rutas) {
    const val = mapaCupos[`${r} | ${fecha} | ${hora24}`] ?? mapaCupos[`${r}${hora24 ? ` (${hora24})` : ''}`] ?? mapaCupos[r]
    if (val !== undefined) { cupos = Number(val); break }
  }

  return (
    <article className="tarjeta">
      <h3>{ruta}</h3>
      <p>{v.vehiculo || 'Chiva Rural'} · Cupos: <strong>{cupos}</strong></p>
      <Link className="boton boton-verde" to="/solicitar-viaje">Solicitar cupo</Link>
    </article>
  )
}