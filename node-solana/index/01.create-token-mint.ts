import { createMint } from "@solana/spl-token";
import "dotenv/config";
import {
  getKeypairFromEnvironment,
  getExplorerLink,
} from "@solana-developers/helpers";
import { Connection, clusterApiUrl, Keypair } from "@solana/web3.js";

interface TokenConfig {
  decimals: number;
  freezeAuthority: Keypair | null;
}

class TokenMintService {
  private connection: Connection;
  private user: Keypair;

  constructor() {
    this.connection = new Connection(clusterApiUrl("devnet"));
    this.user = getKeypairFromEnvironment("SECRET_KEY");
  }

  /**
   * Creates a new token mint
   * @param config Token configuration
   * @returns Token mint address
   */
  public async createTokenMint(config: TokenConfig = { decimals: 2, freezeAuthority: null }) {
    try {
      console.log("\n🚀 Starting token mint creation...");
      console.log(`👤 Authority: ${this.user.publicKey.toBase58()}`);

      // Create the token mint
      const tokenMint = await createMint(
        this.connection,
        this.user,              // Payer
        this.user.publicKey,    // Mint authority
        config.freezeAuthority?.publicKey || null,  // Freeze authority
        config.decimals         // Decimals
      );

      // Log success
      const link = getExplorerLink("address", tokenMint.toString(), "devnet");
      console.log("\n✅ Token mint created successfully!");
      console.log(`🔍 Token Mint Address: ${tokenMint.toString()}`);
      console.log(`🌐 View on Explorer: ${link}\n`);

      return tokenMint;

    } catch (error) {
      console.error("\n❌ Error creating token mint:");
      if (error instanceof Error) {
        console.error(`   ${error.message}`);
      } else {
        console.error(`   ${error}`);
      }
      process.exit(1);
    }
  }
}

/**
 * Main function to create a new token mint
 */
async function main() {
  try {
    const tokenService = new TokenMintService();
    
    // Configure token parameters
    const tokenConfig: TokenConfig = {
      decimals: 9,           // 2 decimal places
      freezeAuthority: null  // No freeze authority
    };

    // Create the token mint
    await tokenService.createTokenMint(tokenConfig);

  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  }
}

// Execute main function
main().catch(console.error);
