/* NOTE: this is a partial rewrite from metaplex js code

   https://github.com/metaplex-foundation/metaplex/tree/master/js/packages/common
*/

import { PublicKey } from '@solana/web3.js';

import { METADATA_PROGRAM_ID } from './constants';
import { EDITION, METADATA_PREFIX, StringPublicKey } from './types';

export const findProgramAddressPublicKey = async (
  seeds,
  programId
): Promise<PublicKey> => {
  const result = await PublicKey.findProgramAddress(seeds, programId);
  return result[0];
};

export async function getProgramAddressForPublicKey({
  metadataContractPK = new PublicKey(METADATA_PROGRAM_ID),
  tokenMintPK,
}: {
  metadataContractPK?: PublicKey;
  tokenMintPK: PublicKey | StringPublicKey;
}): Promise<StringPublicKey> {
  const tokenMintPublicKey = (tokenMintPK as StringPublicKey)
    ? new PublicKey(tokenMintPK)
    : <PublicKey>tokenMintPK;

  const publicKeyForMint = await findProgramAddressPublicKey(
    [
      Buffer.from(METADATA_PREFIX),
      metadataContractPK.toBuffer(),
      tokenMintPublicKey.toBuffer(),
      Buffer.from(EDITION),
    ],
    metadataContractPK
  );

  return publicKeyForMint.toString();
}
