'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StepDetailsProps {
  initialData?: {
    practiceName?: string;
    businessType?: string;
    location?: string;
  };
  onNext: (data: { practiceName: string; businessType: string; location: string }) => void;
}

export function StepDetails({ initialData, onNext }: StepDetailsProps) {
  const [practiceName, setPracticeName] = useState(initialData?.practiceName || '');
  const [businessType, setBusinessType] = useState(initialData?.businessType || '');
  const [location, setLocation] = useState(initialData?.location || '');

  useEffect(() => {
    if (initialData) {
      setPracticeName(initialData.practiceName || '');
      setBusinessType(initialData.businessType || '');
      setLocation(initialData.location || '');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ practiceName, businessType, location });
  };

  const isValid = practiceName && businessType && location;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="practice-name" className="text-fg0 mb-2 block text-sm font-medium">
            Practice Name
          </label>
          <Input
            id="practice-name"
            type="text"
            placeholder="e.g., Bright Smile Dental"
            value={practiceName}
            onChange={(e) => setPracticeName(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="business-type" className="text-fg0 mb-2 block text-sm font-medium">
            Business Type
          </label>
          <Select value={businessType} onValueChange={setBusinessType}>
            <SelectTrigger id="business-type">
              <SelectValue placeholder="Select business type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Dental Practice">Dental Practice</SelectItem>
              <SelectItem value="Medical Clinic">Medical Clinic</SelectItem>
              <SelectItem value="Veterinary Clinic">Veterinary Clinic</SelectItem>
              <SelectItem value="Salon">Salon</SelectItem>
              <SelectItem value="Spa">Spa</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="location" className="text-fg0 mb-2 block text-sm font-medium">
            Location
          </label>
          <Input
            id="location"
            type="text"
            placeholder="e.g., Berlin, Germany, San Francisco, CA"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={!isValid} variant={isValid ? 'primary' : undefined}>
          Continue
        </Button>
      </div>
    </form>
  );
}
