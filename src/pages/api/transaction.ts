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

    // Build transaction based on payment method
    let tx;

    if (paymentMethod === "ADA") {
      // Default: Pay with ADA
      tx = await lucid
        .newTx()
        .pay.ToAddress(
          process.env.NODE_ENV && process.env.NODE_ENV === "development"
            ? PreprodAddress!
            : paymentAddress!,
          { lovelace: 1_000_000n } // 1 ADA
        )
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

      tx = await lucid
        .newTx()
        .pay.ToAddress(
          process.env.NODE_ENV && process.env.NODE_ENV === "development"
            ? PreprodAddress!
            : paymentAddress!,
          { [tokenUnit]: tokensNeeded }
        )
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
    // console.log(minLovelaces);

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
