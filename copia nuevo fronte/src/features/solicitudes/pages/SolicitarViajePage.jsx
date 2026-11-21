import { useMemo, useState } from 'react'
import Formulario from '../../../components/ui/Formulario'
import TarjetaViaje from '../../viajes/components/TarjetaViaje'
import { viajes } from '../../../data/datos'

const CUENTAS = [
  { correo: 'omaira.admin@transportesolidario.org', contrasena: 'Admin12345', nombre: 'Omaira Admin' },
  { correo: 'ana@correo.com', contrasena: 'clave12345', nombre: 'Ana' },
]
const DIAS = ['lu', 'ma', 'mi', 'ju', 'vi', 'sá', 'do']
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const CUPOS_MAX = 12
const HOY = new Date().toISOString().slice(0, 10)
const HORAS = Array.from({ length: 8 }, (_, i) => {
  const m = 6 * 60 + i * 120
  const h24 = Math.floor(m / 60) % 24
  const min = m % 60
  return {
    etiqueta: `${h24 % 12 || 12}:${String(min).padStart(2, '0')} ${h24 >= 12 ? 'PM' : 'AM'}`,
    clave24: `${String(h24).padStart(2, '0')}:${String(min).padStart(2, '0')}`,
  }
})

const leer = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || 'null') ?? d } catch { return d } }
const buscarCuenta = (clave) => [...CUENTAS, ...(leer('usuarios_tsr', []) || [])].find((c) => (c.contrasena || c.password || c.clave || '') === (clave || ''))
const cuposSlot = (ruta, fecha, hora24, mapa) => {
  const sinV = ruta.replace(/\bVereda\s+/gi, '')
  const conV = ruta.replace('→ ', '→ Vereda ').replace(/^([A-Za-zÁÉÍÓÚáéíóúÑñ ]+) →/, 'Vereda $1 →')
  for (const r of [ruta, sinV, conV]) {
    const val = mapa[`${r} | ${fecha} | ${hora24}`]
    if (val !== undefined) return Math.max(0, Number(val))
  }
  return CUPOS_MAX
}

