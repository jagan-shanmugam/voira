"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { SuccessMessage } from "@/components/ui/success-message";
import Image from "next/image";

interface ScrapedData {
  practiceName?: string;
  businessType?: string;
  location?: string;
  description?: string;
  services?: string[];
  hours?: string;
  phone?: string;
  email?: string;
}

interface StepWebsiteProps {
  onNext: (data?: { url?: string; scrapedData?: ScrapedData }) => void;
}

export function StepWebsite({ onNext }: StepWebsiteProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [error, setError] = useState("");
  const [showLovableSpinner, setShowLovableSpinner] = useState(false);
  const [showLovableCta, setShowLovableCta] = useState(false);

  const handleScrape = async () => {
    setError("");
    setLoading(true);
    setShowLovableCta(false);
    setShowLovableSpinner(true);
    // Show the reimagining spinner for 5 seconds, then reveal the CTA
    setTimeout(() => {
      setShowLovableSpinner(false);
      setShowLovableCta(true);
    }, 5000);

    try {
      const response = await fetch("/api/scrape-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Failed to scrape website");
      }

      const result = await response.json();
      setScrapedData(result.data);
    } catch (err) {
      setError("Failed to scrape website. Please check the URL and try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    onNext({ url, scrapedData: scrapedData || undefined });
  };

  const handleSkip = () => {
    onNext();
  };

  const handleLovable = () => {
    window.open("https://preview--medeco-modernizer.lovable.app/", "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="website-url" className="text-fg0 mb-2 block text-sm font-medium">
            Website URL (Optional)
          </label>
          <div className="flex gap-2">
            <Input
              id="website-url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading || !!scrapedData}
            />
            <Button onClick={handleScrape} disabled={!url || loading || !!scrapedData}>
              {loading ? <LoadingSpinner size="sm" /> : "Scrape"}
            </Button>
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {scrapedData && (
          <div className="space-y-3">
            <SuccessMessage message="Website scraped successfully!" />
            <div className="bg-bg2 space-y-2 rounded-lg p-4">
              <p className="text-sm">
                <span className="text-fg0 font-semibold">Name:</span>{" "}
                <span className="text-fg1">{scrapedData.practiceName}</span>
              </p>
              <p className="text-sm">
                <span className="text-fg0 font-semibold">Type:</span>{" "}
                <span className="text-fg1">{scrapedData.businessType}</span>
              </p>
              <p className="text-sm">
                <span className="text-fg0 font-semibold">Location:</span>{" "}
                <span className="text-fg1">{scrapedData.location}</span>
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={handleSkip}>
          Skip
        </Button>
        <Button
          onClick={handleContinue}
          disabled={loading}
          variant={url || scrapedData ? "primary" : undefined}
        >
          Continue
        </Button>

        {/* Only show if user entered website - show reimaging spinner with lovable icon for 5 seconds after user click on scrape button and then show the button */}
        {/* Highlight continue button after data entry in each step */}
        {url && (
          <div className="flex justify-center">
            {showLovableSpinner && (
              <Button variant="outline" disabled>
                <LoadingSpinner size="sm" className="mr-2" />
                Reimagining your site with Lovable
                <Image src="/lovable-icon.png" alt="Lovable" className="ml-2 h-4 w-4" />
                width={16}
                height={16}
              </Button>
            )}
            {showLovableCta && !showLovableSpinner && (
              <Button variant="outline" onClick={handleLovable}>
                Your Website reimagined with Lovable
                <Image src="/lovable-icon.png" alt="Lovable" className="ml-2 h-4 w-4" />
                width={16}
                height={16}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
