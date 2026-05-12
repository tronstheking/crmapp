import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Kanban, 
  Calendar, 
  MessageSquare, 
  LogOut 
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const SidebarLink = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        isActive 
          ? 'bg-primary-600/20 text-primary-400' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </Link>
  );
};

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100 w-full">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-primary-600 to-primary-400 rounded-lg flex items-center justify-center font-bold text-white">
            I
          </div>
          <h1 className="text-xl font-bold tracking-tight">InstaCRM</h1>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" />
          <SidebarLink to="/kanban" icon={Kanban} label="Pipeline" />
          <SidebarLink to="/contacts" icon={Users} label="Contactos" />
          <SidebarLink to="/calendar" icon={Calendar} label="Calendario" />
          <SidebarLink to="/conversations" icon={MessageSquare} label="Conversaciones" />
        </nav>

        <button 
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors mt-auto"
        >
          <LogOut size={20} />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
};
