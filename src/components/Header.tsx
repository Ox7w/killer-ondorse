import type { User } from 'firebase/auth'
import type { Player } from '../types'

export default function Header({
  user,
  me,
  onLogout,
}: {
  user: User
  me: Player | undefined
  onLogout: () => void
}) {
  return (
    <header className="flex items-center justify-between py-4">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🔪</span>
        <div>
          <h1 className="text-lg font-extrabold leading-none tracking-tight">
            Killer <span className="text-brand">Ondorse</span>
          </h1>
          <p className="text-xs text-slate-500">
            {me?.name || user.email}
            {me?.isAdmin && <span className="ml-1 text-brand">· admin</span>}
          </p>
        </div>
      </div>
      <button onClick={onLogout} className="text-xs text-slate-400 underline hover:text-slate-200">
        Déconnexion
      </button>
    </header>
  )
}
