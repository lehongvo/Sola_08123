#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;

#[program]
pub mod favorite_program {
    use super::*;

    pub fn initialize_admin(ctx: Context<InitializeAdmin>) -> Result<()> {
        let admin_config = &mut ctx.accounts.admin_config;
        admin_config.admin = ctx.accounts.admin.key();
        Ok(())
    }

    pub fn set_favorites(
        ctx: Context<SetFavorites>,
        favorite_number: u8,
        favorite_name: String,
        favorite_description: String,
    ) -> Result<()> {
        let favorite = &mut ctx.accounts.favorite;

        // Check if this is a new entry or update request
        if !favorite.is_initialized {
            // First time setting favorites
            favorite.owner = ctx.accounts.payer.key();
            favorite.favorite_number = favorite_number;
            favorite.favorite_name = favorite_name;
            favorite.favorite_description = favorite_description;
            favorite.is_initialized = true;
            favorite.update_requested = false;
            favorite.update_approved = false;
        } else {
            // Validate owner
            require!(
                favorite.owner == ctx.accounts.payer.key(),
                FavoriteError::InvalidOwner
            );

            // Request update
            favorite.pending_number = Some(favorite_number);
            favorite.pending_name = Some(favorite_name);
            favorite.pending_description = Some(favorite_description);
            favorite.update_requested = true;
            favorite.update_approved = false;
        }

        Ok(())
    }

    pub fn approve_update(ctx: Context<ApproveUpdate>) -> Result<()> {
        let favorite = &mut ctx.accounts.favorite;
        let admin_config = &ctx.accounts.admin_config;

        // Validate admin
        require!(
            ctx.accounts.admin.key() == admin_config.admin,
            FavoriteError::InvalidAdmin
        );

        // Validate update request exists
        require!(favorite.update_requested, FavoriteError::NoUpdateRequest);

        // Apply pending updates
        if let (Some(number), Some(name), Some(description)) = (
            favorite.pending_number,
            favorite.pending_name.clone(),
            favorite.pending_description.clone(),
        ) {
            favorite.favorite_number = number;
            favorite.favorite_name = name;
            favorite.favorite_description = description;
            favorite.update_approved = true;
            favorite.update_requested = false;

            // Clear pending values
            favorite.pending_number = None;
            favorite.pending_name = None;
            favorite.pending_description = None;
        }

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeAdmin<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + 32, // discriminator + pubkey
    )]
    pub admin_config: Account<'info, AdminConfig>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetFavorites<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        payer = payer,
        space = ANCHOR_DISCRIMINATOR_SIZE + Favorite::INIT_SPACE,
        seeds = [b"favorite", payer.key().as_ref()],
        bump
    )]
    pub favorite: Account<'info, Favorite>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ApproveUpdate<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(mut)]
    pub favorite: Account<'info, Favorite>,

    pub admin_config: Account<'info, AdminConfig>,
}

#[account]
pub struct AdminConfig {
    pub admin: Pubkey,
}

#[account]
#[derive(InitSpace)]
pub struct Favorite {
    pub owner: Pubkey,
    pub is_initialized: bool,
    pub favorite_number: u8,
    #[max_len(32)]
    pub favorite_name: String,
    #[max_len(100)]
    pub favorite_description: String,

    // Update request fields
    pub update_requested: bool,
    pub update_approved: bool,
    pub pending_number: Option<u8>,
    #[max_len(32)]
    pub pending_name: Option<String>,
    #[max_len(100)]
    pub pending_description: Option<String>,
}

#[error_code]
pub enum FavoriteError {
    #[msg("You are not the owner of this favorite")]
    InvalidOwner,
    #[msg("You are not the admin")]
    InvalidAdmin,
    #[msg("No update request pending")]
    NoUpdateRequest,
}
