'use client';

import { useEffect, useState } from 'react';

interface ManifestItem { key: string; title: string; order: number }

export default function AdminPage() {
  const [items, setItems] = useState<ManifestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/login');
        const data = await res.json();
        if (data?.authenticated) {
          setAuthed(true);
          await load();
        }
      } catch {}
    })();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/manifest', { cache: 'no-store' });
      const data = await res.json();
      const list = Array.isArray(data?.items) ? data.items : [];
      list.sort((a: ManifestItem, b: ManifestItem) => (a.order ?? 0) - (b.order ?? 0));
      setItems(list);
    } catch (e: any) {
      setError('Failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function save(next: ManifestItem[]) {
    const res = await fetch('/api/admin/manifest', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: next })
    });
    if (!res.ok) throw new Error('Save failed');
    await load();
  }

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (!res.ok) {
        setError('Incorrect password');
        return;
      }
      setAuthed(true);
      setPassword('');
      await load();
    } catch (e) {
      setError('Login failed');
    }
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...items];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    const tmp = next[index];
    next[index] = next[target];
    next[target] = tmp;
    // Reassign sequential order
    const normalized = next.map((i, idx) => ({ ...i, order: idx }));
    setItems(normalized);
  }

  async function onSave() {
    try {
      await save(items);
    } catch (e) {
      setError('Save failed');
    }
  }

  async function onDelete(key: string) {
    if (!confirm('Delete this image?')) return;
    try {
      const res = await fetch('/api/admin/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId: key })
      });
      if (!res.ok) throw new Error('Delete failed');
      await load();
    } catch (e) {
      setError('Delete failed');
    }
  }

  if (!authed) {
    return (
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Admin Login</h1>
        <form onSubmit={onLogin} className="space-y-4">
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" className="w-full px-3 py-2 border rounded" />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Manage Artworks</h1>
        <button onClick={onSave} className="px-4 py-2 bg-emerald-600 text-white rounded">Save Changes</button>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={item.key} className="flex items-center gap-3 border rounded p-3 bg-white">
              <div className="flex-1">
                <input
                  value={item.title}
                  onChange={(e)=>{
                    const next = [...items];
                    next[idx] = { ...next[idx], title: e.target.value };
                    setItems(next);
                  }}
                  className="w-full px-3 py-2 border rounded"
                />
                <p className="text-xs text-gray-500 mt-1">{item.key}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={()=>move(idx,-1)} className="px-2 py-1 border rounded">↑</button>
                <button onClick={()=>move(idx,1)} className="px-2 py-1 border rounded">↓</button>
                <button onClick={()=>onDelete(item.key)} className="px-3 py-2 bg-red-600 text-white rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
    </div>
  );
}





