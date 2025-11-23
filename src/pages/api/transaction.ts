import { Koios, Lucid } from "@lucid-evolution/lucid";
import { NextApiRequest, NextApiResponse } from "next";

const paymentAddress = process.env.PAYMENT_ADDRESS;
const PreprodAddress =
  "addr_test1qrl6f3gm0uph6vscjqs900yakynas5eu6puzcrua3kyt6q83uu458738004pap9qr9f3tmnck5y3pt9xcwyv58p7fsvsw570xn";

// Validate that PAYMENT_ADDRESS is set for production
if (process.env.NODE_ENV === "production" && !paymentAddress) {
  throw new Error(
    "PAYMENT_ADDRESS environment variable is required for production"
  );
}

// Initialize Lucid based on environment
async function initLucid() {
  if (process.env.NODE_ENV === "development") {
    // Use Preprod network for development
    return Lucid(new Koios("https://preprod.koios.rest/api/v1"), "Preprod");
  } else {
    // Use Mainnet for production
    return Lucid(new Koios("https://api.koios.rest/api/v1"), "Mainnet");
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Initialize Lucid based on environment
    const lucid = await initLucid();

    // Get address and payment method from request body
    const { address, paymentMethod = "ADA" } = req.body;

    if (!address) {
      return res.status(400).json({ error: "Address is required" });
    }

    // Select wallet from address (no private keys on the server)
    lucid.selectWallet.fromAddress(address, []);

    // IAG token constants
    const IAG_POLICY_ID =
      "5d16cc1a177b5d9ba9cfa9793b07e60f1fb70fea1f8aef064415d114";
    const IAG_ASSET_NAME = "494147"; // "IAG" in hex
    const IAG_UNIT = IAG_POLICY_ID + IAG_ASSET_NAME;

    // Build transaction based on payment method
    let tx;
    if (paymentMethod === "IAG") {
      // Pay with IAG tokens (equivalent to 5 ADA worth)
      tx = await lucid
        .newTx()
        .pay.ToAddress(
          process.env.NODE_ENV && process.env.NODE_ENV === "development"
            ? PreprodAddress!
            : paymentAddress!,
          { [IAG_UNIT]: 20_000_000n } // 5 IAG tokens
        )
        .complete();
    } else {
      // Default: Pay with ADA
      tx = await lucid
        .newTx()
        .pay.ToAddress(
          process.env.NODE_ENV && process.env.NODE_ENV === "development"
            ? PreprodAddress!
            : paymentAddress!,
          { lovelace: 5_000_000n } // 5 ADA
        )
        .complete();
    }

    // Return the transaction CBOR for the client to sign and submit
    return res.status(200).json({ tx: tx.toCBOR(), error: null });
  } catch (error) {
    let jsonError = JSON.stringify(error);
    const errorObject = JSON.parse(jsonError);
    jsonError = JSON.stringify(errorObject.cause.failure.cause);
    let err;
    if (
      jsonError.includes(
        "Your wallet does not have enough funds to cover the required assets"
      )
    ) {
      err =
        "Your wallet does not have enough funds for the required tx, please fund your wallet.";
    } else {
      err = "Failed to build transaction";
    }
    return res.status(200).json({
      tx: null,
      error: err,
    });
  }
}
