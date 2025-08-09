"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDownLeft, Wifi } from "lucide-react";
import Link from 'next/link';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';

const HeroSection = () => {
  return (
    <section className="relative min-h-[85vh] flex items-center">
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <Badge className="bg-[#00BFA6] text-white px-4 py-2">
              🚀 Now Live in Ghana
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl text-blue-100 font-bold leading-tight mb-6">
              Turning Every WiFi into an{" "}
              <span className="text-cyan-500">
                Income Stream
              </span>
            </h1>
            <p className="text-lg md:text-xl text-blue-200 mb-8 max-w-xl mx-auto lg:mx-0">
              Join the decentralized revolution. Monetize your internet connection
              while providing secure, affordable access to your community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/browse">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-300 text-white w-full sm:w-auto
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
                >
                  Become a Host
                  <ArrowDownLeft className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right Column - Visual Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:block relative h-full" 
          >
            <div className="relative h-full">
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
                  className="w-64 h-64 rounded-full border-4 border-blue-600/70"
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
                  className="absolute w-48 h-48 rounded-full border-4 border-blue-300/70"
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
                  className="absolute w-32 h-32 rounded-full border-4 border-blue-100/70"
                />
                <div className="absolute w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <Wifi className="w-8 h-8 text-blue-600" />
                </div>
              </div>


              {/* Floating Cards */}
              <div className="absolute top-4 left-4 bg-white text-[#0D1B2A] p-4 rounded-xl shadow-lg z-20">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">892 Hosts Online</span>
                </div>
              </div>

              <div className="absolute bottom-4 right-4 bg-blue-600 text-white p-4 rounded-xl shadow-lg z-20">
                <div className="text-center">
                  <div className="text-2xl font-bold">$25K+</div>
                  <div className="text-sm opacity-90">Earned by Hosts</div>
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
