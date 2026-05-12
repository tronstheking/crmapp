import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Filter, Plus, Edit2, Trash2 } from 'lucide-react';

export const Contacts = () => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    const { data } = await supabase.from('contacts').select('*');
    if (data) setContacts(data);
  };

  const filteredContacts = contacts.filter(c => {
    const matchesSearch = c.instagram_username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (c.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold">Contactos</h2>
          <p className="text-slate-400">Base de datos de leads e interesados</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Nuevo Contacto
        </button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por usuario o nombre..." 
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-primary-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2">
          <Filter size={18} className="text-slate-500" />
          <select 
            className="bg-transparent focus:outline-none text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">Todos los estados</option>
            <option value="Nuevo Lead">Nuevo Lead</option>
            <option value="Contactado">Contactado</option>
            <option value="Interesado">Interesado</option>
            <option value="Cliente">Cliente</option>
          </select>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-800/30">
              <th className="px-6 py-4 font-semibold text-sm">Usuario IG</th>
              <th className="px-6 py-4 font-semibold text-sm">Nombre Completo</th>
              <th className="px-6 py-4 font-semibold text-sm">Estado</th>
              <th className="px-6 py-4 font-semibold text-sm">Fecha Registro</th>
              <th className="px-6 py-4 font-semibold text-sm text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.map(contact => (
              <tr key={contact.id} className="border-b border-slate-700/50 hover:bg-slate-800/20 transition-colors">
                <td className="px-6 py-4 text-primary-400 font-medium">@{contact.instagram_username}</td>
                <td className="px-6 py-4 text-slate-300">{contact.full_name || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    contact.status === 'Cliente' ? 'bg-emerald-500/10 text-emerald-400' :
                    contact.status === 'Interesado' ? 'bg-amber-500/10 text-amber-400' :
                    contact.status === 'Contactado' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-slate-500/10 text-slate-400'
                  }`}>
                    {contact.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {new Date(contact.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-200">
                      <Edit2 size={16} />
                    </button>
                    <button className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredContacts.length === 0 && (
          <div className="py-12 text-center text-slate-500">
            No se encontraron contactos que coincidan con los filtros.
          </div>
        )}
      </div>
    </div>
  );
};
