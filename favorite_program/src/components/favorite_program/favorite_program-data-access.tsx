'use client'

import { getFavoriteProgramProgram, getFavoriteProgramProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'

export function useFavoriteProgramProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getFavoriteProgramProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getFavoriteProgramProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['favorite_program', 'all', { cluster }],
    queryFn: () => program.account.favorite_program.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['favorite_program', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ favorite_program: keypair.publicKey }).signers([keypair]).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  }
}

export function useFavoriteProgramProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useFavoriteProgramProgram()

  const accountQuery = useQuery({
    queryKey: ['favorite_program', 'fetch', { cluster, account }],
    queryFn: () => program.account.favorite_program.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['favorite_program', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ favorite_program: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['favorite_program', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ favorite_program: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['favorite_program', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ favorite_program: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['favorite_program', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ favorite_program: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  }
}
