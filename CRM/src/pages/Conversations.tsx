import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Send, User, Search, Info } from 'lucide-react';

export const Conversations = () => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (selectedContact) {
      fetchInteractions(selectedContact.id);
    }
  }, [selectedContact]);

  const fetchContacts = async () => {
    const { data } = await supabase.from('contacts').select('*');
    if (data) setContacts(data);
  };

  const fetchInteractions = async (contactId: string) => {
    const { data } = await supabase
      .from('interactions')
      .select('*')
      .eq('contact_id', contactId)
      .order('created_at', { ascending: true });
    if (data) setInteractions(data);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    // In a real app, this would also call Meta Graph API to send DM
    const { error } = await supabase.from('interactions').insert({
      contact_id: selectedContact.id,
      type: 'dm',
      content: newMessage
    });

    if (!error) {
      setNewMessage('');
      fetchInteractions(selectedContact.id);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Sidebar - Contacts List */}
      <div className="w-80 flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Buscar chat..." 
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-primary-500"
          />
        </div>

        <div className="flex-1 overflow-auto glass-card">
          {contacts.map(contact => (
            <button
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`w-full p-4 flex items-center gap-3 hover:bg-slate-700/30 transition-colors border-b border-slate-700/50 ${
                selectedContact?.id === contact.id ? 'bg-primary-600/10 border-r-4 border-r-primary-500' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                <User size={20} className="text-slate-400" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="font-medium truncate">@{contact.instagram_username}</p>
                <p className="text-xs text-slate-500 truncate">{contact.status}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col glass-card overflow-hidden">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                  <User size={20} className="text-slate-400" />
                </div>
                <div>
                  <p className="font-bold">@{selectedContact.instagram_username}</p>
                  <p className="text-xs text-emerald-400">En línea</p>
                </div>
              </div>
              <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400">
                <Info size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto p-6 space-y-4">
              {interactions.map(msg => (
                <div key={msg.id} className={`flex ${msg.type === 'dm' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                    msg.type === 'dm' 
                      ? 'bg-slate-800 text-slate-200' 
                      : 'bg-primary-600 text-white'
                  }`}>
                    <p>{msg.content}</p>
                    <p className="text-[10px] mt-1 opacity-50 text-right">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {interactions.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                  <MessageSquare size={48} className="opacity-20" />
                  <p>No hay mensajes previos</p>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-slate-800/30 border-t border-slate-700 flex gap-3">
              <input 
                type="text" 
                placeholder="Escribe un mensaje..." 
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary-500"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit" className="p-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors">
                <Send size={20} />
              </button>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center">
              <MessageSquare size={32} />
            </div>
            <p>Selecciona un contacto para ver la conversación</p>
          </div>
        )}
      </div>
    </div>
  );
};
