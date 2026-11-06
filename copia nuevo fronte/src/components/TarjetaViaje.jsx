import { Link } from 'react-router-dom'

export default function TarjetaViaje({ v, regreso }) {
const ruta = regreso ? `${v.destino} → Popayán Centro` : `Popayán Centro → ${v.destino}`
return (
<article className="tarjeta">
<h3>{ruta}</h3>
<p>{v.fecha} · Salida {v.hora}</p>
<p>{v.vehiculo} · Cupos: <strong>{v.cupos}</strong></p>
<Link className="boton boton-verde" to="/solicitar-viaje">Solicitar cupo</Link>
</article>
)
}