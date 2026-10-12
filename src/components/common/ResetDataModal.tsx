import React from 'react';
import { RotateCcw } from 'lucide-react';

interface ResetDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ResetDataModal: React.FC<ResetDataModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 text-center z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Red circular refresh icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md shadow-red-500/30">
            <RotateCcw className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-2">
          Reset Demo Data
        </h3>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          This will clear all current data and restore original sample data (sales, dispatches, stock, complaints, and ledger). Are you sure you want to reset?
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-md shadow-red-600/30 transition-all active:scale-[0.98]"
          >
            Reset Data
          </button>
        </div>
      </div>
    </div>
  );
};
