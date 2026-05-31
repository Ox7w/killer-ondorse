import type { Player } from '../types'
import { resetGame } from '../game'

export default function EndScreen({
  me,
  players,
  winnerUid,
}: {
  me: Player
  players: Player[]
  winnerUid: string | null
}) {
  const winner = players.find((p) => p.uid === winnerUid)
  const ranking = [...players].sort((a, b) => {
    if (a.alive !== b.alive) return a.alive ? -1 : 1
    return b.kills - a.kills
  })

  return (
    <div className="mt-6 space-y-4">
      <div className="card text-center">
        <div className="text-5xl">🏆</div>
        <h2 className="mt-2 text-2xl font-extrabold">Partie terminée</h2>
        {winner ? (
          <p className="mt-1 text-lg">
            Vainqueur : <span className="font-bold text-brand">{winner.name}</span>
            {winner.uid === me.uid && ' — c’est toi ! 🎉'}
          </p>
        ) : (
          <p className="mt-1 text-slate-400">Aucun survivant.</p>
        )}
      </div>

      <div className="card">
        <h3 className="font-bold">Classement</h3>
        <ol className="mt-2 space-y-1">
          {ranking.map((p, i) => (
            <li key={p.uid} className="flex items-center justify-between py-1">
              <span>
                <span className="mr-2 text-slate-500">{i + 1}.</span>
                {p.alive ? '' : '💀 '}
                {p.name}
                {p.uid === me.uid && <span className="ml-1 text-xs text-slate-500">(toi)</span>}
              </span>
              <span className="text-sm text-slate-400">{p.kills} kill{p.kills > 1 ? 's' : ''}</span>
            </li>
          ))}
        </ol>
      </div>

      {me.isAdmin && (
        <button className="btn-primary w-full" onClick={() => resetGame(players)}>
          Nouvelle partie
        </button>
      )}
    </div>
  )
}
