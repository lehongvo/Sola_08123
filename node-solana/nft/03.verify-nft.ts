import {
  createNft,
  fetchDigitalAsset,
  findMetadataPda,
  mplTokenMetadata,
  verifyCollectionV1,
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
import { verify } from "crypto";
import "dotenv/config";

const verify_nft = async () => {
  try {
    const connection = new Connection(clusterApiUrl("devnet"));
    const user = getKeypairFromEnvironment("SECRET_KEY");

    console.log(`\n🔑 Using keypair: ${user.publicKey.toBase58()}`);
    const umi = createUmi(connection.rpcEndpoint);
    umi.use(mplTokenMetadata());
    const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
    umi.use(keypairIdentity(umiUser));
    console.log("Set up Umi instance for user");

    const collectionAddress = publicKey(
      "JDW8oK7JMwybBmFRd9qL7mPaSB9HYohWn4ipSAHYB9ur"
    );
    const nftAddress = publicKey("pgQ9hxazdZMi7gJ1fWQrULofT8kQubwgCSBtd6U9pZc");

    console.log(`Creating NFT...`);

    const collectionMint = generateSigner(umi);
    const transaction = await verifyCollectionV1(umi, {
      metadata: findMetadataPda(umi, { mint: nftAddress }),
      collectionMint: collectionAddress,
      authority: umi.identity,
    });

    await transaction.sendAndConfirm(umi);
    console.log(
      `✅ NFT ${nftAddress} verified as member of collection ${collectionAddress}! See Explorer at ${getExplorerLink(
        "address",
        nftAddress,
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
  await verify_nft();
};

main();
