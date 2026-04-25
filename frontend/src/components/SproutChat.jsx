import { useState, useRef, useEffect } from 'react';
import { api } from '../api';

export default function SproutChat({ pet, onClose }) {
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Greet on open
  useEffect(() => {
    setHistory([{ role: 'assistant', content: `Hi! I'm ${pet.name}. 🌱 How are you feeling today?` }]);
  }, [pet.name]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');

    const newHistory = [...history, { role: 'user', content: text }];
    setHistory(newHistory);
    setLoading(true);

    try {
      const { reply } = await api.chat(text, newHistory);
      setHistory([...newHistory, { role: 'assistant', content: reply }]);
    } catch {
      setHistory([...newHistory, { role: 'assistant', content: "I'm having trouble thinking right now... try again in a moment. 🍃" }]);
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4"
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-cream-50 border-2 border-ink rounded-xl shadow-chunky w-full max-w-md flex flex-col"
           style={{ maxHeight: '80vh' }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b-2 border-ink/10">
          <span className="text-2xl">🌱</span>
          <div>
            <div className="font-display font-bold text-moss-700">{pet.name}</div>
            <div className="font-pixel text-xs text-ink/40 uppercase">{pet.mood}</div>
          </div>
          <button onClick={onClose}
                  className="ml-auto text-ink/40 hover:text-ink text-lg leading-none">✕</button>
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
                <span className="font-pixel text-moss-500 animate-pulse text-xs">thinking...</span>
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
            placeholder="Say something..."
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
