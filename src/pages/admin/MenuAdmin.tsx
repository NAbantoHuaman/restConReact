import { FormEvent, useMemo, useState } from 'react'
import { createMenuItem, deleteMenuItem, listCategories, listMenuItems, updateMenuItem } from '../../services/adminDb'
import { PlusCircle, Pencil, Trash2, Image as ImageIcon, CheckCircle } from 'lucide-react'

type Draft = {
  name: string
  description: string
  price: string
  category: string
  imageUrl: string
  available: boolean
}

export default function MenuAdmin() {
  const [items, setItems] = useState(listMenuItems())
  const [filter, setFilter] = useState('')
  const cats = useMemo(() => listCategories(), [items])
  const [draft, setDraft] = useState<Draft>({ name: '', description: '', price: '', category: '', imageUrl: '', available: true })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const onCreate = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setNotice('')
    const name = draft.name.trim()
    const category = draft.category.trim()
    const price = Number(draft.price)
    if (!name || !category) {
      setError('Nombre y categoría son obligatorios')
      return
    }
    if (!Number.isFinite(price) || price <= 0) {
      setError('Precio debe ser un número mayor a 0')
      return
    }
    const created = createMenuItem({ name, description: draft.description.trim(), price, category, imageUrl: draft.imageUrl.trim() || undefined, available: draft.available })
    setItems([created, ...items])
    setDraft({ name: '', description: '', price: '', category: '', imageUrl: '', available: true })
    setNotice('Plato creado correctamente')
    setTimeout(() => setNotice(''), 2500)
  }
  const onUpdate = (id: any, patch: any) => {
    const updated = updateMenuItem(id, patch)
    if (updated) setItems(items.map(i => (i.id === id ? updated : i)))
    setNotice('Plato actualizado')
    setTimeout(() => setNotice(''), 2000)
  }
  const onDelete = (id: any) => {
    const ok = deleteMenuItem(id)
    if (ok) setItems(items.filter(i => i.id !== id))
    setNotice('Plato eliminado')
    setTimeout(() => setNotice(''), 2000)
  }
  const visible = items.filter(i => (filter ? i.category === filter : true))
  return (
    <div className="grid gap-6">
      <div className="text-2xl font-semibold tracking-tight">Menú</div>
      {error && <div className="p-2 rounded bg-red-900/40 border border-red-500 text-red-200 text-sm">{error}</div>}
      {notice && <div className="p-2 rounded bg-emerald-900/30 border border-emerald-600 text-emerald-200 text-sm inline-flex items-center gap-2"><CheckCircle className="h-4 w-4" />{notice}</div>}
      <form onSubmit={onCreate} className="grid gap-3 bg-black/30 border border-amber-700/30 p-4 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input placeholder="Nombre" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} className="bg-neutral-800 text-white border border-neutral-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
          <input placeholder="Precio" value={draft.price} onChange={e => setDraft({ ...draft, price: e.target.value })} className="bg-neutral-800 text-white border border-neutral-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
          <input placeholder="Categoría" value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value })} className="bg-neutral-800 text-white border border-neutral-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
          <input placeholder="Imagen URL" value={draft.imageUrl} onChange={e => setDraft({ ...draft, imageUrl: e.target.value })} className="bg-neutral-800 text-white border border-neutral-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
        <textarea placeholder="Descripción" value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} className="bg-neutral-800 text-white border border-neutral-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
        <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.available} onChange={e => setDraft({ ...draft, available: e.target.checked })} /><span>Disponible</span></label>
        <button className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded px-3 py-2 w-max transition-colors"><PlusCircle className="h-4 w-4" />Agregar plato</button>
      </form>
      <div className="flex items-center gap-2">
        <span className="text-sm text-amber-200">Filtrar categoría</span>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="bg-neutral-800 text-white border border-neutral-700 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-400">
          <option value="">Todas</option>
          {cats.map(c => (<option key={c} value={c}>{c}</option>))}
        </select>
      </div>
      <div className="grid gap-3">
        {visible.map(i => (
          <div key={String(i.id)} className="p-3 bg-black/30 border border-amber-700/30 rounded-xl grid grid-cols-[80px_1fr_auto] gap-3 items-center hover:border-amber-500 transition-colors">
            {i.imageUrl ? <img src={i.imageUrl} alt={i.name} className="w-20 h-20 object-cover rounded" /> : <div className="w-20 h-20 bg-neutral-800 rounded grid place-items-center"><ImageIcon className="h-6 w-6 text-neutral-500" /></div>}
            <div>
              <div className="font-semibold text-white">{i.name}</div>
              <div className="text-sm text-neutral-300">{i.description}</div>
              <div className="text-sm text-amber-200">{i.category} · S/ {i.price.toFixed(2)}</div>
              <label className="inline-flex items-center gap-2 mt-1 text-sm"><input type="checkbox" checked={i.available} onChange={e => onUpdate(i.id, { available: e.target.checked })} /><span>Disponible</span></label>
            </div>
            <div className="flex gap-2">
              <button className="inline-flex items-center gap-1 px-2 py-1 border border-neutral-700 rounded hover:bg-neutral-800 transition-colors" onClick={() => onUpdate(i.id, { name: prompt('Nombre', i.name) || i.name })}><Pencil className="h-4 w-4" />Editar</button>
              <button className="inline-flex items-center gap-1 px-2 py-1 border border-red-700 rounded text-red-400 hover:bg-red-900/40 transition-colors" onClick={() => onDelete(i.id)}><Trash2 className="h-4 w-4" />Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}