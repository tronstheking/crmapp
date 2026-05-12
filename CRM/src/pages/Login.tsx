import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Loader2 } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('¡Revisa tu correo! Te enviamos un enlace de acceso.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <div className="max-w-md w-full space-y-8 glass-card p-8 border-slate-800 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-tr from-primary-600 to-primary-400 rounded-2xl flex items-center justify-center font-bold text-3xl text-white mx-auto shadow-lg shadow-primary-500/20">
            I
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">Bienvenido a InstaCRM</h2>
          <p className="text-slate-400">Ingresa con tu correo para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input
              type="email"
              required
              placeholder="tu@email.com"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Enviar enlace de acceso'}
          </button>

          {message && (
            <div className={`p-4 rounded-lg text-sm text-center ${message.startsWith('Error') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
              {message}
            </div>
          )}
        </form>

        <p className="text-center text-slate-500 text-xs mt-8">
          Al ingresar, aceptas nuestros términos y condiciones.
        </p>
      </div>
    </div>
  );
};
