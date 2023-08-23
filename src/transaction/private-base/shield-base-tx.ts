import {
  NetworkName,
  RailgunERC20Amount,
  RailgunERC20AmountRecipient,
  TransactionGasDetails,
} from "@railgun-community/shared-models";
import {
  getShieldPrivateKeySignatureMessage,
  gasEstimateForShieldBaseToken,
  populateShieldBaseToken,
} from "@railgun-community/wallet";
import { Wallet, formatUnits, keccak256 } from "ethers";
import { getWrappedTokenInfoForChain } from "../../network/network-util";
import {
  calculateEstimatedGasCost,
  getPublicGasDetails,
} from "../../gas/gas-util";
import { PrivateGasEstimate } from "../../models/transaction-models";
import { getCurrentShieldPrivateKey } from "../../wallet/public-utils";

export const getShieldBaseTokenGasDetails = async (
  chainName: NetworkName,
  wrappedERC20Amount: RailgunERC20AmountRecipient,
): Promise<PrivateGasEstimate> => {
  const { shieldPrivateKey, fromWalletAddress } =
    await getCurrentShieldPrivateKey();

  const wrappedInfo = getWrappedTokenInfoForChain(chainName);

  const { gasEstimate } = await gasEstimateForShieldBaseToken(
    chainName,
    wrappedERC20Amount.recipientAddress,
    shieldPrivateKey,
    wrappedERC20Amount,
    fromWalletAddress,
  );
  const gasDetails = (await getPublicGasDetails(
    chainName,
    gasEstimate,
    true,
  )) as TransactionGasDetails;

  const _estimatedCost = calculateEstimatedGasCost(gasDetails);
  const formattedCost = parseFloat(
    formatUnits(_estimatedCost, wrappedInfo.decimals),
  );

  return {
    symbol: wrappedInfo.symbol,
    overallBatchMinGasPrice: 0n,
    estimatedGasDetails: gasDetails,
    estimatedCost: formattedCost,
    relayerFeeERC20Recipient: undefined,
  };
};

export const getProvedShieldBaseTokenTransaction = async (
  chainName: NetworkName,
  wrappedERC20Amount: RailgunERC20AmountRecipient,
  privateGasEstimate: PrivateGasEstimate,
) => {
  const { shieldPrivateKey, fromWalletAddress } =
    await getCurrentShieldPrivateKey();
  const { transaction } = await populateShieldBaseToken(
    chainName,
    wrappedERC20Amount.recipientAddress,
    shieldPrivateKey,
    wrappedERC20Amount,
    privateGasEstimate.estimatedGasDetails,
  );

  // Public wallet to shield from.
  transaction.from = fromWalletAddress;
  return transaction;
};
