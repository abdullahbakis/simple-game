import { useEffect, useState } from 'react';

export interface ToastData {
  id: number;
  title: string;
  subtitle: string;
}

interface ToastNotificationProps {
  toasts: ToastData[];
  onDismiss: (id: number) => void;
}

export default function ToastNotification({ toasts, onDismiss }: ToastNotificationProps) {
  return (
    <div className="fixed top-16 inset-x-0 z-30 flex flex-col items-center gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: number) => void }) {
  const [phase, setPhase] = useState<'enter' | 'visible' | 'exit'>('enter');

  useEffect(() => {
    const enterTimer = setTimeout(() => setPhase('visible'), 50);
    const exitTimer = setTimeout(() => setPhase('exit'), 2800);
    const removeTimer = setTimeout(() => onDismiss(toast.id), 3400);
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [toast.id, onDismiss]);

  const opacity = phase === 'enter' ? 'opacity-0 -translate-y-4' : phase === 'exit' ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0';

  return (
    <div className={`transition-all duration-500 ease-out ${opacity}`}>
      <div className="toast-glow px-6 py-3 rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-900/80 via-amber-800/70 to-amber-900/80 backdrop-blur-md">
        <p className="text-amber-300 text-[10px] uppercase tracking-[0.2em] font-bold text-center mb-0.5">
          {toast.subtitle}
        </p>
        <p className="text-white font-extrabold text-lg text-center tracking-wide toast-title-shimmer">
          {toast.title}
        </p>
      </div>
    </div>
  );
}
