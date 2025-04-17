// Migrations are an early feature. Currently, they're nothing more than this
// single deploy script that's invoked from the CLI, injecting a provider
// configured from the workspace's Anchor.toml.

import * as anchor from '@coral-xyz/anchor'
import { PublicKey, Connection, Keypair } from '@solana/web3.js'
import BN from 'bn.js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

const { Program, AnchorProvider } = anchor

// Load environment variables
dotenv.config()

async function main() {
  console.log("Deploy script starting...")
  
  // Get private key from .env
  const privateKeyArray = JSON.parse(process.env.PRIVATE_KEY || '[]')
  if (!Array.isArray(privateKeyArray) || privateKeyArray.length !== 64) {
    throw new Error('Invalid private key format')
  }
  const privateKey = new Uint8Array(privateKeyArray)
  const keypair = Keypair.fromSecretKey(privateKey)
  
  // Create connection to devnet
  const connection = new Connection(process.env.RPC || 'https://api.devnet.solana.com')
  
  // Create wallet from keypair
  const wallet = new anchor.Wallet(keypair)
  
  // Create provider
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  })
  
  // Configure client to use the provider
  anchor.setProvider(provider)

  // Load IDL
  const idlPath = path.resolve(process.cwd(), 'target/idl/voting.json')
  const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'))
  
  // Create program interface
  const program = new Program(idl, provider)
  const programId = program.programId
  console.log('Program ID:', programId.toString())

  try {
    // Create a unique poll ID
    const pollId = new BN(Date.now())
    console.log('Poll ID:', pollId.toString())
    
    // Derive PDA for poll account
    const [pollAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("poll"), Buffer.from(pollId.toString())],
      programId
    )
    console.log('Poll Account:', pollAccount.toString())

    // Initialize poll
    const currentTime = Math.floor(Date.now() / 1000)
    const startTime = new BN(currentTime)
    const endTime = new BN(currentTime + 86400) // 24 hours from now

    console.log("Creating poll...")
    const pollTx = await program.methods
      .initializePoll(
        pollId,
        "Test Poll",
        "This is a test poll",
        startTime,
        endTime
      )
      .accounts({
        payer: wallet.publicKey,
        pollAccount: pollAccount,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc()

    console.log("Poll created successfully!")
    console.log("Transaction signature:", pollTx)

    // Initialize candidates
    const candidates = [
      { id: new BN(1), name: "Candidate A", description: "First candidate" },
      { id: new BN(2), name: "Candidate B", description: "Second candidate" }
    ]

    for (const candidate of candidates) {
      const [candidateAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from(pollId.toString()), Buffer.from(candidate.id.toString())],
        programId
      )

      console.log(`Creating candidate ${candidate.name}...`)
      const candidateTx = await program.methods
        .initializeCandidate(
          candidate.id,
          candidate.name,
          candidate.description
        )
        .accounts({
          payer: wallet.publicKey,
          pollAccount: pollAccount,
          candidateAccount: candidateAccount,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc()

      console.log(`Candidate ${candidate.name} created successfully!`)
      console.log("Transaction signature:", candidateTx)
    }

    // Vote for the first candidate
    const firstCandidate = candidates[0]
    const [candidateAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from(pollId.toString()), Buffer.from(firstCandidate.id.toString())],
      programId
    )

    const [voteRecord] = PublicKey.findProgramAddressSync(
      [Buffer.from("vote"), Buffer.from(pollId.toString()), wallet.publicKey.toBuffer()],
      programId
    )

    console.log("Voting for first candidate...")
    const voteTx = await program.methods
      .vote(
        pollId,
        firstCandidate.id
      )
      .accounts({
        payer: wallet.publicKey,
        pollAccount: pollAccount,
        candidateAccount: candidateAccount,
        voteRecord: voteRecord,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc()

    console.log("Vote submitted successfully!")
    console.log("Transaction signature:", voteTx)

  } catch (error: any) {
    console.error("Error:", error.message)
    throw error
  }
}

main().catch(console.error)
