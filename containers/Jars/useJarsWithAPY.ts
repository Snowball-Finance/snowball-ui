import { useEffect, useState } from "react";

import { DEPOSIT_TOKENS_JAR_NAMES, JAR_DEPOSIT_TOKENS } from "./jars";
import { Prices } from "../Prices";
import {
  SCRV_STAKING_REWARDS,
  Contracts,
  STECRV_STAKING_REWARDS,
  PNG_STAKING_REWARDS,
} from "../Contracts";
import { Jar } from "./useFetchJars";
import { useCurveRawStats } from "./useCurveRawStats";
import { useCurveCrvAPY } from "./useCurveCrvAPY";
import { useCurveSNXAPY } from "./useCurveSNXAPY";
import { useUniPairDayData } from "./useUniPairDayData";
import { useSushiPairDayData } from "./useSushiPairDayData";
import { usePngPairDayData } from "./usePngPairDayData";
import { formatEther } from "ethers/lib/utils";
import { useCompAPY } from "./useCompAPY";
import erc20 from "@studydefi/money-legos/erc20";

import compound from "@studydefi/money-legos/compound";

import { Contract as MulticallContract } from "ethers-multicall";
import { Connection } from "../Connection";
import { useCurveLdoAPY } from "./useCurveLdoAPY";
import { PngPairs } from "../PngPairs";

const AVERAGE_BLOCK_TIME = 13.22;

interface SushiPoolId {
  [key: string]: number;
}

const sushiPoolIds: SushiPoolId = {
  "0xC3D03e4F041Fd4cD388c549Ee2A29a9E5075882f": 2,
  "0x397FF1542f962076d0BFE58eA045FfA2d347ACa0": 1,
  "0x06da0fd433C1A5d7a4faa01111c044910A184553": 0,
  "0xCEfF51756c56CeFFCA006cD410B03FFC46dd3a58": 21,
  "0x088ee5007C98a9677165D78dD2109AE4a3D04d0C": 11,
  "0x10B47177E92Ef9D5C6059055d92DdF6290848991": 132,
};

export interface JarApy {
  [k: string]: number;
}

export interface JarWithAPY extends Jar {
  totalAPY: number;
  apr: number;
  APYs: Array<JarApy>;
}

type Input = Array<Jar> | null;
type Output = {
  jarsWithAPY: Array<JarWithAPY> | null;
};

const getCompoundingAPY = (apr: number) => {
  return 100 * (Math.pow(1 + apr / 365, 365) - 1);
};

