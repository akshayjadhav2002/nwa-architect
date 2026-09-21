import React, { useEffect } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete Permanently',
  cancelLabel = 'Cancel',
  isDanger = true,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="bg-white w-full max-w-md p-6 sm:p-8 border border-[#747878]/30 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 text-red-600 border-b border-[#747878]/15 pb-3">
          <span className="material-symbols-outlined text-2xl">
            {isDanger ? 'delete_forever' : 'warning'}
          </span>
          <h3 className="font-serif text-xl font-bold text-[#000000]">
            {title}
          </h3>
        </div>

        <div className="text-sm text-[#444748] leading-relaxed">
          {message}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 bg-[#edeeef] hover:bg-[#e1e3e4] text-[#191c1d] text-xs label-caps font-bold transition-colors uppercase cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 text-white text-xs label-caps font-bold transition-colors uppercase flex items-center gap-1.5 cursor-pointer ${
              isDanger
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-[#000000] hover:bg-[#a33e00]'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {isDanger ? 'delete' : 'check'}
            </span>
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
