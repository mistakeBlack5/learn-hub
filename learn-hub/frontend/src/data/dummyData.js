export const courses = [
  {
    id: 1,
    title: "Complete Web Development Bootcamp",
    instructor: "Sarah Johnson",
    category: "Development",
    rating: 4.9,
    students: 15420,
    duration: "52 hours",
    lessons: 142,
    price: 89.99,
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop",
    description: "Become a full-stack web developer with just one course. HTML, CSS, Javascript, Node, React, MongoDB and more!",
    progress: 75,
    enrolled: true,
    tags: ["Web Dev", "JavaScript", "React"]
  },
  {
    id: 2,
    title: "UI/UX Design Masterclass",
    instructor: "Michael Chen",
    category: "Design",
    rating: 4.8,
    students: 8930,
    duration: "38 hours",
    lessons: 98,
    price: 79.99,
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop",
    description: "Learn to design beautiful interfaces and user experiences. Master Figma, Adobe XD, and design principles.",
    progress: 0,
    enrolled: false,
    tags: ["UI/UX", "Figma", "Design"]
  },
  {
    id: 3,
    title: "Digital Marketing Strategy",
    instructor: "Emma Williams",
    category: "Marketing",
    rating: 4.7,
    students: 12300,
    duration: "24 hours",
    lessons: 65,
    price: 69.99,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop",
    description: "Master digital marketing: SEO, social media, email marketing, and analytics. Grow any business online.",
    progress: 30,
    enrolled: true,
    tags: ["Marketing", "SEO", "Social Media"]
  },
  {
    id: 4,
    title: "Data Science with Python",
    instructor: "Dr. James Wilson",
    category: "Data Science",
    rating: 4.9,
    students: 22100,
    duration: "45 hours",
    lessons: 120,
    price: 94.99,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop",
    description: "Learn data science from scratch. Python, pandas, numpy, matplotlib, machine learning, and more.",
    progress: 0,
    enrolled: false,
    tags: ["Python", "Data Science", "ML"]
  },
  {
    id: 5,
    title: "Business Leadership & Management",
    instructor: "Robert Taylor",
    category: "Business",
    rating: 4.6,
    students: 6780,
    duration: "18 hours",
    lessons: 45,
    price: 59.99,
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop",
    description: "Develop essential leadership skills. Learn management strategies, team building, and business growth.",
    progress: 0,
    enrolled: false,
    tags: ["Leadership", "Management", "Business"]
  },
  {
    id: 6,
    title: "Mobile App Development with React Native",
    instructor: "Lisa Anderson",
    category: "Development",
    rating: 4.8,
    students: 9450,
    duration: "32 hours",
    lessons: 88,
    price: 84.99,
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop",
    description: "Build iOS and Android apps with React Native. Cross-platform development made easy.",
    progress: 0,
    enrolled: false,
    tags: ["React Native", "Mobile", "JavaScript"]
  }
];

export const categories = [
  { id: 1, name: "Development", icon: "Code", count: 1240, color: "from-blue-500 to-cyan-500" },
  { id: 2, name: "Design", icon: "Palette", count: 856, color: "from-purple-500 to-pink-500" },
  { id: 3, name: "Business", icon: "Briefcase", count: 634, color: "from-orange-500 to-red-500" },
  { id: 4, name: "Marketing", icon: "Megaphone", count: 423, color: "from-green-500 to-emerald-500" },
  { id: 5, name: "Data Science", icon: "Database", count: 567, color: "from-indigo-500 to-purple-500" },
  { id: 6, name: "Photography", icon: "Camera", count: 289, color: "from-pink-500 to-rose-500" }
];

export const testimonials = [
  {
    id: 1,
    name: "Alexandra Martinez",
    role: "Frontend Developer",
    company: "Tech Corp",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop",
    content: "This platform completely transformed my career. The courses are well-structured and the instructors are world-class. I landed my dream job within 3 months!",
    rating: 5
  },
  {
    id: 2,
    name: "David Kim",
    role: "Product Designer",
    company: "Design Studio",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop",
    content: "The UI/UX course exceeded my expectations. Practical projects and real-world examples made learning enjoyable and effective.",
    rating: 5
  },
  {
    id: 3,
    name: "Sophie Laurent",
    role: "Marketing Manager",
    company: "Growth Inc",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop",
    content: "Best investment I've made in my professional development. The digital marketing strategies I learned helped increase our ROI by 300%.",
    rating: 5
  }
];

export const userStats = {
  coursesCompleted: 12,
  hoursLearned: 156,
  certificates: 8,
  currentStreak: 15,
  totalPoints: 2450
};

export const enrolledCourses = [
  { ...courses[0], currentLesson: 106, lastAccessed: "2 hours ago" },
  { ...courses[2], currentLesson: 20, lastAccessed: "1 day ago" },
  {
    id: 7,
    title: "Advanced JavaScript Concepts",
    instructor: "John Doe",
    progress: 45,
    currentLesson: 34,
    lastAccessed: "3 days ago",
    image: courses[0].image
  }
];