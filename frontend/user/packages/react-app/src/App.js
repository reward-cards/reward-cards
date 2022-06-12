import { Contract } from "@ethersproject/contracts";
import { ethers } from "ethers";
import { shortenAddress, useCall, useEthers, useLookupAddress, useContractFunction } from "@usedapp/core";
import React, { useEffect, useState } from "react";

import { Body, Button, Container, Header, Image, Card, Amount, Center } from "./components";

import { addresses, abis } from "@my-app/contracts";
import logo from "./prague.png";

function RewardCard() {
  const [rendered, setRendered] = useState("");
  const ens = useLookupAddress();
  const cardIdToType = {
    0: "Base",
    1: "Gold",
    2: "Platinum"
  };
  const cardIdToGradient = {
    0: ["#981631", "#c12020"],
    1: ["#988916", "#d6d121"],
    2: ["#575652", "#bdbdb9"],
  }
  const { account } = useEthers();
  const { value: tokens } =
    useCall({
      contract: new Contract(addresses.cafeContract, abis.cafeContract),
      method: "balanceOf",
      args: [account, 0],
    }) ?? {};

  const { value: cardId } =
    useCall({
      contract: new Contract(addresses.cafeContract, abis.cafeContract),
      method: "balanceOf",
      args: [account, 1],
    }) ?? {};

  const cardType = cardIdToType[cardId];
  useEffect(() => {
    if (ens) {
      setRendered(ens);
    } else if (account) {
      setRendered(shortenAddress(account));
    }
  }, [account, ens, rendered]);

  return (
    <Card style={{
      position: "relative",
      backgroundImage: `linear-gradient(to bottom right, ${cardIdToGradient[cardId ?? 0][0]}, ${cardIdToGradient[cardId ?? 0][1]})`
    }}>
      <h3 style={{
        left: "3vmin",
        top: "0px",
        position: "absolute"
      }}>
        {`${cardType} Member`}
      </h3>
      <Center>
        <p style={{
          marginTop: "28px",
          marginBottom: "12px",
        }}>
          {rendered}
        </p>
        <p style={{
          marginTop: "12px",
          marginBottom: "12px",
        }}>
          {`${tokens} tokens`}
        </p>
      </Center>
      <Image src={logo}></Image>
    </Card >
  )
}

function Menu() {
  const [coffee, setCoffee] = useState(0);
  const [brownie, setBrownie] = useState(0);

  const handleCoffeeChange = (e) => {
    setCoffee(e.target.value);
  };

  const handleBrownieChange = (e) => {
    setBrownie(e.target.value);
  };

  const contract = new Contract(addresses.cafeCore, abis.cafeCore);
  const { send } = useContractFunction(contract, "executeOrder", {});
  const { account } = useEthers();
  return (
    <div>
      <h2>
        Order
      </h2>
      <p>
        Coffee: <Amount onChange={handleCoffeeChange} id="coffee" />
      </p>
      <p>
        Brownies: <Amount onChange={handleBrownieChange} id="brownie" />
      </p>
      <Button onClick={() => send(addresses.cafeContract, ["Coffee", "Brownie"], [coffee, brownie], { value: ethers.utils.parseEther((0.001 * coffee + 0.002 * brownie).toString()) })}>Pay for all</Button>
    </div>
  )
}

function WalletButton() {
  const [rendered, setRendered] = useState("");

  const ens = useLookupAddress();
  const { account, activateBrowserWallet, deactivate, error } = useEthers();

  useEffect(() => {
    if (ens) {
      setRendered(ens);
    } else if (account) {
      setRendered(shortenAddress(account));
    } else {
      setRendered("");
    }
  }, [account, ens, setRendered]);

  useEffect(() => {
    if (error) {
      console.error("Error while connecting wallet:", error.message);
    }
  }, [error]);

  return (
    <Button
      onClick={() => {
        if (!account) {
          activateBrowserWallet();
        } else {
          deactivate();
        }
      }}
    >
      {rendered === "" && "Connect Wallet"}
      {rendered !== "" && rendered}
    </Button>
  );
}

function App() {
  // Read more about useDapp on https://usedapp.io/
  const [rendered, setRendered] = useState(false);
  const { account } = useEthers();

  useEffect(() => {
    if (account) {
      setRendered(true);
    } else {
      setRendered(false);
    }
  }, [account]);

  return (
    <Container>
      <Body>
        <h1>
          Welcome to Paralelní Polis Café
        </h1>
        {
          rendered ?
            <>
              <RewardCard />
              <Menu />
            </>
            :
            <>
              <h1>
                Connect your Wallet to continue.
              </h1>
              <WalletButton>Connect Wallet</WalletButton>
            </>
        }
      </Body>
    </Container>
  );
}

export default App;
