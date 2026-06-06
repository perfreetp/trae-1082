import { create } from 'zustand';
import type { User, Aircraft, Declaration, Message, BlacklistRecord, AirspaceInfo } from '@/types';
import {
  mockUser,
  mockAircraft,
  mockDeclarations,
  mockMessages,
  mockBlacklist,
  mockAirspaces,
} from '@/data/mockData';

interface AppState {
  user: User;
  aircraft: Aircraft[];
  declarations: Declaration[];
  messages: Message[];
  blacklist: BlacklistRecord[];
  airspaces: AirspaceInfo[];
  currentDeclarationId: string | null;
  sidebarCollapsed: boolean;

  setCurrentDeclaration: (id: string | null) => void;
  toggleSidebar: () => void;
  markMessageAsRead: (messageId: string) => void;
  markAllMessagesAsRead: () => void;
  updateDeclaration: (id: string, updates: Partial<Declaration>) => void;
  addDeclaration: (declaration: Declaration) => void;
  getUnreadMessageCount: () => number;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: mockUser,
  aircraft: mockAircraft,
  declarations: mockDeclarations,
  messages: mockMessages,
  blacklist: mockBlacklist,
  airspaces: mockAirspaces,
  currentDeclarationId: null,
  sidebarCollapsed: false,

  setCurrentDeclaration: (id) => set({ currentDeclarationId: id }),

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  markMessageAsRead: (messageId) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, read: true } : msg
      ),
    })),

  markAllMessagesAsRead: () =>
    set((state) => ({
      messages: state.messages.map((msg) => ({ ...msg, read: true })),
    })),

  updateDeclaration: (id, updates) =>
    set((state) => ({
      declarations: state.declarations.map((dec) =>
        dec.id === id ? { ...dec, ...updates, updatedAt: new Date().toISOString() } : dec
      ),
    })),

  addDeclaration: (declaration) =>
    set((state) => ({
      declarations: [...state.declarations, declaration],
    })),

  getUnreadMessageCount: () => {
    const { messages } = get();
    return messages.filter((m) => !m.read).length;
  },
}));
