import { useState, useEffect } from 'react';
import {
  getProducts,
  getMyOrders,
  createOrder,
  cancelOrder,
  Product,
  CartItem,
  OrderWithDetails,
} from '@/services/ordersService';

export function useOrders(clientId?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (clientId) {
      loadOrders();
    }
  }, [clientId]);

  const loadProducts = async () => {
    setLoading(true);
    const { data, error } = await getProducts();
    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const loadOrders = async () => {
    if (!clientId) return;
    
    setLoading(true);
    const { data, error } = await getMyOrders(clientId);
    if (!error && data) {
      setOrders(data);
    }
    setLoading(false);
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.product.id === product.id);
      
      if (existingItem) {
        // Increment quantity
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Add new item
        return [...prev, { product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const checkout = async (clientId: string, barbershopId: string) => {
    setCreating(true);
    
    const items = cart.map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.product.price,
    }));

    const totalAmount = getCartTotal();

    const result = await createOrder({
      clientId,
      barbershopId,
      items,
      totalAmount,
    });

    setCreating(false);

    if (!result.error) {
      clearCart();
      loadOrders();
    }

    return result;
  };

  const cancelOrderById = async (orderId: string) => {
    const result = await cancelOrder(orderId);
    if (!result.error) {
      loadOrders();
    }
    return result;
  };

  return {
    products,
    orders,
    cart,
    loading,
    creating,
    loadProducts,
    loadOrders,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    checkout,
    cancelOrderById,
  };
}
