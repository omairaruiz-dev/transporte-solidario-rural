import { Link } from 'react-router-dom'
import Formulario from '../components/Formulario'

const campos = [
{ id: 'correo', etiqueta: 'Correo electrónico', tipo: 'email', maxLength: 80 },
{ id: 'contrasena', etiqueta: 'Contraseña', tipo: 'password', maxLength: 255 },
]

const validar = (v) => {
const e = {}
if (!/^\S+@\S+\.\S+$/.test(v.correo)) e.correo = 'El correo es obligatorio y debe ser válido.'
if (v.contrasena.length < 8) e.contrasena = 'La contraseña es obligatoria (mínimo 8 caracteres).'
return e
}

// Cuenta de ejemplo (se reemplaza por la verificación del backend)
const verificar = (v) =>
v.correo === 'omaira.admin@transportesolidario.org' && v.contrasena === 'Admin12345'
? ''
: 'Correo o contraseña incorrectos. Inténtalo de nuevo.'

export default function Login() {
return (
<section className="panel">
<h1>Iniciar sesión</h1>
<Formulario campos={campos} validar={validar} verificar={verificar} boton="Entrar" mensaje="Inicio de sesión correcto. La conexión con el servidor se hará en la siguiente fase." />
<p className="centrado"><Link to="/recuperar">¿Olvidaste tu contraseña?</Link></p>
</section>
)
}