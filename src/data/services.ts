export interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  reviewCount: number;
  sellerName: string;
  sellerAvatar: string;
  sellerUniversity: string;
  image: string;
  deliveryDays: number;
  tags: string[];
}

export const categories = [
  { id: "web-dev", name: "Web Development", icon: "💻", count: 124 },
  { id: "graphic-design", name: "Graphic Design", icon: "🎨", count: 89 },
  { id: "tutoring", name: "Tutoring", icon: "📚", count: 156 },
  { id: "assignment-help", name: "Assignment Help", icon: "✍️", count: 203 },
  { id: "translation", name: "Translation", icon: "🌍", count: 67 },
  { id: "programming", name: "Programming Help", icon: "⚙️", count: 145 },
  { id: "video-editing", name: "Video Editing", icon: "🎬", count: 52 },
  { id: "writing", name: "Writing & Editing", icon: "📝", count: 98 },
  { id: "mathematics", name: "Mathematics", icon: "📐", count: 178 },
  { id: "physics", name: "Physics", icon: "⚛️", count: 134 },
  { id: "chemistry", name: "Chemistry", icon: "🧪", count: 112 },
  { id: "biology", name: "Biology", icon: "🧬", count: 127 },
  { id: "english", name: "English Language", icon: "🇬🇧", count: 165 },
  { id: "amharic", name: "Amharic (አማርኛ)", icon: "🇪🇹", count: 143 },
  { id: "history", name: "History", icon: "🏛️", count: 88 },
  { id: "geography", name: "Geography", icon: "🗺️", count: 76 },
  { id: "civics", name: "Civics & Ethics", icon: "⚖️", count: 94 },
  { id: "economics", name: "Economics", icon: "📊", count: 105 },
  { id: "business", name: "Business Studies", icon: "💼", count: 82 },
  { id: "ict", name: "ICT", icon: "🖥️", count: 139 },
  { id: "general-science", name: "General Science", icon: "🔬", count: 97 },
  { id: "aptitude", name: "Aptitude & Entrance Exam", icon: "🎯", count: 210 },
];

export const featuredServices: Service[] = [
  {
    id: "1",
    title: "Build a responsive React website",
    description: "I will create a modern, responsive website using React, Tailwind CSS, and TypeScript. Perfect for portfolios, landing pages, or small business sites.",
    category: "Web Development",
    price: 50,
    rating: 4.9,
    reviewCount: 47,
    sellerName: "Alex Chen",
    sellerAvatar: "AC",
    sellerUniversity: "MIT",
    image: "",
    deliveryDays: 3,
    tags: ["React", "Tailwind", "TypeScript"],
  },
  {
    id: "2",
    title: "Design a stunning logo and brand kit",
    description: "Professional logo design with full brand kit including color palette, typography guide, and social media templates.",
    category: "Graphic Design",
    price: 35,
    rating: 4.8,
    reviewCount: 82,
    sellerName: "Sarah Kim",
    sellerAvatar: "SK",
    sellerUniversity: "RISD",
    image: "",
    deliveryDays: 2,
    tags: ["Logo", "Branding", "Figma"],
  },
  {
    id: "3",
    title: "Python & Data Science tutoring",
    description: "One-on-one tutoring sessions for Python programming, data analysis with pandas, and machine learning basics.",
    category: "Tutoring",
    price: 25,
    rating: 5.0,
    reviewCount: 31,
    sellerName: "Marcus Johnson",
    sellerAvatar: "MJ",
    sellerUniversity: "Stanford",
    image: "",
    deliveryDays: 1,
    tags: ["Python", "Data Science", "ML"],
  },
  {
    id: "4",
    title: "Translate documents EN ↔ ES",
    description: "Professional translation between English and Spanish. Academic papers, essays, presentations, and more.",
    category: "Translation",
    price: 15,
    rating: 4.7,
    reviewCount: 63,
    sellerName: "Isabella Torres",
    sellerAvatar: "IT",
    sellerUniversity: "UCLA",
    image: "",
    deliveryDays: 2,
    tags: ["English", "Spanish", "Academic"],
  },
  {
    id: "5",
    title: "Debug and fix your code",
    description: "Send me your buggy code and I'll fix it. Specializing in JavaScript, Python, Java, and C++.",
    category: "Programming Help",
    price: 20,
    rating: 4.9,
    reviewCount: 55,
    sellerName: "David Park",
    sellerAvatar: "DP",
    sellerUniversity: "Carnegie Mellon",
    image: "",
    deliveryDays: 1,
    tags: ["Debugging", "JavaScript", "Python"],
  },
  {
    id: "6",
    title: "Edit your YouTube videos professionally",
    description: "Professional video editing with transitions, color grading, sound design, and motion graphics.",
    category: "Video Editing",
    price: 40,
    rating: 4.6,
    reviewCount: 28,
    sellerName: "Emma Wilson",
    sellerAvatar: "EW",
    sellerUniversity: "NYU",
    image: "",
    deliveryDays: 4,
    tags: ["Premiere Pro", "After Effects", "YouTube"],
  },
];
