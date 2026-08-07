import React, { createContext, useContext, useState, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { toast } from 'sonner';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertState {
  isOpen: boolean;
  title: string;
  message: string;
  type: AlertType;
}

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

interface PromptState {
  isOpen: boolean;
  title: string;
  message: string;
  defaultValue: string;
  inputType?: 'text' | 'date';
  confirmText: string;
  cancelText: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

interface AlertContextType {
  showAlert: (options: { title: string; message: string; type?: AlertType }) => void;
  closeAlert: () => void;
  showConfirm: (options: { title: string; message: string; confirmText?: string; cancelText?: string; }) => Promise<boolean>;
  showPrompt: (options: { title: string; message: string; defaultValue?: string; inputType?: 'text' | 'date'; confirmText?: string; cancelText?: string; }) => Promise<string | null>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [promptState, setPromptState] = useState<PromptState | null>(null);
  const [promptInput, setPromptInput] = useState('');

  const showAlert = ({ title, message, type = 'info' }: { title: string; message: string; type?: AlertType }) => {
    if (type === 'success') {
      toast.success(title, { description: message });
    } else if (type === 'info') {
      toast.info(title, { description: message });
    } else {
      setAlertState({ isOpen: true, title, message, type });
    }
  };

  const closeAlert = () => {
    setAlertState((prev) => ({ ...prev, isOpen: false }));
  };

  const showConfirm = ({ title, message, confirmText = 'Confirm', cancelText = 'Cancel' }: { title: string; message: string; confirmText?: string; cancelText?: string; }) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        onConfirm: () => {
          setConfirmState(null);
          resolve(true);
        },
        onCancel: () => {
          setConfirmState(null);
          resolve(false);
        }
      });
    });
  };

  const showPrompt = ({ title, message, defaultValue = '', inputType = 'text', confirmText = 'Submit', cancelText = 'Cancel' }: { title: string; message: string; defaultValue?: string; inputType?: 'text' | 'date'; confirmText?: string; cancelText?: string; }) => {
    return new Promise<string | null>((resolve) => {
      setPromptInput(defaultValue);
      setPromptState({
        isOpen: true,
        title,
        message,
        defaultValue,
        inputType,
        confirmText,
        cancelText,
        onConfirm: (val) => {
          setPromptState(null);
          resolve(val);
        },
        onCancel: () => {
          setPromptState(null);
          resolve(null);
        }
      });
    });
  };

  return (
    <AlertContext.Provider value={{ showAlert, closeAlert, showConfirm, showPrompt }}>
      {children}
      {alertState.isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200 relative">
              <button 
                onClick={closeAlert}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex flex-col items-center text-center gap-4 mt-2">
                {alertState.type === 'success' && (
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                )}
                {alertState.type === 'error' && (
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                )}
                {alertState.type === 'warning' && (
                  <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                )}
                {alertState.type === 'info' && (
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Info className="w-8 h-8" />
                  </div>
                )}

                <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {alertState.title}
                </h3>
                <p className="text-gray-500 text-sm whitespace-pre-line">
                  {alertState.message}
                </p>
                
                <div className="w-full mt-4">
                  <button
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-white transition-colors shadow-sm ${
                      alertState.type === 'success' ? 'bg-green-600 hover:bg-green-700 shadow-green-200' :
                      alertState.type === 'error' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' :
                      alertState.type === 'warning' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200' :
                      'bg-[#131ADF] hover:bg-blue-800 shadow-blue-200'
                    }`}
                    onClick={closeAlert}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
      {confirmState?.isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200 relative">
              <button 
                onClick={confirmState.onCancel}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex flex-col items-center text-center gap-4 mt-2">
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {confirmState.title}
                </h3>
                <p className="text-gray-500 text-sm whitespace-pre-line">
                  {confirmState.message}
                </p>
                
                <div className="w-full flex flex-col sm:flex-row gap-3 mt-4">
                  <button
                    className="flex-1 py-2.5 px-4 rounded-xl font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors shadow-sm order-2 sm:order-1"
                    onClick={confirmState.onCancel}
                  >
                    {confirmState.cancelText}
                  </button>
                  <button
                    className="flex-1 py-2.5 px-4 rounded-xl font-bold text-white transition-colors shadow-sm order-1 sm:order-2 bg-amber-600 hover:bg-amber-700 shadow-amber-200"
                    onClick={confirmState.onConfirm}
                  >
                    {confirmState.confirmText}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
      {promptState?.isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200 relative">
              <button 
                onClick={promptState.onCancel}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex flex-col text-center gap-4 mt-2">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mx-auto">
                  <Info className="w-8 h-8" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {promptState.title}
                </h3>
                <p className="text-gray-500 text-sm whitespace-pre-line text-left">
                  {promptState.message}
                </p>

                <input 
                  type={promptState.inputType || 'text'}
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && promptInput.trim()) {
                      promptState.onConfirm(promptInput);
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  autoFocus
                />
                
                <div className="w-full flex flex-col sm:flex-row gap-3 mt-4">
                  <button
                    className="flex-1 py-2.5 px-4 rounded-xl font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors shadow-sm order-2 sm:order-1"
                    onClick={promptState.onCancel}
                  >
                    {promptState.cancelText}
                  </button>
                  <button
                    className="flex-1 py-2.5 px-4 rounded-xl font-bold text-white transition-colors shadow-sm order-1 sm:order-2 bg-[#131ADF] hover:bg-blue-800 shadow-blue-200 disabled:opacity-50"
                    onClick={() => promptState.onConfirm(promptInput)}
                    disabled={!promptInput.trim()}
                  >
                    {promptState.confirmText}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </AlertContext.Provider>
  );
}

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

