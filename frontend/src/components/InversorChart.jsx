import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

function InversorChart({ inversores }) {
  const labels = inversores.map(inv => inv.nombre);
  const Soc = inversores.map(inv => inv.Soc);
  const corriente = inversores.map(inv => inv.corriente);
  const CargaDescarga = inversores.map(inv => inv.CargaDescarga);

  const data = {
    labels,
    datasets: [
      {
        label: 'Soc (W)',
        data: Soc,
        backgroundColor: 'rgba(54, 162, 235, 0.6)'
      },
      {
        label: 'Corriente (A)',
        data: corriente,
        backgroundColor: 'rgba(255, 206, 86, 0.6)'
      },    
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  return (
    <div style={{ marginTop: '40px' }}>
      <h3>Visualización de Parámetros</h3>
      <Bar data={data} options={options} />
    </div>
  );
}

export default InversorChart;
