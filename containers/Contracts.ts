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
import { addresses } from "../util/address";

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
      setPickle(Erc20Factory.connect(addresses.snow, signer));
      setMasterchef(MasterchefFactory.connect(addresses.ice_queen, signer));
      setController(ControllerFactory.connect(addresses.controller, signer));
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
