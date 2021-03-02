import { useState, useEffect } from "react";
import { createContainer } from "unstated-next";
import { ethers } from "ethers";
import { Connection } from "./Connection";

import { Strategy } from "./Contracts/Strategy";
import { StrategyFactory } from "./Contracts/StrategyFactory";
import { Masterchef } from "./Contracts/Masterchef";
import { MasterchefFactory } from "./Contracts/MasterchefFactory";
import { StakingRewards } from "./Contracts/StakingRewards";
import { StakingRewardsFactory } from "./Contracts/StakingRewardsFactory";
import { Controller } from "./Contracts/Controller";
import { ControllerFactory } from "./Contracts/ControllerFactory";
import { Erc20 } from "./Contracts/Erc20";
import { Erc20Factory } from "./Contracts/Erc20Factory";
import { PangolinPair } from "./Contracts/PangolinPair";
import { PangolinPairFactory } from "./Contracts/PangolinPairFactory";

export const PNG_AVAX_UNI_STAKING_REWARDS =
  "0x8Cc0183526ab00b2b1F3f4d42Ae7821e6Af2CbCb"; // FUJI

export const PICKLE_TOKEN_ADDR = "0x429881672B9AE42b8EbA0E26cD9C73711b891Ca5";
export const MASTERCHEF_ADDR = "0xbD17B1ce622d73bD438b9E658acA5996dc394b0d";
export const CONTROLLER_ADDR = "0x6847259b2B3A4c17e7c43C54409810aF48bA5210";

function useContracts() {
  const { signer } = Connection.useContainer();

  const [pickle, setPickle] = useState<Erc20 | null>(null);
  const [masterchef, setMasterchef] = useState<Masterchef | null>(null);
  const [controller, setController] = useState<Controller | null>(null);

  const [stakingRewards, setStakingRewards] = useState<StakingRewards | null>(
    null,
  );

  const [pangolinPair, setPangolinPair] = useState<PangolinPair | null>(null);

  const [erc20, setERC20] = useState<Erc20 | null>(null);

  const [strategy, setStrategy] = useState<Strategy | null>(null);

  const initContracts = async () => {
    if (signer) {
      setPickle(Erc20Factory.connect(PICKLE_TOKEN_ADDR, signer));
      setMasterchef(MasterchefFactory.connect(MASTERCHEF_ADDR, signer));
      setController(ControllerFactory.connect(CONTROLLER_ADDR, signer));
      setStakingRewards(
        StakingRewardsFactory.connect(ethers.constants.AddressZero, signer),
      );
      setPangolinPair(
        PangolinPairFactory.connect(ethers.constants.AddressZero, signer),
      );
      setERC20(Erc20Factory.connect(ethers.constants.AddressZero, signer));
      setStrategy(
        StrategyFactory.connect(ethers.constants.AddressZero, signer),
      );
    }
  };

  useEffect(() => {
    if (signer) initContracts();
  }, [signer]);

  return {
    pickle,
    masterchef,
    controller,
    stakingRewards,
    erc20,
    strategy,
    pangolinPair,
  };
}

export const Contracts = createContainer(useContracts);
