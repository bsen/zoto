import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Instagram,
  Linkedin,
  Facebook,
  FileText,
  BookOpen,
} from "lucide-react";

const TermsAndConditions = () => {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: `
        By accessing or using Zoto Platforms' services, you agree to be bound by these Terms and Conditions. If you disagree with any part of the terms, you may not use our services.
      `,
    },
    {
      title: "2. Description of Services",
      content: `
        Zoto Platforms provides home and vehicle maintenance services including, but not limited to, room cleaning, bathroom sanitization, kitchen cleaning, AC servicing, washing machine repairs, and bike/car repairs. The availability of services may vary by location and are subject to change without notice.
      `,
    },
    {
      title: "3. User Responsibilities",
      content: `
        3.1. You must provide accurate and complete information when booking a service.
        3.2. You are responsible for ensuring that the service area is accessible and safe for our service providers.
        3.3. You agree to be present or have an authorized representative present during the service.
        3.4. You must inform us of any potential hazards or special circumstances before the service begins.
      `,
    },
    {
      title: "4. Booking and Cancellation",
      content: `
        4.1. Service bookings are subject to availability.
        4.2. You may cancel or reschedule a booking up to 24 hours before the scheduled service time without penalty.
        4.3. Cancellations made less than 24 hours before the scheduled service time may incur a cancellation fee.
        4.4. Zoto Platforms reserves the right to cancel or reschedule services due to unforeseen circumstances or safety concerns.
      `,
    },
    {
      title: "5. Pricing and Payment",
      content: `
        5.1. Service prices are as listed on our website or app at the time of booking.
        5.2. Additional charges may apply for services outside the standard scope or for special circumstances.
        5.3. Payment is due at the time of booking unless otherwise specified.
        5.4. We accept various payment methods as indicated during the booking process.
      `,
    },
    {
      title: "6. Service Guarantees and Limitations",
      content: `
        6.1. We strive to provide high-quality services but do not guarantee specific results.
        6.2. Zoto Platforms is not responsible for pre-existing conditions or damages.
        6.3. Our liability is limited to the cost of the service provided.
        6.4. We are not responsible for any indirect, consequential, or incidental damages.
      `,
    },
    {
      title: "7. Privacy and Data Protection",
      content: `
        7.1. We collect and use personal information as described in our Privacy Policy.
        7.2. You agree to our collection and use of information in accordance with our Privacy Policy.
        7.3. We implement reasonable security measures to protect your personal information.
      `,
    },
    {
      title: "8. Intellectual Property",
      content: `
        8.1. All content on Zoto Platforms' website and app is the property of Zoto Platforms or its content suppliers and is protected by copyright laws.
        8.2. You may not use, reproduce, or distribute our content without express permission.
      `,
    },
    {
      title: "9. User Accounts",
      content: `
        9.1. You are responsible for maintaining the confidentiality of your account and password.
        9.2. You agree to notify us immediately of any unauthorized use of your account.
        9.3. We reserve the right to terminate accounts that violate these terms.
      `,
    },
    {
      title: "10. Dispute Resolution",
      content: `
        10.1. Any disputes arising from these terms or our services will be resolved through binding arbitration.
        10.2. The arbitration will be conducted in accordance with the rules of the Indian Arbitration Association.
        10.3. The arbitration will take place in Bangalore, India.
      `,
    },
    {
      title: "11. Modifications to Terms",
      content: `
        11.1. We reserve the right to modify these terms at any time.
        11.2. Changes will be effective immediately upon posting on our website.
        11.3. Your continued use of our services after changes constitutes acceptance of the modified terms.
      `,
    },
    {
      title: "12. Governing Law",
      content: `
        These terms are governed by and construed in accordance with the laws of India, without regard to its conflict of law principles.
      `,
    },
    {
      title: "13. Severability",
      content: `
        If any provision of these terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that the Terms and Conditions will otherwise remain in full force and effect and enforceable.
      `,
    },
    {
      title: "14. Contact Information",
      content: `
        If you have any questions about these Terms and Conditions, please contact us at:
        Zoto Platforms Pvt. Ltd.
        123 Service Street, Tech Park
        Bangalore, Karnataka 560001
        India
        Email: support@zotoplatforms.com
        Phone: +91 80 1234 5678
      `,
    },
  ];

  return (
    <div className="h-screen bg-indigo-600  overflow-y-auto no-scrollbar">
      <header className="pt-8 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link
            to="/"
            className="flex items-center text-white hover:text-yellow-400 transition duration-300"
          >
            <ArrowLeft size={24} className="mr-2" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto mt-8 px-2 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white text-indigo-600 rounded-lg shadow-lg p-6"
        >
          <h1 className="text-3xl font-bold text-center mb-6">
            Terms and Conditions
          </h1>

          {sections.map((section, index) => (
            <motion.section
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-indigo-600">
                {section.title}
              </h2>
              <p className="text-gray-700 mt-2">{section.content}</p>
            </motion.section>
          ))}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: sections.length * 0.1 }}
            className="mt-12 text-center"
          >
            <p className="text-lg font-semibold">
              By using Zoto Platforms' services, you acknowledge that you have
              read, understood, and agree to be bound by these Terms and
              Conditions.
            </p>
          </motion.div>
        </motion.div>
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

export default TermsAndConditions;
