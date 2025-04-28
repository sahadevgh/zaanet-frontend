"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Wifi } from "lucide-react";
import Link from 'next/link';
import { Button } from '../../ui/button';

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-white to-zaanet-soft-purple min-h-[85vh] flex items-center">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[500px] h-[500px] -right-24 -top-24 bg-zaanet-purple/10 rounded-full blur-3xl" />
        <div className="absolute w-[400px] h-[400px] -left-24 top-1/2 bg-zaanet-purple-dark/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Connect Everyone,{" "}
              <span className="bg-gradient-to-r from-zaanet-purple to-zaanet-purple-dark bg-clip-text text-transparent">
                Everywhere
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
              Join the decentralized internet revolution. Share WiFi, earn crypto, 
              and help build a more connected world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/browse">
                <Button 
                  size="lg"
                  className="bg-zaanet-purple hover:bg-zaanet-purple-dark text-white w-full sm:w-auto
                            transform transition-all duration-300 hover:scale-105"
                >
                  <Wifi className="w-5 h-5 mr-2" />
                  Find WiFi
                </Button>
              </Link>
              <Link href="/host-network">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-zaanet-purple text-zaanet-purple hover:bg-zaanet-purple/10 hover:text-zaanet-purple-dark
                           transform transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                >
                  Share Your WiFi
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right Column - Visual Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="relative">
              {/* Network Connection Visualization */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-64 h-64 rounded-full border-4 border-zaanet-purple/30"
                />
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                  className="absolute w-48 h-48 rounded-full border-4 border-zaanet-purple/20"
                />
                <motion.div
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.1, 0.4, 0.1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                  className="absolute w-32 h-32 rounded-full border-4 border-zaanet-purple/10"
                />
                <div className="absolute w-16 h-16 rounded-full bg-zaanet-purple flex items-center justify-center">
                  <Wifi className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 text-center"
        >
          {[
            { value: "10K+", label: "Active Users" },
            { value: "5K+", label: "WiFi Hotspots" },
            { value: "$100K+", label: "Earned by Hosts" },
            { value: "50+", label: "Countries" },
          ].map((stat, index) => (
            <div key={index} className="space-y-2">
              <h3 className="text-2xl md:text-3xl font-bold text-zaanet-purple">
                {stat.value}
              </h3>
              <p className="text-gray-600">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
