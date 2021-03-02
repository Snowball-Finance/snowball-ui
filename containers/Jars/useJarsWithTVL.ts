import { ethers } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";
import { useEffect, useState } from "react";

import { Contracts } from "../Contracts";
import { Prices } from "../Prices";

import { STRATEGY_NAMES, DEPOSIT_TOKENS_JAR_NAMES, getPriceId } from "./jars";
import { JarWithAPY } from "./useJarsWithAPY";

import { Contract as MulticallContract } from "ethers-multicall";
import { Connection } from "../Connection";

export interface JarWithTVL extends JarWithAPY {
  tvlUSD: null | number;
  usdPerPToken: null | number;
  ratio: null | number;
}

type Input = Array<JarWithAPY> | null;
type Output = {
  jarsWithTVL: Array<JarWithTVL> | null;
};

const isPngPool = (jarName: string): boolean => {
  return jarName === DEPOSIT_TOKENS_JAR_NAMES.PNG_AVAX_UNI;
};

export const useJarWithTVL = (jars: Input): Output => {
  const { multicallProvider } = Connection.useContainer();
  const { prices } = Prices.useContainer();
  const { pangolinPair } = Contracts.useContainer();

  const [jarsWithTVL, setJarsWithTVL] = useState<Array<JarWithTVL> | null>(
    null,
  );

  const measurePngJarTVL = async (jar: JarWithAPY) => {
    if (!pangolinPair || !prices) {
      return { ...jar, tvlUSD: null, usdPerPToken: null, ratio: null };
    }

    const pngPair = pangolinPair.attach(jar.depositToken.address);

    const [
      supply,
      balance,
      totalPNG,
      token0,
      token1,
      ratio,
    ] = await Promise.all([
      jar.contract.totalSupply(),
      jar.contract.balance().catch(() => ethers.BigNumber.from(0)),
      pngPair.totalSupply(),
      pngPair.token0(),
      pngPair.token1(),
      jar.contract.getRatio().catch(() => ethers.utils.parseEther("1")),
    ]);

    const Token0 = pangolinPair.attach(token0);
    const Token1 = pangolinPair.attach(token1);

    const [
      token0InPool,
      token1InPool,
      token0Decimal,
      token1Decimal,
    ] = await Promise.all([
      Token0.balanceOf(pngPair.address),
      Token1.balanceOf(pngPair.address),
      Token0.decimals(),
      Token1.decimals(),
    ]);

    const dec18 = parseEther("1");

    const token0PerPng = token0InPool.mul(dec18).div(totalPNG);
    const token1PerPng = token1InPool.mul(dec18).div(totalPNG);

    const token0Bal = parseFloat(
      ethers.utils.formatUnits(
        token0PerPng.mul(balance).div(dec18),
        token0Decimal,
      ),
    );
    const token1Bal = parseFloat(
      ethers.utils.formatUnits(
        token1PerPng.mul(balance).div(dec18),
        token1Decimal,
      ),
    );

    const token0PriceId = getPriceId(token0);
    const token1PriceId = getPriceId(token1);

    let tvlUSD;
    if (prices[token0PriceId]) {
      tvlUSD = 2 * token0Bal * prices[token0PriceId];
    } else {
      tvlUSD = 2 * token1Bal * prices[token1PriceId];
    }

    const usdPerPToken = tvlUSD / parseFloat(formatEther(supply));

    return {
      ...jar,
      tvlUSD,
      usdPerPToken,
      ratio: parseFloat(formatEther(ratio)),
    };
  };

  const measureTVL = async () => {
    if (jars) {
      const promises: Array<Promise<JarWithTVL>> = jars.map(async (jar) => {
        if (isPngPool(jar.jarName)) {
          return measurePngJarTVL(jar);
        }

        return {
          ...jar,
          tvlUSD: null,
          usdPerPToken: null,
          ratio: null,
        };
      });
      const jarsWithTVL = await Promise.all(promises);
      setJarsWithTVL(jarsWithTVL);
    }
  };

  useEffect(() => {
    measureTVL();
  }, [jars, prices]);

  return {
    jarsWithTVL,
  } as Output;
};
