import { useEffect, useRef, useState } from 'react'
import { updateGages } from '../game'

export default function GageManager({ gages }: { gages: string[] }) {
  const [text, setText] = useState(gages.join('\n'))
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Resynchronise si la liste change côté serveur (et qu'on n'édite pas).
  useEffect(() => {
    setText(gages.join('\n'))
  }, [gages.join('\n')])

  const parsed = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  const save = async () => {
    await updateGages(parsed)
    setSavedAt(Date.now())
    setTimeout(() => setSavedAt(null), 2000)
  }

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const content = await file.text()
    setText(content)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="card mt-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">Gages ({parsed.length})</h3>
        <button className="text-xs text-slate-400 underline" onClick={() => fileRef.current?.click()}>
          Importer un fichier .txt/.csv
        </button>
        <input ref={fileRef} type="file" accept=".txt,.csv,text/plain" className="hidden" onChange={onFile} />
      </div>
      <p className="mt-1 text-xs text-slate-500">Un gage par ligne. Chaque joueur en reçoit un au lancement.</p>
      <textarea
        className="input mt-3 h-40 resize-y font-mono text-sm"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="mt-3 flex items-center gap-3">
        <button className="btn-ghost" onClick={save}>
          Enregistrer les gages
        </button>
        {savedAt && <span className="text-sm text-emerald-400">Enregistré ✓</span>}
      </div>
    </div>
  )
}
