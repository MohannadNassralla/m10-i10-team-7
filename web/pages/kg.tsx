
import { useState } from 'react';
import { KgQueryResult } from '../lib/types';

export default function KgPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<KgQueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/kg/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (response.status === 422) throw new Error('Unprocessable Query Target (422).');
      if (response.status === 503) throw new Error('Database Stack Unreachable (503).');
      if (!response.ok) throw new Error(`Graph Execution Fail: ${response.status}`);

      const result: KgQueryResult = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <h1>Knowledge Graph Explorer</h1>
      <form onSubmit={handleQuery} style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter Cypher or semantic lookup query..."
          style={{ flex: 1, padding: '10px' }}
        />
        <button type="submit" disabled={loading}>Execute</button>
      </form>

      {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}

      {data && (
        <div style={{ marginTop: '20px', display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            <h4>Nodes Extracted ({data.nodes.length})</h4>
            <ul>
              {data.nodes.map((n) => (
                <li key={n.id}><strong>{n.label}</strong> (ID: {n.id})</li>
              ))}
            </ul>
          </div>
          <div style={{ flex: 1 }}>
            <h4>Discovered Edges ({data.edges.length})</h4>
            <ul>
              {data.edges.map((e, idx) => (
                <li key={idx}>`{e.source}` &rarr; <strong>{e.type}</strong> &rarr; `{e.target}`</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}