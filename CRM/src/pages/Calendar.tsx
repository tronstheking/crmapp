import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ChevronLeft, ChevronRight, Plus, Image as ImageIcon, Film, PlayCircle } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

export const Calendar = () => {
  const [items, setItems] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchCalendar();
  }, []);

  const fetchCalendar = async () => {
    const { data } = await supabase.from('content_calendar').select('*');
    if (data) setItems(data);
  };

  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = [...Array(7)].map((_, i) => addDays(startDate, i));

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'reel': return <PlayCircle size={14} />;
      case 'story': return <ImageIcon size={14} />;
      default: return <Film size={14} />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold">Calendario Editorial</h2>
          <p className="text-slate-400">Planifica y programa tus publicaciones</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Programar Post
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold capitalize">
          {format(currentDate, 'MMMM yyyy', { locale: es })}
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentDate(addDays(currentDate, -7))}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
             onClick={() => setCurrentDate(new Date())}
             className="px-3 py-1 bg-slate-800 rounded-lg text-sm font-medium"
          >
            Hoy
          </button>
          <button 
            onClick={() => setCurrentDate(addDays(currentDate, 7))}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {weekDays.map(day => (
          <div key={day.toString()} className="space-y-4">
            <div className="text-center p-2 rounded-lg bg-slate-800/30 border border-slate-800">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                {format(day, 'eee', { locale: es })}
              </p>
              <p className={`text-lg font-bold ${isSameDay(day, new Date()) ? 'text-primary-400' : ''}`}>
                {format(day, 'd')}
              </p>
            </div>

            <div className="min-h-[400px] bg-slate-900/30 rounded-xl border border-slate-800/50 p-2 space-y-2">
              {items
                .filter(item => isSameDay(new Date(item.scheduled_date), day))
                .map(item => (
                  <div key={item.id} className="glass-card p-3 border-l-4 border-l-primary-500 text-xs">
                    <div className="flex items-center gap-2 mb-2 text-primary-400 font-bold uppercase tracking-tighter">
                      {getTypeIcon(item.type)}
                      {item.type}
                    </div>
                    <p className="text-slate-300 line-clamp-3 mb-2">{item.caption}</p>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-500">
                        {format(new Date(item.scheduled_date), 'HH:mm')}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded-full ${
                        item.status === 'publicado' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
