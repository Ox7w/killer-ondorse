import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import type { User } from 'firebase/auth'
import { db } from './firebase'
import { ADMIN_EMAIL, GAME_ID, isAdminEmail } from './config'
import { DEFAULT_GAGES } from './data/defaultGages'
import type { Game, Player } from './types'

const gameRef = doc(db, 'games', GAME_ID)
const playersCol = collection(db, 'games', GAME_ID, 'players')
const killRequestsCol = collection(db, 'games', GAME_ID, 'killRequests')
const playerRef = (uid: string) => doc(db, 'games', GAME_ID, 'players', uid)

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ---- Mise en place ----------------------------------------------------------

export async function ensureGameDoc(): Promise<void> {
  const snap = await getDoc(gameRef)
  if (snap.exists()) return
  const game: Game = {
    status: 'waiting',
    gages: DEFAULT_GAGES,
    adminEmail: ADMIN_EMAIL,
    winnerUid: null,
    createdAt: Date.now(),
    startedAt: null,
  }
  await setDoc(gameRef, game, { merge: true })
}

export async function joinAsPlayer(user: User, name: string): Promise<void> {
  const ref = playerRef(user.uid)
  const existing = await getDoc(ref)
  if (existing.exists()) {
    await updateDoc(ref, { name })
    return
  }
  const player: Player = {
    uid: user.uid,
    name,
    email: (user.email || '').toLowerCase(),
    isAdmin: isAdminEmail(user.email),
    alive: true,
    ready: false,
    targetUid: null,
    gage: null,
    kills: 0,
    killedNames: [],
    killedByName: null,
    joinedAt: Date.now(),
  }
  await setDoc(ref, player)
}

export async function setReady(uid: string, ready: boolean): Promise<void> {
  await updateDoc(playerRef(uid), { ready })
}

export async function updateGages(gages: string[]): Promise<void> {
  await updateDoc(gameRef, { gages })
}

// ---- Démarrage --------------------------------------------------------------

export async function startGame(players: Player[]): Promise<void> {
  if (players.length < 3) throw new Error('Il faut au moins 3 joueurs.')
  const gameSnap = await getDoc(gameRef)
  const gages: string[] = (gameSnap.data()?.gages as string[]) || []
  if (gages.length < 1) throw new Error('Ajoute au moins un gage avant de lancer.')

  const order = shuffle(players)
  const shuffledGages = shuffle(gages)
  const n = order.length

  const batch = writeBatch(db)
  order.forEach((p, i) => {
    const target = order[(i + 1) % n] // chaîne circulaire : chacun chasse le suivant
    batch.update(playerRef(p.uid), {
      alive: true,
      ready: false,
      targetUid: target.uid,
      gage: shuffledGages[i % shuffledGages.length],
      kills: 0,
      killedNames: [],
      killedByName: null,
    })
  })
  batch.update(gameRef, { status: 'running', startedAt: Date.now(), winnerUid: null })
  await batch.commit()
}

export async function resetGame(players: Player[]): Promise<void> {
  const batch = writeBatch(db)
  players.forEach((p) => {
    batch.update(playerRef(p.uid), {
      alive: true,
      ready: false,
      targetUid: null,
      gage: null,
      kills: 0,
      killedNames: [],
      killedByName: null,
    })
  })
  batch.update(gameRef, { status: 'waiting', startedAt: null, winnerUid: null })
  await batch.commit()

  // Purge des demandes de kill de la partie précédente.
  const reqs = await getDocs(killRequestsCol)
  await Promise.all(reqs.docs.map((d) => deleteDoc(d.ref)))
}

// ---- Logique de résolution (pure) ------------------------------------------

type Updates = Record<string, Partial<Player>>

interface Resolution {
  updates: Updates
  deadUids: string[]
  finished: boolean
  winnerUid: string | null
}

function aliveAfter(players: Player[], deadUids: string[]): Player[] {
  return players.filter((p) => p.alive && !deadUids.includes(p.uid))
}

function withWinCheck(players: Player[], updates: Updates, deadUids: string[]): Resolution {
  const remaining = aliveAfter(players, deadUids)
  const finished = remaining.length <= 1
  const winnerUid = finished && remaining.length === 1 ? remaining[0].uid : null
  return { updates, deadUids, finished, winnerUid }
}

