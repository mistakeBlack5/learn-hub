import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useEffect, useMemo, useState } from 'react';

// ✅ Register Chart.js components ONCE at module level
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AdminChart({ type = 'line', data = {}, title = '', height = '300px' }) {
  const [isDark, setIsDark] = useState(false);

  // 🌓 Sync with theme changes
  useEffect(() => {
    const checkTheme = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    return () => observer.disconnect();
  }, []);

  const themeColors = useMemo(() => ({
    text: isDark ? '#94a3b8' : '#475569',
    grid: isDark ? '#334155' : '#e2e8f0',
    bg: isDark ? '#1e293b' : '#ffffff',
    title: isDark ? '#f1f5f9' : '#1e293b'
  }), [isDark]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { 
          color: themeColors.text, 
          font: { family: 'Inter, system-ui, sans-serif', size: 12 } 
        }
      },
      title: {
        display: !!title,
        text: title,
        color: themeColors.title,
        font: { family: 'Inter, system-ui, sans-serif', size: 16, weight: '600' }
      },
      tooltip: {
        backgroundColor: themeColors.bg,
        titleColor: themeColors.title,
        bodyColor: themeColors.text,
        borderColor: themeColors.grid,
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: { color: themeColors.grid },
        ticks: { color: themeColors.text }
      },
      y: {
        beginAtZero: true,
        grid: { color: themeColors.grid },
        ticks: { color: themeColors.text },
        display: type !== 'doughnut' // Hide axes for doughnut charts
      }
    },
    animation: { duration: 600, easing: 'easeOutQuart' }
  }), [isDark, themeColors, title, type]);

  // Select the correct Chart.js component
  const ChartComponent = type === 'bar' ? Bar : type === 'doughnut' ? Doughnut : Line;

  return (
    <div className="w-full" style={{ height }}>
      <ChartComponent 
        data={{
          labels: data.labels || [],
          datasets: data.datasets || []
        }} 
        options={options} 
      />
    </div>
  );
}