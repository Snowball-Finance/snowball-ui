import { useEffect, useState } from "react";

import { Connection } from "../Connection";
import { JAR_DEPOSIT_TOKENS } from "./jars";

export interface PngLPAPY {
  pairAddress: string;
  reserveUSD: number;
  dailyVolumeUSD: number;
}

const PNG_LP_TOKENS = [JAR_DEPOSIT_TOKENS.PNG_AVAX_UNI];

export const usePngPairDayData = () => {
  const { signer } = Connection.useContainer();

  const [pngPairDayData, setPngPairDayData] = useState<Array<PngLPAPY> | null>(
    null,
  );

  /**
   * TODO: Connect to TheGraph when AVAX is conncted
   * In the meantime, our options are to hard code vaues or remove APY
   */
  const queryTheGraph = async () => {
    const res = await fetch(
      "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
      {
        credentials: "omit",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:81.0) Gecko/20100101 Firefox/81.0",
          Accept: "*/*",
          "Accept-Language": "en-US,en;q=0.5",
          "Content-Type": "application/json",
        },
        referrer: "https://thegraph.com/explorer/subgraph/uniswap/uniswap-v2",
        body: `{"query":"{\\n  pairDayDatas(first: ${PNG_LP_TOKENS.length.toString()}, skip: 1, orderBy: date, orderDirection: desc, where: {pairAddress_in: [\\"${PNG_LP_TOKENS.join(
          '\\", \\"',
        )}\\"]}) {\\n    pairAddress\\n    reserveUSD\\n    dailyVolumeUSD\\n  }\\n}\\n","variables":null}`,
        method: "POST",
        mode: "cors",
      },
    ).then((x) => x.json());

    res.data.pairDayDatas && setPngPairDayData(res.data.pairDayDatas); // Sometimes the graph call fails
  };

  const getPngPairDayAPY = (pair: string) => {
    if (pngPairDayData) {
      const filteredPair = pngPairDayData.filter(
        (x) => x.pairAddress.toLowerCase() === pair.toLowerCase(),
      );

      if (filteredPair.length > 0) {
        const selected = filteredPair[0];

        // 0.3% fee to LP
        const apy =
          (selected.dailyVolumeUSD / selected.reserveUSD) * 0.003 * 365 * 100;

        return [{ lp: apy }];
      }
    }

    return [];
  };

  useEffect(() => {
    queryTheGraph();
  }, [signer]);

  return {
    getPngPairDayAPY,
  };
};
