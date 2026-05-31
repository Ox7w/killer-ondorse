import { useEffect, useMemo, useState } from 'react'
import { firebaseReady } from './firebase'
import { useAuth, useGame, usePlayers } from './hooks'
import { ensureGameDoc } from './game'
import Login from './components/Login'
import NameEntry from './components/NameEntry'
import WaitingRoom from './components/WaitingRoom'
import Game from './components/Game'
import EndScreen from './components/EndScreen'
import Header from './components/Header'
import Spinner from './components/Spinner'

export default function App() {
  if (!firebaseReady) return <ConfigMissing />

  const { user, loading, error, signIn, logout } = useAuth()
  const game = useGame()
  const players = usePlayers()
  const [ensured, setEnsured] = useState(false)

  useEffect(() => {
    if (user && !ensured) {
      ensureGameDoc().finally(() => setEnsured(true))
    }
  }, [user, ensured])

  const me = useMemo(
    () => (user ? players.find((p) => p.uid === user.uid) : undefined),
    [user, players]
  )

  if (loading) return <Centered><Spinner /></Centered>
  if (!user) return <Login onSignIn={signIn} error={error} />
  if (game === undefined) return <Centered><Spinner /></Centered>

  // L'utilisateur est connecté mais n'a pas encore rejoint (pas de prénom).
  const joined = !!me
  const canJoinLobby = game?.status === 'waiting'

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col px-4 pb-10">
      <Header user={user} me={me} onLogout={logout} />
      <main className="flex-1">
        {!joined && canJoinLobby && <NameEntry user={user} />}
        {!joined && !canJoinLobby && <Spectator />}
        {joined && game?.status === 'waiting' && (
          <WaitingRoom me={me!} players={players} gages={game.gages} />
        )}
        {joined && game?.status === 'running' && (
          <Game me={me!} players={players} />
        )}
        {joined && game?.status === 'finished' && (
          <EndScreen me={me!} players={players} winnerUid={game.winnerUid} />
        )}
      </main>
    </div>
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-full items-center justify-center p-6">{children}</div>
}

function Spectator() {
  return (
    <div className="card mt-6 text-center">
      <h2 className="mb-2 text-lg font-bold">Partie en cours 🔒</h2>
      <p className="text-slate-400">
        Une partie est déjà lancée et tu n'y participes pas. Attends qu'elle se termine
        pour rejoindre la prochaine.
      </p>
    </div>
  )
}

function ConfigMissing() {
  return (
    <div className="flex min-h-full items-center justify-center p-6">
      <div className="card max-w-md">
        <h1 className="mb-2 text-xl font-bold text-brand">Configuration Firebase manquante</h1>
        <p className="text-slate-300">
          Copie <code className="rounded bg-slate-800 px-1">.env.example</code> en{' '}
          <code className="rounded bg-slate-800 px-1">.env</code> et renseigne les clés de ton
          projet Firebase, puis relance <code className="rounded bg-slate-800 px-1">npm run dev</code>.
        </p>
        <p className="mt-3 text-sm text-slate-500">Voir le README pour le pas-à-pas.</p>
      </div>
    </div>
  )
}
