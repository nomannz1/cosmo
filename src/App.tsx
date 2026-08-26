import { RealtimeClient, type RealtimeSession, TokenSource } from 'cosmo-ai';
import { useCallback, useRef, useState } from 'react';
import { VoiceSession } from './VoiceSession';

const MINT_SECRET = import.meta.env.VITE_MINT_SECRET as string | undefined;

type Phase = 'idle' | 'starting' | 'live' | 'error';

export function App() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<RealtimeSession | null>(null);
  const [session, setSession] = useState<RealtimeSession | null>(null);

  const start = useCallback(async () => {
    setPhase('starting');
    setError(null);
    try {
      const client = new RealtimeClient({
        token: TokenSource.endpoint('/token', {
          headers: { Authorization: `Bearer ${MINT_SECRET ?? ''}` },
        }),
      });

      const agent = client.agent({
        instructions: 'You are a friendly, terse voice assistant.',
        voice: 'Puck',
        greeting: 'Hi! How can I help?',
        tools: [{ kind: 'web_search' }],
      });

      const s = await agent.start();
      sessionRef.current = s;
      setSession(s);
      setPhase('live');

      // Surface the end of the session in the UI.
      s.on('session_ended', () => {
        sessionRef.current = null;
        setSession(null);
        setPhase('idle');
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPhase('error');
    }
  }, []);

  const stop = useCallback(async () => {
    const s = sessionRef.current;
    if (s) await s.end();
  }, []);

  return (
    <main className="container">
      <h1>Cosmo Voice</h1>
      <p className="sub">Realtime voice agent powered by cosmo-ai</p>

      {phase !== 'live' ? (
        <button type="button" onClick={start} disabled={phase === 'starting'}>
          {phase === 'starting' ? 'Connecting…' : 'Start talking'}
        </button>
      ) : (
        <button type="button" className="stop" onClick={stop}>
          End call
        </button>
      )}

      {phase === 'live' && session && <VoiceSession session={session} />}
      {error && <p className="error">{error}</p>}
    </main>
  );
}
