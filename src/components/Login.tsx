import { ALLOWED_DOMAIN } from '../config'

export default function Login({
  onSignIn,
  error,
}: {
  onSignIn: () => void
  error: string | null
}) {
  return (
    <div className="flex min-h-full items-center justify-center p-6">
      <div className="card w-full max-w-sm text-center">
        <div className="mb-3 text-5xl">🔪</div>
        <h1 className="text-2xl font-extrabold">
          Killer <span className="text-brand">Ondorse</span>
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Connecte-toi avec ton compte <strong>@{ALLOWED_DOMAIN}</strong> pour rejoindre la partie.
        </p>
        <button onClick={onSignIn} className="btn-primary mt-6 w-full">
          Se connecter avec Google
        </button>
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </div>
    </div>
  )
}
