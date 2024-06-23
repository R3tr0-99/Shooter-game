import { create } from "zustand";

const defaultCountOfRounds = 30;

//Store creation
export const useRoundsStore = create((set) => ({
    countRounds: defaultCountOfRounds,
    decreaseRounds: () => set((state) => ({
        countRounds: Math.max(state.countRounds - 1, 0)
    })),
    reloadRounds: () => set(() => ({
        countRounds: defaultCountOfRounds
    }))
}));