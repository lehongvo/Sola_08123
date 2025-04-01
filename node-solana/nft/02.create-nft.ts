import {
  createNft,
  fetchDigitalAsset,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  generateSigner,
  keypairIdentity,
  percentAmount,
  publicKey,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  airdropIfRequired,
  getExplorerLink,
  getKeypairFromEnvironment,
} from "@solana-developers/helpers";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import "dotenv/config";

const createNftMint = async () => {
  try {
    const connection = new Connection(clusterApiUrl("devnet"));
    const user = getKeypairFromEnvironment("SECRET_KEY");

    const signature = await airdropIfRequired(
      connection,
      user.publicKey,
      10 * LAMPORTS_PER_SOL,
      3 * LAMPORTS_PER_SOL
    );
    if (signature) {
      console.log(`\n💸 Airdrop Signature: ${signature}`);
    }

    console.log(`\n🔑 Using keypair: ${user.publicKey.toBase58()}`);
    const umi = createUmi(connection.rpcEndpoint);
    umi.use(mplTokenMetadata());
    const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
    umi.use(keypairIdentity(umiUser));
    console.log("Set up Umi instance for user");

    const collectionAddress = publicKey(
      "JDW8oK7JMwybBmFRd9qL7mPaSB9HYohWn4ipSAHYB9ur"
    );
    console.log(`Creating NFT...`);

    const collectionMint = generateSigner(umi);
    const transaction = await createNft(umi, {
      mint: collectionMint,
      name: "NFT 01",
      symbol: "NFT",
      uri: "https://raw.githubusercontent.com/solana-developers/professional-education/main/labs/sample-nft-offchain-data.json",
      sellerFeeBasisPoints: percentAmount(0),
      collection: {
        key: collectionAddress,
        verified: false,
      },
    });
    await transaction.sendAndConfirm(umi);
    console.log(`\n✅ Collection NFT created!`);
    const createdNft = await fetchDigitalAsset(umi, collectionMint.publicKey);
    console.log(
      `Created Collection 📦! Address is ${getExplorerLink(
        "address",
        createdNft.mint.publicKey,
        "devnet"
      )}`
    );
  } catch (error) {
    console.error("\n❌ Error creating collection:");
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    } else {
      console.error(`   ${error}`);
    }
  }
};

const main = async () => {
  while (true) {
    try {
      await createNftMint();
    } catch (error) {
      console.error("Error creating collection. Retrying...");
    }
  }
};

main();
