import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair, PublicKey } from '@solana/web3.js'
import { Voting } from '../target/types/Voting'
import { expect } from 'chai'
import BN from 'bn.js'

describe('Voting', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Voting as Program<Voting>

  const pollId = new BN(1)
  const candidateId = new BN(1)
  const pollName = "Test Poll"
  const pollDescription = "This is a test poll"
  const currentTime = Math.floor(Date.now() / 1000)
  const pollStartTime = new BN(currentTime)
  const pollEndTime = new BN(currentTime + 3600) // 1 hour later
  const candidateName = "Test Candidate"
  const candidateDescription = "This is a test candidate"

  it('Initialize Poll', async () => {
    const [pollPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("poll"), Buffer.from(pollId.toString())],
      program.programId
    )

    await program.methods
      .initializePoll(pollId, pollName, pollDescription, pollStartTime, pollEndTime)
      .accounts({
        pollAccount: pollPda,
        payer: payer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc()

    const pollAccount = await program.account.poll.fetch(pollPda)
    expect(pollAccount.pollId.toString()).to.equal(pollId.toString())
    expect(pollAccount.pollName).to.equal(pollName)
    expect(pollAccount.pollDescription).to.equal(pollDescription)
    expect(pollAccount.pollStartTime.toString()).to.equal(pollStartTime.toString())
    expect(pollAccount.pollEndTime.toString()).to.equal(pollEndTime.toString())
    expect(pollAccount.pollIsFinished).to.be.false
    expect(pollAccount.totalVotes.toString()).to.equal('0')
  })

  it('Initialize Candidate', async () => {
    const [pollPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("poll"), Buffer.from(pollId.toString())],
      program.programId
    )
    const [candidatePda] = PublicKey.findProgramAddressSync(
      [Buffer.from(pollId.toString()), Buffer.from(candidateId.toString())],
      program.programId
    )

    await program.methods
      .initializeCandidate(candidateId, candidateName, candidateDescription)
      .accounts({
        pollAccount: pollPda,
        candidateAccount: candidatePda,
        payer: payer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc()

    const candidateAccount = await program.account.candidate.fetch(candidatePda)
    expect(candidateAccount.candidateId.toString()).to.equal(candidateId.toString())
    expect(candidateAccount.candidateName).to.equal(candidateName)
    expect(candidateAccount.candidateDescription).to.equal(candidateDescription)
    expect(candidateAccount.candidateVotes.toString()).to.equal('0')
  })

  it('Vote for Candidate', async () => {
    const [pollPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("poll"), Buffer.from(pollId.toString())],
      program.programId
    )
    const [candidatePda] = PublicKey.findProgramAddressSync(
      [Buffer.from(pollId.toString()), Buffer.from(candidateId.toString())],
      program.programId
    )
    const [voteRecordPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vote"), Buffer.from(pollId.toString()), payer.publicKey.toBuffer()],
      program.programId
    )

    await program.methods
      .vote(pollId, candidateId)
      .accounts({
        pollAccount: pollPda,
        candidateAccount: candidatePda,
        voteRecord: voteRecordPda,
        payer: payer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc()

    const pollAccount = await program.account.poll.fetch(pollPda)
    const candidateAccount = await program.account.candidate.fetch(candidatePda)
    const voteRecord = await program.account.voteRecord.fetch(voteRecordPda)

    expect(pollAccount.totalVotes.toString()).to.equal('1')
    expect(candidateAccount.candidateVotes.toString()).to.equal('1')
    expect(voteRecord.pollId.toString()).to.equal(pollId.toString())
    expect(voteRecord.voter.equals(payer.publicKey)).to.be.true
  })

  it('Cannot vote twice', async () => {
    const [pollPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("poll"), Buffer.from(pollId.toString())],
      program.programId
    )
    const [candidatePda] = PublicKey.findProgramAddressSync(
      [Buffer.from(pollId.toString()), Buffer.from(candidateId.toString())],
      program.programId
    )
    const [voteRecordPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vote"), Buffer.from(pollId.toString()), payer.publicKey.toBuffer()],
      program.programId
    )

    try {
      await program.methods
        .vote(pollId, candidateId)
        .accounts({
          pollAccount: pollPda,
          candidateAccount: candidatePda,
          voteRecord: voteRecordPda,
          payer: payer.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc()
      expect.fail('Expected error was not thrown')
    } catch (err) {
      if (err instanceof Error) {
        expect(err.toString()).to.include('AlreadyVoted')
      } else {
        expect.fail('Error is not an instance of Error')
      }
    }
  })
})
