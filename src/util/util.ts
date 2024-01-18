import {
  NetworkName,
  RailgunERC20Amount,
} from "@railgun-community/shared-models";

import { formatUnits } from "ethers";
import { getTokenInfo } from "../balance/token-util";
import { RailgunReadableAmount } from "../models/balance-models";

const convertReadable = (tokenAmount: bigint, decimals: number) => {
  const converted = formatUnits(tokenAmount, decimals);
  return converted;
};

import { promises as fs } from 'fs';
import path from 'path';
import moment from 'moment';

// stringifyBigInts is a replacer function for JSON.stringify that converts
export function stringifyBigInts(key: string, value: any) {
  if (typeof value === 'bigint') {
      return value.toString();
  }
  return value;
}

export function getAMANAamount(events: any[]): string {
  for (const event of events) {
      if (event.erc20Amounts) {
          for (const amountEntry of event.erc20Amounts) {
              if (amountEntry.tokenAddress === "0xb7fa2208b49a65f9b9a85956fad7a3f361b248dd") {
                  return convertReadable(amountEntry.amount, 18);
              }
          }
      }
  }
  throw new Error(`Amount  not found`);
}

// Function to append log with timestamp
export async function appendLogWithTimestamp(message: string): Promise<void> {
    const logFilePath = path.join(__dirname, '..', 'LOG.txt');
    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss')
    const logEntry = `${timestamp}  :  ${message}\n`;

    try {
        await fs.appendFile(logFilePath, logEntry);
    } catch (err) {
      void 0;
    }
}

export const readablePrecision = (
  amount: bigint,
  decimals: number,
  precision: number,
) => {
  return parseFloat(formatUnits(amount, decimals)).toFixed(precision);
};

export const readableAmounts = async (
  tokenBalances: RailgunERC20Amount[],
  chainName: NetworkName,
): Promise<RailgunReadableAmount[]> => {
  const result = Promise.all(
    tokenBalances.map(async (balance) => {
      const { decimals, symbol, name } = await getTokenInfo(
        chainName,
        balance.tokenAddress,
      );

      const converted = convertReadable(balance.amount, decimals);

      return {
        ...balance,
        symbol,
        decimals,
        name,
        amountReadable: converted.toString() ?? "0",
      };
    }),
  );
  return result;
};

export const delay = (delayInMS: number): Promise<void> => {
  return new Promise((resolve) => {
    return setTimeout(resolve, delayInMS);
  });
};

export const throwError = (err: Error) => {
  throw err;
};

/*
 * Creates a promise that rejects in <ms> milliseconds
 */
export function promiseTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise((_resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error(`TIMEOUT: ${ms} ms.`));
    }, ms);
  });

  return Promise.race([promise, timeout])
    .then((result) => result as T)
    .catch((err) => {
      throw err;
    });
}

export const bigIntToHex = (n: bigint): string => {
  return `0x${n.toString(16)}`;
};

// only use for hex strings without 0x prefix.
export const hexToBigInt = (hexString: string) => {
  return BigInt(`0x${hexString}`);
};

export const maxBigInt = (b1: bigint, b2: bigint) => {
  return b1 > b2 ? b1 : b2;
};

export const minBigInt = (b1: bigint, b2: bigint) => {
  return b1 < b2 ? b1 : b2;
};

export function removeUndefineds<T>(a: Optional<T>[]): T[] {
  const newArray: T[] = [];
  for (const item of a) {
    if (item != null) {
      newArray.push(item);
    }
  }
  return newArray;
}
