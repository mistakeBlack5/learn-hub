import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, BookOpen, Users, Settings, BarChart3, 
  TrendingUp, Plus, Search, MoreHorizontal, CheckCircle, 
  AlertTriangle, Clock, LogOut, Shield, Edit, Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Button from '../components/common/Button';
import AdminChart from '../components/admin/AdminChart'; // ✅ New chart component

// ... rest of your code ...

export default function AdminDashboard() {
  const { user, logout } = useAuth() || {};
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ overview: null, courses: [], users: [] });

  const sidebarItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'courses', icon: BookOpen, label: 'Manage Courses' },
    { id: 'users', icon: Users, label: 'Users & Roles' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  // Fetch data when tab changes
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (activeTab === 'overview') {
          const res = await api('/admin/stats');
          if (isMounted) setData(prev => ({ ...prev, overview: res.data }));
        } else if (activeTab === 'users') {
          const res = await api('/admin/users');
          if (isMounted) setData(prev => ({ ...prev, users: res.data || [] }));
        } else if (activeTab === 'courses') {
          const res = await api('/courses?limit=50');
          if (isMounted) setData(prev => ({ ...prev, courses: res.data || [] }));
        }
      } catch (err) {
        console.warn(`Admin tab [${activeTab}] fetch failed:`, err.message);
        // Don't crash UI on API failure, use fallbacks
        if (isMounted) setError(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [activeTab]);

  const handleLogout = () => {
    if (logout) {
      logout();
      window.location.href = '/login';
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p>Loading {activeTab}...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview': return <OverviewView data={data.overview} />;
      case 'courses': return <CoursesView courses={data.courses} />;
      case 'users': return <UsersView users={data.users} />;
      case 'analytics': return <AnalyticsView />;
      case 'settings': return <SettingsView />;
      default: return <OverviewView data={data.overview} />;
    }
  };

  return (
    <div className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden lg:flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <Shield className="text-white" size={20} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">Admin Panel</h2>
              <p className="text-xs text-gray-500 capitalize">{user?.role || 'admin'}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                activeTab === item.id 
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors text-sm font-medium">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white capitalize">
              {sidebarItems.find(i => i.id === activeTab)?.label || 'Dashboard'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your platform efficiently.</p>
          </div>
          {activeTab === 'courses' && (
            <Button size="md" icon={Plus} onClick={() => alert('Course creation modal coming next!')}>
              Create Course
            </Button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
            ⚠️ {error}
          </div>
        )}

        {renderContent()}
      </main>
    </div>
  );
}

// ==========================================
// 📊 TAB COMPONENTS (Self-contained & Safe)
// ==========================================

function OverviewView({ data }) {
  const stats = data || { totalStudents: 0, activeCourses: 0, monthlyRevenue: 0, completionRate: 0 };
  const cards = [
    { label: 'Total Students', value: stats.totalStudents ?? '0', change: '+12%', icon: Users, color: 'bg-blue-500' },
    { label: 'Active Courses', value: stats.activeCourses ?? '0', change: '+5%', icon: BookOpen, color: 'bg-purple-500' },
    { label: 'Monthly Revenue', value: `$${stats.monthlyRevenue ?? '0'}`, change: '+18%', icon: TrendingUp, color: 'bg-green-500' },
    { label: 'Completion Rate', value: `${stats.completionRate ?? '0'}%`, change: '+4%', icon: CheckCircle, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white`}><stat.icon size={24} /></div>
              <span className="text-sm font-medium px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">{stat.change}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
          </motion.div>
        ))}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
        {['New student registered', 'Course "React Mastery" published', 'Admin updated pricing'].map((log, i) => (
          <div key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-lg transition-colors text-sm text-gray-600 dark:text-gray-300">
            <Clock size={14} className="text-gray-400" /> {log} <span className="ml-auto text-xs text-gray-400">{i + 1}h ago</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CoursesView({ courses }) {
  const [search, setSearch] = useState('');
  const filtered = (courses || []).filter(c => c.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:text-white outline-none text-sm" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm">
            <tr>
              <th className="px-6 py-3 font-medium">Course</th>
              <th className="px-6 py-3 font-medium hidden md:table-cell">Status</th>
              <th className="px-6 py-3 font-medium hidden md:table-cell">Students</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filtered.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No courses found</td></tr>
            ) : filtered.map(course => (
              <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{course.title}</td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${course.status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                    {course.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 hidden md:table-cell">{course.student_count || 0}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 rounded-lg"><Edit size={16} /></button>
                  <button className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsersView({ users }) {
  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      alert('Role updated successfully');
      window.location.reload();
    } catch {
      alert('Failed to update role. Check backend endpoint.');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm">
            <tr>
              <th className="px-6 py-3 font-medium">User</th>
              <th className="px-6 py-3 font-medium">Role</th>
              <th className="px-6 py-3 font-medium hidden md:table-cell">Status</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {(users || []).length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No users found</td></tr>
            ) : users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900 dark:text-white">{u.name}</div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </td>
                <td className="px-6 py-4">
                  <select defaultValue={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)} className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 text-sm capitalize focus:ring-2 focus:ring-primary-500 outline-none">
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600'}`}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500"><MoreHorizontal size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AnalyticsView() {
  const [chartData, setChartData] = useState({
    enrollmentTrend: null,
    revenueBreakdown: null,
    courseDistribution: null,
    topCourses: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // In production, replace with real API call:
        // const res = await api('/admin/analytics');
        
        // Mock data for demo (replace with backend response)
        const mockData = {
          enrollmentTrend: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
              label: 'New Enrollments',
              data: [65, 78, 92, 105, 134, 156],
              borderColor: '#8b5cf6',
              backgroundColor: 'rgba(139, 92, 246, 0.1)'
            }, {
              label: 'Completions',
              data: [12, 24, 38, 52, 71, 89],
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)'
            }]
          },
          revenueBreakdown: {
            labels: ['Course Sales', 'Subscriptions', 'Certificates', 'Enterprise'],
            datasets: [{
              data: [45, 30, 15, 10],
              backgroundColor: ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b']
            }]
          },
          courseDistribution: {
            labels: ['Development', 'Design', 'Business', 'Marketing', 'Data Science'],
            datasets: [{
              label: 'Active Courses',
              data: [42, 28, 19, 15, 12],
              backgroundColor: ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444']
            }]
          },
          topCourses: [
            { rank: 1, title: 'Complete Web Development', students: 15420, revenue: 124500, rating: 4.9 },
            { rank: 2, title: 'UI/UX Design Masterclass', students: 8930, revenue: 78200, rating: 4.8 },
            { rank: 3, title: 'Data Science with Python', students: 7210, revenue: 65800, rating: 4.9 }
          ]
        };
        
        setChartData(mockData);
      } catch (err) {
        console.error('Analytics fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: '$268,500', change: '+24%', color: 'text-green-600' },
          { label: 'Active Students', value: '12,450', change: '+18%', color: 'text-blue-600' },
          { label: 'Avg. Completion', value: '68%', change: '+5%', color: 'text-purple-600' },
          { label: 'New This Month', value: '1,240', change: '+32%', color: 'text-orange-600' }
        ].map((stat, i) => (
          <div key={i} className="glass-card rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
            <div className={`text-xs font-medium mt-1 ${stat.color}`}>{stat.change} vs last month</div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Enrollment Trend - Line Chart */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Enrollment Trends</h3>
          <AdminChart 
            type="line" 
            data={chartData.enrollmentTrend} 
            yAxisLabel="Students" 
            height="280px" 
          />
        </div>

        {/* Revenue Breakdown - Doughnut */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Revenue Sources</h3>
          <AdminChart 
            type="doughnut" 
            data={chartData.revenueBreakdown} 
            height="280px" 
          />
        </div>

        {/* Course Distribution - Bar */}
        <div className="glass-card rounded-2xl p-6 lg:col-span-2">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Courses by Category</h3>
          <AdminChart 
            type="bar" 
            data={chartData.courseDistribution} 
            yAxisLabel="Number of Courses" 
            height="250px" 
          />
        </div>
      </div>

      {/* Top Performing Courses Table */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Top Performing Courses</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <th className="pb-3 font-medium">#</th>
                <th className="pb-3 font-medium">Course</th>
                <th className="pb-3 font-medium hidden md:table-cell">Students</th>
                <th className="pb-3 font-medium hidden md:table-cell">Revenue</th>
                <th className="pb-3 font-medium">Rating</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {chartData.topCourses.map(course => (
                <tr key={course.rank} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-3">
                    <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold">
                      {course.rank}
                    </span>
                  </td>
                  <td className="py-3 font-medium text-gray-900 dark:text-white">{course.title}</td>
                  <td className="py-3 text-sm text-gray-600 dark:text-gray-300 hidden md:table-cell">
                    {course.students.toLocaleString()}
                  </td>
                  <td className="py-3 text-sm text-gray-600 dark:text-gray-300 hidden md:table-cell">
                    ${course.revenue.toLocaleString()}
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1 text-yellow-500 font-medium">
                      ★ {course.rating}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                      View Details →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SettingsView() {
  const [form, setForm] = useState({ siteName: 'LearnHub', supportEmail: 'support@learnhub.com', maintenanceMode: false });
  return (
    <div className="max-w-2xl bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="font-bold text-gray-900 dark:text-white mb-4">Platform Settings</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site Name</label>
          <input type="text" value={form.siteName} onChange={e => setForm({...form, siteName: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:text-white outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Support Email</label>
          <input type="email" value={form.supportEmail} onChange={e => setForm({...form, supportEmail: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:text-white outline-none" />
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <div>
            <div className="font-medium text-gray-900 dark:text-white">Maintenance Mode</div>
            <div className="text-sm text-gray-500">Take platform offline for updates</div>
          </div>
          <button onClick={() => setForm({...form, maintenanceMode: !form.maintenanceMode})} className={`w-12 h-6 rounded-full transition-colors relative ${form.maintenanceMode ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.maintenanceMode ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={() => window.location.reload()}>Cancel</Button>
        <Button onClick={() => alert('Settings saved!')}>Save Changes</Button>
      </div>
    </div>
  );
}