import fs from 'fs';
import path from 'path';

import cliProgress from 'cli-progress';
import got from 'got';
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';

import { Data, Metadata } from './metaplex/classes';
import { METADATA_PROGRAM_ID } from './metaplex/constants';
import { decodeMetadata } from './metaplex/metadata';

const METADATA_PROGRAM_PK = new PublicKey(METADATA_PROGRAM_ID);
const OUTPUT_DIR = './results';

interface MintData {
  imageUri?: string;
  mintWalletAddress: string;
  nftData: Data;
  tokenMetadata: Metadata;
  totalSupply: number;
}

async function retrieveMetadata(accountData) {
  const tokenMetadata = decodeMetadata(accountData);
  const nftInfoResponse = await got(tokenMetadata.data.uri);

  return {
    nftData: JSON.parse(nftInfoResponse.body),
    tokenMetadata,
  };
}

(async function () {
  const mintWalletAddress = 'AuTF3kgAyBzsfjGcNABTSzzXK4bVcZcyZJtpCrayxoVp'; // snek wallet mint

  const conn = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
  const response = await conn.getProgramAccounts(METADATA_PROGRAM_PK, {
    filters: [
      {
        memcmp: {
          offset: 326,
          bytes: mintWalletAddress,
        },
      },
    ],
  });

  const totalSupply = response.length;
  console.log('Mint Wallet Address: ', mintWalletAddress);
  console.log('Total Supply: ', totalSupply);

  const progressBar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic
  );

  progressBar.start(totalSupply, 0);

  if (!totalSupply) {
    progressBar.stop();
    return;
  }

  const mintTokenIds = [];
  const mints: MintData[] = [];

  for (const record of response) {
    const { nftData, tokenMetadata } = await retrieveMetadata(
      record.account.data
    );

    const mintData = {
      imageUri: nftData?.image,
      mintWalletAddress,
      nftData,
      tokenMetadata,
      totalSupply,
    };

    mintTokenIds.push(tokenMetadata.mint);
    mints.push(mintData);

    progressBar.increment();
  }

  progressBar.stop();

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
  }

  fs.writeFileSync(
    path.join(OUTPUT_DIR, `mint-token-ids:${mintWalletAddress}.json`),
    JSON.stringify(mintTokenIds),
    'utf-8'
  );

  fs.writeFileSync(
    path.join(OUTPUT_DIR, `mint-data:${mintWalletAddress}.json`),
    JSON.stringify(mints),
    'utf-8'
  );
})();
