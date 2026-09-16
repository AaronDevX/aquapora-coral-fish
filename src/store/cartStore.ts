'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  imageUrl: string;
  quantity: number;
  maxStock: number;
  isWysiwyg: boolean;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  getTotalItems: () => number;
  getSubtotalCents: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item, quantity = 1) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((i) => i.id === item.id);

        if (existingItem) {
          // If WYSIWYG, max quantity is 1
          if (item.isWysiwyg) {
            set({ isOpen: true });
            return;
          }

          const newQty = Math.min(existingItem.quantity + quantity, item.maxStock);
          set({
            items: currentItems.map((i) =>
              i.id === item.id ? { ...i, quantity: newQty } : i
            ),
            isOpen: true,
          });
        } else {
          set({
            items: [
              ...currentItems,
              {
                ...item,
                quantity: item.isWysiwyg ? 1 : Math.min(quantity, Math.max(1, item.maxStock)),
              },
            ],
            isOpen: true,
          });
        }
      },

      removeItem: (id) => {
        set({
          items: get().items.filter((i) => i.id !== id),
        });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        set({
          items: get().items.map((i) => {
            if (i.id === id) {
              return { ...i, quantity: Math.min(quantity, i.maxStock) };
            }
            return i;
          }),
        });
      },

      clearCart: () => set({ items: [] }),

      setIsOpen: (isOpen) => set({ isOpen }),

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSubtotalCents: () => {
        return get().items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
      },
    }),
    {
      name: 'aquapora-cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
