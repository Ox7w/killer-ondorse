import { useState } from 'react'
import type { KillRequest, Player } from '../types'
import { respondToKill } from '../game'
import { Overlay } from './CounterKillModal'

export default function KillConfirmModal({
  request,
  players,
}: {
  request: KillRequest
  players: Player[]
}) {
  const [busy, setBusy] = useState(false)

  const respond = async (accept: boolean) => {
    setBusy(true)
    try {
      await respondToKill(request.id, request.killerUid, request.targetUid, accept, players)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Overlay>
      <div className="card w-full max-w-sm text-center">
        <div className="mb-2 text-4xl">🔪</div>
        <h3 className="text-lg font-bold">Quelqu’un déclare t’avoir killé</h3>
        {request.gage && (
          <p className="mt-2 rounded-xl bg-slate-800 px-3 py-2 text-sm text-slate-300">
            Gage : « {request.gage} »
          </p>
        )}
        <p className="mt-3 text-sm text-slate-400">Est-ce bien correct ?</p>
        <div className="mt-4 flex gap-2">
          <button className="btn-ghost flex-1" disabled={busy} onClick={() => respond(false)}>
            Non
          </button>
          <button className="btn-primary flex-1" disabled={busy} onClick={() => respond(true)}>
            Oui, je suis mort
          </button>
        </div>
      </div>
    </Overlay>
  )
}
