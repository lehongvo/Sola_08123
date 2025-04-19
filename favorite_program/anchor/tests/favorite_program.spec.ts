import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair } from '@solana/web3.js'
import { FavoriteProgram } from '../target/types/favorite_program'

describe('favorite_program', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.FavoriteProgram as Program<FavoriteProgram>

  const favorite_programKeypair = Keypair.generate()

  it('Initialize FavoriteProgram', async () => {
    await program.methods
      .initialize()
      .accounts({
        favorite_program: favorite_programKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([favorite_programKeypair])
      .rpc()

    const currentCount = await program.account.favorite_program.fetch(favorite_programKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment FavoriteProgram', async () => {
    await program.methods.increment().accounts({ favorite_program: favorite_programKeypair.publicKey }).rpc()

    const currentCount = await program.account.favorite_program.fetch(favorite_programKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment FavoriteProgram Again', async () => {
    await program.methods.increment().accounts({ favorite_program: favorite_programKeypair.publicKey }).rpc()

    const currentCount = await program.account.favorite_program.fetch(favorite_programKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement FavoriteProgram', async () => {
    await program.methods.decrement().accounts({ favorite_program: favorite_programKeypair.publicKey }).rpc()

    const currentCount = await program.account.favorite_program.fetch(favorite_programKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set favorite_program value', async () => {
    await program.methods.set(42).accounts({ favorite_program: favorite_programKeypair.publicKey }).rpc()

    const currentCount = await program.account.favorite_program.fetch(favorite_programKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the favorite_program account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        favorite_program: favorite_programKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.favorite_program.fetchNullable(favorite_programKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
