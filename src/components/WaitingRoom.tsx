import { useState } from 'react'
import type { Player } from '../types'
import { setReady, startGame } from '../game'
import GageManager from './GageManager'

export default function WaitingRoom({
  me,
  players,
  gages,
}: {
  me: Player
  players: Player[]
  gages: string[]
}) {
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const enoughPlayers = players.length >= 3
  const enoughGages = gages.length >= 1
  const canStart = enoughPlayers && enoughGages

  const launch = async () => {
    setBusy(true)
    setErr(null)
    try {
      await startGame(players)
    } catch (e: any) {
      setErr(e?.message || 'Erreur au lancement.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="card">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Salle d’attente</h2>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-sm">{players.length} joueur·s</span>
        </div>
        <ul className="mt-3 divide-y divide-slate-800">
          {players.map((p) => (
            <li key={p.uid} className="flex items-center justify-between py-2">
              <span className="font-medium">
                {p.name}
                {p.uid === me.uid && <span className="ml-1 text-xs text-slate-500">(toi)</span>}
                {p.isAdmin && <span className="ml-1 text-xs text-brand">admin</span>}
              </span>
              <span className={p.ready ? 'text-sm text-emerald-400' : 'text-sm text-slate-500'}>
                {p.ready ? 'Prêt ✓' : 'En attente'}
              </span>
            </li>
          ))}
        </ul>
        <button
          className="btn-ghost mt-4 w-full"
          onClick={() => setReady(me.uid, !me.ready)}
        >
          {me.ready ? 'Je ne suis plus prêt' : 'Je suis prêt'}
        </button>
      </div>

      {me.isAdmin ? (
        <>
          <GageManager gages={gages} />
          <div className="card">
            <h3 className="font-bold">Lancer la partie</h3>
            <p className="mt-1 text-sm text-slate-400">
              Tu joues aussi : tu recevras une cible et un gage comme tout le monde.
            </p>
            {!enoughPlayers && (
              <p className="mt-2 text-sm text-amber-400">Il faut au moins 3 joueurs.</p>
            )}
            {!enoughGages && (
              <p className="mt-2 text-sm text-amber-400">Ajoute au moins un gage.</p>
            )}
            <button className="btn-primary mt-3 w-full" disabled={!canStart || busy} onClick={launch}>
              {busy ? 'Lancement…' : '🚀 Lancer la partie'}
            </button>
            {err && <p className="mt-2 text-sm text-red-400">{err}</p>}
          </div>
        </>
      ) : (
        <div className="card text-center text-slate-400">
          En attente du lancement par l’admin…
        </div>
      )}
    </div>
  )
}
