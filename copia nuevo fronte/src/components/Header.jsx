import { Link, NavLink } from 'react-router-dom'

export default function Header() {
return (
<header className="header">
<Link to="/" className="marca">Transporte Solidario Rural</Link>
<nav aria-label="Principal"><NavLink to="/">Inicio</NavLink></nav>
</header>
)
}