import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, type ToastType } from '../components/common/Toast';

interface ToastContextType {
	showToast: (type: ToastType, message: string, duration?: number) => void;
	hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error('useToast must be used within a ToastProvider');
	}
	return context;
};

interface ToastProviderProps {
	children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
	const [toast, setToast] = useState<{
		type: ToastType;
		message: string;
		isVisible: boolean;
		duration: number;
	}>({
		type: 'info',
		message: '',
		isVisible: false,
		duration: 5000,
	});

	const showToast = useCallback((type: ToastType, message: string, duration: number = 5000) => {
		setToast({ type, message, isVisible: true, duration });
	}, []);

	const hideToast = useCallback(() => {
		setToast(prev => ({ ...prev, isVisible: false }));
	}, []);

	return (
		<ToastContext.Provider value={{ showToast, hideToast }}>
			{children}
			<Toast
				type={toast.type}
				message={toast.message}
				isVisible={toast.isVisible}
				onClose={hideToast}
				duration={toast.duration}
			/>
		</ToastContext.Provider>
	);
};
