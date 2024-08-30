import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Calendar, User } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Instagram,
  Linkedin,
  Facebook,
  FileText,
  BookOpen,
} from "lucide-react";

const blogPosts = [
  {
    id: 1,
    title: "5 Essential Home Cleaning Tips for a Spotless Vellore Home",
    excerpt:
      "Discover expert techniques to keep your Vellore home pristine with these easy-to-follow cleaning tips.",
    author: "Priya Sundaram",
    date: "2024-03-15",
    category: "Home Cleaning",
  },
  {
    id: 2,
    title: "Beat the Tamil Nadu Heat: Ultimate Guide to AC Maintenance",
    excerpt:
      "Learn how proper AC maintenance can save you money and ensure optimal performance during hot Tamil summers.",
    author: "Karthik Raman",
    date: "2024-03-10",
    category: "AC Servicing",
  },
  {
    id: 3,
    title: "Eco-Friendly Cleaning Solutions: Green Your Vellore Routine",
    excerpt:
      "Explore natural, environmentally-friendly alternatives to traditional cleaning products suitable for Vellore homes.",
    author: "Lakshmi Narayanan",
    date: "2024-03-05",
    category: "Sustainable Living",
  },
  {
    id: 4,
    title:
      "DIY vs. Professional Appliance Repair in Vellore: When to Call the Experts",
    excerpt:
      "Understand when it's safe to attempt repairs yourself and when it's time to call in Vellore's professional technicians.",
    author: "Senthil Kumar",
    date: "2024-02-28",
    category: "Appliance Repair",
  },
  {
    id: 5,
    title:
      "The Hidden Dangers of a Dirty Bathroom: Why Regular Sanitization Matters in Tamil Nadu",
    excerpt:
      "Uncover the health risks lurking in an improperly cleaned bathroom and learn how to mitigate them in the Tamil Nadu climate.",
    author: "Dr. Anitha Rajendran",
    date: "2024-02-22",
    category: "Bathroom Sanitization",
  },
  {
    id: 6,
    title:
      "Maximizing Efficiency: Time-Saving Hacks for South Indian Kitchen Cleaning",
    excerpt:
      "Streamline your South Indian kitchen cleaning routine with these clever tricks and techniques.",
    author: "Chef Muthu Vel",
    date: "2024-02-15",
    category: "Kitchen Cleaning",
  },
  {
    id: 7,
    title:
      "The Impact of Regular Maintenance on Your Vehicle's Lifespan in Vellore's Climate",
    excerpt:
      "Discover how consistent care can significantly extend the life of your car or bike in Vellore's unique weather conditions.",
    author: "Rajesh Chandran",
    date: "2024-02-10",
    category: "Vehicle Maintenance",
  },
  {
    id: 8,
    title:
      "Smart Home Cleaning: Leveraging Technology for a Cleaner Vellore Home",
    excerpt:
      "Explore how smart devices and AI are revolutionizing the way we approach home cleaning in Vellore.",
    author: "Divya Subramanian",
    date: "2024-02-05",
    category: "Tech & Cleaning",
  },
  {
    id: 9,
    title:
      "The Psychology of Clean Spaces: How a Tidy Tamil Nadu Home Affects Your Mind",
    excerpt:
      "Understand the mental health benefits of maintaining a clean and organized living environment in Tamil Nadu.",
    author: "Dr. Arjun Venkatesh",
    date: "2024-01-30",
    category: "Wellness",
  },
  {
    id: 10,
    title:
      "Seasonal Cleaning Checklist: Preparing Your Vellore Home for Each Season",
    excerpt:
      "Get your Vellore home ready for every season with this comprehensive cleaning and maintenance guide.",
    author: "Meenakshi Sundarajan",
    date: "2024-01-25",
    category: "Home Maintenance",
  },
  {
    id: 11,
    title: "Troubleshooting Common AC Issues in Vellore's Humid Climate",
    excerpt:
      "Learn how to identify and fix frequent air conditioning problems specific to Vellore's weather conditions.",
    author: "Ramesh Krishnan",
    date: "2024-01-20",
    category: "AC Repair",
  },
  {
    id: 12,
    title: "Effective Mold Prevention Techniques for Tamil Nadu Homes",
    excerpt:
      "Discover practical strategies to keep mold at bay in the humid environment of Tamil Nadu.",
    author: "Sangeetha Ravi",
    date: "2024-01-15",
    category: "Home Maintenance",
  },
  {
    id: 13,
    title: "Quick Fixes for Leaky Faucets: A Vellore Homeowner's Guide",
    excerpt:
      "Step-by-step instructions to tackle common faucet issues and when to call a professional plumber in Vellore.",
    author: "Vijay Shankar",
    date: "2024-01-10",
    category: "Plumbing",
  },
  {
    id: 14,
    title: "Maintaining Your Washing Machine: Tips for Vellore Residents",
    excerpt:
      "Extend the life of your washing machine with these maintenance tips tailored for Vellore's water conditions.",
    author: "Lalitha Subramanian",
    date: "2024-01-05",
    category: "Appliance Maintenance",
  },
  {
    id: 15,
    title: "Pest Control Strategies for South Indian Homes",
    excerpt:
      "Effective methods to keep your Vellore home free from common pests found in South India.",
    author: "Dr. Suresh Kumar",
    date: "2023-12-30",
    category: "Pest Control",
  },
  {
    id: 16,
    title: "Energy-Efficient Lighting Options for Tamil Nadu Households",
    excerpt:
      "Explore cost-effective and eco-friendly lighting solutions suitable for homes in Tamil Nadu.",
    author: "Arun Prakash",
    date: "2023-12-25",
    category: "Energy Efficiency",
  },
  {
    id: 17,
    title: "DIY Air Purification Methods for Vellore Homes",
    excerpt:
      "Learn how to improve indoor air quality using simple, natural methods suited for Vellore's environment.",
    author: "Nithya Balakrishnan",
    date: "2023-12-20",
    category: "Indoor Air Quality",
  },
  {
    id: 18,
    title: "Maintaining Your Car in Vellore: Essential Tips for Local Drivers",
    excerpt:
      "Key maintenance advice to keep your vehicle running smoothly on Vellore's roads.",
    author: "Kartik Venkatesh",
    date: "2023-12-15",
    category: "Vehicle Maintenance",
  },
  {
    id: 19,
    title: "Water Conservation Techniques for Tamil Nadu Households",
    excerpt:
      "Practical tips to reduce water usage and promote conservation in water-scarce regions of Tamil Nadu.",
    author: "Priya Raghavan",
    date: "2023-12-10",
    category: "Water Management",
  },
  {
    id: 20,
    title: "Troubleshooting Common Refrigerator Problems in Vellore",
    excerpt:
      "A guide to identifying and resolving frequent refrigerator issues faced by Vellore residents.",
    author: "Gopal Krishnan",
    date: "2023-12-05",
    category: "Appliance Repair",
  },
  {
    id: 21,
    title: "Preparing Your Home for Vellore's Monsoon Season",
    excerpt:
      "Essential steps to protect your home and appliances during Vellore's heavy rainfall periods.",
    author: "Anand Swaminathan",
    date: "2023-11-30",
    category: "Seasonal Maintenance",
  },
  {
    id: 22,
    title: "Efficient Waste Management Practices for Vellore Households",
    excerpt:
      "Learn about proper waste segregation and disposal methods to keep your Vellore home clean and eco-friendly.",
    author: "Deepa Chandrasekhar",
    date: "2023-11-25",
    category: "Waste Management",
  },
];

