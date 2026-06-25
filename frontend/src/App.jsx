import { useEffect, useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:7901/api'
const API_LABEL = API.replace(/^https?:\/\//, '').replace(/\/api$/, '')

const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x }
function dueInfo(due) {
  if (!due) return null
  const days = Math.round((startOfDay(due) - startOfDay(new Date())) / 86400000)
  if (days < 0) return { text: 'Overdue', cls: 'due-over' }
  if (days === 0) return { text: 'Today', cls: 'due-soon' }
  if (days <= 2) return { text: days + 'd left', cls: 'due-soon' }
  return { text: 'in ' + days + 'd', cls: 'due-ok' }
}
const iso = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10) }
const initials = (n) => n.split(/\s+/).map(w => w[0] || '').join('').slice(0, 2).toUpperCase()
function hue(s) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 360; return h }

let _id = 1000
const nid = () => ++_id

function demoBoard() {
  const alice = { id: 1, name: 'Alice' }, bob = { id: 2, name: 'Bob' }
  return {
    id: 1, name: 'Forge 2 Demo Board', members: [alice, bob],
    lists: [
      { id: 1, name: 'To-Do', cards: [
        { id: 1, list_id: 1, title: 'Design the board UI', description: 'Columns, cards, drag between lists.', member_id: 1, member: alice, due_date: iso(3), tags: [{ id: 1, name: 'design', color: '#8b5cf6' }] },
        { id: 2, list_id: 1, title: 'Write the REST API', description: 'Laravel + SQLite.', member_id: 2, member: bob, due_date: iso(-1), tags: [{ id: 2, name: 'backend', color: '#10b981' }, { id: 3, name: 'urgent', color: '#ef4444' }] },
      ] },
      { id: 2, name: 'Doing', cards: [
        { id: 3, list_id: 2, title: 'Wire frontend to the API', member_id: 1, member: alice, due_date: iso(1), tags: [{ id: 4, name: 'frontend', color: '#3b82f6' }] },
      ] },
      { id: 3, name: 'Done', cards: [
        { id: 4, list_id: 3, title: 'Set up the GitHub repo', description: 'Public repo and docs.', member_id: null, member: null, due_date: null, tags: [] },
      ] },
    ],
  }
}

function Avatar({ name, size = 26 }) {
  if (!name) return <span className="avatar empty-av" style={{ width: size, height: size }}>?</span>
  return <span className="avatar" style={{ width: size, height: size, background: `hsl(${hue(name)} 65% 45%)` }} title={name}>{initials(name)}</span>
}

const COL_COLORS = ['#64748b', '#7c8cff', '#22d3ee', '#34d399', '#f59e0b', '#f472b6']

