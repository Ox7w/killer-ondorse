import { useState } from 'react'
import type { Player } from '../types'
import { attemptCounterKill } from '../game'

export default function CounterKillModal({
  me,
  players,
  onClose,
}: {
  me: Player
  players: Player[]
  onClose: () => void
}) {
  const [suspect, setSuspect] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ correct: boolean } | null>(null)

  const candidates = players.filter((p) => p.alive && p.uid !== me.uid)

  const confirm = async () => {
    if (!suspect) return
    setBusy(true)
    try {
      const res = await attemptCounterKill(me.uid, suspect, players)
      setResult(res)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Overlay>
      <div className="card w-full max-w-sm">
        {result ? (
          <div className="text-center">
            <div className="mb-2 text-4xl">{result.correct ? '🎯' : '☠️'}</div>
            <h3 className="text-lg font-bold">
              {result.correct ? 'Contre-kill réussi !' : 'Raté…'}
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              {result.correct
                ? 'Tu avais bien deviné ton chasseur. Il est éliminé.'
                : 'Ce n’était pas ton chasseur. Tu es éliminé et ton gage passe à ton vrai chasseur.'}
            </p>
            <button className="btn-primary mt-4 w-full" onClick={onClose}>
              OK
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-bold">Tenter un contre-kill</h3>
            <p className="mt-1 text-sm text-amber-400">
              ⚠️ Si tu te trompes de chasseur, tu meurs ! Choisis qui te chasse, selon toi.
            </p>
            <div className="mt-3 max-h-60 space-y-2 overflow-y-auto">
              {candidates.map((p) => (
                <button
                  key={p.uid}
                  onClick={() => setSuspect(p.uid)}
                  className={`w-full rounded-xl border px-4 py-3 text-left ${
                    suspect === p.uid
                      ? 'border-brand bg-brand/10'
                      : 'border-slate-700 bg-slate-800'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button className="btn-ghost flex-1" onClick={onClose} disabled={busy}>
                Annuler
              </button>
              <button
                className="btn-primary flex-1"
                disabled={!suspect || busy}
                onClick={confirm}
              >
                {busy ? '…' : 'Accuser'}
              </button>
            </div>
          </>
        )}
      </div>
    </Overlay>
  )
}

export function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      {children}
    </div>
  )
}
