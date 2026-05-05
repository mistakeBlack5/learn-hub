import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../common/ProgressBar';
import StarRating from '../common/StarRating';
import { useProgress } from '../../hooks/useProgress';

export default function CourseCard({ course }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { progress, loading } = useProgress(course.id);

  const handleEnroll = () => {
    if (!user) {
      navigate('/login', { state: { from: `/formations/${course.id}` } });
      return;
    }
    // Add your enrollment API call here
    navigate(`/formations/${course.id}`);
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden card-hover group h-full flex flex-col">
      {/* Image & Badge */}
      <div className="relative h-48 overflow-hidden">
        <img src={course.image} alt={course.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur rounded-full text-xs font-semibold text-primary-600 dark:text-primary-400">
            {course.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">{course.title}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{course.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <StarRating rating={course.rating} count={course.students} />
          <span className="text-2xl font-bold gradient-text">${course.price}</span>
        </div>

        {/* Progress Section - Visitor vs Logged In */}
        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          ) : !user ? (
            // 👁️ VISITOR VIEW
            <button onClick={handleEnroll} className="w-full py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 transition-colors">
              Login to Track Progress
            </button>
          ) : progress?.percentage > 0 ? (
            // ✅ LOGGED IN: Shows real progress
            <>
              <ProgressBar progress={progress.percentage} />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>{progress.completed}/{progress.totalLessons} lessons</span>
                <button onClick={() => navigate(`/formations/${course.id}`)} className="text-primary-600 dark:text-primary-400 hover:underline">
                  Continue →
                </button>
              </div>
            </>
          ) : (
            // 🆕 LOGGED IN: Not enrolled yet
            <button onClick={handleEnroll} className="w-full py-3 rounded-xl gradient-bg text-white font-semibold hover:shadow-lg hover:shadow-primary-500/30 transition-all">
              Enroll Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}