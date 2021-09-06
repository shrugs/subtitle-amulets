import { utils } from 'ethers';

export interface Amulet {
  value: string;
  hash: string;
  count: number;
}

const getAmuletCount = (hash: string): number => {
  const matches = hash.match(/(8)\1*/g);
  if (!matches) return 0;
  return Math.max(...matches.map((match) => match.length));
};
const isValidAmuletCount = (count: number) => count >= 4;

export const toValidAmulet = (value: string): Amulet | undefined => {
  const bytes = utils.toUtf8Bytes(value);
  if (bytes.length > 64) return;

  const hash = utils.sha256(bytes);
  const count = getAmuletCount(hash);
  if (!isValidAmuletCount(count)) return;

  return { value, hash, count };
};
