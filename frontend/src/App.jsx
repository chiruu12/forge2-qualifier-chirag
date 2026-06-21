import { useEffect, useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

function isOverdue(due) {
  if (!due) return false
  const d = new Date(due); d.setHours(0, 0, 0, 0)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return d < today
}

export default function App() {
  const [board, setBoard] = useState(null)
  const [error, setError] = useState(null)
  const [newList, setNewList] = useState('')

  const load = async () => {
    try {
      const res = await fetch(`${API}/boards`)
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const boards = await res.json()
      setBoard(boards[0] || null)
      setError(null)
    } catch (e) {
      setError(e.message)
    }
  }
  useEffect(() => { load() }, [])

  const post = (url, body) => fetch(`${API}${url}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(load)
  const patch = (url, body) => fetch(`${API}${url}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(load)
  const del = (url) => fetch(`${API}${url}`, { method: 'DELETE' }).then(load)

  if (error) return (
    <div className="wrap">
      <h1>Forge 2 Kanban</h1>
      <p className="err">Can't reach the API at <code>{API}</code> ({error}). Start the backend: <code>php artisan serve</code></p>
    </div>
  )
  if (!board) return <div className="wrap"><h1>Forge 2 Kanban</h1><p style={{ color: '#fff' }}>Loading…</p></div>

  const lists = board.lists || []
  const moveCard = (card, dir) => {
    const idx = lists.findIndex(l => l.id === card.list_id)
    const target = lists[idx + dir]
    if (target) patch(`/cards/${card.id}`, { list_id: target.id })
  }

  return (
    <div className="wrap">
      <header>
        <h1>{board.name}</h1>
        <div className="members">
          👥 {board.members.map(m => m.name).join(', ') || 'no members'}
          <button onClick={() => { const n = prompt('Member name'); if (n) post(`/boards/${board.id}/members`, { name: n }) }}>+ member</button>
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
                  <button className="x" onClick={() => del(`/cards/${card.id}`)}>✕</button>
                </div>
                {card.description && <p className="desc">{card.description}</p>}
                <div className="tags">
                  {card.tags.map(t => <span className="tag" key={t.id} style={{ background: t.color }}>{t.name}</span>)}
                  <button className="addtag" onClick={() => { const n = prompt('Tag name'); if (!n) return; const c = prompt('Color (hex)', '#3b82f6'); post(`/cards/${card.id}/tags`, { name: n, color: c || '#3b82f6' }) }}>+ tag</button>
                </div>
                <div className="meta">
                  <select value={card.member_id || ''} onChange={e => patch(`/cards/${card.id}`, { member_id: e.target.value || null })}>
                    <option value="">— assignee —</option>
                    {board.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <input
                    type="date"
                    value={card.due_date ? String(card.due_date).slice(0, 10) : ''}
                    onChange={e => patch(`/cards/${card.id}`, { due_date: e.target.value || null })}
                    className={isOverdue(card.due_date) ? 'overdue' : ''}
                  />
                </div>
                <div className="move">
                  <button disabled={li === 0} onClick={() => moveCard(card, -1)}>◀</button>
                  <button disabled={li === lists.length - 1} onClick={() => moveCard(card, 1)}>▶</button>
                </div>
              </div>
            ))}
            <AddCard onAdd={(title) => post(`/lists/${list.id}/cards`, { title })} />
          </div>
        ))}
        <div className="col add-col">
          <input
            placeholder="+ new list (Enter)"
            value={newList}
            onChange={e => setNewList(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && newList) { post(`/boards/${board.id}/lists`, { name: newList }); setNewList('') } }}
          />
        </div>
      </div>
    </div>
  )
}

function AddCard({ onAdd }) {
  const [t, setT] = useState('')
  return (
    <div className="add-card">
      <input
        placeholder="+ add card (Enter)"
        value={t}
        onChange={e => setT(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && t) { onAdd(t); setT('') } }}
      />
    </div>
  )
}