const Blogs = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPosts = blogPosts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-screen bg-indigo-600  overflow-y-auto no-scrollbar">
      <header className="text-white py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Zoto Platforms Blog</h1>
          <p className="text-xl">
            Stay informed about home and vehicle maintenance tips, tricks, and
            industry insights.
          </p>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search blogs..."
              className="w-full py-3 px-4 pr-12 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2 text-indigo-600">
                  {post.title}
                </h2>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <User size={16} className="mr-2" />
                  <span>{post.author}</span>
                  <Calendar size={16} className="ml-4 mr-2" />
                  <span>{post.date}</span>
                </div>
                <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full mb-4">
                  {post.category}
                </span>
              </div>
            </motion.article>
          ))}
        </div>
      </main>

      <footer className="bg-indigo-600 text-white mt-16 py-12 border-t border-indigo-500">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">About Zoto</h3>
              <p className="text-sm">
                Zoto Platforms is a leading service company dedicated to making
                your life easier. We provide a wide range of home and vehicle
                maintenance services including room cleaning, bathroom
                sanitization, kitchen cleaning, AC servicing, washing machine
                repairs, and bike/car repairs. Our mission is to transform your
                daily living experience with our professional and reliable
                services.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Our Services</h3>
              <ul className="space-y-2 text-sm">
                <li>Home Cleaning</li>
                <li>Bathroom Sanitization</li>
                <li>Kitchen Cleaning</li>
                <li>AC Servicing</li>
                <li>Washing Machine Repairs</li>
                <li>Bike & Car Repairs</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/terms"
                    className="flex items-center text-yellow-300 hover:text-yellow-100 transition duration-300 group"
                  >
                    <FileText size={18} className="mr-2" />
                    Terms & Conditions
                    <span className="ml-1 block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-yellow-300"></span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/blogs"
                    className="flex items-center text-yellow-300 hover:text-yellow-100 transition duration-300 group"
                  >
                    <BookOpen size={18} className="mr-2" />
                    Blogs
                    <span className="ml-1 block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-yellow-300"></span>
                  </Link>
                </li>
              </ul>
            </div>
            <div className="flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold mb-4">Connect With Us</h3>
                <div className="flex space-x-4">
                  <a
                    href="https://www.instagram.com/zotoplatforms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-200 transition-colors"
                  >
                    <Instagram size={24} />
                  </a>
                  <a
                    href="https://www.linkedin.com/company/zoto-platforms-pvt-ltd/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-200 transition-colors"
                  >
                    <Linkedin size={24} />
                  </a>
                  <a
                    href="https://www.facebook.com/share/oEbxBC6edDx7HHbh/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-200 transition-colors"
                  >
                    <Facebook size={24} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-sm">
            &copy; 2024 Zoto Platforms. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Blogs;
