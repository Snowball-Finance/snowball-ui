import { useEffect, useState } from "react";

import { DEPOSIT_TOKENS_JAR_NAMES, JAR_DEPOSIT_TOKENS } from "./jars";
import { Prices } from "../Prices";
import { Contracts, PNG_AVAX_UNI_STAKING_REWARDS } from "../Contracts";
import { Jar } from "./useFetchJars";
import { usePngPairDayData } from "./usePngPairDayData";
import { formatEther } from "ethers/lib/utils";

import { Contract as MulticallContract } from "ethers-multicall";
import { Connection } from "../Connection";
import { PngPairs } from "../PngPairs";

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
  const { stakingRewards } = Contracts.useContainer();
  const { getPngPairDayAPY } = usePngPairDayData();

  const [jarsWithAPY, setJarsWithAPY] = useState<Array<JarWithAPY> | null>(
    null,
  );

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

      // TODO: update to reflect current state of PNG distribution
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
