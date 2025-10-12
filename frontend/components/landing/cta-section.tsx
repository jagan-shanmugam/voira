'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';

export function CtaSection() {
  return (
    <section className="relative overflow-hidden py-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />

      <div className="relative z-10 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="text-fg0 mb-4 text-3xl font-bold md:text-4xl">
            Ready to Transform Your Business?
          </h2>
          <p className="text-fg2 mb-8 text-lg">
            Start building your custom voice agents today. No credit card required.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/demo">
              <Button size="lg" className="px-8 py-6 text-lg">
                Try Demo Agents
              </Button>
            </Link>
            <Link href="/onboard">
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                Onboard Your Practice
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
