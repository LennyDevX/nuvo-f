import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FaLinkedin, FaTwitter, FaGithub } from 'react-icons/fa';
import { SiSolidity, SiReact, SiTailwindcss, SiFirebase, SiPolygon } from 'react-icons/si';
import CountUp from 'react-countup';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const About = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  
  const stats = [
    { value: 1000000, label: "Total Value Locked", prefix: "$" },
    { value: 50000, label: "Active Users", prefix: "" },
    { value: 99.9, label: "Uptime", suffix: "%" },
    { value: 1000000, label: "Transactions", prefix: "" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
      {/* Hero Section without Parallax */}
      <div className=" mt-6 relative h-[30vh] flex items-center justify-center overflow-hidden">
        <div className="" />
        <div 
          className=""
        />
        <div className="relative z-20 text-center">
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            About Nuvo
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-gray-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Building the Future of DeFi
          </motion.p>
        </div>
      </div>

      

      
      

      {/* Team Section with Enhanced Cards */}
      <section className="py-20 px-4">
        <h2 className="text-4xl font-bold text-center text-white mb-16">Our Team</h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            /* ... existing team members ... */
          ].map((member, index) => (
            <motion.div
              key={index}
              className="group relative overflow-hidden rounded-xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="aspect-w-3 aspect-h-4">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
                  <p className="text-purple-400 mb-4">{member.role}</p>
                  <p className="text-gray-300 mb-4">{member.bio}</p>
                  <div className="flex gap-4">
                    <FaLinkedin className="text-white text-xl hover:text-purple-400 cursor-pointer" />
                    <FaTwitter className="text-white text-xl hover:text-purple-400 cursor-pointer" />
                    <FaGithub className="text-white text-xl hover:text-purple-400 cursor-pointer" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>



      {/* mission, value, vision */}

      <section className="py-20 px-4">
        <h2 className="text-4xl font-bold text-center text-white mb-16">Our Mission, Vision, and Values</h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Mission", content: "Our mission is to provide a secure and efficient staking platform for the future of decentralized finance." },
            { title: "Vision", content: "Our vision is to become the leading staking protocol on the Polygon network, offering the best returns and user experience." },
            { title: "Values", content: "Our core values are transparency, security, and innovation. We strive to build trust with our users and deliver cutting-edge solutions." }
          ].map((item, index) => (
            <motion.div
              key={index}
              className="bg-black/30 p-8 rounded-xl border border-purple-500/20 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <h3 className="text-purple-400 font-bold mb-2">{item.title}</h3>
              <p className="text-gray-300">{item.content}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tech Stack Section with Animated Icons */}
        <section className="py-20 px-4">
          <h2 className="text-4xl font-bold text-center text-white mb-16">Our Technology</h2>
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
            {[
          { Icon: SiSolidity, label: "Solidity" },
          { Icon: SiReact, label: "React" },
          { Icon: SiTailwindcss, label: "Tailwind CSS" },
          { Icon: SiFirebase, label: "Firebase" },
          { Icon: SiPolygon, label: "Polygon" }
            ].map(({ Icon, label }, index) => (
          <motion.div
            key={index}
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
            viewport={{ once: true }}
          >
            <Icon className="text-6xl text-purple-400 mb-4" />
            <p className="text-white mt-2">{label}</p>
          </motion.div>
            ))}
          </div>
        </section>


        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-8">Join Our Beta Program</h2>
            <p className="text-xl text-gray-300 mb-12">
          We are excited to announce the beta release of our staking protocol. Be among the first to experience the future of DeFi and help us shape the platform.
            </p>
            <div className="flex justify-center">
          <motion.a
            href="/beta-signup"
            className="px-8 py-4 bg-purple-600 text-white text-lg font-bold rounded-full hover:bg-purple-700 transition-colors duration-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Sign Up for Beta
          </motion.a>
            </div>
          </div>
        </section>

        {/* Values Section with Enhanced Cards */}
      <section className="py-20 px-4">
        {/* ... existing values section with enhanced styling ... */}
      </section>
    </div>
  );
};

export default About;