import { Link, useNavigate } from 'react-router-dom'
import Formulario from '../../../components/ui/Formulario'

const campos = [
  { id: 'correo', name: 'correo', label: 'Correo electrónico', type: 'email', placeholder: 'tu@correo.com', autoComplete: 'email' },
  { id: 'contrasena', name: 'contrasena', label: 'Contraseña', type: 'password', placeholder: '••••••••', autoComplete: 'current-password' },
]

const FIJOS = ['omaira.admin@transportesolidario.org', 'conductor1@transportesolidario.org']

function validar(v) {
  const e = {}
  if (!v.correo?.trim()) e.correo = 'Ingresa tu correo.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.correo)) e.correo = 'Correo no válido.'
  if (!v.contrasena) e.contrasena = 'Ingresa tu contraseña.'
  else if (v.contrasena.length < 8) e.contrasena = 'Mínimo 8 caracteres.'
  return e
}

export default function LoginPage() {
  const navigate = useNavigate()

  const verificar = (v) => {
    const correo = v.correo.trim().toLowerCase()
    const cuentas = JSON.parse(localStorage.getItem('usuarios_tsr') || '[]')
    const guardada = cuentas.find((c) => (c.correo || '').toLowerCase() === correo && c.contrasena === v.contrasena)
    const esFijo = FIJOS.includes(correo) && v.contrasena.length >= 8

    if (guardada || esFijo) {
      localStorage.setItem('usuario_tsr', JSON.stringify({ ...(guardada || {}), email: correo, rol: guardada?.rol || 'conductor' }))
      navigate('/viajes')
      return ''
    }
    return 'Correo o contraseña incorrectos. Inténtalo de nuevo.'
  }

  return (
    <section className="panel">
      <h1>Iniciar sesión</h1>
      <Formulario campos={campos} validar={validar} verificar={verificar} boton="Entrar" mensaje="Inicio de sesión correcto." />
      <p className="centrado"><Link to="/recuperar">¿Olvidaste tu contraseña?</Link></p>
    </section>
  )
}