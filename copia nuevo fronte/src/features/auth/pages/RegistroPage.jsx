import { useState } from 'react'
import Formulario from '../../../components/ui/Formulario'

const reglas = {
  nombre: [/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{3,100}$/, 'Nombre obligatorio (3 a 100 letras).'],
  telefono: [/^3\d{9}$/, 'Celular de 10 dígitos que empiece por 3.'],
  correo: [/^\S+@\S+\.\S+$/, 'Escribe un correo válido.'],
  contrasena: [/^.{8,}$/, 'La contraseña debe tener al menos 8 caracteres.'],
  vereda: [/\S/, 'La vereda o dirección es obligatoria.'],
  licencia: [/^[A-Za-z0-9]{5,20}$/, 'Licencia de 5 a 20 letras o números.'],
  placa: [/^[A-Za-z]{3}-\d{3}$/, 'Placa con formato ABC-123.'],
  tipo: [/\S/, 'Selecciona el tipo de vehículo.'],
  capacidad: [/^[1-9]\d*$/, 'Escribe un número mayor que 0.'],
}

const validar = (v) =>
  Object.fromEntries(Object.keys(v).filter((k) => !reglas[k][0].test(v[k].trim())).map((k) => [k, reglas[k][1]]))

const comunes = (ver, toggle) => [
  { id: 'nombre', etiqueta: 'Nombre completo', maxLength: 100 },
  { id: 'telefono', etiqueta: 'Teléfono celular', tipo: 'tel', maxLength: 10 },
  { id: 'correo', etiqueta: 'Correo electrónico', tipo: 'email', maxLength: 80 },
  { id: 'contrasena', etiqueta: 'Contraseña (mínimo 8 caracteres)', tipo: ver ? 'text' : 'password', maxLength: 255, esClave: true, visible: ver, onToggleClave: toggle },
]

export default function RegistroPage() {
  const [tipo, setTipo] = useState('pasajero')
  const [ver, setVer] = useState(false)

  const base = comunes(ver, () => setVer((p) => !p))
  const campos = {
    pasajero: [...base, { id: 'vereda', etiqueta: 'Vereda o dirección', maxLength: 120 }],
    conductor: [
      ...base,
      { id: 'licencia', etiqueta: 'Número de licencia', maxLength: 20 },
      { id: 'placa', etiqueta: 'Placa (ABC-123)', maxLength: 7 },
      { id: 'tipo', etiqueta: 'Tipo de vehículo', opciones: ['Camioneta', 'Campero', 'Buseta'].map((t) => [t, t]) },
      { id: 'capacidad', etiqueta: 'Capacidad de pasajeros', tipo: 'number', min: 1 },
    ],
  }

  const guardar = (v) => {
    const cuentas = JSON.parse(localStorage.getItem('usuarios_tsr') || '[]')
    const correo = v.correo.trim().toLowerCase()
    const nueva = { ...v, correo, rol: tipo }
    const i = cuentas.findIndex((c) => (c.correo || '').toLowerCase() === correo)
    if (i >= 0) cuentas[i] = { ...cuentas[i], ...nueva }
    else cuentas.push(nueva)
    localStorage.setItem('usuarios_tsr', JSON.stringify(cuentas))
    return ''
  }

  return (
    <section className="panel">
      <h1>Crear cuenta de {tipo}</h1>
      <div className="pestanas" role="group" aria-label="Tipo de cuenta">
        {Object.keys(campos).map((t) => (
          <button key={t} type="button" className="boton" aria-pressed={tipo === t} onClick={() => setTipo(t)}>
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      <Formulario key={tipo} campos={campos[tipo]} validar={validar} verificar={guardar} boton="Registrarme" mensaje="Registro realizado correctamente." />
    </section>
  )
}