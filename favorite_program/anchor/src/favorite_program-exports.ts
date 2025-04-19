// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import FavoriteProgramIDL from '../target/idl/favorite_program.json'
import type { FavoriteProgram } from '../target/types/favorite_program'

// Re-export the generated IDL and type
export { FavoriteProgram, FavoriteProgramIDL }

// The programId is imported from the program IDL.
export const FAVORITE_PROGRAM_PROGRAM_ID = new PublicKey(FavoriteProgramIDL.address)

// This is a helper function to get the FavoriteProgram Anchor program.
export function getFavoriteProgramProgram(provider: AnchorProvider, address?: PublicKey) {
  return new Program({ ...FavoriteProgramIDL, address: address ? address.toBase58() : FavoriteProgramIDL.address } as FavoriteProgram, provider)
}

// This is a helper function to get the program ID for the FavoriteProgram program depending on the cluster.
export function getFavoriteProgramProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the FavoriteProgram program on devnet and testnet.
      return new PublicKey('coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF')
    case 'mainnet-beta':
    default:
      return FAVORITE_PROGRAM_PROGRAM_ID
  }
}
