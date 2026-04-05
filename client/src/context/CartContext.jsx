import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('sms_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('sms_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, plan, interval) => {
    setCart((prevCart) => {
      // Check if product with same plan already in cart
      const existing = prevCart.find(item => item.product._id === product._id && item.plan._id === plan._id);
      if (existing) {
        return prevCart.map(item => 
          item.product._id === product._id && item.plan._id === plan._id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prevCart, { product, plan, interval, quantity: 1 }];
    });
  };

  const removeFromCart = (productId, planId) => {
    setCart(prevCart => prevCart.filter(item => !(item.product._id === productId && item.plan._id === planId)));
  };

  const updateQuantity = (productId, planId, quantity) => {
    if (quantity < 1) return;
    setCart(prevCart => prevCart.map(item => 
      (item.product._id === productId && item.plan._id === planId)
        ? { ...item, quantity }
        : item
    ));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.plan.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
