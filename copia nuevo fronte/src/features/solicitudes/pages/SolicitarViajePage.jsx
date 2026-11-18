import Formulario from '../../../components/ui/Formulario'
import { viajes } from '../../../data/datos'

const campos = [
  { id: 'correo', etiqueta: 'Correo registrado', tipo: 'email', maxLength: 80 },
  { id: 'contrasena', etiqueta: 'Contraseña', tipo: 'password', maxLength: 255 },
  { id: 'viaje', etiqueta: 'Viaje', opciones: viajes.map((v) => [v.id, `${v.destino} · ${v.fecha} ${v.hora} · ${v.cupos} cupos`]) },
]

const validar = (v) => {
  const e = {}
  if (!/^\S+@\S+\.\S+$/.test(v.correo)) e.correo = 'Ingresa un correo electrónico válido.'
  if (!v.contrasena || v.contrasena.length < 8) e.contrasena = 'La contraseña debe tener al menos 8 caracteres.'
  if (!v.viaje) e.viaje = 'Selecciona un viaje disponible.'
  return e
}

// Verificación simulada (se conecta al backend más adelante)
const verificar = (v) => {
  const cuentasValidas = [
    { correo: 'omaira.admin@transportesolidario.org', contrasena: 'Admin12345' },
    { correo: 'ana@correo.com', contrasena: 'clave12345' },
  ]
  const existe = cuentasValidas.some(
    (c) => c.correo === v.correo && c.contrasena === v.contrasena
  )
  return existe ? '' : 'Usuario no registrado o contraseña incorrecta.'
}

export default function SolicitarViajePage() {
  return (
    <section className="panel">
      <h1>Solicitar viaje</h1>
      <Formulario
        campos={campos}
        validar={validar}
        verificar={verificar}
        boton="Enviar solicitud"
        mensaje="Solicitud registrada en estado pendiente."
      />
    </section>
  )
}