export const useJarWithAPY = (jars: Input): Output => {
  const { multicallProvider } = Connection.useContainer();
  const { controller, strategy } = Contracts.useContainer();
  const { prices } = Prices.useContainer();
  const { getPairData: getPngPairData } = PngPairs.useContainer();
  //const { getPairData: getSushiPairData } = SushiPairs.useContainer();
  //const { getPairData: getUniPairData } = UniV2Pairs.useContainer();
  const {
    stakingRewards,
    susdPool,
    susdGauge,
    renGauge,
    renPool,
    threeGauge,
    threePool,
    sushiChef,
    steCRVPool,
    steCRVGauge,
  } = Contracts.useContainer();
  const { getUniPairDayAPY } = useUniPairDayData();
  const { getSushiPairDayAPY } = useSushiPairDayData();
  const { rawStats: curveRawStats } = useCurveRawStats();
  const { APYs: susdCrvAPY } = useCurveCrvAPY(
    jars,
    prices?.usdc || null,
    susdGauge,
    susdPool,
  );
  const { APYs: stEthCrvAPY } = useCurveCrvAPY(
    jars,
    prices?.eth || null,
    steCRVGauge,
    steCRVPool,
  );
  const { APYs: threePoolCrvAPY } = useCurveCrvAPY(
    jars,
    prices?.usdc || null,
    threeGauge,
    threePool,
  );
  const { APYs: ren2CrvAPY } = useCurveCrvAPY(
    jars,
    prices?.wbtc || null,
    renGauge,
    renPool,
  );
  const { APYs: susdSNXAPY } = useCurveSNXAPY(
    jars,
    susdPool,
    stakingRewards ? stakingRewards.attach(SCRV_STAKING_REWARDS) : null,
  );
  const { APYs: stEthLdoAPY } = useCurveLdoAPY(
    jars,
    steCRVPool,
    stakingRewards ? stakingRewards.attach(STECRV_STAKING_REWARDS) : null,
  );

  const { APYs: compDaiAPYs } = useCompAPY(compound.cDAI.address);

  const [jarsWithAPY, setJarsWithAPY] = useState<Array<JarWithAPY> | null>(
    null,
  );

  /*  const calculateUNIAPY = async (rewardsAddress: string) => {
    if (stakingRewards && prices?.uni && getUniPairData && multicallProvider) {
      const multicallUniStakingRewards = new MulticallContract(
        rewardsAddress,
        stakingRewards.interface.fragments,
      );

      const [
        rewardsDurationBN,
        uniRewardsForDurationBN,
        stakingToken,
        totalSupplyBN,
      ] = await multicallProvider.all([
        multicallUniStakingRewards.rewardsDuration(),
        multicallUniStakingRewards.getRewardForDuration(),
        multicallUniStakingRewards.stakingToken(),
        multicallUniStakingRewards.totalSupply(),
      ]);

      const totalSupply = parseFloat(formatEther(totalSupplyBN));
      const rewardsDuration = rewardsDurationBN.toNumber(); //epoch
      const uniRewardsForDuration = parseFloat(
        formatEther(uniRewardsForDurationBN),
      );

      const { pricePerToken } = await getUniPairData(stakingToken);

      const uniRewardsPerYear =
        uniRewardsForDuration * ((360 * 24 * 60 * 60) / rewardsDuration);
      const valueRewardedPerYear = prices.uni * uniRewardsPerYear;

      const totalValueStaked = totalSupply * pricePerToken;
      const uniAPY = valueRewardedPerYear / totalValueStaked;

      // no more UNI being distributed
      return [{ uni: 0 * 100 * 0.725, apr: 0 }];
    }

    return [];
  };
 */
  const calculatePNGAPY = async (rewardsAddress: string) => {
    if (stakingRewards && prices?.png && getPngPairData && multicallProvider) {
      const multicallPngStakingRewards = new MulticallContract(
        rewardsAddress,
        stakingRewards.interface.fragments,
      );

      const [
        rewardsDurationBN,
        pngRewardsForDurationBN,
        stakingToken,
        totalSupplyBN,
      ] = await multicallProvider.all([
        multicallPngStakingRewards.rewardsDuration(),
        multicallPngStakingRewards.getRewardForDuration(),
        multicallPngStakingRewards.stakingToken(),
        multicallPngStakingRewards.totalSupply(),
      ]);

      const totalSupply = parseFloat(formatEther(totalSupplyBN));
      const rewardsDuration = rewardsDurationBN.toNumber(); //epoch
      const pngRewardsForDuration = parseFloat(
        formatEther(pngRewardsForDurationBN),
      );

      const { pricePerToken } = await getPngPairData(stakingToken);

      const pngRewardsPerYear =
        pngRewardsForDuration * ((360 * 24 * 60 * 60) / rewardsDuration);
      const valueRewardedPerYear = prices.png * pngRewardsPerYear;

      const totalValueStaked = totalSupply * pricePerToken;
      const pngAPY = valueRewardedPerYear / totalValueStaked;

      // no more PNG being distributed
      return [{ png: 0 * 100 * 0.725, apr: 0 }];
    }

    return [];
  };

  const calculateAPY = async () => {
    if (jars && controller && strategy) {
      const [
        // pngAvaxSushiApy,
        pngAvaxUniApy,
      ] = await Promise.all([calculatePNGAPY(PNG_AVAX_UNI_STAKING_REWARDS)]);

      const promises = jars.map(async (jar) => {
        let APYs: Array<JarApy> = [];
        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.PNG_AVAX_UNI) {
          APYs = [
            ...pngAvaxUniApy,
            ...getPngPairDayAPY(JAR_DEPOSIT_TOKENS.PNG_AVAX_UNI),
          ];
        }

        let apr = 0;
        APYs.map((x) => {
          if (x.apr) {
            apr += x.apr;
            delete x.apr;
          }
        });

        let lp = 0;
        APYs.map((x) => {
          if (x.lp) {
            lp += x.lp;
          }
        });

        const totalAPY = getCompoundingAPY(apr / 100) + lp;

        return {
          ...jar,
          APYs,
          totalAPY,
          apr,
        };
      });

      const newJarsWithAPY = await Promise.all(promises);

      setJarsWithAPY(newJarsWithAPY);
    }
  };

  useEffect(() => {
    calculateAPY();
  }, [jars, prices]);

  return { jarsWithAPY };
};
