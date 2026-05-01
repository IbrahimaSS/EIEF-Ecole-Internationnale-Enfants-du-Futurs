import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  // Rendu via React Portal dans document.body pour eviter les conflits de
  // reconciliation DOM avec framer-motion (erreur "removeChild" en React 18).
  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div className={`
        bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-[2rem] shadow-2xl w-full
        ${sizeClasses[size]}
        max-h-[90vh] overflow-hidden
        transform transition-all duration-300 scale-100 ring-1 ring-white/10
      `}>
        {title && (
          <div className="flex items-center justify-between p-8 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
            <div className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
              {title}
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all duration-200"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>
        )}

        <div className="p-8 overflow-y-auto max-h-[calc(90vh-100px)] custom-scrollbar">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
