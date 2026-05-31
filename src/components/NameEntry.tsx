import { useState } from 'react'
import type { User } from 'firebase/auth'
import { joinAsPlayer } from '../game'

export default function NameEntry({ user }: { user: User }) {
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed.length < 2) {
      setErr('Entre un prénom valide.')
      return
    }
    setBusy(true)
    setErr(null)
    try {
      await joinAsPlayer(user, trimmed)
    } catch (e: any) {
      setErr(e?.message || 'Erreur.')
      setBusy(false)
    }
  }

  return (
    <div className="card mt-6">
      <h2 className="text-lg font-bold">Bienvenue ! 👋</h2>
      <p className="mt-1 text-sm text-slate-400">Choisis le prénom affiché aux autres joueurs.</p>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <input
          autoFocus
          className="input"
          placeholder="Ton prénom"
          value={name}
          maxLength={24}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? 'Connexion…' : 'Rejoindre la salle d’attente'}
        </button>
        {err && <p className="text-sm text-red-400">{err}</p>}
      </form>
    </div>
  )
}
