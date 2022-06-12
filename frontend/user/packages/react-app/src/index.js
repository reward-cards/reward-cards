import "./index.css";

import { DAppProvider, Rinkeby } from "@usedapp/core";
import React from "react";
import ReactDOM from "react-dom";

import App from "./App";

const config = {
  readOnlyChainId: Rinkeby.chainId,
  readOnlyUrls: {
    [Rinkeby.chainId]: "https://eth-rinkeby.alchemyapi.io/v2/bZOVWiVdQxNZhRc_MBqBvgEr41ERX5lr",
  },
}

ReactDOM.render(
  <React.StrictMode>
    <DAppProvider config={config}>
      <App />
    </DAppProvider>
  </React.StrictMode>,
  document.getElementById("root"),
);
