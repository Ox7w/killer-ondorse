import { useState } from 'react'
import type { Player } from '../types'
import {
  usePendingKillForMe,
  useMyKillRequests,
  useMyGageRequests,
  usePendingGageRequests,
} from '../hooks'
import { declareKill, resetGame, requestGageChange, resolveGageChange } from '../game'
import Dashboard from './Dashboard'
import CounterKillModal from './CounterKillModal'
import KillConfirmModal from './KillConfirmModal'

export default function Game({ me, players }: { me: Player; players: Player[] }) {
  const pendingForMe = usePendingKillForMe(me.uid)
  const myRequests = useMyKillRequests(me.uid)
  const myGageRequests = useMyGageRequests(me.uid)
  const [showCounter, setShowCounter] = useState(false)
  const [busy, setBusy] = useState(false)
  const [gageBusy, setGageBusy] = useState(false)

  const target = players.find((p) => p.uid === me.targetUid)
  const myPending = myRequests.find((r) => r.status === 'pending')
  const lastRejected = myRequests.some((r) => r.status === 'rejected') && !myPending
  const gagePending = myGageRequests.some((r) => r.status === 'pending')
  const gageRejected = !gagePending && myGageRequests.some((r) => r.status === 'rejected')

  const declare = async () => {
    setBusy(true)
    try {
      await declareKill(me)
    } finally {
      setBusy(false)
    }
  }

  const askGageChange = async () => {
    setGageBusy(true)
    try {
      await requestGageChange(me)
    } finally {
      setGageBusy(false)
    }
  }

  return (
    <div className="mt-4">
      {pendingForMe && <KillConfirmModal request={pendingForMe} players={players} />}
      {showCounter && (
        <CounterKillModal me={me} players={players} onClose={() => setShowCounter(false)} />
      )}

      {me.alive ? (
        <div className="card border-brand/40">
          <h2 className="text-sm uppercase tracking-wide text-slate-500">Ta mission</h2>
          {target ? (
            <>
              <p className="mt-1 text-2xl font-extrabold">
                🎯 {target.name}
              </p>
              <p className="mt-2 rounded-xl bg-slate-800 px-3 py-2 text-slate-200">
                Gage : <strong>{me.gage}</strong>
              </p>

              {gagePending ? (
                <div className="mt-2 rounded-xl bg-sky-500/10 px-3 py-2 text-sm text-sky-300">
                  🔁 Demande de changement de gage envoyée à l’admin…
                </div>
              ) : (
                <button
                  className="mt-2 w-full text-sm text-slate-400 underline disabled:opacity-50"
                  disabled={gageBusy}
                  onClick={askGageChange}
                >
                  🔁 Demander un autre gage (même cible)
                </button>
              )}
              {gageRejected && (
                <p className="mt-1 text-xs text-red-400">
                  Ta dernière demande de gage a été refusée par l’admin.
                </p>
              )}

              {myPending ? (
                <div className="mt-4 rounded-xl bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
                  ⏳ En attente de la confirmation de ta cible…
                </div>
              ) : (
                <button className="btn-primary mt-4 w-full" disabled={busy} onClick={declare}>
                  🔪 J’ai killé ma cible
                </button>
              )}

              {lastRejected && (
                <p className="mt-2 text-sm text-red-400">
                  Ta dernière déclaration a été refusée. Réessaie quand c’est fait.
                </p>
              )}

              <button
                className="btn-ghost mt-2 w-full"
                onClick={() => setShowCounter(true)}
              >
                🛡️ Tenter un contre-kill
              </button>
            </>
          ) : (
            <p className="mt-2 text-slate-400">En attente d’attribution de cible…</p>
          )}
        </div>
      ) : (
        <div className="card border-red-500/40 text-center">
          <div className="text-4xl">💀</div>
          <h2 className="mt-1 text-lg font-bold">Tu es éliminé</h2>
          {me.killedByName && (
            <p className="text-sm text-slate-400">Éliminé par {me.killedByName}.</p>
          )}
          <p className="mt-1 text-sm text-slate-500">
            Tu as fait {me.kills} kill{me.kills > 1 ? 's' : ''}. Suis la fin de la partie ci-dessous.
          </p>
        </div>
      )}

      <Dashboard players={players} meUid={me.uid} />

      {me.isAdmin && <AdminControls players={players} />}
    </div>
  )
}

function AdminControls({ players }: { players: Player[] }) {
  const [confirming, setConfirming] = useState(false)
  const gageRequests = usePendingGageRequests()
  const [busyId, setBusyId] = useState<string | null>(null)

  const resolve = async (id: string, playerUid: string, currentGage: string | null, accept: boolean) => {
    setBusyId(id)
    try {
      await resolveGageChange(id, playerUid, currentGage, accept)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="card mt-4 border-slate-700">
      <h3 className="text-sm font-bold text-slate-400">Admin</h3>

      {gageRequests.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-400">
            Demandes de changement de gage ({gageRequests.length})
          </p>
          {gageRequests.map((r) => (
            <div key={r.id} className="rounded-xl border border-slate-800 p-3">
              <p className="text-sm">
                <strong>{r.playerName}</strong> demande un autre gage.
              </p>
              <p className="mt-1 text-xs text-slate-500">Gage actuel : {r.currentGage || '—'}</p>
              <div className="mt-2 flex gap-2">
                <button
                  className="btn-ghost flex-1 text-sm"
                  disabled={busyId === r.id}
                  onClick={() => resolve(r.id, r.playerUid, r.currentGage, false)}
                >
                  Refuser
                </button>
                <button
                  className="btn-primary flex-1 text-sm"
                  disabled={busyId === r.id}
                  onClick={() => resolve(r.id, r.playerUid, r.currentGage, true)}
                >
                  Valider (nouveau gage)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirming ? (
        <div className="mt-2 flex gap-2">
          <button className="btn-ghost flex-1" onClick={() => setConfirming(false)}>
            Annuler
          </button>
          <button
            className="btn-primary flex-1"
            onClick={() => resetGame(players)}
          >
            Confirmer la réinitialisation
          </button>
        </div>
      ) : (
        <button className="btn-ghost mt-2 w-full" onClick={() => setConfirming(true)}>
          Réinitialiser la partie
        </button>
      )}
    </div>
  )
}
