import React, { useState, useEffect } from 'react';
import { Task, Priority, FilterType, SubTask } from './types';
import TaskCard from './components/TaskCard';
import SmartAddModal from './components/SmartAddModal';
import { Plus, ListTodo, Search, Zap, Trophy, LayoutGrid } from 'lucide-react';
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [filter, setFilter] = useState<FilterType>('ACTIVE');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 6) setGreeting('Доброй ночи');
    else if (hour < 12) setGreeting('Доброе утро');
    else if (hour < 18) setGreeting('Добрый день');
    else setGreeting('Добрый вечер');
  }, []);

  const triggerConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 }
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  };

  const addTask = (data: { title: string; description: string; priority: Priority; dueDate: string | undefined }) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description,
      priority: data.priority,
      completed: false,
      dueDate: data.dueDate,
      subtasks: [],
      createdAt: Date.now(),
    };
    setTasks(prev => [newTask, ...prev]);
    // Small confetti for adding a task
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.9 }, colors: ['#6366f1', '#a855f7'] });
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const isCompleting = !t.completed;
        if (isCompleting) triggerConfetti();
        return { ...t, completed: isCompleting };
      }
      return t;
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const addSubtasks = (taskId: string, subtaskTitles: string[]) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const newSubtasks: SubTask[] = subtaskTitles.map(title => ({
        id: crypto.randomUUID(),
        title,
        completed: false
      }));
      return { ...t, subtasks: [...t.subtasks, ...newSubtasks] };
    }));
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        subtasks: t.subtasks.map(st => 
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        )
      };
    }));
  };

  const filteredTasks = tasks
    .filter(t => {
      if (filter === 'ACTIVE') return !t.completed;
      if (filter === 'COMPLETED') return t.completed;
      return true;
    })
    .filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
       const pMap = { [Priority.HIGH]: 3, [Priority.MEDIUM]: 2, [Priority.LOW]: 1 };
       if (a.completed !== b.completed) return a.completed ? 1 : -1;
       if (pMap[a.priority] !== pMap[b.priority]) return pMap[b.priority] - pMap[a.priority];
       return b.createdAt - a.createdAt;
    });

  const stats = {
    active: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length,
    total: tasks.length
  };
  
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 pb-24 font-sans overflow-hidden">
      
      {/* Dynamic Background Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 pt-8 pb-4 px-6">
        <div className="max-w-md mx-auto">
           <div className="flex items-center justify-between mb-8">
             <div>
               <p className="text-slate-500 font-medium text-sm mb-1 uppercase tracking-wider">{new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
               <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">
                 {greeting}, <br />
                 <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Чемпион!</span>
               </h1>
             </div>
             
             {/* Progress Ring */}
             <div className="relative w-20 h-20 flex items-center justify-center drop-shadow-xl">
                <svg className="transform -rotate-90 w-20 h-20">
                  <circle
                    className="text-slate-200"
                    strokeWidth="6"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="40"
                    cy="40"
                  />
                  <circle
                    className="text-indigo-600 transition-all duration-1000 ease-out"
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="40"
                    cy="40"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-sm font-bold text-slate-800">{completionRate}%</span>
                </div>
             </div>
           </div>

           {/* Stats Cards */}
           <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="glass p-4 rounded-2xl flex flex-col items-start gap-2 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-slate-800">{stats.active}</span>
                  <p className="text-xs text-slate-500 font-medium">В процессе</p>
                </div>
              </div>
              <div className="glass p-4 rounded-2xl flex flex-col items-start gap-2 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-slate-800">{stats.completed}</span>
                  <p className="text-xs text-slate-500 font-medium">Сделано</p>
                </div>
              </div>
           </div>

           {/* Search & Filter Bar */}
           <div className="flex flex-col gap-3">
             <div className="relative group">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
               </div>
               <input 
                 type="text" 
                 placeholder="Найти задачу..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="block w-full pl-10 pr-3 py-3 border-none rounded-xl leading-5 bg-white shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 sm:text-sm transition-all"
               />
             </div>

             <div className="flex bg-slate-200/50 p-1 rounded-xl">
               {(['ALL', 'ACTIVE', 'COMPLETED'] as FilterType[]).map(f => (
                 <button
                   key={f}
                   onClick={() => setFilter(f)}
                   className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${filter === f ? 'bg-white text-indigo-600 shadow-md transform scale-105' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   {f === 'ALL' ? 'Все' : f === 'ACTIVE' ? 'В работе' : 'Готово'}
                 </button>
               ))}
             </div>
           </div>
        </div>
      </header>

      {/* Task List */}
      <main className="relative z-10 max-w-md mx-auto px-6 py-2">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
            <div className="w-24 h-24 bg-gradient-to-tr from-indigo-50 to-purple-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <LayoutGrid className="w-10 h-10 text-indigo-200" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">
              {searchQuery ? 'Ничего не найдено' : 'Пока все тихо'}
            </h3>
            <p className="text-sm text-slate-400 max-w-[200px] leading-relaxed">
              {searchQuery ? 'Попробуйте изменить запрос' : 'Самое время запланировать что-то грандиозное!'}
            </p>
          </div>
        ) : (
          <div className="space-y-4 pb-20">
            {filteredTasks.map((task, index) => (
              <div key={task.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-slide-up">
                <TaskCard 
                  task={task} 
                  onToggle={toggleTask} 
                  onDelete={deleteTask}
                  onAddSubtasks={addSubtasks}
                  onToggleSubtask={toggleSubtask}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 left-0 right-0 z-40 flex justify-center pointer-events-none">
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="pointer-events-auto group relative flex items-center justify-center w-16 h-16 bg-slate-900 text-white rounded-2xl shadow-2xl shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all duration-300 bg-gradient-to-br from-slate-800 to-black border border-slate-700/50"
        >
          <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
          <div className="absolute inset-0 rounded-2xl bg-indigo-500 opacity-0 group-hover:opacity-20 transition-opacity blur-md"></div>
        </button>
      </div>

      <SmartAddModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={addTask}
      />
    </div>
  );
};

export default App;