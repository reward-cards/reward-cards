import { useQuery } from "@apollo/client";
import { Contract } from "@ethersproject/contracts";
import { shortenAddress, useCall, useEthers, useLookupAddress } from "@usedapp/core";
import React, { useEffect, useState } from "react";

import { Body, Button, Container, Header, Image, Link, Card, Amount, Center } from "./components";

import { addresses, abis } from "@my-app/contracts";
import GET_TRANSFERS from "./graphql/subgraph";
import logo from "./prague.png";

function RewardCard() {
  const [rendered, setRendered] = useState("");
  const [hasCard, setHasCard] = useState(false);
  const ens = useLookupAddress();
  const { account } = useEthers();
  const tokens = "123123123";
  const cardType = "Base";

  useEffect(() => {
    if (ens) {
      setRendered(ens);
    } else if (account) {
      setRendered(shortenAddress(account));
    }
  }, [account, ens, rendered]);

  useEffect(() => {
    if (false) {
      setHasCard(true);
    }
  }, [hasCard])


  return (
    hasCard ?
      <Card style={{
        position: "relative",
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
      :
      <Button onClick={() => { setHasCard(true) }}>Mint Your Card</Button>
  )
}

function Menu() {
  return (
    <div>
      <h2>
        Order
      </h2>
      <p>
        Coffee: <Amount id="coffee" />
      </p>
      <p>
        Brownies: <Amount id="brownie" />
      </p>
      <Button>Pay for all</Button>
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
    }
  }, [account]);

  const { error: contractCallError, value: tokenBalance } =
    useCall({
      contract: new Contract(addresses.ceaErc20, abis.erc20),
      method: "balanceOf",
      args: ["0x3f8CB69d9c0ED01923F11c829BaE4D9a4CB6c82C"],
    }) ?? {};

  return (
    <Container>
      <Header>
        <WalletButton />
      </Header>
      <Body>
        {
          rendered ?
            <>
              <RewardCard />
              <Menu />
            </>
            :
            <h1>
              Connect your Wallet to continue.
            </h1>
        }
      </Body>
    </Container>
  );
}

export default App;
