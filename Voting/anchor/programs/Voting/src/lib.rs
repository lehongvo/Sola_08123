#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

const START_POLL_SEED: usize = 8;
const START_CANDIDATE_SEED: usize = 8;

#[program]
pub mod voting {
    use super::*;

    pub fn initialize_poll(ctx: Context<InitializePoll>, poll_id: u64, poll_name: String, poll_description: String, poll_start_time: u64, poll_end_time: u64) -> Result<()> {
        let poll = &mut ctx.accounts.poll_account;
        poll.poll_id = poll_id;
        poll.poll_name = poll_name;
        poll.poll_description = poll_description;
        poll.poll_start_time = poll_start_time;
        poll.poll_end_time = poll_end_time;
        poll.poll_is_finished = false;
        poll.total_votes = 0;
        Ok(())
    }

    pub fn initialize_candidate(ctx: Context<InitializeCandidate>, candidate_id: u64, candidate_name: String, candidate_description: String) -> Result<()> {
        let candidate = &mut ctx.accounts.candidate_account;
        candidate.candidate_id = candidate_id;
        candidate.candidate_name = candidate_name;
        candidate.candidate_description = candidate_description;
        candidate.candidate_votes = 0;

        let poll = &mut ctx.accounts.poll_account;
        let is_exist = poll.candidates.iter().any(|id| *id == candidate_id);
        if is_exist {
            return Err(ErrorCode::CandidateAlreadyExists.into());
        }
        poll.candidates.push(candidate_id);
        Ok(())
    }

    pub fn vote(ctx: Context<Vote>, _poll_id: u64, candidate_id: u64) -> Result<()> {
        let poll = &mut ctx.accounts.poll_account;
        let candidate = &mut ctx.accounts.candidate_account;
        
        let current_time = Clock::get()?.unix_timestamp as u64;
        if poll.poll_start_time > current_time {
            return Err(ErrorCode::PollNotStarted.into());
        }
        if poll.poll_end_time < current_time {
            return Err(ErrorCode::PollEnded.into());
        }

        if poll.poll_is_finished {
            return Err(ErrorCode::PollAlreadyEnded.into());
        }

        let is_exist = poll.candidates.iter().any(|id| *id == candidate_id);
        if !is_exist {
            return Err(ErrorCode::CandidateNotFound.into());
        }

        // Check if user has already voted
        let voter_key = ctx.accounts.payer.key();
        let vote_seed = format!("vote-{}-{}", poll.poll_id, voter_key);
        let (vote_account, _) = Pubkey::find_program_address(
            &[vote_seed.as_bytes()],
            ctx.program_id
        );
        
        if vote_account == ctx.accounts.payer.key() {
            return Err(ErrorCode::AlreadyVoted.into());
        }

        poll.total_votes += 1;
        candidate.candidate_votes += 1;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(poll_id: u64)]
pub struct InitializePoll<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
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

    #[account(
        init,
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
        seeds = [b"poll".as_ref(), poll_id.to_string().as_bytes()],
        bump,
        constraint = poll_account.poll_id == poll_id
    )]
    pub poll_account: Account<'info, Poll>,

    #[account(
        mut,
        seeds = [poll_id.to_string().as_bytes(), candidate_id.to_string().as_bytes()],
        bump,
        constraint = candidate_account.candidate_id == candidate_id
    )]
    pub candidate_account: Account<'info, Candidate>,

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
    pub total_votes: u16,
    #[max_len(10)]
    pub candidates: Vec<u64>,
}

#[account]
#[derive(InitSpace)]
pub struct Candidate {
    pub candidate_id: u64,
    #[max_len(32)]
    pub candidate_name: String,
    #[max_len(256)]
    pub candidate_description: String,
    pub candidate_votes: u16,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Poll not found")]
    PollNotFound,
    #[msg("Candidate already exists")]
    CandidateAlreadyExists,
    #[msg("Candidate not found")]
    CandidateNotFound,
    #[msg("Poll not started")]
    PollNotStarted,
    #[msg("Poll already ended")]
    PollAlreadyEnded,
    #[msg("Poll ended")]
    PollEnded,
    #[msg("User has already voted")]
    AlreadyVoted,
}
