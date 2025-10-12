'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SuccessMessage } from '@/components/ui/success-message';

interface StepPhoneProps {
  onNext: (data: { inboundNumber: string; outboundNumber: string }) => void;
}

export function StepPhone({ onNext }: StepPhoneProps) {
  const [allocating, setAllocating] = useState(false);
  const [phoneNumbers, setPhoneNumbers] = useState<{
    inboundNumber: string;
    outboundNumber: string;
  } | null>(null);
  const [error, setError] = useState('');

  const handleAllocate = async () => {
    setAllocating(true);
    setError('');

    try {
      const response = await fetch('/api/allocate-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: 'US' }),
      });

      if (!response.ok) {
        throw new Error('Failed to allocate phone numbers');
      }

      const result = await response.json();
      setPhoneNumbers({
        inboundNumber: result.inboundNumber,
        outboundNumber: result.outboundNumber,
      });
    } catch (err) {
      setError('Failed to allocate phone numbers. Please try again.');
      console.error(err);
    } finally {
      setAllocating(false);
    }
  };

  const handleContinue = () => {
    if (phoneNumbers) {
      onNext(phoneNumbers);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-fg0 mb-2 text-lg font-semibold">Phone Configuration</h3>
          <p className="text-fg2 mb-4 text-sm">
            Allocate phone numbers for inbound and outbound calls with your voice agents.
          </p>
        </div>

        {!phoneNumbers ? (
          <Button onClick={handleAllocate} disabled={allocating} size="lg">
            {allocating ? <LoadingSpinner size="sm" className="mr-2" /> : null}
            Allocate Phone Numbers
          </Button>
        ) : (
          <div className="space-y-4">
            <SuccessMessage message="Phone numbers allocated successfully!" />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="bg-bg2 border-separator2 rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="default">Inbound</Badge>
                </div>
                <p className="text-fg0 font-mono text-lg">{phoneNumbers.inboundNumber}</p>
                <p className="text-fg3 mt-1 text-xs">For receiving calls</p>
              </div>

              <div className="bg-bg2 border-separator2 rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="secondary">Outbound</Badge>
                </div>
                <p className="text-fg0 font-mono text-lg">{phoneNumbers.outboundNumber}</p>
                <p className="text-fg3 mt-1 text-xs">For making calls</p>
              </div>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      <div className="flex justify-end pt-4">
        <Button
          onClick={handleContinue}
          disabled={!phoneNumbers || allocating}
          variant={phoneNumbers ? 'primary' : undefined}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
