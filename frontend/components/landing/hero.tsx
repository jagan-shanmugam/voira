"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />

      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-5xl font-bold text-transparent md:text-7xl">
            Voira
          </h1>
          <p className="text-fg0 mb-4 text-2xl font-semibold md:text-3xl">
            Voice Agents with Custom Knowledge
          </p>
          <p className="text-fg2 mx-auto mb-8 max-w-3xl text-xl md:text-2xl">
            Complete platform managing voice agents for your business with your own custom knowledge
            and custom avatars
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/demo">
              <Button size="lg" className="px-8 py-6 text-lg">
                Try Demo
              </Button>
            </Link>
            <Link href="/onboard">
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                Get Started
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
