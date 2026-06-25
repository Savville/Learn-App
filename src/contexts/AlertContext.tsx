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

interface AlertContextType {
  showAlert: (options: { title: string; message: string; type?: AlertType }) => void;
  closeAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

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

  return (
    <AlertContext.Provider value={{ showAlert, closeAlert }}>
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
