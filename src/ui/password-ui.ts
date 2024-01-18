import { isDefined } from "@railgun-community/shared-models";
import { computePasswordHash, hashString } from "../util/crypto";
import { WalletManager } from "../wallet/wallet-manager";
import { confirmPrompt } from "./confirm-ui";
const { Password } = require("enquirer");
import * as dotenv from 'dotenv';
import { env } from "process";
dotenv.config();

export const getPasswordPrompt = async (
  message: string,
  _options?: object,
  passwordSalt?: string,
): Promise<string | undefined> => {
  const options = _options ?? {};
  const result = process.env.PASSWORD;
  if (!isDefined(result)) {
    return undefined;
  }
  return computePasswordHash(result, 32, passwordSalt);
};

export const confirmGetPasswordPrompt = async (
  walletManager: WalletManager,
  options?: object,
): Promise<boolean> => {
  const refPassword = await getPasswordPrompt(
    "Confirm your password:",
    {
      validate: (value: string) => {
        return value !== "" && value !== " " && value.length >= 8;
      },
    },
    walletManager.saltedPassword,
  );
  if (isDefined(refPassword)) {
    const computedHash = await hashString(refPassword);
    return computedHash === walletManager.comparisonRefHash;
  }

  return false;
};
