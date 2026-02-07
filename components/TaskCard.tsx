import React, { useState } from 'react';
import { Task, Priority } from '../types';
import { Check, Clock, ChevronDown, ChevronUp, Trash2, Wand2, Calendar, GripVertical } from 'lucide-react';
import { generateSubtasks } from '../services/geminiService';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAddSubtasks: (taskId: string, subtasks: string[]) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onDelete, onAddSubtasks, onToggleSubtask }) => {
  const [expanded, setExpanded] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);

  const handleGenerateSubtasks = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoadingAI(true);
    try {
      const newSubtasks = await generateSubtasks(task.title, task.description);
      onAddSubtasks(task.id, newSubtasks);
      setExpanded(true);
    } finally {
      setLoadingAI(false);
    }
  };

  const priorityConfig = {
    [Priority.LOW]: { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Низкий' },
    [Priority.MEDIUM]: { color: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Средний' },
    [Priority.HIGH]: { color: 'bg-rose-100 text-rose-700 border-rose-200', label: 'Высокий' },
  };

  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
  const totalSubtasks = task.subtasks.length;
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <div 
      className={`relative group bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 overflow-hidden transition-all duration-500 hover:shadow-md hover:scale-[1.01] ${task.completed ? 'opacity-60 saturate-50' : 'opacity-100'}`}
    >
      {/* Priority Indicator Line */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${priorityConfig[task.priority].color.split(' ')[0].replace('bg-', 'bg-')}`}></div>

      <div className="p-4 pl-5 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start gap-4">
          {/* Custom Checkbox */}
          <button 
            onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
            className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${task.completed ? 'bg-indigo-500 border-indigo-500 scale-110' : 'bg-transparent border-slate-300 hover:border-indigo-400'}`}
          >
            <Check className={`w-3.5 h-3.5 text-white transition-all duration-300 ${task.completed ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} strokeWidth={3} />
          </button>
          
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex justify-between items-start">
               <h3 className={`text-base font-semibold text-slate-800 leading-snug break-words transition-all duration-300 ${task.completed ? 'line-through text-slate-400' : ''}`}>
                {task.title}
              </h3>
            </div>
            
            {task.description && (
              <p className={`text-sm text-slate-500 mt-1 line-clamp-2 transition-all ${task.completed ? 'text-slate-300' : ''}`}>
                {task.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 mt-3">
              {task.dueDate && (
                <div className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${new Date(task.dueDate) < new Date() && !task.completed ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                  <Calendar className="w-3 h-3" />
                  {new Date(task.dueDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
               
               {/* Priority Badge */}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide border ${priorityConfig[task.priority].color}`}>
                {priorityConfig[task.priority].label}
              </span>

              {totalSubtasks > 0 && (
                <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                  {completedSubtasks}/{totalSubtasks}
                </span>
              )}
            </div>
          </div>

          <div className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''} text-slate-400`}>
             <ChevronDown className="w-5 h-5" />
          </div>
        </div>

        {/* Progress Bar for Subtasks */}
        {totalSubtasks > 0 && (
          <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </div>

      <div className={`transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden ${expanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="border-t border-slate-100 bg-slate-50/50 p-4">
          
          {/* Subtasks List */}
          {task.subtasks.length > 0 && (
            <div className="space-y-3 mb-5">
              {task.subtasks.map(st => (
                <div key={st.id} className="group/sub flex items-center gap-3 animate-slide-up">
                   <button 
                    onClick={() => onToggleSubtask(task.id, st.id)}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${st.completed ? 'bg-indigo-400 border-indigo-400' : 'border-slate-300 hover:border-indigo-400 bg-white'}`}
                  >
                     <Check className={`w-3 h-3 text-white transition-opacity ${st.completed ? 'opacity-100' : 'opacity-0'}`} strokeWidth={3} />
                  </button>
                  <span className={`text-sm flex-1 transition-colors ${st.completed ? 'line-through text-slate-400' : 'text-slate-600'}`}>
                    {st.title}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
             <button 
              onClick={handleGenerateSubtasks}
              disabled={loadingAI || task.completed}
              className={`flex-1 flex items-center justify-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all ${loadingAI ? 'bg-indigo-50 text-indigo-400' : 'bg-white text-indigo-600 shadow-sm border border-indigo-100 hover:bg-indigo-50 active:scale-95'}`}
            >
              {loadingAI ? (
                <Clock className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Wand2 className="w-3.5 h-3.5" />
              )}
              {loadingAI ? 'Думаю...' : task.subtasks.length > 0 ? 'Добавить этапы' : 'AI Декомпозиция'}
            </button>

            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-white text-rose-500 border border-rose-100 shadow-sm hover:bg-rose-50 hover:border-rose-200 transition-all active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;