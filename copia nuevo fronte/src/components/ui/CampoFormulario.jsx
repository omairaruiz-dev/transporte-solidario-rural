export default function CampoFormulario({ id, etiqueta, tipo = 'text', valor, onChange, error, opciones, ...resto }) {
const props = { id, name: id, value: valor, onChange, 'aria-invalid': !!error, 'aria-describedby': error ? id + '-e' : undefined, ...resto }
return (
<div className="campo">
<label htmlFor={id}>{etiqueta}</label>
{opciones ? (
<select {...props}>
<option value="">Seleccione...</option>
{opciones.map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
</select>
) : (
<input type={tipo} {...props} />
)}
{error && <p id={id + '-e'} className="error" role="alert">{error}</p>}
</div>
)
}
