import Hero from '../components/sections/Hero';
import FeaturedCourses from '../components/sections/FeaturedCourses';
import Categories from '../components/sections/Categories';
import Testimonials from '../components/sections/Testimonials';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Award, Users } from 'lucide-react';
import Button from '../components/common/Button';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen">
      <Hero />
      <FeaturedCourses />
      <Categories />
      
      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative gradient-bg rounded-3xl p-12 lg:p-20 overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 text-center">
              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
                Ready to Start Learning?
              </h2>
              <p className="text-white/90 text-lg max-w-2xl mx-auto mb-8">
                Join our community of learners today and get unlimited access to 
                500+ courses taught by industry experts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/formations">
                  <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
                    Browse Courses
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  View Pricing
                </Button>
              </div>

              {/* Features */}
              <div className="grid md:grid-cols-3 gap-8 mt-16 text-white">
                {[
                  { icon: BookOpen, title: 'Expert Instructors', desc: 'Learn from industry professionals' },
                  { icon: Award, title: 'Certificates', desc: 'Earn recognized certifications' },
                  { icon: Users, title: 'Community', desc: 'Join 50k+ learners worldwide' }
                ].map((feature, index) => (
                  <div key={index} className="text-center">
                    <feature.icon className="w-10 h-10 mx-auto mb-3" />
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-white/80">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Testimonials />
    </div>
  );
}