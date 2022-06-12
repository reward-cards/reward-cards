import { useQuery } from "@apollo/client";
import { Contract } from "@ethersproject/contracts";
import { shortenAddress, useCall, useEthers, useLookupAddress } from "@usedapp/core";
import React, { useEffect, useState } from "react";

import { Body, Button, Container, Header, Image, Link, Input, Grid } from "./components";
import logo from "./ethereumLogo.png";

import { addresses, abis } from "@my-app/contracts";
import GET_TRANSFERS from "./graphql/subgraph";

function Form() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}>
      <div style={{
        display: "flex",
        flexDirection: "column",
        minWidth: "75vw",
      }}>
        <p style={{
          display: "flex",
          justifyContent: "space-between",
        }}>
          <div>
            Coffee Price: <Input value={0.01} />ETH
          </div>
          <div>
            Reward Per Item: <Input value={2} />Tokens
          </div>
        </p>
        <p style={{
          display: "flex",
          justifyContent: "space-between",
        }}>
          <div>
            Brownie Price: <Input value={0.02} />ETH
          </div>
          <div>
            Reward Per Item: <Input value={4} />Tokens
          </div>
        </p>
        <p style={{
          display: "flex",
          justifyContent: "space-between",
        }}>
          <div>
            Lemonade Price: <Input value={0.015} />ETH
          </div>
          <div>
            Reward Per Item: <Input value={3} />Tokens
          </div>
        </p>
      </div>
      <Button onClick={() => { }}>Save Menu</Button>
    </div>
  );
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
  const { error: contractCallError, value: tokenBalance } =
    useCall({
      contract: new Contract(addresses.ceaErc20, abis.erc20),
      method: "balanceOf",
      args: ["0x3f8CB69d9c0ED01923F11c829BaE4D9a4CB6c82C"],
    }) ?? {};

  const { loading, error: subgraphQueryError, data } = useQuery(GET_TRANSFERS);

  return (
    <Container>
      <Header>
        <WalletButton />
      </Header>
      <Body>
        <h1>
          Cafe Manager Page
        </h1>
        <Form />
      </Body>
    </Container>
  );
}

export default App;
