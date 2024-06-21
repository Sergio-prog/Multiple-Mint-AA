import { z } from "zod";
import { AlchemyGasManagerConfig } from "@alchemy/aa-alchemy";
import {
  SupportedAccountTypes,
  cookieStorage,
  createConfig,
} from "@alchemy/aa-alchemy/config";
import {
  SmartAccountClientOptsSchema,
  arbitrumSepolia,
} from "@alchemy/aa-core";
import { QueryClient } from "@tanstack/react-query";

// [!region create-accounts-config]
// NOTE: feel free to change the chain here!
export const chain = arbitrumSepolia;
export const config = createConfig({
  // this is for requests to the specific chain RPC
  rpcUrl: "/api/rpc/chain/" + chain.id,
  signerConnection: {
    // this is for Alchemy Signer requests
    rpcUrl: "/api/rpc/",
  },
  chain,
  ssr: true,
  storage: cookieStorage,
});
// [!endregion create-accounts-config]

// [!region other-config-vars]
// provide a query client for use by the alchemy accounts provider
export const queryClient = new QueryClient();
// configure the account type we wish to use once
export const accountType: SupportedAccountTypes = "MultiOwnerModularAccount";
// setup the gas policy for sponsoring transactions
export const gasManagerConfig: AlchemyGasManagerConfig = {
  policyId: process.env.NEXT_PUBLIC_ALCHEMY_GAS_MANAGER_POLICY_ID!,
};
// additional options for our account client
type SmartAccountClienOptions = z.infer<typeof SmartAccountClientOptsSchema>;
export const accountClientOptions: Partial<SmartAccountClienOptions> = {
  txMaxRetries: 20,
};
// [!endregion other-config-vars]

export type NftType = {
  contractAddress: string;
  image: string;
  symbol: string;
  name: string;
}

export const nfts: NftType[] = [
  {
    contractAddress: "0x46467df1395E69Ca2D08978ae73032F1e3EDF133",
    image: "https://ipfs.io/ipfs/QmZGVMEg56qSgD3Pq95sSA9jFBMRkZM9jD7UC9UL5vpQU9/IMG_3722.jpg",
    symbol: "GME",
    name: "Roaring Kitty"
  },
  {
    contractAddress: "0x8c8Bb678BF49b6E612B808A6BfD73aAc32bFEd61",
    image: "https://ipfs.io/ipfs/bafybeihm3fhykxp7ah44zwe3wezz2u7exgszxc7yww5thvztbbppgepsge/4041.png",
    symbol: "Test",
    name: "Retarded"
  }
]
