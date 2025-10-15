"use client";

import { type ReactNode } from "react";
import { motion } from "motion/react";
import { Card } from "@/components/ui/card";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  delay?: number;
}

export function FeatureCard({ icon, title, description, delay = 0 }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="border-separator2 bg-bg1/50 hover:border-primary/50 h-full p-6 backdrop-blur-sm transition-all duration-300">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-4">
            {icon}
          </div>
          <h3 className="text-fg0 text-xl font-semibold">{title}</h3>
          <p className="text-fg2">{description}</p>
        </div>
      </Card>
    </motion.div>
  );
}
