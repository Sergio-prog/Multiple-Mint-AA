"use client";

import React, { FormEvent, useEffect } from "react";
import {
  useAccount,
  useLogout,
  useSendUserOperation,
  useSmartAccountClient,
  useUser,
} from "@alchemy/aa-alchemy/react";
import {
  chain,
  accountType,
  gasManagerConfig,
  accountClientOptions as opts,
  nfts,
  NftType,
  tokenToCheck,
  Token,
} from "@/config";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { encodeFunctionData, etherUnits, Hex, formatEther, maxUint256, zeroAddress } from "viem";
import { OpStatus } from "./op-status";
import { DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import erc721A_abi from "../abis/ERC721A_abi.json";
import erc165_abi from "../abis/ERC165.json";
import erc1155_abi from "../abis/ERC1155_abi.json";
import uniswapV3router_abi from "../abis/UniswapV3Router_abi.json";
import erc20_abi from "../abis/ERC20_abi.json";
import { Dialog } from "./ui/Dialog";

export const ProfileCard = () => {
  const user = useUser();
  const { address } = useAccount({ type: accountType });
  const { logout } = useLogout();
  const enum pagesEnum {
    transactions = "transaction",
    nfts = "nfts",
    balances = "balances",
  }
  const [page, setPage] = React.useState<pagesEnum | null>(pagesEnum.transactions)
  const [checked, setChecked] = React.useState<number[]>([0]);
  const [openMint, setOpenMint] = React.useState(false);
  const [tokensInfo, setTokensInfo] = React.useState<Token[]>([]);
  const ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

  const handleToggle = (value: number) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const handlePage = (
    event: React.MouseEvent<HTMLElement>,
    newPage: pagesEnum | null,
  ) => {
    setPage(newPage);
  };

  // [!region sending-user-op]
  // use config values to initialize our smart account client
  const { client } = useSmartAccountClient({
    type: accountType,
    gasManagerConfig,
    opts,
  });

  // provide the useSendUserOperation with a client to send a UO
  // this hook provides us with a status, error, and a result
  const {
    sendUserOperation,
    sendUserOperationResult,
    isSendingUserOperation,
    error: isSendUserOperationError,
  } = useSendUserOperation({ client, waitForTxn: true });

  const send = (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();

    // collect all the form values from the user input
    const formData = new FormData(evt.currentTarget);
    const target = formData.get("to") as Hex;
    const data = formData.get("data") as Hex;
    const value = formData.get("value") as string;

    // send the user operation
    sendUserOperation({
      uo: { target, data, value: value ? BigInt(value) : 0n },
    });
  };

  const swap = () => {
    const target = "0x101F443B4d1b059569D643917553c771E1b9663E";
    const weth_address = "0x980B62Da83eFf3D4576C647993b0c1D7faf17c73";
    const usdc_address = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d";

    // const approveData = encodeFunctionData({
    //   abi: erc20_abi,
    //   functionName: "approve",
    //   args: []
    // });

    const value = 0.001;

    const data = encodeFunctionData({
      abi: uniswapV3router_abi,
      functionName: "exactInputSingle",
      args: [{
        "tokenIn": weth_address,
        "tokenOut": usdc_address,
        "fee": 3000,
        "recipient": address,
        "amountIn": BigInt(value * 10 ** 18),
        "amountOutMinimum": 0,
        "sqrtPriceLimitX96": 0
      }],
    })

    sendUserOperation({
      uo: { target, data, value: BigInt(value * 10 ** 18) },
    });
  };

  const mintNfts = async (nfts: NftType[]) => {
    if (!client) {
      return;
    }

    const operations = [];
    for (const nft of nfts) {
      const isErc1155 = await client.readContract({
        abi: erc165_abi,
        address: nft.contractAddress as Hex,
        functionName: "supportsInterface",
        args: ["0xd9b67a26"]
      })

      let args, callData;
      
      if (isErc1155) {
        console.log("ERC1155");
        
        const uri = await client.readContract({
          abi: erc1155_abi,
          address: nft.contractAddress as Hex,
          functionName: "uri",
          args: [0]
        })
        args = [address, 0, uri, 1];
        console.log(args);
        
        callData = encodeFunctionData({
          abi: erc1155_abi,
          functionName: "mintTo",
          args
        })
      } else {
        args = [address, 1, ETH_ADDRESS, 0, {
          proof: [zeroAddress + "0".repeat(24)],
          quantityLimitPerWallet: maxUint256,
          pricePerToken: 0,
          currency: ETH_ADDRESS
        }, "0x"];
        
        callData = encodeFunctionData({
          abi: erc721A_abi,
          functionName: "claim",
          args
        })
      }

      operations.push({target: nft.contractAddress as Hex, data: callData as Hex, value: 0n});
    }

    sendUserOperation({
      uo: operations
    });
  }

  const fetchTokenIfnfo = async (tokenAddress: string) => {    
      if (!client) {
        return;
      }

      let name: string, symbol: string;
      
      if (tokenAddress === zeroAddress) {
        [name, symbol] = ["Ethereum", "ETH"];
      } else {
        name = await client.readContract({
          abi: erc20_abi,
          address: tokenAddress as Hex,
          functionName: "name",
          args: []
        }) as string;
        
        symbol = await client.readContract({
          abi: erc20_abi,
          address: tokenAddress as Hex,
          functionName: "symbol"
        }) as string;
    }
    
    console.log(name, symbol);
    
    const token: Token = { name, symbol };
    tokensInfo.push(token);
  }
  // [!endregion sending-user-op]

  useEffect(() => {
    tokenToCheck.forEach((token) => {
      fetchTokenIfnfo(token);
    });
    console.log(tokenToCheck, tokensInfo)
  }, []);

  return (
    <Card>
      <div className="flex flex-col gap-4">
        <div className="text-center text-lg font-semibold">
          Send a Transaction!
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="font-bold">Address:</div>
            <div>{address}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="font-bold">Email:</div>
            <div>{user?.email}</div>
          </div>
          <div className="flex gap-2 justify-between mb-4">
            <Button variant={page === pagesEnum.transactions ? "default" : "secondary"} onClick={() => setPage(pagesEnum.transactions)}>
              Transactions
            </Button>
            <Button variant={page === pagesEnum.nfts ? "default" : "secondary"} onClick={() => setPage(pagesEnum.nfts)}>
              View NFTs
            </Button>
            <Button variant={page === pagesEnum.balances ? "default" : "secondary"} onClick={() => setPage(pagesEnum.balances)}>
              Balances
            </Button>
          </div>

          {page === pagesEnum.transactions && (
          <form className="flex flex-col gap-4" onSubmit={send}>
            <div className="flex items-center gap-2">
              <label className="w-12">To:</label>
              <Input
                name="to"
                defaultValue="0x7d29eaA4F8bc836746B63FAd5180069e824DE291"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-12">Data:</label>
              <Input
                name="data"
                defaultValue="0xa0712d680000000000000000000000000000000000000000000000056bc75e2d63100000"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-12">Value:</label>
              <Input name="value" defaultValue="0" />
            </div>

            <div className="my-2 flex flex-col gap-4">

          <Button type="submit" disabled={isSendingUserOperation}>
            Send Transaction
          </Button>
          <Button type="button" onClick={swap} disabled={isSendingUserOperation}>
            Test swap
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => logout()}
            disabled={isSendingUserOperation}
          >
            Logout
          </Button>
        </div>
          </form>
        )}

        {page === pagesEnum.nfts && (
          <div>
            <List sx={{ width: '100%', maxWidth: 500 }}>
              {nfts.map((value, index: number) => {
                const {symbol, contractAddress, name, image} = value; 

                return (
                  <ListItem
                    key={index}
                    secondaryAction={
                      <a target="_blank"
                      rel="noopener noreferrer"
                      className="text-center text-[#363FF9] hover:underline dark:text-[#b6b9f9]"
                      href={`${chain.blockExplorers?.default.url}/address/${contractAddress}`}>
                        {contractAddress.slice(0, 4) + "..." + contractAddress.slice(contractAddress.length - 4)}
                      </a>
                    }
                    disablePadding
                  >
                    <ListItemButton selected={checked.indexOf(index) !== -1} role={undefined} onClick={handleToggle(index)} dense>
                      <ListItemIcon>
                        <img className="size-12" src={image} />
                      </ListItemIcon>
                      <ListItemText sx={{'& .MuiTypography-body2': {color: 'white'}}} primary={name} secondary={<span color="white">{symbol}</span>}></ListItemText>
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
            <div className="flex flex-row mt-10">
              <Button disabled={checked.length < 1} onClick={() => setOpenMint(true)}>
                Mint
              </Button>
            </div>

            <Dialog maxWidth={'xs'} fullWidth={true} open={openMint} onClose={() => setOpenMint(false)}>
              <DialogTitle sx={{'backgroundColor': '#0F172A', 'color': 'white'}}>Mint NFTs</DialogTitle>
              <DialogContent sx={{'backgroundColor': '#0F172A', 'color': 'white'}}>
                <DialogContentText>
                {nfts.map((value, index: number) => {
                const {symbol, contractAddress, name, image} = value; 
                
                if (!checked.includes(index)) return;

                return (
                  <ListItem
                    key={index}
                    secondaryAction={
                      <a target="_blank"
                      rel="noopener noreferrer"
                      className="text-center text-[#363FF9] hover:underline dark:text-[#b6b9f9]"
                      href={`${chain.blockExplorers?.default.url}/address/${contractAddress}`}>
                        {contractAddress.slice(0, 4) + "..." + contractAddress.slice(contractAddress.length - 4)}
                      </a>
                    }
                    disablePadding
                  >
                    <ListItemButton selected={true} role={undefined}>
                      <ListItemIcon>
                        <img className="size-12" src={image} />
                      </ListItemIcon>
                      <ListItemText sx={
                        {'& .MuiTypography-body2': {color: 'white'}, '& .MuiTypography-body1': {color: 'white'}}
                        } primary={name} secondary={<span color="white">{symbol}</span>}></ListItemText>
                    </ListItemButton>
                  </ListItem>
                );
              })}
                </DialogContentText>
              </DialogContent>
              <DialogActions sx={{'backgroundColor': "#0F172A"}}>
                  <Button onClick={() => mintNfts(
                    nfts.filter(
                    (_, index) => checked.includes(index))
                    )} variant="default" disabled={isSendingUserOperation}>
                    Mint
                  </Button>
                  <Button onClick={() => setOpenMint(false)} variant="secondary">
                    <span className="text-white">Close</span>
                  </Button>
              </DialogActions>
            </Dialog>
          </div>
        )}

        {page === pagesEnum.balances && (
          <div>
            <List sx={{ width: '100%', maxWidth: 500 }}>
              {
              tokensInfo.map((token, index) => {
                console.log(token);
                const {symbol, name} = token;

                return (
                  <ListItem
                    key={index}
                    disablePadding
                  >
                    <ListItemButton selected={true} role={undefined}>
                      <ListItemText sx={
                        {'& .MuiTypography-body2': {color: 'white'}, '& .MuiTypography-body1': {color: 'white'}}
                        } primary={name} secondary={<span color="white">{symbol}</span>}></ListItemText>
                    </ListItemButton>
                  </ListItem>
                )
              })}
            </List>
          </div>
        )}

        <OpStatus
          sendUserOperationResult={sendUserOperationResult}
          isSendingUserOperation={isSendingUserOperation}
          isSendUserOperationError={isSendUserOperationError}
        />
        </div>
      </div>
    </Card>
  );
};
