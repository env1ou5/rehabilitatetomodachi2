import { useState, useRef, useEffect } from 'react';
import { api } from '../api';

export default function SproutChat({ pet, onClose }) {
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState(() => getInitialPosition());
  const bottomRef = useRef(null);
  const panelRef = useRef(null);
  const dragRef = useRef(null);

  // Greet on open
  useEffect(() => {
    setHistory([{ role: 'assistant', content: `Hey, I'm ${pet.name}. I'm here with you. What's been going on today?` }]);
  }, [pet.name]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading]);

  useEffect(() => {
    const keepOnScreen = () => {
      setPosition((pos) => clampPosition(pos, panelRef.current));
    };

    window.addEventListener('resize', keepOnScreen);
    return () => window.removeEventListener('resize', keepOnScreen);
  }, []);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');

    const newHistory = [...history, { role: 'user', content: text }];
    setHistory(newHistory);
    setLoading(true);

    try {
      const { reply } = await api.chat(text, history);
      setHistory([...newHistory, { role: 'assistant', content: reply }]);
    } catch {
      setHistory([...newHistory, { role: 'assistant', content: "I'm having a little trouble answering right now. Give me a moment and try again?" }]);
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const startDrag = (e) => {
    if (e.button !== undefined && e.button !== 0) return;

    dragRef.current = {
      pointerId: e.pointerId,
      offsetX: e.clientX - position.x,
      offsetY: e.clientY - position.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const drag = (e) => {
    if (!dragRef.current || dragRef.current.pointerId !== e.pointerId) return;

    const next = {
      x: e.clientX - dragRef.current.offsetX,
      y: e.clientY - dragRef.current.offsetY,
    };
    setPosition(clampPosition(next, panelRef.current));
  };

  const stopDrag = (e) => {
    if (!dragRef.current || dragRef.current.pointerId !== e.pointerId) return;

    dragRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div
        ref={panelRef}
        className="chat-bubble-panel pointer-events-auto bg-cream-50 border-2 border-ink rounded-xl shadow-chunky w-[calc(100vw-2rem)] max-w-md flex flex-col"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          maxHeight: 'min(80vh, 34rem)',
        }}
      >

        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b-2 border-ink/10 cursor-move select-none touch-none"
          onPointerDown={startDrag}
          onPointerMove={drag}
          onPointerUp={stopDrag}
          onPointerCancel={stopDrag}
        >
          <span className="text-2xl">🌱</span>
          <div>
            <div className="font-display font-bold text-moss-700">{pet.name}</div>
            <div className="font-pixel text-xs text-ink/40 uppercase">here with you</div>
          </div>
          <button onClick={onClose}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="ml-auto text-ink/40 hover:text-ink text-lg leading-none cursor-pointer"
                  aria-label="Close chat">✕</button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {history.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed
                ${msg.role === 'user'
                  ? 'bg-moss-500 text-cream-50 rounded-br-sm'
                  : 'bg-white border-2 border-ink/10 text-ink rounded-bl-sm font-display'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border-2 border-ink/10 rounded-xl rounded-bl-sm px-4 py-2">
                <span className="font-pixel text-moss-500 animate-pulse text-xs">thinking with you...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t-2 border-ink/10 flex gap-2">
          <textarea
            className="flex-1 input resize-none text-sm py-2"
            rows={1}
            placeholder="Tell me what's up..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            disabled={loading}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="btn-primary px-4 py-2 text-sm disabled:opacity-40">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function getInitialPosition() {
  if (typeof window === 'undefined') return { x: 24, y: 120 };

  const width = Math.min(448, window.innerWidth - 32);
  const x = Math.max(16, window.innerWidth - width - 28);
  const y = window.innerWidth < 640
    ? Math.max(16, window.innerHeight - 540)
    : 120;

  return { x, y };
}

function clampPosition(pos, panel) {
  if (typeof window === 'undefined') return pos;

  const rect = panel?.getBoundingClientRect();
  const width = rect?.width || Math.min(448, window.innerWidth - 32);
  const height = rect?.height || Math.min(544, window.innerHeight - 32);
  const padding = 12;

  return {
    x: Math.min(Math.max(padding, pos.x), Math.max(padding, window.innerWidth - width - padding)),
    y: Math.min(Math.max(padding, pos.y), Math.max(padding, window.innerHeight - height - padding)),
  };
}