// Kill classique : `killer` élimine `victim` et hérite de sa cible + son gage.
export function computeKill(players: Player[], killerUid: string, victimUid: string): Resolution {
  const map = Object.fromEntries(players.map((p) => [p.uid, p]))
  const killer = map[killerUid]
  const victim = map[victimUid]
  const updates: Updates = {}

  updates[victimUid] = { alive: false, killedByName: killer.name, targetUid: null, gage: null }

  let newTarget = victim.targetUid
  if (newTarget === killerUid) newTarget = null // boucle à 2 : le killer est le dernier
  updates[killerUid] = {
    targetUid: newTarget,
    gage: victim.gage,
    kills: killer.kills + 1,
    killedNames: [...killer.killedNames, victim.name],
  }

  return withWinCheck(players, updates, [victimUid])
}

// Contre-kill RÉUSSI : `defender` devine et élimine son chasseur `hunter`.
// Le defender garde sa propre cible ; le chasseur du chasseur se reporte sur lui.
export function computeCounterKillCorrect(
  players: Player[],
  defenderUid: string,
  hunterUid: string
): Resolution {
  const map = Object.fromEntries(players.map((p) => [p.uid, p]))
  const defender = map[defenderUid]
  const hunter = map[hunterUid]
  const updates: Updates = {}

  updates[hunterUid] = { alive: false, killedByName: defender.name, targetUid: null, gage: null }
  updates[defenderUid] = {
    gage: hunter.gage, // le gage du killé passe au killer
    kills: defender.kills + 1,
    killedNames: [...defender.killedNames, hunter.name],
  }

  // Le chasseur du chasseur (celui qui visait `hunter`) se reporte sur `defender`.
  const grand = players.find((p) => p.alive && p.targetUid === hunterUid && p.uid !== hunterUid)
  if (grand) {
    updates[grand.uid] = { ...(updates[grand.uid] || {}), targetUid: defenderUid }
  }

  return withWinCheck(players, updates, [hunterUid])
}

async function applyResolution(res: Resolution, extraDeletes: string[] = []): Promise<void> {
  const batch = writeBatch(db)
  for (const [uid, patch] of Object.entries(res.updates)) {
    batch.update(playerRef(uid), patch)
  }
  if (res.finished) {
    batch.update(gameRef, { status: 'finished', winnerUid: res.winnerUid })
  }
  await batch.commit()

  // Nettoyage des demandes en attente liées aux joueurs morts (devenues caduques).
  const toClean = [...res.deadUids]
  const reqs = await getDocs(killRequestsCol)
  await Promise.all(
    reqs.docs
      .filter((d) => {
        const data = d.data() as { killerUid: string; targetUid: string; status: string }
        if (extraDeletes.includes(d.id)) return true
        if (data.status !== 'pending') return false
        return toClean.includes(data.killerUid) || toClean.includes(data.targetUid)
      })
      .map((d) => deleteDoc(d.ref))
  )
}

// ---- Actions joueur ---------------------------------------------------------

export async function declareKill(killer: Player): Promise<void> {
  if (!killer.alive || !killer.targetUid) throw new Error('Action impossible.')
  await addDoc(killRequestsCol, {
    killerUid: killer.uid,
    targetUid: killer.targetUid,
    gage: killer.gage,
    status: 'pending',
    createdAt: Date.now(),
  })
}

export async function respondToKill(
  requestId: string,
  killerUid: string,
  victimUid: string,
  accept: boolean,
  players: Player[]
): Promise<void> {
  const reqRef = doc(killRequestsCol, requestId)
  if (!accept) {
    await updateDoc(reqRef, { status: 'rejected' })
    return
  }
  const res = computeKill(players, killerUid, victimUid)
  // Marque la demande comme confirmée puis applique la résolution.
  await updateDoc(reqRef, { status: 'confirmed' })
  await applyResolution(res)
}

// `defender` accuse `suspectUid` d'être son chasseur.
export async function attemptCounterKill(
  defenderUid: string,
  suspectUid: string,
  players: Player[]
): Promise<{ correct: boolean }> {
  const hunter = players.find((p) => p.alive && p.targetUid === defenderUid)
  const correct = !!hunter && hunter.uid === suspectUid

  if (correct) {
    await applyResolution(computeCounterKillCorrect(players, defenderUid, hunter!.uid))
  } else if (hunter) {
    // Contre-kill raté : le defender meurt, son gage va à son vrai chasseur.
    await applyResolution(computeKill(players, hunter.uid, defenderUid))
  } else {
    // Pas de chasseur connu (cas dégénéré) : le defender meurt seul.
    const batch = writeBatch(db)
    batch.update(playerRef(defenderUid), {
      alive: false,
      killedByName: 'Contre-kill raté',
      targetUid: null,
      gage: null,
    })
    await batch.commit()
  }
  return { correct }
}
