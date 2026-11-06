import Formulario from '../components/Formulario'

const campos = [{ id: 'correo', etiqueta: 'Correo electrónico', tipo: 'email', maxLength: 80 }]
const validar = (v) => (/^\S+@\S+\.\S+$/.test(v.correo) ? {} : { correo: 'El correo es obligatorio y debe ser válido.' })

export default function Recuperar() {
return (
<section className="panel">
<h1>Recuperar contraseña</h1>
<Formulario campos={campos} validar={validar} boton="Enviar instrucciones" mensaje="Si el correo está registrado, recibirás las instrucciones para restablecer tu contraseña." />
</section>
)
}