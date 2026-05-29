import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { Product } from './data';

const cookieStorage = {
  getItem: (name: string) => {
    if (typeof window === 'undefined') return null;
    return Cookies.get(name) || null;
  },
  setItem: (name: string, value: string) => {
    if (typeof window === 'undefined') return;
    Cookies.set(name, value, { expires: 7, secure: true, sameSite: 'strict' });
  },
  removeItem: (name: string) => {
    if (typeof window === 'undefined') return;
    Cookies.remove(name);
  },
};

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalAmount: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
  isOpen: false,
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  addItem: (product, quantity = 1) =>
    set((state) => {
      const existing = state.items.find((item) => item.product.id === product.id);
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: Math.min(99, item.quantity + quantity) }
              : item
          ),
          isOpen: true,
        };
      }

      return {
        items: [...state.items, { product, quantity: Math.min(99, quantity) }],
        isOpen: true,
      };
    }),
  removeItem: (productId) =>
    set((state) => ({ items: state.items.filter((item) => item.product.id !== productId) })),
  updateQuantity: (productId, quantity) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.product.id === productId ? { ...item, quantity: Math.min(99, Math.max(1, quantity)) } : item
      ),
    })),
  clearCart: () => set({ items: [] }),
  totalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
  totalAmount: () =>
    get().items.reduce((total, item) => total + item.quantity * item.product.price, 0),
    }),
    {
      name: 'didallah-cart-storage',
      storage: createJSONStorage(() => cookieStorage),
      partialize: (state) => ({ items: state.items }), // Only persist items
    }
  )
);
