import { create } from "zustand";

interface OnlineState {
  onlineIds: Set<number>;

  setOnline: (userId: number) => void;
  setOffline: (userId: number) => void;
  setAllOnline: (ids: number[]) => void;
}

export const useOnlineStore = create<OnlineState>((set) => ({
  onlineIds: new Set<number>(),

  setOnline: (userId) =>
    set((state) => {
      const nextSet = new Set(state.onlineIds);
      nextSet.add(Number(userId));
      return { onlineIds: nextSet };
    }),

  setOffline: (userId) =>
    set((state) => {
      const nextSet = new Set(state.onlineIds);
      nextSet.delete(Number(userId));
      return { onlineIds: nextSet };
    }),

  setAllOnline: (ids) =>
    set(() => ({
      onlineIds: new Set(ids.map(Number)),
    })),
}));
