import { address, Address, getProgramDerivedAddress } from '@solana/addresses';
import { getStringEncoder, getU8Encoder } from '@solana/codecs';
import bs58 from 'bs58';

export const findFeeVaultPda = async (stateAccount: Address) => {
  // Last byte of mint address is the fee vault shard number.
  const bytes = bs58.decode(stateAccount);
  const lastByte = bytes[bytes.length - 1];

  return await getProgramDerivedAddress({
    programAddress: address('TFEEgwDP6nn1s8mMX2tTNPPz8j2VomkphLUmyxKm17A'),
    seeds: [
      getStringEncoder({ size: 'variable' }).encode('fee_vault'),
      getU8Encoder().encode(lastByte),
    ],
  });
};
