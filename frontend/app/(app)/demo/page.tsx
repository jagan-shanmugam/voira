'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CalendarIcon, PhoneIcon, UserCircleIcon } from '@phosphor-icons/react';
import { AgentCard } from '@/components/demo/agent-card';
import { PhoneInput } from '@/components/demo/phone-input';
import { VoiceInterface } from '@/components/demo/voice-interface';
import { ApplyThemeScript } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';

export default function DemoPage() {
  const [activeAgent, setActiveAgent] = useState<string | null>(null);

  const startCall = (name: string) => {
    setActiveAgent(name);
  };

  const closeCall = () => {
    setActiveAgent(null);
  };

  return (
    <div className="bg-background min-h-screen">
      <ApplyThemeScript />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-fg0 mb-4 text-4xl font-bold md:text-5xl">Try Our Voice Agents</h1>
          <p className="text-fg2 mx-auto max-w-2xl text-lg">
            Experience the power of AI voice agents. Choose an agent below to start a demo.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Calendar Agent */}
          <AgentCard
            icon={<CalendarIcon size={40} className="text-blue-400" weight="duotone" />}
            title="Calendar Agent"
            description="Book appointments, check availability, and manage your schedule through natural conversation."
            badge="Inbound"
            badgeVariant="default"
          >
            <Button onClick={() => startCall('Calendar Agent')} className="w-full" size="lg">
              Start Call
            </Button>
          </AgentCard>

          {/* Claims Agent */}
          <AgentCard
            icon={<PhoneIcon size={40} className="text-purple-400" weight="duotone" />}
            title="Claims Agent"
            description="Receive outbound calls for invoice reminders, payment processing, and account management."
            badge="Outbound"
            badgeVariant="secondary"
          >
            <PhoneInput />
          </AgentCard>

          {/* Avatar Agent */}
          <AgentCard
            icon={<UserCircleIcon size={40} className="text-pink-400" weight="duotone" />}
            title="Avatar Agent"
            description="Interact with a visual avatar agent for general information and assistance."
            badge="Inbound + Avatar"
            badgeVariant="outline"
          >
            <Button onClick={() => startCall('Avatar Agent')} className="w-full" size="lg">
              Start Call with Avatar
            </Button>
          </AgentCard>
        </div>

        <div className="mt-16 text-center">
          <p className="text-fg2 mb-4">Ready to onboard your own practice?</p>
          <Link href="/onboard">
            <Button size="lg" variant="outline">
              Get Started with Onboarding
            </Button>
          </Link>
        </div>
      </div>

      {/* Voice Interface Modal */}
      {activeAgent && (
        <VoiceInterface isOpen={!!activeAgent} onClose={closeCall} agentName={activeAgent} />
      )}
    </div>
  );
}
