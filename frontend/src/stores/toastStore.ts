/**
 * Toast Store
 * 
 * IMPORTANCE:
 * - Global toast notification state
 * - Can be called from anywhere in the app
 * - Manages multiple toasts
 * - Auto-removes expired toasts
 * - Used throughout app for user feedback
 */

import { create } from 'zustand';
import type { Toast, ToastType } from '../components/ui/Toast';

interface ToastState {
  toasts: Toast[];
  show: (message: string, type?: ToastType, duration?: number) => void;
  remove: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  show: (message, type = 'info', duration = 5000) => {
    const id = Math.random().toString(36).substring(7);
    const toast: Toast = { id, message, type, duration };
    
    set((state) => ({
      toasts: [...state.toasts, toast],
    }));
  },

  remove: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  success: (message, duration) => {
    useToastStore.getState().show(message, 'success', duration);
  },

  error: (message, duration) => {
    useToastStore.getState().show(message, 'error', duration || 7000);
  },

  info: (message, duration) => {
    useToastStore.getState().show(message, 'info', duration);
  },

  warning: (message, duration) => {
    useToastStore.getState().show(message, 'warning', duration);
  },
}));

