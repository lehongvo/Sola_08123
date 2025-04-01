import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import {
  generateSigner,
  keypairIdentity,
  KeypairSigner,
  percentAmount,
  Umi,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  airdropIfRequired,
  getKeypairFromEnvironment,
} from "@solana-developers/helpers";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import "dotenv/config";

const createCollection = async () => {
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

    const collectionMint = generateSigner(umi);

    const transaction = await createNft(umi, {
      mint: collectionMint,
      name: "VincentVO",
      symbol: "VO",
      uri: "https://nftdata.parallelnft.com/api/parallel-avatars/ipfs/4163",
      sellerFeeBasisPoints: percentAmount(0),
      isCollection: true,
    });
    await transaction.sendAndConfirm(umi);
  } catch (error) {
    console.error("\n❌ Error creating collection:");
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    } else {
      console.error(`   ${error}`);
    }
    process.exit(1);
  }
};

// Execute main function
createCollection();
function createNft(
  umi: Umi,
  arg1: {
    mint: KeypairSigner;
    name: string;
    symbol: string;
    uri: string;
    sellerFeeBasisPoints: any;
    isCollection: boolean;
  }
) {
  throw new Error("Function not implemented.");
}
