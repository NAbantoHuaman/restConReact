import { listLogs } from '../../services/adminDb'
import { FileText } from 'lucide-react'
import Card from '../../components/admin/ui/Card'

export default function AdminLogs() {
  const logs = listLogs()
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Logs</h1>
      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-neutral-600 dark:text-neutral-300">
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Detalles</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <tr key={String(l.id)} className="border-b border-neutral-200 dark:border-neutral-800 odd:bg-neutral-50 dark:odd:bg-neutral-900">
                  <td className="px-4 py-3 align-top"><span className="inline-flex items-center gap-2"><FileText className="h-4 w-4 text-accent-600 dark:text-accent-400" />{new Date(l.at).toLocaleString()}</span></td>
                  <td className="px-4 py-3 align-top"><span className="inline-block text-xs uppercase tracking-wide bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 rounded px-2 py-0.5">{l.type}</span></td>
                  <td className="px-4 py-3 align-top">
                    <pre className="text-xs overflow-auto bg-transparent text-neutral-800 dark:text-neutral-200 rounded p-0">{JSON.stringify(l.payload, null, 2)}</pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}