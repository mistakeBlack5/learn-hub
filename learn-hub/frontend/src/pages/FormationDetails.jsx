import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Play,
  Clock,
  Users,
  BookOpen,
  Award,
  ChevronDown,
  ChevronUp,
  Star,
  CheckCircle,
  Lock,
  PlayCircle
} from 'lucide-react';
import { courses } from '../data/dummyData';
import Button from '../components/common/Button';
import StarRating from '../components/common/StarRating';
import ProgressBar from '../components/common/ProgressBar';

export default function FormationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expandedLesson, setExpandedLesson] = useState(0);
  
  const course = courses.find(c => c.id === parseInt(id)) || courses[0];

  // Mock lessons data
  const lessons = [
    {
      id: 1,
      title: "Introduction to Web Development",
      duration: "15:30",
      type: "video",
      completed: true,
      free: true
    },
    {
      id: 2,
      title: "Setting Up Your Development Environment",
      duration: "22:45",
      type: "video",
      completed: true,
      free: true
    },
    {
      id: 3,
      title: "HTML Fundamentals",
      duration: "45:00",
      type: "video",
      completed: course.enrolled,
      free: false
    },
    {
      id: 4,
      title: "CSS Basics and Styling",
      duration: "38:20",
      type: "video",
      completed: false,
      free: false
    },
    {
      id: 5,
      title: "JavaScript Introduction",
      duration: "52:15",
      type: "video",
      completed: false,
      free: false
    },
    {
      id: 6,
      title: "Quiz: HTML & CSS Basics",
      duration: "20:00",
      type: "quiz",
      completed: false,
      free: false
    }
  ];

  return (
    <div className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-900">
      {/* Course Header */}
      <div className="gradient-bg py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2">
              <span className="inline-block px-4 py-1 bg-white/20 backdrop-blur rounded-full text-white text-sm font-medium mb-4">
                {course.category}
              </span>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                {course.title}
              </h1>
              <p className="text-white/90 text-lg mb-6">
                {course.description}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <Star className="fill-yellow-400 text-yellow-400" size={20} />
                  <span className="font-semibold">{course.rating}</span>
                  <span>({course.students.toLocaleString()} students)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={20} />
                  <span>{course.students.toLocaleString()} enrolled</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={20} />
                  <span>{course.duration}</span>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop"
                  alt={course.instructor}
                  className="w-12 h-12 rounded-full border-2 border-white"
                />
                <div>
                  <div className="text-white font-semibold">{course.instructor}</div>
                  <div className="text-white/70 text-sm">Senior Developer</div>
                </div>
              </div>
            </div>

            {/* Course Preview Card */}
            <div className="lg:col-span-1">
              <div className="glass-card rounded-2xl p-6 sticky top-24">
                <div className="aspect-video bg-gray-900 rounded-xl mb-4 flex items-center justify-center relative group cursor-pointer overflow-hidden">
                  <img
                    src={course.image}
                    alt="Course preview"
                    className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity"
                  />
                  <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
                    <Play className="text-white ml-1" size={28} />
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    ${course.price}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    30-Day Money-Back Guarantee
                  </p>
                </div>

                {course.enrolled ? (
                  <Button className="w-full mb-3" onClick={() => navigate('/dashboard')}>
                    Continue Learning
                  </Button>
                ) : (
                  <Button className="w-full mb-3">
                    Enroll Now
                  </Button>
                )}
                
                <button className="w-full py-3 rounded-full border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:border-primary-500 hover:text-primary-500 transition-colors">
                  Add to Wishlist
                </button>

                <div className="mt-6 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-3">
                    <BookOpen size={18} className="text-primary-500" />
                    <span>{course.lessons} lessons</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock size={18} className="text-primary-500" />
                    <span>{course.duration} total length</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award size={18} className="text-primary-500" />
                    <span>Certificate of completion</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* What you'll learn */}
            <div className="glass-card rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                What you'll learn
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  "Build real-world projects from scratch",
                  "Master modern development tools and workflows",
                  "Understand industry best practices",
                  "Create responsive and accessible websites",
                  "Work with APIs and databases",
                  "Deploy applications to production"
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={20} />
                    <span className="text-gray-600 dark:text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Content Accordion */}
            <div className="glass-card rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Course Content
              </h2>
              <div className="space-y-4">
                {lessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedLesson(expandedLesson === index ? -1 : index)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {lesson.completed ? (
                          <CheckCircle className="text-green-500" size={20} />
                        ) : lesson.free ? (
                          <PlayCircle className="text-primary-500" size={20} />
                        ) : (
                          <Lock className="text-gray-400" size={20} />
                        )}
                        <div className="text-left">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {lesson.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {lesson.type === 'video' ? 'Video' : 'Quiz'} • {lesson.duration}
                          </div>
                        </div>
                      </div>
                      {expandedLesson === index ? (
                        <ChevronUp size={20} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-400" />
                      )}
                    </button>
                    
                    {expandedLesson === index && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        className="p-4 bg-white dark:bg-gray-800"
                      >
                        <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                          <Play className="text-white/50" size={48} />
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                          <button className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
                            Download resources
                          </button>
                          <button className="px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors">
                            {lesson.completed ? 'Review' : 'Start Lesson'}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            {course.enrolled && (
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Your Progress</h3>
                <ProgressBar progress={course.progress} className="mb-4" />
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {course.progress}% complete • {course.lessons - Math.floor(course.lessons * course.progress / 100)} lessons remaining
                </div>
              </div>
            )}

            {/* Requirements */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Requirements</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>• Basic computer skills</li>
                <li>• A computer with internet access</li>
                <li>• Willingness to learn and practice</li>
                <li>• No prior experience required</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}