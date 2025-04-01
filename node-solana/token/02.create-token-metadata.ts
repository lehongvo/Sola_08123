// This uses "@metaplex-foundation/mpl-token-metadata@2" to create tokens
import "dotenv/config";
import {
  getKeypairFromEnvironment,
  getExplorerLink,
} from "@solana-developers/helpers";
import {
  Connection,
  clusterApiUrl,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import pkg from '@metaplex-foundation/mpl-token-metadata';
const { createCreateMetadataAccountV3Instruction } = pkg;

// Constants
const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
const TOKEN_MINT_ADDRESS = new PublicKey("6zZxyDP8S85LcYdvTjJFMs7Vtg8diUtuSDWG38vDS32V");

// Token metadata configuration
const TOKEN_METADATA = {
  name: "VincentVo02",
  symbol: "VVO02",
  uri: "https://raw.githubusercontent.com/mikemaccana/token-command-line/main/metadata.json",
  sellerFeeBasisPoints: 0,
  creators: null,
  collection: null,
  uses: null
};

/**
 * Derives the Metadata PDA (Program Derived Address) for a token
 * @param mintAddress The token's mint address
 * @returns The PDA where metadata will be stored
 */
const deriveMetadataPDA = (mintAddress: PublicKey): PublicKey => {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      METADATA_PROGRAM_ID.toBuffer(),
      mintAddress.toBuffer(),
    ],
    METADATA_PROGRAM_ID
  );
  return pda;
};

/**
 * Creates a transaction instruction to create metadata for a token
 * @param metadataPDA The PDA where metadata will be stored
 * @param mintAddress The token's mint address
 * @param authority The authority that can modify the metadata
 * @returns Transaction instruction
 */
const createMetadataInstruction = (
  metadataPDA: PublicKey,
  mintAddress: PublicKey,
  authority: PublicKey
) => {
  return createCreateMetadataAccountV3Instruction(
    {
      metadata: metadataPDA,
      mint: mintAddress,
      mintAuthority: authority,
      payer: authority,
      updateAuthority: authority,
    },
    {
      createMetadataAccountArgsV3: {
        data: {
          name: TOKEN_METADATA.name,
          symbol: TOKEN_METADATA.symbol,
          uri: TOKEN_METADATA.uri,
          sellerFeeBasisPoints: TOKEN_METADATA.sellerFeeBasisPoints,
          creators: TOKEN_METADATA.creators,
          collection: TOKEN_METADATA.collection,
          uses: TOKEN_METADATA.uses
        },
        isMutable: true,
        collectionDetails: null
      }
    }
  );
};

/**
 * Main function to create metadata for a token
 */
const main = async () => {
  try {
    // Initialize connection and get user keypair
    const connection = new Connection(clusterApiUrl("devnet"));
    const user = getKeypairFromEnvironment("SECRET_KEY");

    console.log(
      `🔑 Using keypair: ${user.publicKey.toBase58()}`
    );

    // Derive metadata PDA
    const metadataPDA = deriveMetadataPDA(TOKEN_MINT_ADDRESS);
    console.log(`📝 Creating metadata at: ${metadataPDA.toString()}`);

    // Create and send transaction
    const transaction = new Transaction().add(
      createMetadataInstruction(metadataPDA, TOKEN_MINT_ADDRESS, user.publicKey)
    );

    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [user]
    );

    // Log results
    console.log(
      `✅ Metadata created! View transaction: ${getExplorerLink("transaction", signature, "devnet")}`
    );
    console.log(
      `🪙 View token: ${getExplorerLink("address", TOKEN_MINT_ADDRESS.toString(), "devnet")}`
    );

  } catch (error) {
    console.error("❌ Error creating metadata:", error);
    process.exit(1);
  }
};

// Execute main function
main().catch(console.error);