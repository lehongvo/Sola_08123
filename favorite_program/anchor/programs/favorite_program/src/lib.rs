#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;

#[program]
pub mod favorite_program {
    use super::*;

    pub fn set_favorites(
        ctx: Context<SetFavorites>,
        favorite_number: u8,
        favorite_name: String,
        favorite_description: String,
    ) -> Result<()> {
        let favorite = &mut ctx.accounts.favorite;
        favorite.favorite_number = favorite_number;
        favorite.favorite_name = favorite_name;
        favorite.favorite_description = favorite_description;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct SetFavorites<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
  init,
  space = ANCHOR_DISCRIMINATOR_SIZE + Favorite::INIT_SPACE,
  payer = payer
  )]
    pub favorite: Account<'info, Favorite>,

    pub system_program: Program<'info, System>,
}
#[account]
#[derive(InitSpace)]
pub struct Favorite {
    pub favorite_number: u8,
    #[max_len(32)]
    pub favorite_name: String,
    #[max_len(100)]
    pub favorite_description: String,
}
