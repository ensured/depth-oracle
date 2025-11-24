import { NetworkType } from "@cardano-foundation/cardano-connect-with-wallet-core";

export const network =
  process.env.NODE_ENV === "development"
    ? NetworkType.TESTNET
    : NetworkType.MAINNET;
