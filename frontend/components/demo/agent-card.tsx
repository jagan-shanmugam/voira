"use client";

import { type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface AgentCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  children: ReactNode;
}

export function AgentCard({
  icon,
  title,
  description,
  badge,
  badgeVariant = "default",
  children,
}: AgentCardProps) {
  return (
    <Card className="border-separator2 bg-bg1/50 hover:border-primary/30 p-6 backdrop-blur-sm transition-all duration-300">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-3">
            {icon}
          </div>
          {badge && <Badge variant={badgeVariant}>{badge}</Badge>}
        </div>
        <div className="space-y-2">
          <h3 className="text-fg0 text-xl font-semibold">{title}</h3>
          <p className="text-fg2 text-sm">{description}</p>
        </div>
        <div className="pt-2">{children}</div>
      </div>
    </Card>
  );
}
