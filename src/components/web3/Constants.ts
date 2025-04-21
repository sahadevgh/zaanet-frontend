import { ethers, InterfaceAbi } from "ethers";

export const ZAANET_CONTRACT_ADDRESS =
  "0x95da2040CA6dC80D1b0D8C4c3dcE05B649554190";
export const DEPLOYER_WALLET = "0x6D108C5084c378E7e74531424f5eeE0b7c34fD59";

export const getContract = async (
  Contract_Address: string,
  abi: InterfaceAbi
) => {
  if (typeof window !== "undefined" && window.ethereum) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(Contract_Address, abi, signer);
    return contract;
  } else {
    console.error("Ethereum provider not found");
    return null;
  }
};
