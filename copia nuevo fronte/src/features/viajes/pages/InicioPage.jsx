import { Link } from 'react-router-dom'

export default function InicioPage() {
  return (
    <section className="panel centrado">
      <h1>Bienvenido a Transporte Solidario Rural</h1>
      <div className="acciones">
        <Link className="boton boton-verde" to="/solicitar-viaje">Solicitar Viaje</Link>
        <Link className="boton boton-azul" to="/registro">Crear Cuenta</Link>
        <Link className="boton" to="/login">Iniciar Sesión</Link>
      </div>
    </section>
  )
}