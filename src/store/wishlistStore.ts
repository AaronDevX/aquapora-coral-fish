'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { z } from 'zod';

const storedWishlist = z.object({ ids: z.array(z.string().uuid()).max(500) });
interface WishlistState {
  ids: string[];
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  getFavoriteCount: () => number;
  clearFavorites: () => void;
}

export const useWishlistStore = create<WishlistState>()(persist((set, get) => ({
  ids: [],
  toggleFavorite: (id) => {
    if (!z.string().uuid().safeParse(id).success) return;
    set(({ ids }) => ({ ids: ids.includes(id) ? ids.filter((item) => item !== id) : [...ids.slice(-499), id] }));
  },
  isFavorite: (id) => get().ids.includes(id),
  getFavoriteCount: () => get().ids.length,
  clearFavorites: () => set({ ids: [] }),
}), {
  name: 'aquapora-wishlist-storage',
  storage: createJSONStorage(() => localStorage),
  partialize: ({ ids }) => ({ ids }),
  merge: (persisted, current) => {
    const result = storedWishlist.safeParse(persisted);
    return { ...current, ids: result.success ? [...new Set(result.data.ids)] : [] };
  },
}));