export default function App() {
  const [board, setBoard] = useState(null)
  const [demo, setDemo] = useState(false)
  const [apiOk, setApiOk] = useState(false)
  const [newList, setNewList] = useState('')
  const [q, setQ] = useState('')
  const [dragId, setDragId] = useState(null)
  const [dropId, setDropId] = useState(null)

  const load = async () => {
    try {
      const res = await fetch(`${API}/boards`)
      if (!res.ok) throw new Error('http ' + res.status)
      const boards = await res.json()
      setBoard(boards[0] || demoBoard()); setDemo(false); setApiOk(true)
    } catch { setBoard(demoBoard()); setDemo(true); setApiOk(false) }
  }
  useEffect(() => { load() }, [])

  const POST = (u, b) => fetch(`${API}${u}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) })
  const PATCH = (u, b) => fetch(`${API}${u}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) })
  const DEL = (u) => fetch(`${API}${u}`, { method: 'DELETE' })
  const apply = async (localFn, apiCall) => {
    if (demo) { setBoard(b => { const nb = structuredClone(b); localFn(nb); return nb }); return }
    try { await apiCall(); await load() }
    catch { setDemo(true); setBoard(b => { const nb = structuredClone(b); localFn(nb); return nb }) }
  }

  if (!board) return <div className="wrap"><h1>Forge 2 Kanban</h1><p style={{ color: '#8b93a7' }}>Loading...</p></div>

  const lists = board.lists
  const find = (nb, id) => { for (const l of nb.lists) { const c = l.cards.find(c => c.id === id); if (c) return [l, c] } return [] }
  const all = lists.flatMap(l => l.cards)
  const total = all.length
  const doneList = lists.find(l => /done|complete|shipped/i.test(l.name)) || lists[lists.length - 1]
  const done = doneList ? doneList.cards.length : 0
  const overdue = all.filter(c => dueInfo(c.due_date)?.cls === 'due-over').length
  const pct = total ? Math.round(done / total * 100) : 0
  const match = (c) => !q || (c.title + ' ' + (c.description || '') + ' ' + c.tags.map(t => t.name).join(' ')).toLowerCase().includes(q.toLowerCase())

  const addList = (name) => apply(nb => nb.lists.push({ id: nid(), name, cards: [] }), () => POST(`/boards/${board.id}/lists`, { name }))
  const addMember = (name) => apply(nb => nb.members.push({ id: nid(), name }), () => POST(`/boards/${board.id}/members`, { name }))
  const addCard = (listId, title) => apply(nb => nb.lists.find(l => l.id === listId).cards.push({ id: nid(), list_id: listId, title, description: null, member_id: null, member: null, due_date: null, tags: [] }), () => POST(`/lists/${listId}/cards`, { title }))
  const delCard = (card) => apply(nb => { const [l] = find(nb, card.id); l.cards = l.cards.filter(x => x.id !== card.id) }, () => DEL(`/cards/${card.id}`))
  const moveTo = (card, listId) => { if (card.list_id === listId) return; apply(nb => { const [l, c] = find(nb, card.id); l.cards = l.cards.filter(x => x.id !== card.id); c.list_id = listId; nb.lists.find(x => x.id === listId).cards.push(c) }, () => PATCH(`/cards/${card.id}`, { list_id: listId })) }
  const addTag = (card, name, color) => apply(nb => { const [, c] = find(nb, card.id); c.tags.push({ id: nid(), name, color }) }, () => POST(`/cards/${card.id}/tags`, { name, color }))
  const setMember = (card, memberId) => apply(nb => { const [, c] = find(nb, card.id); c.member_id = memberId ? Number(memberId) : null; c.member = nb.members.find(m => m.id === Number(memberId)) || null }, () => PATCH(`/cards/${card.id}`, { member_id: memberId || null }))
  const setDue = (card, due) => apply(nb => { const [, c] = find(nb, card.id); c.due_date = due || null }, () => PATCH(`/cards/${card.id}`, { due_date: due || null }))

  return (
    <div className="wrap">
      {apiOk && !demo && (
        <div className="banner connected">
          ✓ <b>Live API connected.</b> Board data from Laravel via <code>{API_LABEL}</code> — create, move, and tag cards; changes persist in SQLite.
        </div>
      )}
      {demo && (
        <div className="banner">
          🧩 <b>Frontend demo.</b> No reachable API at <code>{API}</code> — showing sample data in your browser only.
          Start Laravel + ngrok and set <code>VITE_API_URL</code> (see <b>DEPLOYMENT.md</b>).
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
          <div className="avatars">{board.members.map(m => <Avatar key={m.id} name={m.name} />)}</div>
          <button onClick={() => { const n = prompt('Member name'); if (n) addMember(n) }}>+ member</button>
        </div>
      </header>

      <div className="stats">
        <div className="stat"><div className="stat-v">{total}</div><div className="stat-l">Cards</div></div>
        <div className="stat"><div className="stat-v">{done}</div><div className="stat-l">Done</div></div>
        <div className="stat"><div className={'stat-v' + (overdue ? ' danger' : '')}>{overdue}</div><div className="stat-l">Overdue</div></div>
        <div className="stat"><div className="stat-v">{board.members.length}</div><div className="stat-l">Members</div></div>
        <div className="progress">
          <div className="progress-head"><span>Progress</span><span>{pct}%</span></div>
          <div className="bar"><div className="fill" style={{ width: pct + '%' }} /></div>
        </div>
        <input className="search" placeholder="🔍  Search cards, tags..." value={q} onChange={e => setQ(e.target.value)} />
      </div>

      <div className="cols">
        {lists.map((list, li) => {
          const shown = list.cards.filter(match)
          return (
            <div className={'col' + (dropId === list.id ? ' drop' : '')} key={list.id}
              onDragOver={e => { e.preventDefault(); if (dropId !== list.id) setDropId(list.id) }}
              onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDropId(d => (d === list.id ? null : d)) }}
              onDrop={e => { e.preventDefault(); setDropId(null); const c = all.find(x => x.id === dragId); if (c) moveTo(c, list.id); setDragId(null) }}>
              <h2><span className="col-name"><span className="cdot" style={{ background: COL_COLORS[li % COL_COLORS.length] }} />{list.name}</span><span className="count">{list.cards.length}</span></h2>
              {shown.map(card => {
                const di = dueInfo(card.due_date)
                return (
                  <div className={'card' + (dragId === card.id ? ' dragging' : '')} key={card.id} draggable
                    onDragStart={() => setDragId(card.id)} onDragEnd={() => setDragId(null)}>
                    <div className="card-top">
                      <strong>{card.title}</strong>
                      <button className="x" onClick={() => delCard(card)}>✕</button>
                    </div>
                    {card.description && <p className="desc">{card.description}</p>}
                    <div className="tags">
                      {card.tags.map(t => <span className="tag" key={t.id} style={{ background: t.color }}>{t.name}</span>)}
                      <button className="addtag" onClick={() => { const n = prompt('Tag name'); if (!n) return; const c = prompt('Color (hex)', '#7c8cff'); addTag(card, n, c || '#7c8cff') }}>+ tag</button>
                    </div>
                    <div className="card-foot">
                      <label className="assign">
                        <Avatar name={card.member?.name} size={22} />
                        <select value={card.member_id || ''} onChange={e => setMember(card, e.target.value)}>
                          <option value="">Unassigned</option>
                          {board.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                      </label>
                      <label className={'duewrap ' + (di ? di.cls : 'due-none')}>
                        {di ? di.text : '📅 due'}
                        <input type="date" value={card.due_date ? String(card.due_date).slice(0, 10) : ''} onChange={e => setDue(card, e.target.value)} />
                      </label>
                      <div className="move">
                        <button disabled={li === 0} onClick={() => moveTo(card, lists[li - 1].id)} title="Move left">◀</button>
                        <button disabled={li === lists.length - 1} onClick={() => moveTo(card, lists[li + 1].id)} title="Move right">▶</button>
                      </div>
                    </div>
                  </div>
                )
              })}
              {shown.length === 0 && <div className="empty">{q ? 'No matches' : 'Drop cards here'}</div>}
              <AddCard onAdd={(t) => addCard(list.id, t)} />
            </div>
          )
        })}
        <div className="col add-col">
          <input placeholder="+ new list" value={newList} onChange={e => setNewList(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newList) { addList(newList); setNewList('') } }} />
        </div>
      </div>
    </div>
  )
}

function AddCard({ onAdd }) {
  const [t, setT] = useState('')
  return <div className="add-card"><input placeholder="+ add card" value={t} onChange={e => setT(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && t) { onAdd(t); setT('') } }} /></div>
}
