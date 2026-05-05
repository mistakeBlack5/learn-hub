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
import AdminChart from '../components/admin/AdminChart';
import { useState, useEffect } from 'react';
import { api } from '../services/api';

// ✅ Register Chart.js components once
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  ArcElement, Title, Tooltip, Legend, Filler
);

export default function AdminChart({ type = 'line', data, title = '', height = '300px' }) {
  const [isDark, setIsDark] = useState(false);

  // 🌓 Sync with system/app theme
  useEffect(() => {
    const checkTheme = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
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
        labels: { color: themeColors.text, font: { family: 'Inter, system-ui, sans-serif', size: 12 } }
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
        cornerRadius: 8,
        displayColors: true
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
        display: type !== 'doughnut'
      }
    },
    animation: { duration: 600, easing: 'easeOutQuart' }
  }), [isDark, themeColors, title, type]);

  const ChartComponent = type === 'bar' ? Bar : type === 'doughnut' ? Doughnut : Line;

  return (
    <div className="w-full" style={{ height }}>
      <ChartComponent 
        data={{
          labels: data?.labels || [],
          datasets: data?.datasets || []
        }} 
        options={options} 
      />
    </div>
  );
function AnalyticsView() {
  const [loading, setLoading] = useState(true);
  const [charts, setCharts] = useState({
    enrollment: null,
    revenue: null,
    categories: null
  });

  useEffect(() => {
    const loadCharts = async () => {
      try {
        // 🔌 Replace with: const res = await api('/admin/analytics');
        // For now, using realistic mock data:
        setCharts({
          enrollment: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
              {
                label: 'New Enrollments',
                data: [65, 78, 92, 105, 134, 156],
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.15)',
                fill: true,
                tension: 0.4
              },
              {
                label: 'Completions',
                data: [12, 24, 38, 52, 71, 89],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                fill: true,
                tension: 0.4
              }
            ]
          },
          revenue: {
            labels: ['Course Sales', 'Subscriptions', 'Certificates', 'Enterprise'],
            datasets: [{
              data: [45, 30, 15, 10],
              backgroundColor: ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b'],
              hoverOffset: 8
            }]
          },
          categories: {
            labels: ['Development', 'Design', 'Business', 'Marketing', 'Data Science'],
            datasets: [{
              label: 'Active Courses',
              data: [42, 28, 19, 15, 12],
              backgroundColor: '#0ea5e9',
              borderRadius: 6,
              borderSkipped: false
            }]
          }
        });
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCharts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: '$268.5K', change: '+24%', color: 'text-green-600' },
          { label: 'Active Students', value: '12,450', change: '+18%', color: 'text-blue-600' },
          { label: 'Avg Completion', value: '68%', change: '+5%', color: 'text-purple-600' },
          { label: 'New This Month', value: '1,240', change: '+32%', color: 'text-orange-600' }
        ].map((kpi, i) => (
          <div key={i} className="glass-card rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{kpi.label}</div>
            <div className={`text-xs font-medium mt-1 ${kpi.color}`}>{kpi.change} vs last month</div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Enrollment & Completion Trends</h3>
          <AdminChart type="line" data={charts.enrollment} height="280px" />
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Revenue Sources</h3>
          <AdminChart type="doughnut" data={charts.revenue} height="280px" />
        </div>

        <div className="glass-card rounded-2xl p-6 lg:col-span-2">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Courses by Category</h3>
          <AdminChart type="bar" data={charts.categories} height="250px" />
        </div>
      </div>
    </div>
  );
}
}