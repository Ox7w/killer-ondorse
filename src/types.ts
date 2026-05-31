export type GameStatus = 'waiting' | 'running' | 'finished'

export interface Game {
  status: GameStatus
  gages: string[]
  adminEmail: string
  winnerUid: string | null
  createdAt: number
  startedAt: number | null
}

export interface Player {
  uid: string
  name: string
  email: string
  isAdmin: boolean
  alive: boolean
  ready: boolean
  targetUid: string | null
  gage: string | null
  kills: number
  killedNames: string[]
  killedByName: string | null
  joinedAt: number
}

export type KillRequestStatus = 'pending' | 'confirmed' | 'rejected'

export interface KillRequest {
  id: string
  killerUid: string
  targetUid: string
  gage: string | null
  status: KillRequestStatus
  createdAt: number
}

export type GageRequestStatus = 'pending' | 'approved' | 'rejected'

export interface GageRequest {
  id: string
  playerUid: string
  playerName: string
  currentGage: string | null
  newGage: string | null
  status: GageRequestStatus
  createdAt: number
}
