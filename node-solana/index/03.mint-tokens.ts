import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import "dotenv/config";
import {
  getExplorerLink,
  getKeypairFromEnvironment,
} from "@solana-developers/helpers";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";

// mintTo() doesn't default to a commitment level (unlike, say, sendAndConfirmTransaction() ), so we need to specify it
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Our token has two decimal places
const MINOR_UNITS_PER_MAJOR_UNITS = Math.pow(10, 9);

const user = getKeypairFromEnvironment("SECRET_KEY");

// Token mint address from our previous steps
const tokenMintAccount = new PublicKey("4RCiTSshoBjJ4eJvtR6vDf2RepFokVQ83c4ZgYGaRZHS");

async function mintTokens() {
  try {
    console.log(`🔑 Using keypair: ${user.publicKey.toBase58()}`);
    console.log(`🪙 Token Mint Address: ${tokenMintAccount.toString()}`);

    // Get or create the Associated Token Account to hold the tokens
    console.log(`\n👛 Getting/Creating Associated Token Account...`);
    const recipientAssociatedTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      user,
      tokenMintAccount,
      user.publicKey
    );
    console.log(`✅ Associated Token Account: ${recipientAssociatedTokenAccount.address.toString()}`);

    // Mint 10 tokens (with 2 decimal places)
    console.log(`\n💰 Minting 10 tokens...`);
    const transactionSignature = await mintTo(
      connection,
      user,
      tokenMintAccount,
      recipientAssociatedTokenAccount.address,
      user,
      10 * MINOR_UNITS_PER_MAJOR_UNITS
    );

    const link = getExplorerLink("transaction", transactionSignature, "devnet");
    console.log(`\n✅ Success! Mint Token Transaction: ${link}`);
    console.log(`   View token: ${getExplorerLink("address", tokenMintAccount.toString(), "devnet")}`);

  } catch (error) {
    console.error("\n❌ Error minting tokens:", error);
    process.exit(1);
  }
}

// Execute main function
mintTokens().catch(console.error);
