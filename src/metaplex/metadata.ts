/* NOTE: this is a copy from the metaplex repo for use in this project

   https://github.com/metaplex-foundation/metaplex/tree/master/js/packages/common
*/

import { PublicKey } from '@solana/web3.js';

import { deserializeUnchecked, BinaryReader, BinaryWriter } from 'borsh';
import base58 from 'bs58';

import { METADATA_SCHEMA, Metadata } from './classes';
import { StringPublicKey } from './types';

export const extendBorsh = () => {
  (BinaryReader.prototype as any).readPubkey = function () {
    const reader = this as unknown as BinaryReader;
    const array = reader.readFixedArray(32);
    return new PublicKey(array);
  };

  (BinaryWriter.prototype as any).writePubkey = function (value: any) {
    const writer = this as unknown as BinaryWriter;
    writer.writeFixedArray(value.toBuffer());
  };

  (BinaryReader.prototype as any).readPubkeyAsString = function () {
    const reader = this as unknown as BinaryReader;
    const array = reader.readFixedArray(32);
    return base58.encode(array) as StringPublicKey;
  };

  (BinaryWriter.prototype as any).writePubkeyAsString = function (
    value: StringPublicKey
  ) {
    const writer = this as unknown as BinaryWriter;
    writer.writeFixedArray(base58.decode(value));
  };
};

extendBorsh();

export const decodeMetadata = (buffer: Buffer): Metadata => {
  const metadata = deserializeUnchecked(
    METADATA_SCHEMA,
    Metadata,
    buffer
  ) as Metadata;

  metadata.data.name = metadata.data.name.replace(/\0/g, '');
  metadata.data.symbol = metadata.data.symbol.replace(/\0/g, '');
  metadata.data.uri = metadata.data.uri.replace(/\0/g, '');
  metadata.data.name = metadata.data.name.replace(/\0/g, '');
  return metadata;
};
