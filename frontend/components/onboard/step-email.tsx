'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SuccessMessage } from '@/components/ui/success-message';

interface StepEmailProps {
  onComplete: (data?: { provider: string }) => void;
}

const emailProviders = [
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Connect your Gmail account',
    icon: '📧',
  },
  {
    id: 'outlook',
    name: 'Microsoft Outlook',
    description: 'Connect to your Outlook email',
    icon: '📬',
  },
];

export function StepEmail({ onComplete }: StepEmailProps) {
  const [connected, setConnected] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = async (providerId: string) => {
    setConnecting(providerId);

    // Simulate OAuth flow
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setConnected(providerId);
    setConnecting(null);
  };

  const handleComplete = () => {
    if (connected) {
      onComplete({ provider: connected });
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-fg0 mb-2 text-lg font-semibold">Email Integration</h3>
          <p className="text-fg2 mb-4 text-sm">
            Connect an email provider to send confirmation emails and notifications.
          </p>
        </div>

        {connected && (
          <SuccessMessage
            message={`Successfully connected to ${emailProviders.find((p) => p.id === connected)?.name}!`}
          />
        )}

        <div className="grid grid-cols-1 gap-4">
          {emailProviders.map((provider) => (
            <Card
              key={provider.id}
              className={`p-4 ${connected === provider.id ? 'border-primary' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{provider.icon}</span>
                  <div>
                    <h4 className="text-fg0 font-semibold">{provider.name}</h4>
                    <p className="text-fg2 text-sm">{provider.description}</p>
                  </div>
                </div>
                {connected === provider.id ? (
                  <Button variant="outline" disabled>
                    Connected
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleConnect(provider.id)}
                    disabled={!!connecting || !!connected}
                    variant="outline"
                  >
                    {connecting === provider.id ? 'Connecting...' : 'Connect'}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={handleSkip} disabled={!!connecting}>
          Skip for Now
        </Button>
        <Button
          onClick={handleComplete}
          disabled={!connected || !!connecting}
          variant={connected ? 'primary' : undefined}
        >
          Complete Setup
        </Button>
      </div>
    </div>
  );
}
