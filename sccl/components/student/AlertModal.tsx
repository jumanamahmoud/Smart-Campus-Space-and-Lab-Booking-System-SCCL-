'use client';

interface AlertModalProps {
  title: string;
  message: string;
  onClose: () => void;
}

export default function AlertModal({ title, message, onClose }: AlertModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-xl border border-red-100 bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
            !
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-600">{message}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
