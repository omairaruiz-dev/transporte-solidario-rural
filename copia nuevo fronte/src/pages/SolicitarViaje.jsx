import Formulario from '../components/Formulario'
import { pasajeros, viajes } from '../data/datos'

const campos = [
{ id: 'pasajero', etiqueta: 'Pasajero', opciones: pasajeros },
{ id: 'viaje', etiqueta: 'Viaje', opciones: viajes.map((v) => [v.id, `${v.destino} · ${v.fecha} ${v.hora} · ${v.cupos} cupos`]) },
]

const validar = (v) => {
const e = {}
if (!v.pasajero) e.pasajero = 'Selecciona un pasajero.'
if (!v.viaje) e.viaje = 'Selecciona un viaje disponible.'
return e
}

export default function SolicitarViaje() {
return (
<section className="panel">
<h1>Solicitar viaje</h1>
<Formulario campos={campos} validar={validar} boton="Enviar solicitud" mensaje="Solicitud registrada en estado pendiente." />
</section>
)
}
