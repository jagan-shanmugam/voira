"use client";

import { Rubik_Mono_One } from "next/font/google";
import { APP_CONFIG_DEFAULTS } from "@/app-config";
import EmbedPopupAgentClient from "./embed-popup/agent-client";

const quirky = Rubik_Mono_One({ weight: "400", subsets: ["latin"] });

export default function Welcome() {
  return (
    <div className="relative bg-white text-black dark:bg-black dark:text-white">
      <div className="mx-auto flex h-[calc(100svh-4rem)] w-full max-w-[1200px] items-center justify-center px-6">
        <h1
          className={`${quirky.className} max-w-[90vw] text-center text-[8vw] leading-[0.9] tracking-tight md:text-[7vw] lg:text-[6vw]`}
        >
          Customer Experience of Your <span className="underline underline-offset-8">Business</span>{" "}
          should be in <span className="underline underline-offset-8">2025</span>
        </h1>
      </div>

      {/* Popup trigger (fixed by component) */}
      <EmbedPopupAgentClient appConfig={APP_CONFIG_DEFAULTS} />
    </div>
  );
}
