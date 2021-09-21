import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';

import { METADATA_PROGRAM_ID } from './metaplex/constants';
import { decodeMetadata } from './metaplex/metadata';

const METADATA_PROGRAM_PK = new PublicKey(METADATA_PROGRAM_ID);

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
  for (const record of response) {
    const solMetadata = decodeMetadata(record.account.data);

    mintTokenIds.push(solMetadata.mint);
  }

  console.log(mintTokenIds);
})();
