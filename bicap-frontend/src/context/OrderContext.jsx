import { createContext, useContext, useState } from 'react';

const OrderContext = createContext(null);

export function OrderProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product, quantity) => {
    const normalizedQty = Number(quantity) || 0;
    if (normalizedQty <= 0) return;

    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.productId === product.productId && item.farmId === product.farmId
      );
      const maxQuantity = Number(product.maxQuantity) || 0;

      if (existing) {
        const nextQty = existing.quantity + normalizedQty;
        return prev.map((item) =>
          item.productId === product.productId && item.farmId === product.farmId
            ? { ...item, quantity: maxQuantity ? Math.min(nextQty, maxQuantity) : nextQty }
            : item
        );
      }
      return [
        ...prev,
        { ...product, quantity: maxQuantity ? Math.min(normalizedQty, maxQuantity) : normalizedQty, cartId: Date.now() },
      ];
    });
  };

  const removeFromCart = (cartId) => {
    setCartItems((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const updateQuantity = (cartId, quantity) => {
    const normalizedQty = Number(quantity) || 0;
    if (normalizedQty <= 0) {
      removeFromCart(cartId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.cartId === cartId
          ? {
              ...item,
              quantity: item.maxQuantity ? Math.min(normalizedQty, Number(item.maxQuantity)) : normalizedQty,
            }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  };

  return (
    <OrderContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getTotalPrice }}>
      {children}
    </OrderContext.Provider>
  );
}

export const useOrder = () => useContext(OrderContext);
