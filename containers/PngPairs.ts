import { createContainer } from "unstated-next";
import { ethers } from "ethers";
import erc20 from "@studydefi/money-legos/erc20";

import { PriceIds, Prices } from "./Prices";
import { Connection } from "./Connection";

import { Contract as MulticallContract } from "ethers-multicall";

const addresses = {
  pickle: "0x429881672B9AE42b8EbA0E26cD9C73711b891Ca5",
  onesplit: "0xC586BeF4a0992C495Cf22e1aeEE4E446CECDee0E",
  wavax: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
  pangolinRouter: "0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106",
  png: "0x60781C2586D68229fde47564546784ab3fACA982",
  png_rewards: "0x88f26b81c9cae4ea168e31BC6353f493fdA29661",
  sushi: "0x39cf1BD5f15fb22eC3D9Ff86b0727aFc203427cc",
};

interface Token {
  address: string;
  priceId: PriceIds;
  decimals: number;
}

// prettier-ignore
const pickle: Token = { address: addresses.pickle, priceId: "pickle", decimals: 18 };
const onesplit: Token = {
  address: addresses.onesplit,
  priceId: "onesplit",
  decimals: 18,
};
const wavax: Token = {
  address: addresses.wavax,
  priceId: "wavax",
  decimals: 18,
};
const png: Token = { address: addresses.png, priceId: "png", decimals: 6 };
const png_rewards: Token = {
  address: addresses.png_rewards,
  priceId: "png_rewards",
  decimals: 6,
};
const sushi: Token = {
  address: addresses.sushi,
  priceId: "sushi",
  decimals: 18,
};

interface PairMap {
  [key: string]: { a: Token; b: Token };
}

export const PAIR_INFO: PairMap = {
  "0xd8B262C0676E13100B33590F10564b46eeF652AD": { a: png, b: wavax },
};

function usePngPairs() {
  const { multicallProvider } = Connection.useContainer();
  const { prices } = Prices.useContainer();

  // don't return a function if it's not ready to be used
  if (!multicallProvider || !prices)
    return { getPairData: null, getPairDataPrefill: null };

  const getPairData = async (pairAddress: string) => {
    // setup contracts
    const { a, b } = PAIR_INFO[pairAddress];
    const tokenA = new MulticallContract(a.address, erc20.abi);
    const tokenB = new MulticallContract(b.address, erc20.abi);
    const pair = new MulticallContract(pairAddress, erc20.abi);

    const [
      numAInPairBN,
      numBInPairBN,
      totalSupplyBN,
    ] = await multicallProvider?.all([
      tokenA.balanceOf(pairAddress),
      tokenB.balanceOf(pairAddress),
      pair.totalSupply(),
    ]);

    // get num of tokens
    const numAInPair = numAInPairBN / Math.pow(10, a.decimals);
    const numBInPair = numBInPairBN / Math.pow(10, b.decimals);

    // get prices
    const priceA = prices[a.priceId];
    const priceB = prices[b.priceId];

    const totalValueOfPair = priceA * numAInPair + priceB * numBInPair;
    const totalSupply = totalSupplyBN / 1e18; // Uniswap LP tokens are always 18 decimals
    const pricePerToken = totalValueOfPair / totalSupply;

    return { totalValueOfPair, totalSupply, pricePerToken };
  };

  // Mainly for multi-call
  const getPairDataPrefill = (
    pairAddress: string,
    numAInPairBN: ethers.BigNumber,
    numBInPairBN: ethers.BigNumber,
    totalSupplyBN: ethers.BigNumber,
  ) => {
    const { a, b } = PAIR_INFO[pairAddress];

    // get num of tokens
    const numAInPair = parseFloat(
      ethers.utils.formatUnits(numAInPairBN, a.decimals),
    );
    const numBInPair = parseFloat(
      ethers.utils.formatUnits(numBInPairBN, b.decimals),
    );

    // get prices
    const priceA = prices[a.priceId];
    const priceB = prices[b.priceId];

    const totalValueOfPair = priceA * numAInPair + priceB * numBInPair;
    const totalSupply = parseFloat(ethers.utils.formatEther(totalSupplyBN)); // Uniswap LP tokens are always 18 decimals
    const pricePerToken = totalValueOfPair / totalSupply;

    return { totalValueOfPair, totalSupply, pricePerToken };
  };

  return { getPairData, getPairDataPrefill };
}

//export const UniV2Pairs = createContainer(useUniV2Pairs);
export const PngPairs = createContainer(usePngPairs);
