#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod favorite_program {
    use super::*;

  pub fn close(_ctx: Context<CloseFavoriteProgram>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.favorite_program.count = ctx.accounts.favorite_program.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.favorite_program.count = ctx.accounts.favorite_program.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeFavoriteProgram>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.favorite_program.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeFavoriteProgram<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + FavoriteProgram::INIT_SPACE,
  payer = payer
  )]
  pub favorite_program: Account<'info, FavoriteProgram>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseFavoriteProgram<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub favorite_program: Account<'info, FavoriteProgram>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub favorite_program: Account<'info, FavoriteProgram>,
}

#[account]
#[derive(InitSpace)]
pub struct FavoriteProgram {
  count: u8,
}
