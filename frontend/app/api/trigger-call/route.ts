import { NextResponse } from "next/server";

// Simulated outbound call trigger
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phoneNumber, agentType } = body;

    if (!phoneNumber) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    // Simulate API processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // In a real implementation, this would trigger an outbound call through Twilio/LiveKit SIP

    return NextResponse.json({
      success: true,
      message: "Call request queued successfully",
      callId: `call_${Date.now()}`,
      phoneNumber,
      agentType: agentType || "claims",
      estimatedCallTime: "30-60 seconds",
    });
  } catch (error) {
    console.error("Error triggering call:", error);
    return NextResponse.json({ error: "Failed to trigger call" }, { status: 500 });
  }
}
