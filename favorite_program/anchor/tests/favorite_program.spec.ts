import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { FavoriteProgram } from "../target/types/favorite_program";

describe("favorite_program", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = provider.wallet as anchor.Wallet;

  const program = anchor.workspace.FavoriteProgram as Program<FavoriteProgram>;

  const favorite_programKeypair = Keypair.generate();

  const ADMIN_INFO = {
    FAVORITE_NUMBER: 1,
    FAVORITE_NAME: "admin",
    FAVORITE_DESCRIPTION: "This is admin favorite",
  };

  const PDA: any = {};

  describe("Admin Config ", () => {
    it("Initialize Admin", async () => {
      // Find PDA for admin config - using same seeds as Rust program
      const adminPda = PublicKey.findProgramAddressSync(
        [Buffer.from("admin_config"), payer.publicKey.toBuffer()],
        program.programId
      )[0];
      PDA.adminPde = adminPda;

      await program.methods
        .initializeAdmin(payer.publicKey)
        .accounts({
          payer: payer.publicKey,
          adminConfig: adminPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        } as any)
        .rpc();

      const adminAccount = await program.account.adminConfig.fetch(adminPda);
      expect(adminAccount.admin.toString()).toEqual(payer.publicKey.toString());
    });

    it("Admin Already Initialized", async () => {
      await expect(
        program.methods
          .initializeAdmin(payer.publicKey)
          .accounts({
            adminConfig: PDA.adminPde,
            systemProgram: anchor.web3.SystemProgram.programId,
          } as any)
          .rpc()
      ).rejects.toThrow();
    });
  });

  describe("Favorite Config", () => {
    it("Initialize Favorite Config", async () => {
      const favoritePda = PublicKey.findProgramAddressSync(
        [
          Buffer.from("favorite"),
          payer.publicKey.toBuffer(),
          new Uint8Array([ADMIN_INFO.FAVORITE_NUMBER]),
          Buffer.from(ADMIN_INFO.FAVORITE_NAME),
          Buffer.from(ADMIN_INFO.FAVORITE_DESCRIPTION),
        ],
        program.programId
      )[0];

      await program.methods
        .setFavorites(
          ADMIN_INFO.FAVORITE_NUMBER,
          ADMIN_INFO.FAVORITE_NAME,
          ADMIN_INFO.FAVORITE_DESCRIPTION
        )
        .accounts({
          payer: payer.publicKey,
          favorite: favoritePda,
          systemProgram: anchor.web3.SystemProgram.programId,
        } as any)
        .rpc();
    });
  });

  // it('Increment FavoriteProgram', async () => {
  //   await program.methods.increment().accounts({ favorite_program: favorite_programKeypair.publicKey }).rpc()

  //   const currentCount = await program.account.favorite_program.fetch(favorite_programKeypair.publicKey)

  //   expect(currentCount.count).toEqual(1)
  // })

  // it('Increment FavoriteProgram Again', async () => {
  //   await program.methods.increment().accounts({ favorite_program: favorite_programKeypair.publicKey }).rpc()

  //   const currentCount = await program.account.favorite_program.fetch(favorite_programKeypair.publicKey)

  //   expect(currentCount.count).toEqual(2)
  // })

  // it('Decrement FavoriteProgram', async () => {
  //   await program.methods.decrement().accounts({ favorite_program: favorite_programKeypair.publicKey }).rpc()

  //   const currentCount = await program.account.favorite_program.fetch(favorite_programKeypair.publicKey)

  //   expect(currentCount.count).toEqual(1)
  // })

  // it('Set favorite_program value', async () => {
  //   await program.methods.set(42).accounts({ favorite_program: favorite_programKeypair.publicKey }).rpc()

  //   const currentCount = await program.account.favorite_program.fetch(favorite_programKeypair.publicKey)

  //   expect(currentCount.count).toEqual(42)
  // })

  // it('Set close the favorite_program account', async () => {
  //   await program.methods
  //     .close()
  //     .accounts({
  //       payer: payer.publicKey,
  //       favorite_program: favorite_programKeypair.publicKey,
  //     })
  //     .rpc()

  //   // The account should no longer exist, returning null.
  //   const userAccount = await program.account.favorite_program.fetchNullable(favorite_programKeypair.publicKey)
  //   expect(userAccount).toBeNull()
  // })
});
