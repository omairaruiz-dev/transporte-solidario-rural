import { useState } from 'react'
import CampoFormulario from './CampoFormulario'

export default function Formulario({ campos, validar, verificar, boton, mensaje }) {
  const vacio = Object.fromEntries(campos.map((c) => [c.id, '']))
  const [valores, setValores] = useState(vacio)
  const [errores, setErrores] = useState({})
  const [ok, setOk] = useState(false)
  const [fallo, setFallo] = useState('')
  const [ver, setVer] = useState({})

  const cambiar = (e) => {
    setValores({ ...valores, [e.target.name]: e.target.value })
    setOk(false); setFallo('')
  }

  const enviar = (e) => {
    e.preventDefault()
    const nuevos = validar(valores)
    setErrores(nuevos)
    if (Object.keys(nuevos).length) return
    const err = verificar?.(valores)
    if (err) return setFallo(err)
    setOk(true); setValores(vacio)
  }

  return (
    <form className="formulario" onSubmit={enviar} noValidate>
      {ok && <p className="exito" role="status">{mensaje}</p>}
      {fallo && (
        <div className="alerta" role="alert">
          <p>{fallo}</p>
          <button type="button" className="boton" onClick={() => { setFallo(''); setValores({ ...valores, contrasena: '' }) }}>Reintentar</button>
        </div>
      )}
      {campos.map((c) => {
        const baseTipo = c.tipo || c.type
        const clave = Boolean(c.esClave || baseTipo === 'password' || c.id === 'contrasena')
        const visible = clave ? Boolean(c.visible ?? ver[c.id]) : false
        return (
          <div key={c.id} style={{ position: 'relative' }}>
            <CampoFormulario {...c} type={clave ? (visible ? 'text' : 'password') : baseTipo} valor={valores[c.id]} onChange={cambiar} error={errores[c.id]} />
            {clave && (
              <button type="button" onClick={c.onToggleClave || (() => setVer((p) => ({ ...p, [c.id]: !p[c.id] })))} style={{ position: 'absolute', right: '0.6rem', top: '2.15rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                {visible ? '🙈' : '👁️'}
              </button>
            )}
          </div>
        )
      })}
      <button className="boton boton-verde">{boton}</button>
    </form>
  )
}