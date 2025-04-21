import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { FavoriteProgram } from "../target/types/favorite_program";

describe("favorite_program", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = provider.wallet as anchor.Wallet;

  const program = anchor.workspace.FavoriteProgram as Program<FavoriteProgram>;

  const INITIAL_INFO = {
    FAVORITE_NUMBER: 1,
    FAVORITE_NAME: "Initial Favorite",
    FAVORITE_DESCRIPTION: "Initial description",
  };

  const UPDATE_INFO = {
    FAVORITE_NUMBER: 2,
    FAVORITE_NAME: "Updated Favorite",
    FAVORITE_DESCRIPTION: "Updated description",
  };

  const PDA: any = {};

  describe("Admin Config", () => {
    it("Initialize Admin", async () => {
      const adminPda = PublicKey.findProgramAddressSync(
        [Buffer.from("admin_config"), payer.publicKey.toBuffer()],
        program.programId
      )[0];
      PDA.adminPda = adminPda;

      await program.methods
        .initializeAdmin(payer.publicKey)
        .accounts({
          payer: payer.publicKey,
          adminConfig: adminPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      const adminAccount = await program.account.adminConfig.fetch(adminPda);
      expect(adminAccount.admin.toString()).toEqual(payer.publicKey.toString());
    });

    it("Admin Already Initialized", async () => {
      await expect(
        program.methods
          .initializeAdmin(payer.publicKey)
          .accounts({
            adminConfig: PDA.adminPda,
            systemProgram: anchor.web3.SystemProgram.programId,
          } as any)
          .rpc()
      ).rejects.toThrow();
    });
  });

  describe("Favorite Flow", () => {
    it("Initial Set Favorites", async () => {
      const favoritePda = PublicKey.findProgramAddressSync(
        [Buffer.from("favorite"), payer.publicKey.toBuffer()],
        program.programId
      )[0];
      PDA.favoritePda = favoritePda;

      await program.methods
        .setFavorites(
          INITIAL_INFO.FAVORITE_NUMBER,
          INITIAL_INFO.FAVORITE_NAME,
          INITIAL_INFO.FAVORITE_DESCRIPTION
        )
        .accounts({
          payer: payer.publicKey,
          favorite: favoritePda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      const favoriteAccount = await program.account.favorite.fetch(favoritePda);
      expect(favoriteAccount.favoriteNumber).toEqual(
        INITIAL_INFO.FAVORITE_NUMBER
      );
      expect(favoriteAccount.favoriteName).toEqual(INITIAL_INFO.FAVORITE_NAME);
      expect(favoriteAccount.favoriteDescription).toEqual(
        INITIAL_INFO.FAVORITE_DESCRIPTION
      );
      expect(favoriteAccount.hasUpdateRequest).toEqual(false);
      expect(favoriteAccount.updateApproved).toEqual(false);
    });

    it("Request Update Favorites", async () => {
      await program.methods
        .newRqUpdateFavorites(
          UPDATE_INFO.FAVORITE_NUMBER,
          UPDATE_INFO.FAVORITE_NAME,
          UPDATE_INFO.FAVORITE_DESCRIPTION
        )
        .accounts({
          payer: payer.publicKey,
          favorite: PDA.favoritePda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      const favoriteAccount = await program.account.favorite.fetch(
        PDA.favoritePda
      );
      expect(favoriteAccount.hasUpdateRequest).toEqual(true);
      expect(favoriteAccount.updateApproved).toEqual(false);
      expect(favoriteAccount.pendingNumber).toEqual(
        UPDATE_INFO.FAVORITE_NUMBER
      );
      expect(favoriteAccount.pendingName).toEqual(UPDATE_INFO.FAVORITE_NAME);
      expect(favoriteAccount.pendingDescription).toEqual(
        UPDATE_INFO.FAVORITE_DESCRIPTION
      );
    });

    it("Admin Approves Update", async () => {
      await program.methods
        .approveUpdate()
        .accounts({
          admin: payer.publicKey,
          favorite: PDA.favoritePda,
          adminConfig: PDA.adminPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      const favoriteAccount = await program.account.favorite.fetch(
        PDA.favoritePda
      );
      expect(favoriteAccount.hasUpdateRequest).toEqual(true);
      expect(favoriteAccount.updateApproved).toEqual(true);
    });

    it("Apply Approved Update", async () => {
      await program.methods
        .setFavorites(
          UPDATE_INFO.FAVORITE_NUMBER,
          UPDATE_INFO.FAVORITE_NAME,
          UPDATE_INFO.FAVORITE_DESCRIPTION
        )
        .accounts({
          payer: payer.publicKey,
          favorite: PDA.favoritePda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      const favoriteAccount = await program.account.favorite.fetch(
        PDA.favoritePda
      );
      expect(favoriteAccount.favoriteNumber).toEqual(
        UPDATE_INFO.FAVORITE_NUMBER
      );
      expect(favoriteAccount.favoriteName).toEqual(UPDATE_INFO.FAVORITE_NAME);
      expect(favoriteAccount.favoriteDescription).toEqual(
        UPDATE_INFO.FAVORITE_DESCRIPTION
      );
      expect(favoriteAccount.hasUpdateRequest).toEqual(false);
      expect(favoriteAccount.updateApproved).toEqual(false);
    });

    it("Cannot Update Without Request", async () => {
      await expect(
        program.methods
          .setFavorites(99, "Test", "Test")
          .accounts({
            payer: payer.publicKey,
            favorite: PDA.favoritePda,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc()
      ).rejects.toThrow();
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
