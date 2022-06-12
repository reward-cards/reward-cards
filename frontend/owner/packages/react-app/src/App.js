import { useQuery } from "@apollo/client";
import { Contract } from "@ethersproject/contracts";
import { shortenAddress, useCall, useEthers, useLookupAddress, useContractFunction } from "@usedapp/core";
import React, { useEffect, useState } from "react";

import { Body, Button, Container, Header, Image, Link, Input, InputText, Grid } from "./components";
import logo from "./ethereumLogo.png";

import { addresses, abis } from "@my-app/contracts";
import GET_TRANSFERS from "./graphql/subgraph";

function Form() {
  const contract = new Contract(addresses.cafeRegistry, abis.cafeRegistry);
  const { send } = useContractFunction(contract, "createCafeContract", {});

  const handleSubmit = () => {

  };

  return (
    <form onSubmit={handleSubmit}>
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
          <p style={{
            display: "flex",
            justifyContent: "space-evenly",
          }}>
            <div>
              Membership Levels: <Input value={3} />
            </div>
            <div>
              Membership Level Thresholds: <InputText value={"0, 20, 40"} />
            </div>
          </p>
          <p style={{
            display: "flex",
            justifyContent: "space-evenly",
          }}>
            <div>
              Membership Level Discounts: <InputText value={"0, 5, 10"} />%
            </div>
          </p>
          <p style={{
            display: "flex",
            justifyContent: "space-evenly",
          }}>
            <div>
              One Time Discount Threshold: <Input value={10} />
            </div>
            <div>
              One Time Discount: <Input value={0.001} />ETH
            </div>
          </p>
        </div>
        <Button>Save Menu</Button>
      </div>
    </form>
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
