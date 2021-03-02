import { PriceIds } from "../Prices";

export const PICKLE_JARS = {
  sPNGAVAXUNI: "0x3DBaE283a2be4b26358E55765C64523B1C17B504", // FUJI
};

export const JAR_DEPOSIT_TOKENS = {
  PNG_AVAX_UNI: "0x8364a01108D9b71Ed432C63Ba7fa57236A908647", // FUJI
};

export const DEPOSIT_TOKENS_NAME = {
  PNG_AVAX_UNI: "PNG AVAX/UNI",
};

export const JAR_ACTIVE: Record<string, boolean> = {
  [DEPOSIT_TOKENS_NAME.PNG_AVAX_UNI]: true,
};

export const DEPOSIT_TOKENS_LINK = {
  PNG_AVAX_UNI:
    "https://app.pangolin.exchange/#/add/AVAX/0xf39f9671906d8630812f9d9863bBEf5D523c84Ab",
  PNG_AVAX_SUSHI:
    "https://app.pangolin.exchange/#/add/AVAX/0x39cf1BD5f15fb22eC3D9Ff86b0727aFc203427cc",
};

export const DEPOSIT_TOKENS_JAR_NAMES = {
  PNG_AVAX_UNI: "sGlobe 0a",
};

export const STRATEGY_NAMES = {};

export const getPriceId = (tokenAddress: string): PriceIds => {
  const l = tokenAddress.toLowerCase();

  if (l === "0x83080D4b5fC60e22dFFA8d14AD3BB41Dde48F199") {
    return "png"; // FUJI
  }

  if (l === "0xd00ae08403B9bbb9124bB305C09058E32C39A48c") {
    return "avax"; // FUJI
  }

  if (l === "0xf4E0A9224e8827dE91050b528F34e2F99C82Fbf6") {
    return "uni"; // FUJI
  }

  throw new Error(`Unknown token address: ${tokenAddress}`);
};
