import { useEffect, useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

function isOverdue(due) {
  if (!due) return false
  const d = new Date(due); d.setHours(0, 0, 0, 0)
  const t = new Date(); t.setHours(0, 0, 0, 0)
  return d < t
}
function iso(daysFromNow) {
  const d = new Date(); d.setDate(d.getDate() + daysFromNow)
  return d.toISOString().slice(0, 10)
}

let _id = 1000
const nid = () => ++_id

// Sample data used when no backend is reachable (frontend-only demo).
function demoBoard() {
  const alice = { id: 1, name: 'Alice' }, bob = { id: 2, name: 'Bob' }
  return {
    id: 1, name: 'Forge 2 Demo Board', members: [alice, bob],
    lists: [
      { id: 1, name: 'To-Do', cards: [
        { id: 1, list_id: 1, title: 'Design the board UI', description: 'Columns, cards, move between lists.', member_id: 1, member: alice, due_date: iso(3), tags: [{ id: 1, name: 'design', color: '#8b5cf6' }] },
        { id: 2, list_id: 1, title: 'Write the REST API', description: 'Laravel + SQLite.', member_id: 2, member: bob, due_date: iso(-1), tags: [{ id: 2, name: 'backend', color: '#10b981' }, { id: 3, name: 'urgent', color: '#ef4444' }] },
      ] },
      { id: 2, name: 'Doing', cards: [
        { id: 3, list_id: 2, title: 'Wire frontend to the API', member_id: 1, member: alice, due_date: null, tags: [{ id: 4, name: 'frontend', color: '#3b82f6' }] },
      ] },
      { id: 3, name: 'Done', cards: [
        { id: 4, list_id: 3, title: 'Set up the GitHub repo', description: 'Public repo + docs.', member_id: null, member: null, due_date: null, tags: [] },
      ] },
    ],
  }
}

export default function App() {
  const [board, setBoard] = useState(null)
  const [demo, setDemo] = useState(false)
  const [newList, setNewList] = useState('')

  const load = async () => {
    try {
      const res = await fetch(`${API}/boards`)
      if (!res.ok) throw new Error('http ' + res.status)
      const boards = await res.json()
      setBoard(boards[0] || demoBoard())
      setDemo(false)
    } catch {
      setBoard(demoBoard())
      setDemo(true)
    }
  }
  useEffect(() => { load() }, [])

  const POST = (u, b) => fetch(`${API}${u}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) })
  const PATCH = (u, b) => fetch(`${API}${u}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) })
  const DEL = (u) => fetch(`${API}${u}`, { method: 'DELETE' })

  // Apply a mutation: demo -> local state; live -> API then reload (fall back to local if the API drops).
  const apply = async (localFn, apiCall) => {
    if (demo) { setBoard(b => { const nb = structuredClone(b); localFn(nb); return nb }); return }
    try { await apiCall(); await load() }
    catch { setDemo(true); setBoard(b => { const nb = structuredClone(b); localFn(nb); return nb }) }
  }

  if (!board) return <div className="wrap"><h1>Forge 2 Kanban</h1><p style={{ color: '#fff' }}>Loading…</p></div>

  const lists = board.lists
  const find = (nb, id) => { for (const l of nb.lists) { const c = l.cards.find(c => c.id === id); if (c) return [l, c] } return [] }

  const addList = (name) => apply(nb => nb.lists.push({ id: nid(), name, cards: [] }), () => POST(`/boards/${board.id}/lists`, { name }))
  const addMember = (name) => apply(nb => nb.members.push({ id: nid(), name }), () => POST(`/boards/${board.id}/members`, { name }))
  const addCard = (listId, title) => apply(
    nb => nb.lists.find(l => l.id === listId).cards.push({ id: nid(), list_id: listId, title, description: null, member_id: null, member: null, due_date: null, tags: [] }),
    () => POST(`/lists/${listId}/cards`, { title }))
  const delCard = (card) => apply(nb => { const [l] = find(nb, card.id); l.cards = l.cards.filter(x => x.id !== card.id) }, () => DEL(`/cards/${card.id}`))
  const moveCard = (card, dir) => {
    const idx = lists.findIndex(l => l.id === card.list_id); const target = lists[idx + dir]; if (!target) return
    apply(nb => {
      const [l, c] = find(nb, card.id); l.cards = l.cards.filter(x => x.id !== card.id); c.list_id = target.id
      nb.lists.find(x => x.id === target.id).cards.push(c)
    }, () => PATCH(`/cards/${card.id}`, { list_id: target.id }))
  }
  const addTag = (card, name, color) => apply(nb => { const [, c] = find(nb, card.id); c.tags.push({ id: nid(), name, color }) }, () => POST(`/cards/${card.id}/tags`, { name, color }))
  const setMember = (card, memberId) => apply(
    nb => { const [, c] = find(nb, card.id); c.member_id = memberId ? Number(memberId) : null; c.member = nb.members.find(m => m.id === Number(memberId)) || null },
    () => PATCH(`/cards/${card.id}`, { member_id: memberId || null }))
  const setDue = (card, due) => apply(nb => { const [, c] = find(nb, card.id); c.due_date = due || null }, () => PATCH(`/cards/${card.id}`, { due_date: due || null }))

  return (
    <div className="wrap">
      {demo && (
        <div className="banner">
          🧩 <b>Frontend demo</b> — running on sample data in your browser (no backend connected). This is the React UI only.
          For the full app with the Laravel API + saved data, clone the repo and run it locally — see the <b>README</b>.
        </div>
      )}
      <header>
        <div className="brand">
          <div className="logo">◆</div>
          <div>
            <h1>{board.name}</h1>
            <p className="sub">Two-agent Kanban · Hermes plans · OpenClaw builds</p>
          </div>
        </div>
        <div className="members">
          👥 {board.members.map(m => m.name).join(', ') || 'no members'}
          <button onClick={() => { const n = prompt('Member name'); if (n) addMember(n) }}>+ member</button>
        </div>
      </header>

      <div className="cols">
        {lists.map((list, li) => (
          <div className="col" key={list.id}>
            <h2>{list.name} <span className="count">{list.cards.length}</span></h2>
            {list.cards.map(card => (
              <div className="card" key={card.id}>
                <div className="card-top">
                  <strong>{card.title}</strong>
                  <button className="x" onClick={() => delCard(card)}>✕</button>
                </div>
                {card.description && <p className="desc">{card.description}</p>}
                <div className="tags">
                  {card.tags.map(t => <span className="tag" key={t.id} style={{ background: t.color }}>{t.name}</span>)}
                  <button className="addtag" onClick={() => { const n = prompt('Tag name'); if (!n) return; const c = prompt('Color (hex)', '#3b82f6'); addTag(card, n, c || '#3b82f6') }}>+ tag</button>
                </div>
                <div className="meta">
                  <select value={card.member_id || ''} onChange={e => setMember(card, e.target.value)}>
                    <option value="">— assignee —</option>
                    {board.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <input type="date" value={card.due_date ? String(card.due_date).slice(0, 10) : ''} onChange={e => setDue(card, e.target.value)} className={isOverdue(card.due_date) ? 'overdue' : ''} />
                </div>
                <div className="move">
                  <button disabled={li === 0} onClick={() => moveCard(card, -1)}>◀</button>
                  <button disabled={li === lists.length - 1} onClick={() => moveCard(card, 1)}>▶</button>
                </div>
              </div>
            ))}
            <AddCard onAdd={(title) => addCard(list.id, title)} />
          </div>
        ))}
        <div className="col add-col">
          <input placeholder="+ new list (Enter)" value={newList} onChange={e => setNewList(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newList) { addList(newList); setNewList('') } }} />
        </div>
      </div>
    </div>
  )
}

function AddCard({ onAdd }) {
  const [t, setT] = useState('')
  return (
    <div className="add-card">
      <input placeholder="+ add card (Enter)" value={t} onChange={e => setT(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && t) { onAdd(t); setT('') } }} />
    </div>
  )
}
