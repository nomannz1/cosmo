import {
  RealtimeProvider,
  type RealtimeSession,
  useAgentState,
  useMicLevel,
  useTranscript,
} from 'cosmo-ai';
import { useEffect } from 'react';

export function VoiceSession({ session }: { session: RealtimeSession }) {
  // Unlock audio playback on the user gesture chain.
  useEffect(() => {
    void session;
  }, [session]);

  return (
    <RealtimeProvider session={session}>
      <Transcript />
      <Status />
    </RealtimeProvider>
  );
}

function Transcript() {
  const items = useTranscript();
  return (
    <ul className="transcript">
      {items.map((item) => (
        <li key={item.id} className={item.role}>
          <strong>{item.role === 'assistant' ? 'Agent' : 'You'}:</strong> {item.text}
        </li>
      ))}
    </ul>
  );
}

function Status() {
  const state = useAgentState();
  const mic = useMicLevel();
  return (
    <div className="status">
      <span className={`dot ${state}`} /> {state}
      <div className="meter">
        <div className="fill" style={{ width: `${Math.round(mic * 100)}%` }} />
      </div>
    </div>
  );
}
