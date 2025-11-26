import { Koios, Lucid, UTxO } from "@lucid-evolution/lucid";
import { NextApiRequest, NextApiResponse } from "next";
import * as LE from "@lucid-evolution/lucid";

const paymentAddress = process.env.PAYMENT_ADDRESS;
const PreprodAddress =
  "addr_test1qrl6f3gm0uph6vscjqs900yakynas5eu6puzcrua3kyt6q83uu458738004pap9qr9f3tmnck5y3pt9xcwyv58p7fsvsw570xn";
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY || "";

// Validate that PAYMENT_ADDRESS is set for production
if (process.env.NODE_ENV === "production" && !paymentAddress) {
  throw new Error(
    "PAYMENT_ADDRESS environment variable is required for production"
  );
}

// Token Configuration
interface TokenConfig {
  policyId: string;
  assetName: string; // Hex encoded
  coingeckoId: string;
  decimals: number; // 6 for IAG, 0 for SNEK
}

const TOKENS: Record<string, TokenConfig> = {
  IAG: {
    policyId: "5d16cc1a177b5d9ba9cfa9793b07e60f1fb70fea1f8aef064415d114",
    assetName: "494147", // "IAG"
    coingeckoId: "iagon",
    decimals: 6,
  },
  SNEK: {
    policyId: "279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3f",
    assetName: "534e454b", // "SNEK"
    coingeckoId: "snek",
    decimals: 0,
  },
};

// Price cache with 60-second TTL
interface PriceCache {
  price: number;
  timestamp: number;
}

const priceCache: Record<string, PriceCache> = {};
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

// Fetch token price in ADA from CoinGecko (Free API) with caching
async function getTokenPriceInAda(tokenId: string): Promise<number | null> {
  // Check if we have a valid cached price
  const cached = priceCache[tokenId];
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    console.log(
      `Using cached price for ${tokenId}: ${cached.price.toFixed(4)} ADA (age: ${Math.floor((now - cached.timestamp) / 1000)}s)`
    );
    return cached.price;
  }
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

    // Cache the price
    priceCache[tokenId] = {
      price: tokenPriceInAda,
      timestamp: Date.now(),
    };

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
    const { address, paymentMethod = "ADA", mintingPolicy } = req.body;

    if (!address) {
      return res.status(400).json({ error: "Address is required" });
    }

    // Select wallet from address (no private keys on the server)
    lucid.selectWallet.fromAddress(address, []);

    // Build transaction based on payment method
    const policyId = LE.mintingPolicyToId(mintingPolicy);
    let tx;

    if (paymentMethod === "ADA") {
      tx = await lucid
        .newTx()
        .mintAssets({
          [policyId + LE.fromText("Yup")]: 1n,
        })
        .pay.ToAddress(
          process.env.NODE_ENV && process.env.NODE_ENV === "development"
            ? PreprodAddress!
            : paymentAddress!,
          { [policyId + LE.fromText("Yup")]: 1n }
        )
        .pay.ToAddress(
          process.env.NODE_ENV && process.env.NODE_ENV === "development"
            ? PreprodAddress!
            : paymentAddress!,
          { lovelace: 5_000_000n } // 5 ADA
        )
        .attach.MintingPolicy(mintingPolicy)
        .complete();
    } else {
      const tokenConfig = TOKENS[paymentMethod];

      if (!tokenConfig) {
        return res.status(400).json({ error: "Invalid payment method" });
      }

      const currentTokenPriceInAda = await getTokenPriceInAda(
        tokenConfig.coingeckoId
      );

      if (!currentTokenPriceInAda) {
        return res.status(200).json({
          tx: null,
          error: `Failed to get ${paymentMethod} price from CoinGecko`,
        });
      }

      const adaAmount = 5; // 5 ADA worth of credits
      const tokenUnit = tokenConfig.policyId + tokenConfig.assetName;

      let tokensNeeded: bigint;

      if (tokenConfig.decimals > 0) {
        const priceInMicro = Math.floor(currentTokenPriceInAda * 1_000_000);
        tokensNeeded =
          (BigInt(adaAmount * 1_000_000) * BigInt(10 ** tokenConfig.decimals)) /
          BigInt(priceInMicro);
      } else {
        const priceInMicro = Math.floor(currentTokenPriceInAda * 1_000_000);
        tokensNeeded = BigInt(adaAmount * 1_000_000) / BigInt(priceInMicro);
      }
      console.log("tokensNeeded", tokensNeeded);

      // tx = await lucid
      //   .newTx()
      //   .pay.ToAddress(
      //     process.env.NODE_ENV && process.env.NODE_ENV === "development"
      //       ? PreprodAddress!
      //       : paymentAddress!,
      //     { [tokenUnit]: tokensNeeded }
      //   )
      //   .complete();

      // mint token for the user
      tx = await lucid
        .newTx()
        .mintAssets({
          [policyId + LE.fromText("Yup")]: 1n,
        })
        .pay.ToAddress(
          process.env.NODE_ENV && process.env.NODE_ENV === "development"
            ? PreprodAddress!
            : paymentAddress!,
          { [policyId + LE.fromText("Yup")]: 1n }
        )
        .pay.ToAddress(
          process.env.NODE_ENV && process.env.NODE_ENV === "development"
            ? PreprodAddress!
            : paymentAddress!,
          { [tokenUnit]: tokensNeeded }
        )
        .attach.MintingPolicy(mintingPolicy)
        .complete();
    }

    // const txHash = tx.toCBOR();
    // const utxo: UTxO = {
    //   txHash,
    //   outputIndex: 0,
    //   address,
    //   assets: { lovelace: 0n },
    // };

    // const minLovelaces = LE.calculateMinLovelaceFromUTxO(
    //   LE.PROTOCOL_PARAMETERS_DEFAULT.coinsPerUtxoByte,
    //   utxo
    // );

    // tx = await lucid
    //   .newTx()
    //   .pay.ToAddress(
    //     process.env.NODE_ENV && process.env.NODE_ENV === "development"
    //       ? PreprodAddress!
    //       : paymentAddress!,
    //     { lovelace: minLovelaces }
    //   )
    //   .complete();
    console.log(tx.toCBOR());

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
