import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, BookOpen, Award, Clock, TrendingUp, 
  Settings, LogOut, PlayCircle, ChevronRight, Shield, AlertCircle, Bug
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import ProgressBar from '../components/common/ProgressBar';
import CourseCard from '../components/sections/CourseCard';

export default function Dashboard() {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDebug, setShowDebug] = useState(false); // Toggle debug panel

  // Redirect if not authenticated
  useEffect(() => {
    console.log('Auth state:', { user, authLoading });
    if (!authLoading && !user) {
      console.log('No user, redirecting to login');
      navigate('/login', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        console.log('No user ID, skipping fetch');
        setLoading(false);
        return;
      }
      
      console.log('Fetching dashboard data for user:', user.id);
      
      try {
        setError(null);
        const [statsRes, coursesRes] = await Promise.all([
          api('/dashboard/stats'),
          api('/dashboard/courses')
        ]);
        console.log('API responses:', { statsRes, coursesRes });
        setDashboardData(statsRes.data);
        setCourses(coursesRes.data || []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(err.message || 'Failed to load dashboard');
        
        if (err.message?.includes('401') || err.message?.includes('token')) {
          console.log('Auth error, logging out');
          logout();
          navigate('/login', { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  // Debug info panel
  const DebugPanel = () => (
    <div className="fixed bottom-4 right-4 z-50 glass-card rounded-xl p-4 max-w-sm text-xs font-mono">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold flex items-center gap-1"><Bug size={14}/> Debug</span>
        <button onClick={() => setShowDebug(false)} className="text-gray-400 hover:text-gray-600">×</button>
      </div>
      <pre className="bg-gray-900 text-green-400 p-2 rounded overflow-auto max-h-48">
{`authLoading: ${authLoading}
user: ${user ? JSON.stringify({id: user.id?.slice(0,8)+'...', name: user.name, role: user.role}, null, 2) : 'null'}
loading: ${loading}
error: ${error || 'null'}
dashboardData: ${dashboardData ? 'loaded' : 'null'}
courses: ${courses?.length || 0} items
token: ${localStorage.getItem('learnhub_token')?.slice(0, 20)+'...' || 'missing'}`}
      </pre>
      <button 
        onClick={() => {
          localStorage.clear();
          window.location.href = '/login';
        }}
        className="mt-2 w-full py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition"
      >
        Clear Session & Reload
      </button>
    </div>
  );

  // Show loading while auth initializes
  if (authLoading) {
    return (
      <>
        <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Initializing session...</p>
          </div>
        </div>
        <button onClick={() => setShowDebug(true)} className="fixed bottom-4 right-4 p-2 bg-gray-800 text-white rounded-full"><Bug size={20}/></button>
        {showDebug && <DebugPanel />}
      </>
    );
  }

  // Show error state prominently
  if (error) {
    return (
      <>
        <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="glass-card rounded-2xl p-8 max-w-md text-center border-2 border-red-500/30">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Dashboard Error</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4 bg-red-50 dark:bg-red-900/20 p-3 rounded">{error}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => window.location.reload()} className="btn-primary">Retry</button>
              <button onClick={() => { logout(); navigate('/login'); }} className="btn-secondary">Login Again</button>
            </div>
            <p className="text-xs text-gray-400 mt-4">Check console for details (F12)</p>
          </div>
        </div>
        <button onClick={() => setShowDebug(true)} className="fixed bottom-4 right-4 p-2 bg-red-500 text-white rounded-full"><Bug size={20}/></button>
        {showDebug && <DebugPanel />}
      </>
    );
  }

  // Safe fallbacks
  const userName = user?.name || 'Learner';
  const userRole = user?.role || 'student';
  const userAvatar = user?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userName);
  const userJoinDate = user?.joinedDate || new Date().toISOString().split('T')[0];
  const stats = dashboardData || { hoursLearned: 0, coursesCompleted: 0, currentStreak: 0 };

  const sidebarItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'courses', icon: BookOpen, label: 'My Courses' },
    { id: 'certificates', icon: Award, label: 'Certificates' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <div className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-3">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card rounded-2xl p-6 sticky top-24">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full gradient-bg p-1">
                    <img src={userAvatar} alt={userName} className="w-full h-full rounded-full object-cover border-4 border-white dark:border-gray-800" onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userName); }} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{userName}</h2>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">{userRole}</span>
                    {userRole === 'admin' && <Shield size={14} className="text-primary-500" />}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Joined {userJoinDate}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20">
                    <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{stats.coursesCompleted}</div>
                    <div className="text-xs text-gray-500">Completed</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-accent-50 dark:bg-accent-900/20">
                    <div className="text-2xl font-bold text-accent-600 dark:text-accent-400">{stats.hoursLearned}h</div>
                    <div className="text-xs text-gray-500">Learned</div>
                  </div>
                </div>

                <nav className="space-y-2">
                  {sidebarItems.map((item) => (
                    <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${activeTab === item.id ? 'gradient-bg text-white shadow-lg shadow-primary-500/30' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                      <item.icon size={18} /> {item.label}
                    </button>
                  ))}
                </nav>

                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 mt-4 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors text-sm font-medium">
                  <LogOut size={18} /> Logout
                </button>
              </motion.div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-9 space-y-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full blur-3xl opacity-20 -translate-y-10 translate-x-10" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome back, {userName.split(' ')[0]}! 👋</h1>
                    <p className="text-gray-600 dark:text-gray-300">You've learned for <span className="font-semibold text-primary-600">{stats.hoursLearned} hours</span> this week.</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">
                    <TrendingUp size={18} /> <span className="font-semibold">{stats.currentStreak} day streak</span>
                  </div>
                </div>
              </motion.div>

              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Continue Learning</h2>
                  <button className="text-primary-600 dark:text-primary-400 font-medium hover:underline flex items-center gap-1">View All <ChevronRight size={16} /></button>
                </div>

                {courses.length === 0 ? (
                  <div className="glass-card rounded-2xl p-12 text-center">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No courses yet</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">Start your learning journey by exploring our courses.</p>
                    <button onClick={() => navigate('/formations')} className="btn-primary">Browse Courses</button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {courses.slice(0, 4).map((course, index) => (
                      <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="glass-card rounded-2xl p-6 hover:shadow-xl transition-shadow">
                        <div className="flex gap-4 mb-4">
                          <img src={course.thumbnail_url || course.image || 'https://via.placeholder.com/96x96?text=No+Image'} alt={course.title} className="w-24 h-24 object-cover rounded-xl border border-gray-200 dark:border-gray-700" onError={(e) => { e.target.src = 'https://via.placeholder.com/96x96?text=Error'; }} />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">{course.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 truncate">{course.instructor_name || course.instructor || 'Unknown'}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1"><PlayCircle size={14} /> {course.progress_percentage ? `${Math.round(course.progress_percentage)}% complete` : 'Not started'}</span>
                            </div>
                          </div>
                        </div>
                        {course.progress_percentage > 0 && <ProgressBar progress={Math.round(course.progress_percentage)} showLabel={false} />}
                        <div className="flex justify-end mt-3">
                          <button onClick={() => navigate(`/formations/${course.id}`)} className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">Continue →</button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Toggle Button */}
      <button onClick={() => setShowDebug(!showDebug)} className="fixed bottom-4 right-4 p-3 bg-gray-800 dark:bg-gray-700 text-white rounded-full shadow-lg hover:scale-110 transition-transform z-40">
        <Bug size={20} />
      </button>
      {showDebug && <DebugPanel />}
    </>
  );
}