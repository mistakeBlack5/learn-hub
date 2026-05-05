import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import CourseCard from './CourseCard';
import Button from '../common/Button';
import { courses } from '../../data/dummyData';

export default function FeaturedCourses() {
  const featuredCourses = courses.slice(0, 4);

  return (
    <section className="py-20 lg:py-32 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Featured <span className="gradient-text">Courses</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore our most popular courses designed by industry experts to help you 
            achieve your learning goals.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {featuredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <CourseCard course={course} />
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/formations">
            <Button variant="outline" icon={ArrowRight}>
              View All Courses
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}