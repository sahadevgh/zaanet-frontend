import {
  createKernelAccount,
  createKernelAccountClient,
  createZeroDevPaymasterClient,
} from "@zerodev/sdk";
import { KERNEL_V3_1, getEntryPoint } from "@zerodev/sdk/constants";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { http, createPublicClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";
import { Web3Auth } from "@web3auth/modal";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";

const ZERODEV_RPC = `https://rpc.zerodev.app/api/v3/${process.env.NEXT_PUBLIC_ZERO_DEV_PROJECT_ID}/chain/421614`;
const chainIdHex = "0x66eee"; // Arbitrum Sepolia chain ID in hex

const chain = arbitrumSepolia;
const entryPoint = getEntryPoint("0.7");
const kernelVersion = KERNEL_V3_1;

export async function initSmartAccountClient() {
  try {
    // Web3Auth configuration
    const privateKeyProvider = new EthereumPrivateKeyProvider({
      config: {
        chainConfig: {
          chainNamespace: "eip155",
          chainId: chainIdHex,
          rpcTarget: ZERODEV_RPC,
          displayName: "Arbitrum Sepolia",
          blockExplorerUrl: "https://sepolia.arbiscan.io",
          ticker: "ETH",
          tickerName: "Ethereum",
        },
      },
    });

    const web3auth = new Web3Auth({
      clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID!,
      web3AuthNetwork: "sapphire_devnet", // or "sapphire_mainnet" if in production
      chainConfig: {
        chainNamespace: "eip155",
        chainId: chainIdHex,
        rpcTarget: ZERODEV_RPC,
      },
      privateKeyProvider,
    });

    await web3auth.initModal();
    await web3auth.connect();

    let signer;
    const privateKey = (await privateKeyProvider.request({
      method: "eth_private_key",
    })) as string;
    if (!privateKey) throw new Error("Could not extract private key");

    if (privateKey) {
      signer = privateKeyToAccount(`0x${privateKey}`);
    } else {
      const rawKey = process.env.NEXT_PUBLIC_PRIVATE_KEY;
      if (!rawKey) throw new Error("Missing PRIVATE_KEY in environment");

      const normalizedKey = rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`;
      signer = privateKeyToAccount(normalizedKey as `0x${string}`);
    }

    const publicClient = createPublicClient({
      chain,
      transport: http(ZERODEV_RPC),
    });

    const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
      signer,
      entryPoint,
      kernelVersion,
    });

    const account = await createKernelAccount(publicClient, {
      plugins: {
        sudo: ecdsaValidator,
      },
      entryPoint,
      kernelVersion,
    });

    const zerodevPaymaster = createZeroDevPaymasterClient({
      chain,
      transport: http(ZERODEV_RPC),
    });

    const kernelClient = createKernelAccountClient({
      account,
      chain,
      bundlerTransport: http(ZERODEV_RPC),
      client: publicClient,
      paymaster: {
        getPaymasterData(userOperation) {
          return zerodevPaymaster.sponsorUserOperation({ userOperation });
        },
      },
    });

    return kernelClient;
  } catch (error) {
    console.error("Failed to initialize ZeroDev smart account client:", error);
    throw error;
  }
}
