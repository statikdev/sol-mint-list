import cliProgress from 'cli-progress';
import got from 'got';
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';

import { Metadata } from './metaplex/classes';
import { METADATA_PROGRAM_ID } from './metaplex/constants';
import { decodeMetadata } from './metaplex/metadata';

const METADATA_PROGRAM_PK = new PublicKey(METADATA_PROGRAM_ID);

interface MintData {
  mintWalletAddress: string;
  metadata: Metadata;
  attributes: any;
  imageUri?: string;
  totalSupply: number;
}

(async function () {
  const mintWalletAddress = 'AuTF3kgAyBzsfjGcNABTSzzXK4bVcZcyZJtpCrayxoVp'; // snek wallet mint

  const progressBar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic
  );

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
  console.log('Found: ', totalSupply);

  progressBar.start(totalSupply, 0);

  if (!totalSupply) {
    progressBar.stop();
    return;
  }

  const mintTokenIds = [];
  const mints: MintData[] = [];

  for (const record of response) {
    const solMetadata = decodeMetadata(record.account.data);
    const nftInfoResponse = await got(solMetadata.data.uri);
    const attrs = JSON.parse(nftInfoResponse.body);

    const mintData = {
      attributes: attrs,
      imageUri: attrs?.image,
      metadata: solMetadata,
      mintWalletAddress,
      totalSupply,
    };

    mintTokenIds.push(solMetadata.mint);
    mints.push(mintData);

    progressBar.increment();
  }

  progressBar.stop();

  console.log(mintTokenIds);
})();
