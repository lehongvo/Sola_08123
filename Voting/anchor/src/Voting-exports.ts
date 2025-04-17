// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import VotingIDL from '../target/idl/Voting.json'
import type { Voting } from '../target/types/Voting'

// Re-export the generated IDL and type
export { Voting, VotingIDL }

// The programId is imported from the program IDL.
export const VOTING_PROGRAM_ID = new PublicKey(VotingIDL.address)

// This is a helper function to get the Voting Anchor program.
export function getVotingProgram(provider: AnchorProvider, address?: PublicKey) {
  return new Program({ ...VotingIDL, address: address ? address.toBase58() : VotingIDL.address } as Voting, provider)
}

// This is a helper function to get the program ID for the Voting program depending on the cluster.
export function getVotingProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Voting program on devnet and testnet.
      return new PublicKey('3bMs6aKSfpJKnm5yHSkoi9hu99Pcvh1yHK5w7RpopRKV')
    case 'mainnet-beta':
    default:
      return VOTING_PROGRAM_ID
  }
}
