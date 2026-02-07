import React, { useState, useEffect } from 'react';
import { Priority, AITaskParseResult } from '../types';
import { X, Sparkles, Send, Mic, Keyboard, Calendar, Flag, AlertCircle } from 'lucide-react';
import { parseTaskFromNaturalLanguage } from '../services/geminiService';

interface SmartAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: { title: string; description: string; priority: Priority; dueDate: string | undefined }) => void;
}

const SmartAddModal: React.FC<SmartAddModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [mode, setMode] = useState<'SIMPLE' | 'AI'>('AI');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Simple mode states
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (isOpen) {
      setInput('');
      setTitle('');
      setDesc('');
      setPriority(Priority.MEDIUM);
      setDueDate('');
      setMode('AI');
      setLoading(false);
    }
  }, [isOpen]);

  const handleAISubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const result: AITaskParseResult = await parseTaskFromNaturalLanguage(input);
      onAdd({
        title: result.title,
        description: result.description,
        priority: result.priority,
        dueDate: result.dueDate || undefined,
      });
      onClose();
    } catch (e) {
      console.error(e);
      setMode('SIMPLE');
      setTitle(input);
    } finally {
      setLoading(false);
    }
  };

  const handleSimpleSubmit = () => {
    if (!title.trim()) return;
    onAdd({
      title,
      description: desc,
      priority,
      dueDate: dueDate || undefined,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className={`relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl transform transition-all duration-300 flex flex-col max-h-[90vh] overflow-hidden animate-slide-up ${mode === 'AI' ? 'bg-gradient-to-b from-slate-900 to-slate-800 text-white' : 'bg-white text-slate-900'}`}>
        
        {/* Glow effect for AI mode */}
        {mode === 'AI' && (
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-indigo-500/20 blur-[60px] pointer-events-none"></div>
        )}

        <div className="relative flex items-center justify-between p-6 border-b border-transparent">
          <div className="flex gap-2 bg-slate-100/10 p-1 rounded-xl backdrop-blur-md">
            <button
              onClick={() => setMode('AI')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 flex items-center gap-2 ${mode === 'AI' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:text-white'}`}
            >
              <Sparkles className="w-3.5 h-3.5" /> AI Ассистент
            </button>
            <button
              onClick={() => setMode('SIMPLE')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 flex items-center gap-2 ${mode === 'SIMPLE' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <Keyboard className="w-3.5 h-3.5" /> Вручную
            </button>
          </div>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${mode === 'AI' ? 'hover:bg-white/10 text-white/70' : 'hover:bg-slate-100 text-slate-400'}`}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {mode === 'AI' ? (
            <div className="flex flex-col gap-6 relative">
              <div className="space-y-2">
                 <label className="text-sm font-medium text-indigo-200 ml-1">Что планируете сделать?</label>
                 <div className="relative group">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Например: Подготовить отчет по продажам к пятнице, важно..."
                      className="w-full h-40 p-5 rounded-2xl bg-white/5 border border-white/10 focus:border-indigo-400/50 focus:bg-white/10 focus:ring-4 focus:ring-indigo-500/20 resize-none outline-none text-lg leading-relaxed placeholder:text-slate-500 transition-all"
                      autoFocus
                    />
                    <div className="absolute bottom-4 right-4 flex items-center gap-2 pointer-events-none opacity-50">
                       <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse-slow" />
                    </div>
                 </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center gap-3 py-4 text-indigo-300 animate-pulse">
                   <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                   <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                   <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                   <span className="text-sm font-medium ml-2">Анализирую задачу...</span>
                </div>
              ) : (
                <button
                  onClick={handleAISubmit}
                  disabled={!input.trim()}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-indigo-900/50 hover:shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Создать задачу <Send className="w-4 h-4 ml-1" />
                </button>
              )}

              <div className="mt-2 p-4 rounded-xl bg-white/5 border border-white/5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Совет</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Не беспокойтесь о формате. Просто пишите как есть — AI поймет дату, приоритет и контекст.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block ml-1">Название</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Купить продукты"
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-medium text-slate-800"
                />
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block ml-1">Описание</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Список продуктов..."
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none h-24 resize-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block ml-1">Приоритет</label>
                   <div className="relative">
                     <select 
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as Priority)}
                      className="w-full p-4 pl-10 rounded-2xl bg-slate-50 border border-slate-200 appearance-none outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                     >
                       <option value={Priority.LOW}>Низкий</option>
                       <option value={Priority.MEDIUM}>Средний</option>
                       <option value={Priority.HIGH}>Высокий</option>
                     </select>
                     <Flag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                   </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block ml-1">Срок</label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full p-4 pl-10 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 text-sm transition-all"
                    />
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSimpleSubmit}
                disabled={!title.trim()}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold mt-4 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                Сохранить
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartAddModal;