import { useState } from 'react';
import { api } from '../api';

export default function Login({ onAuthenticated }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ username: '', email: '', password: '', petName: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = mode === 'login'
        ? await api.login({ username: form.username, password: form.password })
        : await api.register(form);
      onAuthenticated(result.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-2">🌱</div>
          <h1 className="font-display font-black text-4xl text-moss-700 leading-none">
            Rehabilitatemogotchi
          </h1>
          <p className="font-pixel text-lg text-peach-600 mt-2 tracking-wide">
            GROW TOGETHER, ONE DAY AT A TIME
          </p>
        </div>

        <div className="card p-6">
          {/* Tab toggle */}
          <div className="flex gap-2 mb-5 p-1 bg-cream-100 rounded-lg border-2 border-ink">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-1.5 font-display font-bold rounded-md transition ${
                mode === 'login' ? 'bg-moss-500 text-cream-50' : 'text-ink/60'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-1.5 font-display font-bold rounded-md transition ${
                mode === 'register' ? 'bg-moss-500 text-cream-50' : 'text-ink/60'
              }`}
            >
              New here
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">{mode === 'login' ? 'Username or email' : 'Username'}</label>
              <input
                className="input"
                value={form.username}
                onChange={update('username')}
                autoComplete="username"
                required
              />
            </div>

            {mode === 'register' && (
              <>
                <div>
                  <label className="label">Email</label>
                  <input
                    className="input"
                    type="email"
                    value={form.email}
                    onChange={update('email')}
                    autoComplete="email"
                    required
                  />
                </div>
                <div>
                  <label className="label">Pet name <span className="text-ink/40 font-normal normal-case">(you can change this later)</span></label>
                  <input
                    className="input"
                    value={form.petName}
                    onChange={update('petName')}
                    placeholder="Buddy"
                    maxLength={50}
                  />
                </div>
              </>
            )}

            <div>
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                value={form.password}
                onChange={update('password')}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                minLength={mode === 'register' ? 8 : undefined}
                required
              />
              {mode === 'register' && (
                <p className="text-xs text-ink/50 mt-1">At least 8 characters.</p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-clay-400/20 border-2 border-clay-500 rounded-lg text-sm text-clay-500 font-medium">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? '...' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-ink/50 mt-6 leading-relaxed">
          A supportive companion app, not a substitute for medical care.<br/>
          In crisis? Call <strong>988</strong> or SAMHSA at <strong>1-800-662-4357</strong>.
        </p>
      </div>
    </div>
  );
}
