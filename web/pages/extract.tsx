// web/pages/extract.tsx
import { useState } from 'react';
import { ExtractResponse } from '../lib/types';

export default function ExtractPage() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ExtractResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (response.status === 422) throw new Error('Invalid Schema/Payload (422).');
      if (response.status === 503) throw new Error('Extraction Pipeline Down (503).');
      if (!response.ok) throw new Error(`Server returned error status ${response.status}`);

      const result: ExtractResponse = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Network connectivity broken.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <h1>Entity Extraction Engine</h1>
      <form onSubmit={handleExtract} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <textarea
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste unstructured recipe text or documentation here..."
          style={{ width: '100%', padding: '10px', fontSize: '1rem', borderRadius: '4px' }}
          disabled={loading}
        />
        <button type="submit" style={{ padding: '10px 20px', alignSelf: 'flex-start' }} disabled={loading}>
          {loading ? 'Processing Text...' : 'Extract Entities'}
        </button>
      </form>

      {error && <div style={{ color: 'red', marginTop: '15px' }}>{error}</div>}

      {data && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Extracted Entities</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ backgroundColor: '#eee', textAlign: 'left' }}>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Entity Name</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Type Class</th>
              </tr>
            </thead>
            <tbody>
              {data.entities.map((ent, idx) => (
                <tr key={idx}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{ent.name}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{ent.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}