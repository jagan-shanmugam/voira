import { NextResponse } from "next/server";

// Simulated phone number allocation
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { country = "US", areaCode } = body;

    // Simulate allocation delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Generate mock phone numbers
    const generatePhoneNumber = (area: string = "555") => {
      const prefix = Math.floor(Math.random() * 900) + 100;
      const suffix = Math.floor(Math.random() * 9000) + 1000;
      return `+1 (${area}) ${prefix}-${suffix}`;
    };

    const inboundNumber = generatePhoneNumber(areaCode);
    const outboundNumber = generatePhoneNumber(areaCode);

    return NextResponse.json({
      success: true,
      inboundNumber,
      outboundNumber,
      country,
      message: "Phone numbers allocated successfully",
      configuration: {
        voicemail: "enabled",
        callForwarding: "enabled",
        recording: "enabled",
      },
    });
  } catch (error) {
    console.error("Error allocating phone numbers:", error);
    return NextResponse.json({ error: "Failed to allocate phone numbers" }, { status: 500 });
  }
}
