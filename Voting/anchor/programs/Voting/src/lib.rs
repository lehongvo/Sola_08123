#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

const START_POLL_SEED: u8 = 8;

#[program]
pub mod Voting {
    use super::*;

    pub fn initialize_poll(ctx: Context<InitializePoll>) -> Result<()> {
        Ok(())
    }

    pub fn initialize_candidate(ctx: Context<InitializeCandidate>) -> Result<()> {
        Ok(())
    }

    pub fn vote(ctx: Context<Vote>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(poll_id: u64)]
pub struct InitializePoll<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(init,
        payer = payer,
        space = START_POLL_SEED + Poll::INIT_SPACE,
        seeds = [b"poll".as_ref(), poll_id.to_string().as_bytes()],
        bump,
    )]
    pub poll_account: Account<'info, Poll>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(poll_id: u64, candidate_id: u64)]
pub struct InitializeCandidate<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut)]
    pub poll_account: Account<'info, Poll>,

    #[account(init,
        payer = payer,
        space = START_CANDIDATE_SEED + Candidate::INIT_SPACE,
        seeds = [poll_id.to_string().as_bytes(), candidate_id.to_string().as_bytes()],
        bump,
    )]
    pub candidate_account: Account<'info, Candidate>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(poll_id: u64, candidate_id: u64)]
pub struct Vote<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        seeds = [poll_id.to_string().as_bytes(), candidate_id.to_string().as_bytes()],
        bump,
    )]
    pub poll_account: Account<'info, Poll>,

    #[account(init,
        payer = payer,
        space = START_VOTE_SEED + Vote::INIT_SPACE,
        seeds = [poll_id.to_string().as_bytes(), candidate_id.to_string().as_bytes()],
        bump,
    )]
    pub vote_account: Account<'info, Vote>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Poll {
    pub poll_id: u64,
    #[max_len(32)]
    pub poll_name: String,
    #[max_len(256)]
    pub poll_description: String,

    pub poll_start_time: u64,
    pub poll_end_time: u64,
    pub poll_is_finished: bool,

    #[max(100)]
    pub total_votes: u16,

    #[max_len(10)]
    pub candidates: Vec<Candidate>,
}

#[account]
pub struct Candidate {
    pub candidate_id: u64,
    #[max_len(32)]
    pub candidate_name: String,
    pub candidate_description: String,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Poll not found")]
    PollNotFound,

    #[msg("Vote not found")]
    VoteNotFound,

    #[msg("Vote already exists")]
    VoteAlreadyExists,

    #[msg("Poll already started")]
    PollAlreadyStarted,

    #[msg("Poll already ended")]
    PollAlreadyEnded,
}
