import { type AppProps } from "next/app";
import { log } from "next-axiom";

import { api } from "../utils/api";

import "@rainbow-me/rainbowkit/styles.css";

import {
  googleWallet,
  facebookWallet,
  githubWallet,
  discordWallet,
  twitchWallet,
  twitterWallet,
  enhanceWalletWithAAConnector,
} from "@zerodevapp/wagmi/rainbowkit";
import {
  RainbowKitProvider,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { polygonMumbai } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";

if (process.env.NODE_ENV !== "production") log.logLevel = "off";

export { reportWebVitals } from "next-axiom";

// YOUR ZERODEV PROJECT ID
const projectId = "ZERODEV_PROJECT_ID";

const { chains, provider } = configureChains(
  [polygonMumbai],
  [
    alchemyProvider({
      apiKey: "ALCHEMY_API_KEY",
    }),
    publicProvider(),
  ]
);

const connectors = connectorsForWallets([
  {
    groupName: "Social",
    wallets: [
      googleWallet({ options: { projectId } }),
      facebookWallet({ options: { projectId } }),
      githubWallet({ options: { projectId } }),
      discordWallet({ options: { projectId } }),
      twitchWallet({ options: { projectId } }),
      twitterWallet({ options: { projectId } }),
    ],
  },
  //   {
  //     groupName: "Wallets",
  //     wallets: [metaMaskWallet({ chains })], // walletConnectWallet({ chains })
  //   },
]);

const wagmiClient = createClient({
  autoConnect: false,
  connectors,
  provider,
});

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default api.withTRPC(App);
