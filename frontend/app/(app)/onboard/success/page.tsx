import Link from "next/link";
import { CheckCircleIcon, RocketLaunchIcon } from "@phosphor-icons/react/dist/ssr";
import { ApplyThemeScript } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function OnboardSuccessPage() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <ApplyThemeScript />

      <div className="container mx-auto max-w-2xl px-4 py-12">
        <Card className="p-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-green-500/10 p-6">
              <CheckCircleIcon size={64} className="text-green-500" weight="duotone" />
            </div>
          </div>

          <h1 className="text-fg0 mb-4 text-4xl font-bold">Setup Complete!</h1>
          <p className="text-fg2 mb-8 text-lg">
            Congratulations! Your voice agent platform is now configured and ready to use.
          </p>

          <div className="bg-bg2 mb-8 rounded-lg p-6 text-left">
            <h2 className="text-fg0 mb-4 text-lg font-semibold">What&apos;s Configured:</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircleIcon
                  size={20}
                  className="mt-0.5 shrink-0 text-green-500"
                  weight="fill"
                />
                <div>
                  <p className="text-fg0 font-medium">Practice Details</p>
                  <p className="text-fg2 text-sm">Your business information has been set up</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircleIcon
                  size={20}
                  className="mt-0.5 shrink-0 text-green-500"
                  weight="fill"
                />
                <div>
                  <p className="text-fg0 font-medium">Knowledge Base</p>
                  <p className="text-fg2 text-sm">Documents uploaded for agent training</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircleIcon
                  size={20}
                  className="mt-0.5 shrink-0 text-green-500"
                  weight="fill"
                />
                <div>
                  <p className="text-fg0 font-medium">Phone Numbers</p>
                  <p className="text-fg2 text-sm">Inbound and outbound calling configured</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircleIcon
                  size={20}
                  className="mt-0.5 shrink-0 text-green-500"
                  weight="fill"
                />
                <div>
                  <p className="text-fg0 font-medium">Integrations</p>
                  <p className="text-fg2 text-sm">Calendar and email services connected</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Link href="/demo">
              <Button size="lg" className="w-full">
                <RocketLaunchIcon size={20} className="mr-2" weight="duotone" />
                Try Demo Agents
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
