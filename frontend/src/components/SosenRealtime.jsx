import { useEffect, useState } from 'react';

function SosenRealtime() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchRealtime = async () => {
      const res = await fetch('http://localhost:5000/api/sosen/realtime');
      const json = await res.json();
      setData(json);
    };

    fetchRealtime();
    const interval = setInterval(fetchRealtime, 10000); // Actualiza cada 10s

    return () => clearInterval(interval);
  }, []);

  if (!data) return <p>Cargando datos en tiempo real...</p>;

  return (
    <div style={{ marginTop: 40 }}>
      <h3>📡 Datos en Tiempo Real del Inversor SOSEN {data.deviceId}</h3>
      <ul>
        <li>Potencia Salida (Output): {data.ppv * data.ipv} W</li>
        <li>Potencia PV: {data.vpv * data.ipv} W</li>
        <li>Temperatura: XX °C</li>
        <li>Voltaje AC: {data.vpv} V</li>
        <li>Corriente AC: {data.ipv} A</li>
      </ul>
    </div>
  );
}

export default SosenRealtime;
