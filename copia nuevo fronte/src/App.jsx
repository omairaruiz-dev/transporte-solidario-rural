import Encabezado from './components/layout/Encabezado'
import AppRouter from './routes/AppRouter'

export default function App() {
  return (
    <>
      <a className="saltar" href="#contenido">Saltar al contenido</a>
      <Encabezado />
      <main id="contenido" className="contenedor">
        <AppRouter />
      </main>
    </>
  )
}
