import React from 'react';
import { m } from 'framer-motion';
import { FaRocket, FaShieldAlt, FaUsers } from 'react-icons/fa';

const MissionSection = () => {
  const missionItems = [
    {
      title: "Bridging Physical & Digital",
      content: "We're pioneering new ways to connect real-world assets with blockchain technology. Our infrastructure allows users to create digital representations of physical items, establishing verifiable ownership, provenance, and programmable utility that spans both worlds.",
      icon: <FaRocket className="text-4xl" />
    },
    {
      title: "Democratized Tokenization",
      content: "We're building tools that empower anyone to tokenize assets without technical expertise. From collectibles to real estate, from artwork to equipment, our platform enables users to transform physical value into digital opportunities through a seamless, accessible process.",
      icon: <FaShieldAlt className="text-4xl" />
    },
    {
      title: "Ecosystem of Possibilities",
      content: "Our platform serves as a foundation where tokenized assets can interact with the broader digital economy. Users can showcase their tokenized items in our NFT marketplace, implement novel utility through smart contracts, or integrate with complementary services in the web3 ecosystem.",
      icon: <FaUsers className="text-4xl" />
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Background elements - Remove grid pattern */}
      <div className="absolute inset-0 bg-transparent z-0"></div>
      {/* Remove the dots pattern that causes grid effect */}
      
      {/* Animated accent shapes */}
      <m.div
        className="absolute left-0 top-1/4 w-96 h-96 rounded-full bg-purple-600/5 blur-3xl"
        animate={{ 
          x: [-20, 0, -20], 
          opacity: [0.3, 0.5, 0.3],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <m.h2 
          className="text-5xl font-bold text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <span className="bg-nuvo-gradient-text text-transparent bg-clip-text">
            Our Vision & Mission
          </span>
        </m.h2>
        
        <m.p
          className="text-xl text-center text-gray-300 max-w-3xl mx-auto mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Creating a world where every physical asset can unlock digital potential, generating new forms of value, utility, and experience.
        </m.p>

        <m.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {missionItems.map((item, index) => (
            <m.div
              key={index}
              variants={itemVariants}
              className="bg-gradient-to-br from-purple-900/40 to-black/60 backdrop-blur-md p-8 rounded-xl border border-purple-500/20 shadow-xl hover:shadow-purple-500/10 transition-all duration-300"
              whileHover={{ 
                scale: 1.02, 
                boxShadow: "0 0 25px 0 rgba(168, 85, 247, 0.3)",
                borderColor: "rgba(168, 85, 247, 0.5)"
              }}
            >
              <m.div 
                className="text-purple-400 mb-6"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {item.icon}
              </m.div>
              <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
              <p className="text-gray-300 leading-relaxed">{item.content}</p>
            </m.div>
          ))}
        </m.div>
      </div>
    </section>
  );
};

export default MissionSection;
