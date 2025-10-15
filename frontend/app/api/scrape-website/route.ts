import { NextResponse } from "next/server";

// Simulated website scraping
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    // Simulate scraping delay (2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock scraped data
    const mockData = {
      practiceName: "Medco",
      businessType: "Dental Practice",
      location: "Berlin, Germany",
      description:
        "Premier dental care services including cleanings, whitening, and cosmetic dentistry",
      services: ["Teeth Cleaning", "Whitening", "Fillings", "Root Canals", "Cosmetic Dentistry"],
      hours: "Mon-Fri 8AM-6PM, Sat 9AM-2PM",
      phone: "+49 (555) 123-4567",
      email: "contact@brightsmile.com",
    };

    return NextResponse.json({
      success: true,
      data: mockData,
      message: "Website scraped successfully",
    });
  } catch (error) {
    console.error("Error scraping website:", error);
    return NextResponse.json({ error: "Failed to scrape website" }, { status: 500 });
  }
}
