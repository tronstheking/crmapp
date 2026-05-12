import React, { useEffect, useState } from 'react';
import { TrendingUp, UserPlus, Calendar as CalendarIcon, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="glass-card p-6 flex items-center gap-4">
    <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-400`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm text-slate-400">{title}</p>
      <h3 className="text-2xl font-bold">{value}</h3>
    </div>
  </div>
);

export const Dashboard = () => {
  const [stats, setStats] = useState({
    newLeads: 0,
    conversionRate: '0%',
    scheduledPosts: 0,
    totalClients: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      // New Leads
      const { count: newLeads } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Nuevo Lead');

      // Total Clients
      const { count: clients } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Cliente');

      // Scheduled Posts
      const { count: scheduled } = await supabase
        .from('content_calendar')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'programado');

      // Conversion Rate (Total Clients / Total Contacts)
      const { count: total } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true });

      const rate = total ? ((clients || 0) / total * 100).toFixed(1) : 0;

      setStats({
        newLeads: newLeads || 0,
        totalClients: clients || 0,
        scheduledPosts: scheduled || 0,
        conversionRate: `${rate}%`
      });
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <p className="text-slate-400">Resumen de tu rendimiento en Instagram</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Leads Nuevos" value={stats.newLeads} icon={UserPlus} color="blue" />
        <StatCard title="Tasa de Conversión" value={stats.conversionRate} icon={TrendingUp} color="emerald" />
        <StatCard title="Posts Programados" value={stats.scheduledPosts} icon={CalendarIcon} color="amber" />
        <StatCard title="Total Clientes" value={stats.totalClients} icon={CheckCircle} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold mb-4">Interacciones Recientes</h3>
          <div className="space-y-4">
             {/* Placeholder for interactions */}
             <p className="text-slate-500 text-sm text-center py-8">No hay interacciones recientes para mostrar</p>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-xl font-bold mb-4">Próximas Publicaciones</h3>
          <div className="space-y-4">
             {/* Placeholder for calendar items */}
             <p className="text-slate-500 text-sm text-center py-8">No hay publicaciones programadas para esta semana</p>
          </div>
        </div>
      </div>
    </div>
  );
};
