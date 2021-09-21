import got from 'got';
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';

import { Metadata } from './metaplex/classes';
import { METADATA_PROGRAM_ID } from './metaplex/constants';
import { decodeMetadata } from './metaplex/metadata';

const METADATA_PROGRAM_PK = new PublicKey(METADATA_PROGRAM_ID);

interface MintData {
  metadata: Metadata;
  attributes: any;
  imageUri?: string;
}

(async function () {
  const mintWallet = 'AuTF3kgAyBzsfjGcNABTSzzXK4bVcZcyZJtpCrayxoVp'; // snek wallet mint

  const conn = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
  const response = await conn.getProgramAccounts(METADATA_PROGRAM_PK, {
    filters: [
      {
        memcmp: {
          offset: 326,
          bytes: mintWallet,
        },
      },
    ],
  });

  console.log('Found: ', response.length);

  const mintTokenIds = [];
  const mints: MintData[] = [];

  for (const record of response) {
    const solMetadata = decodeMetadata(record.account.data);
    const nftInfoResponse = await got(solMetadata.data.uri);
    const attrs = JSON.parse(nftInfoResponse.body);

    const mintData = {
      metadata: solMetadata,
      attributes: attrs,
      imageUri: attrs?.image,
    };

    mintTokenIds.push(solMetadata.mint);
    mints.push(mintData);
  }

  console.log(mintTokenIds);
})();
