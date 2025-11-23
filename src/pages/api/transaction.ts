import { Koios, Lucid } from "@lucid-evolution/lucid";
import { NextApiRequest, NextApiResponse } from "next";

const paymentAddress = process.env.PAYMENT_ADDRESS;
const PreprodAddress =
  "addr_test1qrl6f3gm0uph6vscjqs900yakynas5eu6puzcrua3kyt6q83uu458738004pap9qr9f3tmnck5y3pt9xcwyv58p7fsvsw570xn";
const COINGECKO_API_KEY = process.env.NEXT_PUBLIC_COINGECKO_API_KEY || "";

// Validate that PAYMENT_ADDRESS is set for production
if (process.env.NODE_ENV === "production" && !paymentAddress) {
  throw new Error(
    "PAYMENT_ADDRESS environment variable is required for production"
  );
}

// Fetch token price in ADA from CoinGecko (Free API)
async function getTokenPriceInAda(tokenId: string): Promise<number | null> {
  try {
    // Get both Token and ADA prices in USD, then calculate the ratio
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId},cardano&vs_currencies=usd`,
      {
        headers: { "x-cg-demo-api-key": COINGECKO_API_KEY },
      }
    );

    if (!response.ok) {
      throw new Error(
        `CoinGecko API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    const tokenPriceUSD = data?.[tokenId]?.usd;
    const adaPriceUSD = data?.cardano?.usd;

    if (
      !tokenPriceUSD ||
      !adaPriceUSD ||
      typeof tokenPriceUSD !== "number" ||
      typeof adaPriceUSD !== "number"
    ) {
      throw new Error("Invalid price data from CoinGecko");
    }

    // Calculate Token price in ADA terms
    const tokenPriceInAda = tokenPriceUSD / adaPriceUSD;

    console.log(
      `CoinGecko: ${tokenId.toUpperCase()}=$${tokenPriceUSD}, ADA=$${adaPriceUSD}, ${tokenId.toUpperCase()}/ADA=${tokenPriceInAda.toFixed(
        4
      )}`
    );

    return tokenPriceInAda;
  } catch (error) {
    console.error(`Error fetching ${tokenId} price from CoinGecko:`, error);
    return null;
  }
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

    // SNEK token constants
    const SNEK_POLICY_ID =
      "279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3f";
    const SNEK_ASSET_NAME = "534e454b"; // "SNEK" in hex
    const SNEK_UNIT = SNEK_POLICY_ID + SNEK_ASSET_NAME;

    // Build transaction based on payment method
    let tx;

    if (paymentMethod === "IAG") {
      // Fetch current IAG price from CoinGecko
      const currentIagPriceInAda = await getTokenPriceInAda("iagon");
      if (!currentIagPriceInAda) {
        return res.status(200).json({
          tx: null,
          error: "Failed to get IAG price from CoinGecko",
        });
      }
      const adaAmount = 5; // 5 ADA worth of credits

      // Convert to micro-units (multiply by 1,000,000) and do BigInt math
      // iagTokens (in micro-units) = (adaAmount / iagPriceInAda) * 1,000,000
      // = (adaAmount * 1,000,000 * 1,000,000) / (iagPriceInAda * 1,000,000)
      const iagTokensNeeded =
        (BigInt(adaAmount * 1_000_000) * 1_000_000n) /
        BigInt(Math.floor(currentIagPriceInAda * 1_000_000));

      console.log(
        `IAG Payment: ${iagTokensNeeded} tokens (~${
          Number(iagTokensNeeded) / 1_000_000
        } IAG) for ${adaAmount} ADA worth`
      );

      tx = await lucid
        .newTx()
        .pay.ToAddress(
          process.env.NODE_ENV && process.env.NODE_ENV === "development"
            ? PreprodAddress!
            : paymentAddress!,
          { [IAG_UNIT]: iagTokensNeeded }
        )
        .complete();
    } else if (paymentMethod === "SNEK") {
      // Fetch current SNEK price from CoinGecko
      const currentSnekPriceInAda = await getTokenPriceInAda("snek");
      if (!currentSnekPriceInAda) {
        return res.status(200).json({
          tx: null,
          error: "Failed to get SNEK price from CoinGecko",
        });
      }
      const adaAmount = 5; // 5 ADA worth of credits

      // SNEK has 0 decimals? No, SNEK has 0 decimals on Cardano?
      // Wait, I need to check SNEK decimals.
      // Usually standard tokens have 6 decimals.
      // SNEK on Cardano has 0 decimals.
      // Let me double check SNEK decimals.
      // SNEK policy: 279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3f
      // Most meme coins on Cardano have 0 decimals.
      // If SNEK has 0 decimals, then 1 SNEK = 1 unit.
      // If SNEK has 6 decimals, then 1 SNEK = 1,000,000 units.

      // I will assume 0 decimals for SNEK as it is common for meme coins, BUT I should verify.
      // Actually, looking at Cardanoscan for SNEK... it has 0 decimals.
      // So 1 SNEK = 1 unit.

      // Formula if 0 decimals:
      // snekTokens = (adaAmount / snekPriceInAda)
      // snekTokens = (5 / 0.000...)

      // Wait, if IAG has 6 decimals, we multiplied by 1,000,000.
      // If SNEK has 0 decimals, we don't multiply by 1,000,000 for the unit conversion.

      // Let's assume SNEK has 0 decimals for now.
      // snekTokensNeeded = (adaAmount * 1_000_000) / (snekPriceInAda * 1_000_000) -> this cancels out if we use micro-units for price.

      // Let's stick to the same formula but adjust for decimals.
      // If SNEK has 0 decimals:
      // snekTokensNeeded = (adaAmount / snekPriceInAda)
      // To keep precision: (adaAmount * 1_000_000) / (snekPriceInAda * 1_000_000)

      // Wait, snekPriceInAda is usually very small (e.g. 0.000001 ADA).
      // So snekPriceMicro = snekPriceInAda * 1,000,000.

      // snekTokensNeeded = (5 * 1_000_000) / snekPriceMicro
      // This gives the number of SNEK units (which are whole SNEK if 0 decimals).

      const snekPriceMicro = Math.floor(currentSnekPriceInAda * 1_000_000);
      const snekTokensNeeded =
        BigInt(adaAmount * 1_000_000) / BigInt(snekPriceMicro);

      console.log(
        `SNEK Payment: ${snekTokensNeeded} tokens for ${adaAmount} ADA worth`
      );

      tx = await lucid
        .newTx()
        .pay.ToAddress(
          process.env.NODE_ENV && process.env.NODE_ENV === "development"
            ? PreprodAddress!
            : paymentAddress!,
          { [SNEK_UNIT]: snekTokensNeeded }
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