export default function SolicitarViajePage() {
  const [ver, setVer] = useState(false)
  const [sentido, setSentido] = useState('ida')
  const [viajeSel, setViajeSel] = useState(null)
  const [vistaMes, setVistaMes] = useState({ año: 2026, mes: 10 })
  const [fechaSel, setFechaSel] = useState(HOY)
  const [horaSel, setHoraSel] = useState(HORAS[3])
  const [aviso, setAviso] = useState('')
  const [revisar, setRevisar] = useState(false)
  const [claveRev, setClaveRev] = useState('')
  const [errorRev, setErrorRev] = useState('')
  const [revisor, setRevisor] = useState(null)
  const [tick, setTick] = useState(0)

  const ida = sentido === 'ida'
  const mapaCupos = useMemo(() => leer('cupos_tsr', {}), [tick])
  const todasReservas = useMemo(() => leer('solicitudes_tsr', []) || [], [tick])
  const fechasProg = useMemo(() => new Set((leer('viajes_tsr', []) || []).map((v) => v.fecha).filter(Boolean)), [tick])

  const reservasRevisor = useMemo(() => {
    if (!revisor) return []
    const ids = [revisor.nombre, revisor.correo, revisor.email, revisor.usuario].filter(Boolean).map((x) => x.toString().trim().toLowerCase())
    return todasReservas.filter((r) => [r?.persona, r?.correo, r?.email, r?.usuario].filter(Boolean).some((x) => ids.includes(x.toString().trim().toLowerCase())))
  }, [todasReservas, revisor])

  const listaUnica = useMemo(() => {
    const vistos = new Set()
    return viajes
      .map((v) => ({ ...v, destino: (v.destino || v.vereda || '').trim() }))
      .filter((v) => v.destino && !vistos.has(v.destino.toLowerCase()) && vistos.add(v.destino.toLowerCase()))
      .map((v) => ({ ...v, cupos: cuposSlot(ida ? `Popayán Centro → ${v.destino}` : `${v.destino} → Popayán Centro`, fechaSel, horaSel.clave24, mapaCupos) }))
  }, [ida, mapaCupos, fechaSel, horaSel])

  const celdas = useMemo(() => {
    const offset = (new Date(vistaMes.año, vistaMes.mes, 1).getDay() + 6) % 7
    const total = new Date(vistaMes.año, vistaMes.mes + 1, 0).getDate()
    return [...Array(offset).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)]
  }, [vistaMes])

  const destino = (viajeSel || listaUnica[0])?.destino || 'Vereda Morinda'
  const rutaBase = ida ? `Popayán Centro → ${destino}` : `${destino} → Popayán Centro`
  const rutaActiva = `${rutaBase} (${horaSel.clave24})`
  const slotActual = `${rutaBase} | ${fechaSel} | ${horaSel.clave24}`
  const cuposActivos = cuposSlot(rutaBase, fechaSel, horaSel.clave24, mapaCupos)

  const validar = (v) => {
    const e = {}
    if (!v.contrasena || v.contrasena.length < 8) e.contrasena = 'Mínimo 8 caracteres.'
    if (!v.cuposSolicitados) e.cuposSolicitados = 'Elige cupos.'
    return e
  }

  const verificar = (v) => {
    setAviso('')
    const u = buscarCuenta(v.contrasena)
    if (!u) return 'Contraseña incorrecta.'
    const ped = Number(v.cuposSolicitados) || 1
    if (cuposActivos <= 0 || ped > cuposActivos) return `No hay cupos suficientes (disponibles: ${cuposActivos}).`

    const nombre = u.nombre || u.correo || u.email || 'Pasajero'
    localStorage.setItem('cupos_tsr', JSON.stringify({ ...mapaCupos, [slotActual]: cuposActivos - ped }))
    localStorage.setItem('solicitudes_tsr', JSON.stringify([{
      id: Date.now(), persona: nombre, correo: u.correo || u.email || '', ruta: rutaActiva,
      fecha: fechaSel, hora: horaSel.etiqueta, cupos: ped, estado: 'Aprobado',
    }, ...todasReservas]))
    setRevisor(u)
    setAviso('Tu viaje fue aprobado.')
    setTick((n) => n + 1)
    return ''
  }

  const consultarReservas = (e) => {
    e.preventDefault()
    setErrorRev('')
    const u = buscarCuenta(claveRev)
    if (!u) { setRevisor(null); setErrorRev('Contraseña incorrecta.'); return }
    setRevisor(u)
  }

  const campos = [
    { id: 'contrasena', etiqueta: 'Contraseña', tipo: ver ? 'text' : 'password', maxLength: 255, esClave: true, visible: ver, onToggleClave: () => setVer((p) => !p) },
    { id: 'cuposSolicitados', etiqueta: 'Cupos a solicitar', opciones: Array.from({ length: cuposActivos }, (_, i) => [String(i + 1), `${i + 1} ${i === 0 ? 'cupo' : 'cupos'}`]) },
  ]
  const btn = (on) => ({ padding: '8px 14px', borderRadius: '8px', border: '1px solid #0f766e', cursor: 'pointer', background: on ? '#0f766e' : '#fff', color: on ? '#fff' : '#0f766e', fontWeight: 'bold' })
  const moverMes = (d) => setVistaMes((p) => { const f = new Date(p.año, p.mes + d, 1); return { año: f.getFullYear(), mes: f.getMonth() } })
  const estiloDia = (on, prog) => ({
    padding: '6px 0', borderRadius: '6px', cursor: 'pointer',
    border: prog ? '1px solid #0f766e' : 'none',
    background: on ? '#111827' : prog ? '#ccfbf1' : '#f3f4f6',
    color: on ? '#fff' : '#0f172a', fontWeight: on || prog ? 'bold' : 'normal',
  })

  return (
    <section className="panel">
      <h1>Solicitar viaje</h1>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button type="button" onClick={() => { setSentido('ida'); setRevisar(false); setAviso('') }} style={btn(!revisar && ida)}>Ida: Popayán → Vereda</button>
        <button type="button" onClick={() => { setSentido('regreso'); setRevisar(false); setAviso('') }} style={btn(!revisar && !ida)}>Regreso: Vereda → Popayán</button>
        <button type="button" onClick={() => { setRevisar((p) => !p); setErrorRev(''); setAviso('') }} style={btn(revisar)}>Revisar reservas</button>
        {viajeSel && !revisar && <button type="button" className="boton" onClick={() => { setViajeSel(null); setAviso('') }}>← Ver viajes disponibles</button>}
      </div>

      {revisar && (
        <div style={{ marginBottom: '16px', padding: '12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1' }}>
          <form onSubmit={consultarReservas} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input type="password" placeholder="Ingresa tu contraseña" value={claveRev} onChange={(e) => setClaveRev(e.target.value)} style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #94a3b8' }} />
            <button type="submit" className="boton boton-verde">Ver</button>
          </form>
          {errorRev && <p style={{ marginTop: '8px', marginBottom: 0, color: '#b91c1c' }}>{errorRev}</p>}
          {revisor && (
            <div style={{ marginTop: '10px' }}>
              <strong>Mis reservas ({revisor.nombre || revisor.correo}):</strong>
              {reservasRevisor.length === 0 ? (
                <p style={{ marginTop: '6px', marginBottom: 0 }}>No tienes reservas registradas.</p>
              ) : (
                <ul style={{ marginTop: '6px', paddingLeft: '18px', marginBottom: 0 }}>
                  {reservasRevisor.map((r) => (
                    <li key={r.id} style={{ marginTop: '4px' }}>
                      {r.ruta} · {r.fecha} · {r.hora} · Cupos: <strong>{r.cupos}</strong> — <strong>{r.estado || 'Aprobado'}</strong>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {!viajeSel ? (
        <div className="grid">
          {listaUnica.map((v) => (
            <div key={`${sentido}-${fechaSel}-${horaSel.clave24}-${v.id}`} onClick={() => { setViajeSel(v); setAviso('') }}>
              <TarjetaViaje v={v} regreso={!ida} />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '14px', padding: '12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div><strong>Ruta:</strong> {rutaActiva} · <strong>Fecha:</strong> {fechaSel} · <strong>Hora:</strong> {horaSel.etiqueta}</div>
            <div><strong>Cupos disponibles:</strong> {cuposActivos}</div>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '18px' }}>
            <div style={{ minWidth: '270px', maxWidth: '310px', border: '1px solid #d1d5db', borderRadius: '10px', padding: '12px', background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '8px' }}>
                <button type="button" onClick={() => moverMes(-1)}>&lt;</button>
                <span>{MESES[vistaMes.mes]} {vistaMes.año}</span>
                <button type="button" onClick={() => moverMes(1)}>&gt;</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontSize: '0.85rem', color: '#6b7280', marginBottom: '4px' }}>
                {DIAS.map((d) => <span key={d}>{d}</span>)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
                {celdas.map((d, i) => {
                  if (!d) return <span key={`v-${i}`} />
                  const iso = `${vistaMes.año}-${String(vistaMes.mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
                  return iso < HOY ? <span key={iso} /> : <button key={iso} type="button" onClick={() => setFechaSel(iso)} style={estiloDia(fechaSel === iso, fechasProg.has(iso))}>{d}</button>
                })}
              </div>
            </div>

            <div style={{ flex: '1 1 250px', border: '1px solid #d1d5db', borderRadius: '10px', padding: '12px', background: '#fff' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Horarios (cada 2 horas desde 6:00 AM)</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(80px, 1fr))', gap: '8px' }}>
                {HORAS.map((h) => (
                  <button key={h.etiqueta} type="button" onClick={() => setHoraSel(h)} style={{ padding: '8px 6px', borderRadius: '8px', border: '1px solid #cbd5e1', background: horaSel.etiqueta === h.etiqueta ? '#0f766e' : '#f8fafc', color: horaSel.etiqueta === h.etiqueta ? '#fff' : '#0f172a', fontWeight: horaSel.etiqueta === h.etiqueta ? 'bold' : 'normal', cursor: 'pointer' }}>{h.etiqueta}</button>
                ))}
              </div>
            </div>
          </div>

          <Formulario key={`${sentido}-${fechaSel}-${horaSel.etiqueta}-${destino}`} campos={campos} validar={validar} verificar={verificar} boton="Enviar solicitud" mensaje="Tu viaje fue aprobado." />
          {aviso && <p style={{ marginTop: '10px', padding: '10px 12px', borderRadius: '8px', background: '#dcfce7', color: '#166534', fontWeight: 'bold' }}>{aviso}</p>}
        </>
      )}
    </section>
  )
}