import { NextRequest, NextResponse } from "next/server";
import { Lucid, Koios } from "@lucid-evolution/lucid";

async function initLucid() {
  if (process.env.NODE_ENV === "development") {
    // Use Preprod network for development
    return Lucid(new Koios("https://preprod.koios.rest/api/v1"), "Preprod");
  } else {
    // Use Mainnet for production
    return Lucid(new Koios("https://api.koios.rest/api/v1"), "Mainnet");
  }
}

export default async function handler(req: NextRequest) {
  const { signData } = await import("@lucid-evolution/lucid");
  try {
    const { signature, message, address } = await req.json();

    if (!signature || !message || !address) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Initialize Lucid (Network doesn't matter much for verification, but good practice)
    const network =
      process.env.NODE_ENV === "development" ? "Preprod" : "Mainnet";
    const api =
      process.env.NODE_ENV === "development"
        ? "https://preprod.koios.rest/api/v1"
        : "https://api.koios.rest/api/v1";

    const lucid = await initLucid();

    lucid.selectWallet.fromAddress(address, []);
    // Verify the signature
    const isValid = signData(message, signature, address);
    console.log(isValid);

    if (isValid) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
