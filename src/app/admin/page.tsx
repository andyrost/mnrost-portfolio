'use client';

import { useEffect, useState } from 'react';

interface ManifestItem {
  key: string;
  url: string;
  title: string;
  order: number;
}

export default function AdminPage() {
  const [items, setItems] = useState<ManifestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/login');
        const data = await res.json();
        if (data?.authenticated) {
          setAuthed(true);
          await load();
        }
      } catch {
        // Not authenticated
      }
      setLoading(false);
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
    } catch {
      setError('Failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function save(next: ManifestItem[]) {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/manifest', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: next }),
      });
      if (!res.ok) throw new Error('Save failed');
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError('Incorrect password');
        return;
      }
      setAuthed(true);
      setPassword('');
      await load();
    } catch {
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
    } catch {
      setError('Save failed');
    }
  }

  async function onDelete(key: string) {
    if (!confirm('Delete this image? This cannot be undone.')) return;
    try {
      const res = await fetch('/api/admin/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pathname: key }),
      });
      if (!res.ok) throw new Error('Delete failed');
      await load();
    } catch {
      setError('Delete failed');
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4 bg-white rounded-2xl shadow-xl p-8">
          <h1 className="font-playfair text-2xl font-semibold mb-6 text-center text-gray-900">Admin Login</h1>
          <form onSubmit={onLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-inter text-gray-900 placeholder-gray-500"
              autoFocus
            />
            {error && <p className="text-red-600 text-sm font-inter">{error}</p>}
            <button
              type="submit"
              className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 font-inter"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-playfair text-3xl font-semibold text-gray-900">Manage Artworks</h1>
            <p className="font-inter text-gray-600 mt-1">Drag to reorder, edit titles, or delete items</p>
          </div>
          <div className="flex gap-3">
            <a
              href="/"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-inter"
            >
              ← Back to Gallery
            </a>
            <button
              onClick={onSave}
              disabled={saving}
              className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 font-inter disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <p className="font-inter text-gray-600">No artworks yet. Add some from the gallery page!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div
                key={item.key}
                className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow"
              >
                {/* Thumbnail */}
                <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Title Input */}
                <div className="flex-1">
                  <input
                    value={item.title}
                    onChange={(e) => {
                      const next = [...items];
                      next[idx] = { ...next[idx], title: e.target.value };
                      setItems(next);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-inter text-gray-900"
                    placeholder="Artwork title"
                  />
                  <p className="text-xs text-gray-400 mt-1 font-mono truncate">{item.key}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => move(idx, 1)}
                    disabled={idx === items.length - 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move down"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => onDelete(item.key)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    title="Delete artwork"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm font-inter">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
