import { listLogs } from '../../services/adminDb'
import { FileText } from 'lucide-react'

export default function AdminLogs() {
  const logs = listLogs()
  return (
    <div className="grid gap-6">
      <div className="text-2xl font-semibold tracking-tight">Logs</div>
      <div className="grid gap-2">
        {logs.map(l => (
          <div key={String(l.id)} className="p-3 bg-black/30 border border-amber-700/30 rounded-xl">
            <div className="text-sm text-neutral-300 flex items-center gap-2"><FileText className="h-4 w-4 text-amber-300" />{new Date(l.at).toLocaleString()}</div>
            <div className="mt-1 inline-block text-xs uppercase tracking-wide bg-neutral-800 text-amber-200 border border-neutral-700 rounded px-2 py-0.5">{l.type}</div>
            <pre className="mt-2 text-xs overflow-auto bg-neutral-900 text-neutral-200 rounded p-2 border border-neutral-800">{JSON.stringify(l.payload, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  )
}