import { FormEvent, useMemo, useState } from 'react'
import { createMenuItem, deleteMenuItem, listCategories, listMenuItems, updateMenuItem } from '../../services/adminDb'
import { PlusCircle, Pencil, Trash2, Image as ImageIcon, CheckCircle } from 'lucide-react'
import Card from '../../components/admin/ui/Card'
import Button from '../../components/admin/ui/Button'
import Input from '../../components/admin/ui/Input'

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Menú</h1>
        {notice && <div className="inline-flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-200"><CheckCircle className="h-4 w-4" />{notice}</div>}
      </div>
      {error && <div role="alert" className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/40 dark:border-red-600 dark:text-red-200 text-sm">{error}</div>}
      <Card className="p-4">
        <form onSubmit={onCreate} className="grid gap-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input label="Nombre" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} />
            <Input label="Precio" value={draft.price} onChange={e => setDraft({ ...draft, price: e.target.value })} />
            <Input label="Categoría" value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value })} />
            <Input label="Imagen URL" value={draft.imageUrl} onChange={e => setDraft({ ...draft, imageUrl: e.target.value })} />
          </div>
          <textarea placeholder="Descripción" value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-3 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-accent-300" />
          <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.available} onChange={e => setDraft({ ...draft, available: e.target.checked })} /><span>Disponible</span></label>
          <Button type="submit"><PlusCircle className="h-4 w-4" />Agregar plato</Button>
        </form>
      </Card>
      <div className="flex items-center gap-2">
        <span className="text-sm text-neutral-600 dark:text-neutral-300">Filtrar categoría</span>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="bg-transparent border border-neutral-300 dark:border-neutral-700 rounded-xl px-2 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-accent-300">
          <option value="">Todas</option>
          {cats.map(c => (<option key={c} value={c}>{c}</option>))}
        </select>
      </div>
      <div className="grid gap-3">
        {visible.map(i => (
          <Card key={String(i.id)} className="p-3 grid grid-cols-[80px_1fr_auto] gap-3 items-center">
            {i.imageUrl ? <img src={i.imageUrl} alt={i.name} className="w-20 h-20 object-cover rounded-xl" /> : <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-xl grid place-items-center"><ImageIcon className="h-6 w-6 text-neutral-500" /></div>}
            <div>
              <div className="font-semibold">{i.name}</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-300">{i.description}</div>
              <div className="text-sm text-accent-700 dark:text-accent-300">{i.category} · S/ {i.price.toFixed(2)}</div>
              <label className="inline-flex items-center gap-2 mt-1 text-sm"><input type="checkbox" checked={i.available} onChange={e => onUpdate(i.id, { available: e.target.checked })} /><span>Disponible</span></label>
            </div>
            <div className="flex gap-2 justify-self-end">
              <Button variant="outline" size="sm" onClick={() => onUpdate(i.id, { name: prompt('Nombre', i.name) || i.name })}><Pencil className="h-4 w-4" />Editar</Button>
              <Button variant="danger" size="sm" onClick={() => onDelete(i.id)}><Trash2 className="h-4 w-4" />Eliminar</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}