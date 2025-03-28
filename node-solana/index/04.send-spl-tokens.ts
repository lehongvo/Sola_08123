import "dotenv/config";
import {
  getExplorerLink,
  getKeypairFromEnvironment,
} from "@solana-developers/helpers";
import { Connection, PublicKey, clusterApiUrl, Transaction } from "@solana/web3.js";
import { 
  getOrCreateAssociatedTokenAccount, 
  createTransferInstruction,
  getAssociatedTokenAddress,
  getAccount,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction
} from "@solana/spl-token";

async function sendTokens() {
  try {
    // Initialize connection with commitment level
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const sender = getKeypairFromEnvironment("SECRET_KEY");

    console.log(`🔑 Sender: ${sender.publicKey.toBase58()}`);

    // Recipient address
    const recipient = new PublicKey("HC5zjbXBWVsNWEq79v1xpPuHaT8J1YRWEFVbVoD3jSFZ");
    console.log(`👤 Recipient: ${recipient.toBase58()}`);

    // Token mint address
    const tokenMintAccount = new PublicKey("4RCiTSshoBjJ4eJvtR6vDf2RepFokVQ83c4ZgYGaRZHS");
    console.log(`🪙 Token: ${tokenMintAccount.toString()}`);

    // Our token has two decimal places
    const MINOR_UNITS_PER_MAJOR_UNITS = Math.pow(10, 2);

    console.log(`\n💸 Preparing to send 1 token...`);

    // Get the source token account address
    const sourceATA = await getAssociatedTokenAddress(
      tokenMintAccount,
      sender.publicKey
    );

    // Create a new transaction
    const transaction = new Transaction();

    try {
      // Try to get the source account info
      await getAccount(connection, sourceATA);
      console.log(`✅ Source Token Account exists: ${sourceATA.toString()}`);
    } catch (error) {
      console.error("\n❌ Source token account not found. Please mint some tokens first using:");
      console.error("   npx ts-node --esm index/03.mint-tokens.ts");
      process.exit(1);
    }

    // Get or create destination token account
    console.log(`\n👛 Setting up destination token account...`);
    const destinationATA = await getAssociatedTokenAddress(
      tokenMintAccount,
      recipient
    );

    try {
      // Check if destination account exists
      await getAccount(connection, destinationATA);
      console.log(`✅ Destination Token Account exists: ${destinationATA.toString()}`);
    } catch {
      // If not, add instruction to create it
      console.log(`📝 Creating Destination Token Account...`);
      transaction.add(
        createAssociatedTokenAccountInstruction(
          sender.publicKey,
          destinationATA,
          recipient,
          tokenMintAccount
        )
      );
    }

    // Add transfer instruction
    console.log(`\n📤 Sending tokens...`);
    transaction.add(
      createTransferInstruction(
        sourceATA,
        destinationATA,
        sender.publicKey,
        1 * MINOR_UNITS_PER_MAJOR_UNITS
      )
    );

    // Send transaction
    const signature = await connection.sendTransaction(transaction, [sender]);
    await connection.confirmTransaction(signature, "confirmed");

    const explorerLink = getExplorerLink("transaction", signature, "devnet");
    console.log(`\n✅ Transaction confirmed!`);
    console.log(`   View transaction: ${explorerLink}`);
    console.log(`   View token: ${getExplorerLink("address", tokenMintAccount.toString(), "devnet")}`);

  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exit(1);
  }
}

// Execute main function
sendTokens().catch(console.error); 