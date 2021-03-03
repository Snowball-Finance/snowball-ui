import { useState, useEffect } from "react";
import { createContainer } from "unstated-next";

const requestURL =
  "https://api.coingecko.com/api/v3/simple/price?ids=pangolin%2Cavalanche%2Cuniswap&vs_currencies=usd";

type UsdPrice = { usd: number };

interface Response {
  uniswap: UsdPrice;
  pangolin: UsdPrice;
  avalanche: UsdPrice;
}

interface PriceObject {
  uni: number;
  avax: number;
  png: number;
  pickle: number;
}

export type PriceIds = keyof PriceObject;

function usePrices() {
  const [prices, setPrices] = useState<PriceObject | null>(null);

  const getPrices = async () => {
    const response: Response = await fetch(requestURL, {
      headers: {
        accept: "application/json",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
      },
      referrer: "https://www.coingecko.com/",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "omit",
    }).then((x) => x.json());

    const prices: PriceObject = {
      uni: response["uniswap"].usd,
      png: response["pangolin"].usd,
      avax: response["avalanche"].usd,

      pickle: "20.00",
      //snow: response["snowball"].usd,
    };
    setPrices(prices);
  };

  useEffect(() => {
    getPrices();
    setInterval(() => getPrices(), 120000);
  }, []);

  return { prices };
}

export const Prices = createContainer(usePrices);
