import { useState } from 'react'
import CampoFormulario from './CampoFormulario'

export default function Formulario({ campos, validar, verificar, boton, mensaje }) {
const vacio = Object.fromEntries(campos.map((c) => [c.id, '']))
const [valores, setValores] = useState(vacio)
const [errores, setErrores] = useState({})
const [ok, setOk] = useState(false)
const [fallo, setFallo] = useState('')

const cambiar = (e) => {
setValores({ ...valores, [e.target.name]: e.target.value })
setOk(false)
setFallo('')
}

const enviar = (e) => {
e.preventDefault()
const nuevos = validar(valores)
setErrores(nuevos)
if (Object.keys(nuevos).length) return
const error = verificar?.(valores)
if (error) return setFallo(error)
setOk(true)
setValores(vacio)
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
{campos.map((c) => (
<CampoFormulario key={c.id} {...c} valor={valores[c.id]} onChange={cambiar} error={errores[c.id]} />
))}
<button className="boton boton-verde">{boton}</button>
</form>
)
}