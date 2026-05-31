import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth'
import { collection, doc, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { auth, db, googleProvider } from './firebase'
import { ALLOWED_DOMAIN, GAME_ID, isAllowedEmail } from './config'
import type { Game, GageRequest, KillRequest, Player } from './types'

const gameRef = doc(db, 'games', GAME_ID)
const playersCol = collection(db, 'games', GAME_ID, 'players')
const killRequestsCol = collection(db, 'games', GAME_ID, 'killRequests')
const gageRequestsCol = collection(db, 'games', GAME_ID, 'gageRequests')

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export function useAuth(): AuthState & {
  signIn: () => Promise<void>
  logout: () => Promise<void>
} {
  const [state, setState] = useState<AuthState>({ user: null, loading: true, error: null })

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (user && !isAllowedEmail(user.email)) {
        // Email hors domaine autorisé : déconnexion immédiate.
        signOut(auth)
        setState({
          user: null,
          loading: false,
          error: `Seuls les emails @${ALLOWED_DOMAIN} sont autorisés.`,
        })
        return
      }
      setState({ user, loading: false, error: null })
    })
  }, [])

  const signIn = async () => {
    setState((s) => ({ ...s, error: null }))
    try {
      const cred = await signInWithPopup(auth, googleProvider)
      if (!isAllowedEmail(cred.user.email)) {
        await signOut(auth)
        setState({
          user: null,
          loading: false,
          error: `Seuls les emails @${ALLOWED_DOMAIN} sont autorisés.`,
        })
      }
    } catch (e: any) {
      if (e?.code === 'auth/popup-closed-by-user') return
      setState((s) => ({ ...s, error: e?.message || 'Échec de la connexion.' }))
    }
  }

  const logout = () => signOut(auth)

  return { ...state, signIn, logout }
}

export function useGame(): Game | null | undefined {
  // undefined = en cours de chargement, null = inexistant
  const [game, setGame] = useState<Game | null | undefined>(undefined)
  useEffect(() => {
    return onSnapshot(gameRef, (snap) => {
      setGame(snap.exists() ? (snap.data() as Game) : null)
    })
  }, [])
  return game
}

export function usePlayers(): Player[] {
  const [players, setPlayers] = useState<Player[]>([])
  useEffect(() => {
    const q = query(playersCol, orderBy('joinedAt', 'asc'))
    return onSnapshot(q, (snap) => {
      setPlayers(snap.docs.map((d) => d.data() as Player))
    })
  }, [])
  return players
}

// Demandes de kill en attente DONT je suis la cible (à confirmer/refuser).
export function usePendingKillForMe(uid: string | undefined): KillRequest | null {
  const [req, setReq] = useState<KillRequest | null>(null)
  useEffect(() => {
    if (!uid) return
    const q = query(
      killRequestsCol,
      where('targetUid', '==', uid),
      where('status', '==', 'pending')
    )
    return onSnapshot(q, (snap) => {
      const first = snap.docs[0]
      setReq(first ? ({ id: first.id, ...first.data() } as KillRequest) : null)
    })
  }, [uid])
  return req
}

// Mes demandes de kill en tant que tueur (pour afficher "en attente" / "refusée").
export function useMyKillRequests(uid: string | undefined): KillRequest[] {
  const [reqs, setReqs] = useState<KillRequest[]>([])
  useEffect(() => {
    if (!uid) return
    const q = query(killRequestsCol, where('killerUid', '==', uid))
    return onSnapshot(q, (snap) => {
      setReqs(snap.docs.map((d) => ({ id: d.id, ...d.data() } as KillRequest)))
    })
  }, [uid])
  return reqs
}

// Mes demandes de changement de gage (pour afficher l'état côté joueur).
export function useMyGageRequests(uid: string | undefined): GageRequest[] {
  const [reqs, setReqs] = useState<GageRequest[]>([])
  useEffect(() => {
    if (!uid) return
    const q = query(gageRequestsCol, where('playerUid', '==', uid))
    return onSnapshot(q, (snap) => {
      setReqs(snap.docs.map((d) => ({ id: d.id, ...d.data() } as GageRequest)))
    })
  }, [uid])
  return reqs
}

// Toutes les demandes de changement de gage en attente (vue admin).
export function usePendingGageRequests(): GageRequest[] {
  const [reqs, setReqs] = useState<GageRequest[]>([])
  useEffect(() => {
    const q = query(gageRequestsCol, where('status', '==', 'pending'))
    return onSnapshot(q, (snap) => {
      setReqs(snap.docs.map((d) => ({ id: d.id, ...d.data() } as GageRequest)))
    })
  }, [])
  return reqs
}
