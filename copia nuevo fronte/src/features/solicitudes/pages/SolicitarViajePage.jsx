import { useEffect, useMemo, useState } from 'react'
import Formulario from '../../../components/ui/Formulario'
import TarjetaViaje from '../../viajes/components/TarjetaViaje'
import { viajes } from '../../../data/datos'

const CUENTAS = [
  { correo: 'omaira.admin@transportesolidario.org', contrasena: 'Admin12345', nombre: 'Omaira Admin' },
  { correo: 'ana@correo.com', contrasena: 'clave12345', nombre: 'Ana' },
]
const DIAS = ['lu', 'ma', 'mi', 'ju', 'vi', 'sá', 'do']
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const BASE = Array.from({ length: 8 }, (_, i) => {
  const h = 6 + i * 2
  return { etiqueta: `${h % 12 || 12}:00 ${h >= 12 ? 'PM' : 'AM'}`, clave24: `${String(h).padStart(2, '0')}:00` }
})

const hoyISO = () => new Date().toLocaleDateString('en-CA')
const leer = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || 'null') ?? d } catch { return d } }
const buscarCuenta = (c) => [...CUENTAS, ...(leer('usuarios_tsr', []) || [])].find((u) => (u.contrasena || u.password || u.clave || '') === (c || ''))
const a24 = (h = '') => {
  const s = String(h).trim(), m12 = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i), m24 = s.match(/^(\d{1,2}):(\d{2})$/)
  if (m12) return `${String((Number(m12[1]) % 12) + (m12[3].toUpperCase() === 'PM' ? 12 : 0)).padStart(2, '0')}:${m12[2]}`
  return m24 ? `${String(Math.min(23, Number(m24[1]))).padStart(2, '0')}:${m24[2]}` : ''
}
const fmtHora = (c) => BASE.find((x) => x.clave24 === c) || (() => {
  const [h, m] = c.split(':').map(Number)
  return { etiqueta: `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`, clave24: c }
})()
const cuposSlot = (ruta, fecha, h24, mapa) => {
  const sinV = ruta.replace(/\bVereda\s+/gi, ''), conV = ruta.replace('→ ', '→ Vereda ').replace(/^([A-Za-zÁÉÍÓÚáéíóúÑñ ]+) →/, 'Vereda $1 →')
  for (const r of [ruta, sinV, conV]) if (mapa[`${r} | ${fecha} | ${h24}`] !== undefined) return Math.max(0, Number(mapa[`${r} | ${fecha} | ${h24}`]))
  return 12
}
const vencida = (r) => r?.fecha && new Date(`${r.fecha}T${a24(r.hora24 || r.hora) || '23:59'}:00`) <= new Date()
const vigentes = () => {
  const l = leer('solicitudes_tsr', []) || [], a = l.filter((r) => !vencida(r))
  if (a.length !== l.length) localStorage.setItem('solicitudes_tsr', JSON.stringify(a))
  return a
}

