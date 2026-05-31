import type { Player } from '../types'

export default function Dashboard({ players, meUid }: { players: Player[]; meUid: string }) {
  const alive = players.filter((p) => p.alive).sort((a, b) => b.kills - a.kills)
  const dead = players.filter((p) => !p.alive).sort((a, b) => b.kills - a.kills)

  return (
    <div className="mt-4 space-y-4">
      <div className="card">
        <h3 className="font-bold text-emerald-400">En vie ({alive.length})</h3>
        <ul className="mt-2 space-y-2">
          {alive.map((p) => (
            <PlayerRow key={p.uid} p={p} meUid={meUid} />
          ))}
        </ul>
      </div>

      {dead.length > 0 && (
        <div className="card">
          <h3 className="font-bold text-slate-400">Morts ({dead.length})</h3>
          <ul className="mt-2 space-y-2">
            {dead.map((p) => (
              <PlayerRow key={p.uid} p={p} meUid={meUid} dead />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function PlayerRow({ p, meUid, dead }: { p: Player; meUid: string; dead?: boolean }) {
  return (
    <li className={`rounded-xl border border-slate-800 p-3 ${dead ? 'opacity-70' : ''}`}>
      <div className="flex items-center justify-between">
        <span className="font-medium">
          {dead && '💀 '}
          {p.name}
          {p.uid === meUid && <span className="ml-1 text-xs text-slate-500">(toi)</span>}
        </span>
        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs">
          {p.kills} kill{p.kills > 1 ? 's' : ''}
        </span>
      </div>
      {p.killedNames.length > 0 && (
        <p className="mt-1 text-xs text-slate-500">A éliminé : {p.killedNames.join(', ')}</p>
      )}
      {dead && p.killedByName && (
        <p className="mt-1 text-xs text-red-400">Éliminé par : {p.killedByName}</p>
      )}
    </li>
  )
}
