
import { useState } from 'react';
import { RagResponse } from '../lib/types';

export default function RagPage() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RagResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      // Baked at build time from Infra Lead's Compose build arg setup
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${apiUrl}/rag/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      if (response.status === 422) {
        throw new Error('Validation Error (422): Please check your input parameters.');
      }
      if (response.status === 503) {
        throw new Error('Service Unavailable (503): Cold-start or model inference timeout. Please retry.');
      }
      if (!response.ok) {
        throw new Error(`Network Error (${response.status}): Failed to fetch grounded response.`);
      }

      const result: RagResponse = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'An unexpected network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <h1>Retrieval-Augmented Generation (RAG)</h1>
      
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Find Sichuan recipes that use ginger..."
          style={{ flex: 1, padding: '0.75rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
          disabled={loading}
        />
        <button type="submit" style={{ padding: '0.75rem 1.5rem', cursor: 'pointer' }} disabled={loading}>
          {loading ? 'Searching...' : 'Ask'}
        </button>
      </form>

      {error && (
        <div style={{ color: '#a94442', backgroundColor: '#f2dede', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {data && (
        <div>
          <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #0070f3', marginBottom: '2rem' }}>
            <h3 style={{ marginTop: 0 }}>Grounded Answer</h3>
            <p style={{ lineHeight: '1.6', fontSize: '1.1rem' }}>
              {data.answer}
              {data.citations.map((_, index) => (
                <span key={index} style={{ verticalAlign: 'super', fontSize: '0.75rem', color: '#0070f3', marginLeft: '0.15rem', fontWeight: 'bold' }}>
                  [{index + 1}]
                </span>
              ))}
            </p>
            <small style={{ color: '#666' }}>Confidence Score: {(data.confidence * 100).toFixed(1)}%</small>
          </div>

          <h3>Sources & Citations</h3>
          <ol style={{ paddingLeft: '1.2rem' }}>
            {data.citations.map((citation, index) => (
              <li key={citation.id || index} style={{ marginBottom: '0.75rem', lineHeight: '1.4' }}>
                <strong>{citation.source}</strong>: "{citation.text}"
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}