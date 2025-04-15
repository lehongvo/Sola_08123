import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair } from '@solana/web3.js'
import { Voting } from '../target/types/Voting'

describe('Voting', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Voting as Program<Voting>

  const VotingKeypair = Keypair.generate()

  it('Initialize Voting', async () => {
    await program.methods
      .initialize()
      .accounts({
        Voting: VotingKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([VotingKeypair])
      .rpc()

    const currentCount = await program.account.Voting.fetch(VotingKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment Voting', async () => {
    await program.methods.increment().accounts({ Voting: VotingKeypair.publicKey }).rpc()

    const currentCount = await program.account.Voting.fetch(VotingKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment Voting Again', async () => {
    await program.methods.increment().accounts({ Voting: VotingKeypair.publicKey }).rpc()

    const currentCount = await program.account.Voting.fetch(VotingKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement Voting', async () => {
    await program.methods.decrement().accounts({ Voting: VotingKeypair.publicKey }).rpc()

    const currentCount = await program.account.Voting.fetch(VotingKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set Voting value', async () => {
    await program.methods.set(42).accounts({ Voting: VotingKeypair.publicKey }).rpc()

    const currentCount = await program.account.Voting.fetch(VotingKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the Voting account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        Voting: VotingKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.Voting.fetchNullable(VotingKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
