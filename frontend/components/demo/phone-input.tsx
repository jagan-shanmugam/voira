'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SuccessMessage } from '@/components/ui/success-message';

interface PhoneInputProps {
  onSubmit?: (phoneNumber: string) => void;
}

export function PhoneInput({ onSubmit }: PhoneInputProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const validatePhoneNumber = (phone: string) => {
    // Basic phone validation - accepts various formats
    const phoneRegex = /^[\d\s()+-]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess(false);

    if (!phoneNumber) {
      setError('Please enter a phone number');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/trigger-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, agentType: 'claims' }),
      });

      if (!response.ok) {
        throw new Error('Failed to trigger call');
      }

      setSuccess(true);
      setPhoneNumber('');

      if (onSubmit) {
        onSubmit(phoneNumber);
      }
    } catch (err) {
      setError('Failed to request call. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          type="tel"
          placeholder="+1 (555) 123-4567"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          disabled={loading}
          className="flex-1"
        />
        <Button onClick={handleSubmit} disabled={loading || !phoneNumber}>
          {loading ? <LoadingSpinner size="sm" /> : 'Request Call'}
        </Button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <SuccessMessage message="You will receive a call shortly!" />}
    </div>
  );
}
