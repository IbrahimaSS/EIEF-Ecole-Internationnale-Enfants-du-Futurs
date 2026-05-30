import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Bot, User, Sparkles } from 'lucide-react';
import { cn } from '../utils/cn';
import { aiService, ChatMessage } from '../services/aiService';
import { useAuthStore } from '../store/authStore';

interface CoachEIEFProps {
  studentName?: string;
  className?: string;
}

const SUGGESTIONS = [
  '📚 Aide-moi à réviser les maths',
  '✏️ Comment mieux mémoriser mes leçons ?',
  '📖 Explique-moi la photosynthèse',
  '🎯 Donne-moi des conseils pour les examens',
];

const CoachEIEF: React.FC<CoachEIEFProps> = ({ studentName, className: schoolClass }) => {
  const { token } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading || !token) return;

    const userMsg: ChatMessage = { role: 'user', content: trimmed };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const res = await aiService.chat(
        { messages: newHistory, studentName, className: schoolClass },
        token,
      );
      setMessages(prev => [...prev, { role: 'assistant', content: res.reply }]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Désolé, je ne peux pas répondre pour l\'instant. Réessaie ! 🙏' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <div className="flex flex-col h-[420px] sm:h-[480px] rounded-3xl overflow-hidden bg-white dark:bg-gray-900/60 shadow-soft border border-gray-100 dark:border-white/5">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-bleu-600 to-violet-600">
        <div className="relative">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
            <Bot size={22} className="text-white" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-vert-400 border-2 border-white rounded-full" />
        </div>
        <div>
          <p className="text-white font-black text-sm leading-tight">Coach EIEF</p>
          <p className="text-white/70 text-[10px] font-semibold flex items-center gap-1">
            <Sparkles size={9} /> IA propulsée par DeepSeek
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-bleu-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-gray-100 dark:bg-white/8 rounded-2xl rounded-tl-none px-4 py-3 max-w-[80%]">
                <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                  Bonjour {studentName ? <strong>{studentName}</strong> : 'toi'} ! 👋 Je suis ton Coach EIEF, ton assistant personnel pour t'aider à progresser. Pose-moi n'importe quelle question scolaire ! 🎓
                </p>
              </div>
            </div>
            {/* Suggestions */}
            <div className="pl-11 flex flex-wrap gap-2">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => send(s)}
                  className="text-[11px] font-semibold px-3 py-1.5 rounded-xl bg-bleu-50 dark:bg-bleu-900/20 text-bleu-700 dark:text-bleu-300 hover:bg-bleu-100 dark:hover:bg-bleu-900/40 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}>
              <div className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0',
                msg.role === 'assistant'
                  ? 'bg-gradient-to-br from-bleu-500 to-violet-500'
                  : 'bg-gradient-to-br from-or-400 to-orange-500',
              )}>
                {msg.role === 'assistant' ? <Bot size={16} className="text-white" /> : <User size={16} className="text-white" />}
              </div>
              <div className={cn(
                'px-4 py-3 rounded-2xl max-w-[78%] text-sm leading-relaxed whitespace-pre-wrap',
                msg.role === 'assistant'
                  ? 'bg-gray-100 dark:bg-white/8 text-gray-800 dark:text-gray-200 rounded-tl-none'
                  : 'bg-bleu-600 text-white rounded-tr-none',
              )}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-bleu-500 to-violet-500 flex items-center justify-center flex-shrink-0">
              <Bot size={16} className="text-white" />
            </div>
            <div className="bg-gray-100 dark:bg-white/8 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-bleu-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-bleu-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-bleu-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-white/5">
        <div className="flex items-end gap-2 bg-gray-50 dark:bg-white/5 rounded-2xl px-3 py-2">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Pose ta question au Coach EIEF..."
            className="flex-1 bg-transparent text-sm resize-none outline-none text-gray-800 dark:text-white placeholder:text-gray-400 max-h-28 min-h-[28px]"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all',
              input.trim() && !loading
                ? 'bg-bleu-600 hover:bg-bleu-700 text-white shadow-md'
                : 'bg-gray-200 dark:bg-white/10 text-gray-400 cursor-not-allowed',
            )}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        <p className="text-center text-[9px] text-gray-400 mt-1.5">Shift+Entrée pour nouvelle ligne · Entrée pour envoyer</p>
      </div>
    </div>
  );
};

export default CoachEIEF;
