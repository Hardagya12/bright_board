import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now().toString();
    setToasts((t) => [...t, { id, message, type, duration }]);
    
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((t) => t.filter((toast) => toast.id !== id));
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={18} className="text-emerald-500" />;
      case 'error': return <AlertCircle size={18} className="text-red-500" />;
      case 'info':
      default: return <Info size={18} className="text-blue-500" />;
    }
  };

  const getStyles = (type) => {
    switch (type) {
      case 'success': return 'border-emerald-500/20 bg-emerald-500/10';
      case 'error': return 'border-red-500/20 bg-red-500/10';
      case 'info':
      default: return 'border-blue-500/20 bg-blue-500/10';
    }
  };

  return (
    <ToastContext.Provider value={{ addToast, success: (m) => addToast(m, 'success'), error: (m) => addToast(m, 'error'), info: (m) => addToast(m, 'info') }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className={`flex items-center gap-3 p-4 pr-10 rounded-xl border shadow-xl backdrop-blur-md relative min-w-[280px] max-w-sm ${getStyles(toast.type)}`}
            >
              <div className="flex-shrink-0">{getIcon(toast.type)}</div>
              <p className="text-sm font-medium text-white">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
