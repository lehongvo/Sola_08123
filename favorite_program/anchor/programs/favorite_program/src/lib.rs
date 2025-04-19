#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

/**
 * Anchor discriminator size
 */
const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;

#[program]
pub mod favorite_program {
    use super::*;

    /**
     * Initialize admin
     * @param admin: Pubkey
     */
    pub fn initialize_admin(ctx: Context<InitializeAdmin>, admin: Pubkey) -> Result<()> {
        let admin_config = &mut ctx.accounts.admin_config;
        require!(
            admin_config.admin == Pubkey::default(),
            ErrorCode::AdminAlreadyInitialized
        );
        admin_config.admin = admin;
        Ok(())
    }

    /**
     * Set favorites
     * @param favorite_number: u8
     * @param favorite_name: String
     * @param favorite_description: String
     */
    pub fn set_favorites(
        ctx: Context<SetFavorites>,
        favorite_number: u8,
        favorite_name: String,
        favorite_description: String,
    ) -> Result<()> {
        let favorite = &mut ctx.accounts.favorite;
        require!(
            favorite.signer == Pubkey::default(),
            ErrorCode::UserAlreadyInitialized
        );
        favorite.signer = ctx.accounts.payer.key();
        favorite.favorite_number = favorite_number;
        favorite.favorite_name = favorite_name;
        favorite.favorite_description = favorite_description;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(admin: Pubkey)]
pub struct InitializeAdmin<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        payer = payer,
        space = ANCHOR_DISCRIMINATOR_SIZE + AdminConfig::INIT_SPACE,
        seeds = [b"admin_config", admin.as_ref()],
        bump,
    )]
    pub admin_config: Account<'info, AdminConfig>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct AdminConfig {
    pub admin: Pubkey,
}

#[derive(Accounts)]
#[instruction(favorite_number: u8, favorite_name: String, favorite_description: String)]
pub struct SetFavorites<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        space = ANCHOR_DISCRIMINATOR_SIZE + Favorite::INIT_SPACE,
        payer = payer,
        seeds = [b"favorite", payer.key().as_ref(), &favorite_number.to_le_bytes(), favorite_name.as_bytes(), favorite_description.as_bytes()],
        bump,
    )]
    pub favorite: Account<'info, Favorite>,

    pub system_program: Program<'info, System>,
}
#[account]
#[derive(InitSpace)]
pub struct Favorite {
    pub signer: Pubkey,
    pub favorite_number: u8,
    #[max_len(32)]
    pub favorite_name: String,
    #[max_len(100)]
    pub favorite_description: String,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Admin already initialized")]
    AdminAlreadyInitialized,

    #[msg("User already initialized")]
    UserAlreadyInitialized,
}
