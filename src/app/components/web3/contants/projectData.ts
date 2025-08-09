// Contract addresses
import deployedAddresses from "../../../../../deployments/chain-421614/deployed_addresses.json";

// Contract ABIs
import TestUSDT from "../../../../../artifacts/contracts/TestUSDT.sol/TestUSDT.json";
import ZaaNetNetwork from "../../../../../deployments/chain-421614/artifacts/ZaaNetDeploymentModule#ZaaNetNetwork.json";
import ZaaNetPayment from "../../../../../deployments/chain-421614/artifacts/ZaaNetDeploymentModule#ZaaNetPayment.json";
import ZaaNetAdmin from "../../../../../deployments/chain-421614/artifacts/ZaaNetDeploymentModule#ZaaNetAdmin.json";
import ZaaNetStorage from "../../../../../deployments/chain-421614/artifacts/ZaaNetDeploymentModule#ZaaNetStorage.json";
import ZaaNetVoucher from "../../../../../deployments/chain-421614/artifacts/ZaaNetDeploymentModule#ZaaNetVoucher.json";

export const zaanetNetwork_CA = deployedAddresses["ZaaNetDeploymentModule#ZaaNetNetwork"];
export const usdt_CA = "0x1A14a686567945626350481fC07Ec24767d1A640";
export const zaanetPayment_CA = deployedAddresses["ZaaNetDeploymentModule#ZaaNetPayment"];
export const zaanetAdmin_CA = deployedAddresses["ZaaNetDeploymentModule#ZaaNetAdmin"];
export const zaanetStorage_CA = deployedAddresses["ZaaNetDeploymentModule#ZaaNetStorage"];
export const zaanetVoucher_CA = deployedAddresses["ZaaNetDeploymentModule#ZaaNetVoucher"];



export const usdtAbi = TestUSDT.abi;
export const network_Abi = ZaaNetNetwork.abi;
export const payment_Abi = ZaaNetPayment.abi;
export const admin_Abi = ZaaNetAdmin.abi;
export const storage_Abi = ZaaNetStorage.abi;
export const voucher_Abi = ZaaNetVoucher.abi;