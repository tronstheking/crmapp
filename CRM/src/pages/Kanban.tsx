import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { MoreVertical, User } from 'lucide-react';

const STAGES = ['Nuevo Lead', 'Contactado', 'Interesado', 'Cliente'];

export const Kanban = () => {
  const [contacts, setContacts] = useState<any[]>([]);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    const { data } = await supabase.from('contacts').select('*');
    if (data) setContacts(data);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('contacts')
      .update({ status })
      .eq('id', id);
    
    if (!error) fetchContacts();
  };

  return (
    <div className="h-full flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-bold">Pipeline de Ventas</h2>
        <p className="text-slate-400">Gestiona tus leads a través del embudo</p>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 flex-1">
        {STAGES.map((stage) => (
          <div key={stage} className="min-w-[300px] flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-semibold text-slate-300 flex items-center gap-2">
                {stage}
                <span className="text-xs bg-slate-800 px-2 py-1 rounded-full text-slate-500">
                  {contacts.filter(c => c.status === stage).length}
                </span>
              </h3>
            </div>

            <div className="flex-1 bg-slate-900/50 rounded-xl p-3 border border-slate-800/50 space-y-3">
              {contacts.filter(c => c.status === stage).map(contact => (
                <div 
                  key={contact.id} 
                  className="glass-card p-4 hover:border-primary-500/50 cursor-grab active:cursor-grabbing transition-colors group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                        <User size={16} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">@{contact.instagram_username}</p>
                        <p className="text-xs text-slate-500">{contact.full_name || 'Sin nombre'}</p>
                      </div>
                    </div>
                    <button className="text-slate-600 hover:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                  
                  {contact.notes && (
                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                      {contact.notes}
                    </p>
                  )}

                  <div className="flex gap-2">
                    {/* Placeholder for tags */}
                  </div>
                </div>
              ))}

              {contacts.filter(c => c.status === stage).length === 0 && (
                <div className="h-32 border-2 border-dashed border-slate-800/50 rounded-xl flex items-center justify-center text-slate-600 text-sm">
                  Vacío
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
