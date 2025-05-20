import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [inversores, setInversores] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    estado: '',
    voltaje: '',
    corriente: '',
    temperatura: ''
  });

  // Cargar inversores al inicio
  useEffect(() => {
    fetch('http://localhost:5000/api/inversores')
      .then(res => res.json())
      .then(data => setInversores(data));
  }, []);

  // Manejar cambios del formulario
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Enviar nuevo inversor
  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/api/inversores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      const nuevo = await res.json();
      setInversores([...inversores, nuevo]);
      setFormData({ nombre: '', estado: '', soc: '', potencia: '', CargaDescarga: '' });
    } else {
      alert('Error al agregar inversor');
    }
  };

  return (
    <div className="container">
      <h1>Dashboard de Inversores</h1>

      <form onSubmit={handleSubmit}>
        <input name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre" required />
        <input name="estado" value={formData.estado} onChange={handleChange} placeholder="Estado" required />
        <input name="soc" value={formData.Soc} onChange={handleChange} placeholder="Soc (%)" />
        <input name="potencia" value={formData.potencia} onChange={handleChange} placeholder="Potencia (W)" />
        <input name="CargaDescarga" value={formData.CargaDescarga} onChange={handleChange} placeholder="CargaDescarga" />
        <button type="submit">Agregar Inversor</button>
      </form>

      <h2>Lista de Inversoress</h2>
      <ul>
        {inversores.map((inv) => (
          <li key={inv._id}>
            {inv.nombre} | {inv.estado} | {inv.soc || '-'}W | {inv.corriente || '-'}A | {inv.CargaDescarga|| '-'}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;