export default function SolicitarViajePage() {
  const [ver, setVer] = useState(false)
  const [sentido, setSentido] = useState('ida')
  const [viajeSel, setViajeSel] = useState(null)
  const [mes, setMes] = useState({ año: 2026, mes: 10 })
  const [fechaSel, setFechaSel] = useState(hoyISO)
  const [horaSel, setHoraSel] = useState(BASE[3])
  const [aviso, setAviso] = useState('')
  const [revisar, setRevisar] = useState(false)
  const [claveRev, setClaveRev] = useState('')
  const [errorRev, setErrorRev] = useState('')
  const [revisor, setRevisor] = useState(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const ref = () => setTick((n) => n + 1), id = setInterval(ref, 30000)
    window.addEventListener('storage', ref)
    return () => { clearInterval(id); window.removeEventListener('storage', ref) }
  }, [])

  const ida = sentido === 'ida', hoy = hoyISO()
  const mapaCupos = useMemo(() => leer('cupos_tsr', {}), [tick])
  const reservas = useMemo(() => vigentes(), [tick])
  const prog = useMemo(() => leer('viajes_tsr', []) || [], [tick])
  const fechasProg = useMemo(() => new Set(prog.map((v) => v.fecha).filter(Boolean)), [prog])

  const horasDisp = useMemo(() => {
    const extras = prog.filter((v) => !fechaSel || !v.fecha || v.fecha === fechaSel).map((v) => a24(v.hora)).filter(Boolean).map(fmtHora)
    return [...new Map([...BASE, ...extras].map((h) => [h.clave24, h])).values()]
      .filter((h) => !(fechaSel === hoy && new Date(`${fechaSel}T${h.clave24}:00`) <= new Date()))
      .sort((a, b) => a.clave24.localeCompare(b.clave24))
  }, [prog, fechaSel, hoy, tick])

  const horaAct = horasDisp.find((h) => h.clave24 === horaSel.clave24) || horasDisp[0] || horaSel

  const misReservas = useMemo(() => {
    if (!revisor) return []
    const ids = [revisor.nombre, revisor.correo, revisor.email, revisor.usuario].filter(Boolean).map((x) => String(x).trim().toLowerCase())
    return reservas.filter((r) => [r?.persona, r?.correo, r?.email, r?.usuario].filter(Boolean).some((x) => ids.includes(String(x).trim().toLowerCase())))
  }, [reservas, revisor])

  const listaUnica = useMemo(() => {
    const vistos = new Set()
    return viajes
      .map((v) => ({ ...v, destino: (v.destino || v.vereda || '').trim() }))
      .filter((v) => v.destino && !vistos.has(v.destino.toLowerCase()) && vistos.add(v.destino.toLowerCase()))
      .map((v) => ({ ...v, cupos: cuposSlot(ida ? `Popayán Centro → ${v.destino}` : `${v.destino} → Popayán Centro`, fechaSel, horaAct.clave24, mapaCupos) }))
  }, [ida, mapaCupos, fechaSel, horaAct])

  const celdas = useMemo(() => {
    const off = (new Date(mes.año, mes.mes, 1).getDay() + 6) % 7, tot = new Date(mes.año, mes.mes + 1, 0).getDate()
    return [...Array(off).fill(null), ...Array.from({ length: tot }, (_, i) => i + 1)]
  }, [mes])

  const destino = (viajeSel || listaUnica[0])?.destino || 'Vereda Morinda'
  const rutaBase = ida ? `Popayán Centro → ${destino}` : `${destino} → Popayán Centro`
  const rutaActiva = `${rutaBase} (${horaAct.clave24})`
  const cuposActivos = cuposSlot(rutaBase, fechaSel, horaAct.clave24, mapaCupos)

  const validar = (v) => ({
    ...((!v.contrasena || v.contrasena.length < 8) && { contrasena: 'Mínimo 8 caracteres.' }),
    ...(!v.cuposSolicitados && { cuposSolicitados: 'Elige cupos.' }),
  })

  const verificar = (v) => {
    setAviso('')
    const u = buscarCuenta(v.contrasena), ped = Number(v.cuposSolicitados) || 1
    if (!u) return 'Contraseña incorrecta.'
    if (cuposActivos <= 0 || ped > cuposActivos) return `No hay cupos suficientes (disponibles: ${cuposActivos}).`
    localStorage.setItem('cupos_tsr', JSON.stringify({ ...mapaCupos, [`${rutaBase} | ${fechaSel} | ${horaAct.clave24}`]: cuposActivos - ped }))
    localStorage.setItem('solicitudes_tsr', JSON.stringify([{
      id: Date.now(), persona: u.nombre || u.correo || 'Pasajero', correo: u.correo || u.email || '',
      ruta: rutaActiva, fecha: fechaSel, hora: horaAct.etiqueta, hora24: horaAct.clave24, cupos: ped, estado: 'Aprobado',
    }, ...vigentes()]))
    setRevisor(u); setAviso('Tu viaje fue aprobado.'); setTick((n) => n + 1)
    return ''
  }

  const consultar = (e) => {
    e.preventDefault(); setErrorRev(''); setTick((n) => n + 1)
    const u = buscarCuenta(claveRev)
    if (!u) { setRevisor(null); setErrorRev('Contraseña incorrecta.'); return }
    setRevisor(u)
  }

  const btn = (on) => ({ padding: '8px 14px', borderRadius: '8px', border: '1px solid #0f766e', cursor: 'pointer', background: on ? '#0f766e' : '#fff', color: on ? '#fff' : '#0f766e', fontWeight: 'bold' })
  const moverMes = (d) => setMes((p) => { const f = new Date(p.año, p.mes + d, 1); return { año: f.getFullYear(), mes: f.getMonth() } })
  const caja = { padding: '12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', marginBottom: '16px' }

  return (
    <section className="panel">
      <h1>Solicitar viaje</h1>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button type="button" onClick={() => { setSentido('ida'); setRevisar(false); setAviso('') }} style={btn(!revisar && ida)}>Ida: Popayán → Vereda</button>
        <button type="button" onClick={() => { setSentido('regreso'); setRevisar(false); setAviso('') }} style={btn(!revisar && !ida)}>Regreso: Vereda → Popayán</button>
        <button type="button" onClick={() => { setTick((n) => n + 1); setRevisar((p) => !p); setErrorRev(''); setAviso('') }} style={btn(revisar)}>Revisar reservas</button>
        {viajeSel && !revisar && <button type="button" className="boton" onClick={() => { setViajeSel(null); setAviso('') }}>← Ver viajes disponibles</button>}
      </div>

      {revisar && (
        <div style={caja}>
          <form onSubmit={consultar} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input type="password" placeholder="Ingresa tu contraseña" value={claveRev} onChange={(e) => setClaveRev(e.target.value)} style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #94a3b8' }} />
            <button type="submit" className="boton boton-verde">Ver</button>
          </form>
          {errorRev && <p style={{ margin: '8px 0 0', color: '#b91c1c' }}>{errorRev}</p>}
          {revisor && (
            <div style={{ marginTop: '10px' }}>
              <strong>Mis reservas ({revisor.nombre || revisor.correo}):</strong>
              {!misReservas.length ? <p style={{ margin: '6px 0 0' }}>No tienes reservas registradas.</p> : (
                <ul style={{ margin: '6px 0 0', paddingLeft: '18px' }}>
                  {misReservas.map((r) => (
                    <li key={r.id} style={{ marginTop: '4px' }}>
                      {r.ruta} · {r.fecha} · {r.hora} · Cupos: <strong>{r.cupos}</strong> —{' '}
                      <strong style={{ color: r.estado === 'Viaje cancelado' ? '#b91c1c' : '#166534' }}>{r.estado || 'Aprobado'}</strong>
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
            <div key={`${sentido}-${fechaSel}-${horaAct.clave24}-${v.id}`} onClick={() => { setViajeSel(v); setAviso('') }}>
              <TarjetaViaje v={v} regreso={!ida} />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div style={caja}>
            <div><strong>Ruta:</strong> {rutaActiva} · <strong>Fecha:</strong> {fechaSel} · <strong>Hora:</strong> {horaAct.etiqueta}</div>
            <div><strong>Cupos disponibles:</strong> {cuposActivos}</div>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '18px' }}>
            <div style={{ minWidth: '270px', maxWidth: '310px', border: '1px solid #d1d5db', borderRadius: '10px', padding: '12px', background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '8px' }}>
                <button type="button" onClick={() => moverMes(-1)}>&lt;</button>
                <span>{MESES[mes.mes]} {mes.año}</span>
                <button type="button" onClick={() => moverMes(1)}>&gt;</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontSize: '0.85rem', color: '#6b7280', marginBottom: '4px' }}>
                {DIAS.map((d) => <span key={d}>{d}</span>)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
                {celdas.map((d, i) => {
                  if (!d) return <span key={`v-${i}`} />
                  const iso = `${mes.año}-${String(mes.mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, on = fechaSel === iso, pr = fechasProg.has(iso)
                  return iso < hoy ? <span key={iso} /> : (
                    <button key={iso} type="button" onClick={() => setFechaSel(iso)} style={{ padding: '6px 0', borderRadius: '6px', cursor: 'pointer', border: pr ? '1px solid #0f766e' : 'none', background: on ? '#111827' : pr ? '#ccfbf1' : '#f3f4f6', color: on ? '#fff' : '#0f172a', fontWeight: on || pr ? 'bold' : 'normal' }}>{d}</button>
                  )
                })}
              </div>
            </div>

            <div style={{ flex: '1 1 250px', border: '1px solid #d1d5db', borderRadius: '10px', padding: '12px', background: '#fff' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Horarios disponibles</div>
              {!horasDisp.length ? <p style={{ margin: 0, color: '#6b7280' }}>No quedan horarios disponibles para hoy. Selecciona otra fecha.</p> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(80px, 1fr))', gap: '8px' }}>
                  {horasDisp.map((h) => (
                    <button key={h.clave24} type="button" onClick={() => setHoraSel(h)} style={{ padding: '8px 6px', borderRadius: '8px', border: '1px solid #cbd5e1', background: horaAct.clave24 === h.clave24 ? '#0f766e' : '#f8fafc', color: horaAct.clave24 === h.clave24 ? '#fff' : '#0f172a', fontWeight: horaAct.clave24 === h.clave24 ? 'bold' : 'normal', cursor: 'pointer' }}>{h.etiqueta}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Formulario
            key={`${sentido}-${fechaSel}-${horaAct.etiqueta}-${destino}`}
            campos={[
              { id: 'contrasena', etiqueta: 'Contraseña', tipo: ver ? 'text' : 'password', maxLength: 255, esClave: true, visible: ver, onToggleClave: () => setVer((p) => !p) },
              { id: 'cuposSolicitados', etiqueta: 'Cupos a solicitar', opciones: Array.from({ length: cuposActivos }, (_, i) => [String(i + 1), `${i + 1} ${i === 0 ? 'cupo' : 'cupos'}`]) },
            ]}
            validar={validar}
            verificar={verificar}
            boton="Enviar solicitud"
            mensaje="Tu viaje fue aprobado."
          />
          {aviso && <p style={{ marginTop: '10px', padding: '10px 12px', borderRadius: '8px', background: '#dcfce7', color: '#166534', fontWeight: 'bold' }}>{aviso}</p>}
        </>
      )}
    </section>
  )
}