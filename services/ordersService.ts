import { getSupabaseClient } from '@/template';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  image_url: string | null;
  is_active: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  status: string;
  total_amount: number;
  items: {
    product_id: string;
    quantity: number;
    price: number;
  }[];
  created_at: string;
}

export interface OrderWithDetails extends Order {
  products?: Product[];
}

export async function getProducts() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Get products error:', error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function getMyOrders(clientId: string) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('product_orders')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get orders error:', error);
      return { data: null, error: error.message };
    }

    // Parse items and enrich with product details
    const ordersWithProducts = await Promise.all(
      (data || []).map(async (order) => {
        const items = typeof order.items === 'string' 
          ? JSON.parse(order.items) 
          : order.items;

        // Get product details for each item
        const productIds = items.map((item: any) => item.product_id);
        const { data: products } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds);

        return {
          ...order,
          items,
          products: products || [],
        };
      })
    );

    return { data: ordersWithProducts, error: null };
  } catch (error: any) {
    console.error('Get orders exception:', error);
    return { data: null, error: error.message };
  }
}

export async function createOrder(params: {
  clientId: string;
  barbershopId: string;
  items: { product_id: string; quantity: number; price: number }[];
  totalAmount: number;
}) {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('product_orders')
      .insert({
        client_id: params.clientId,
        barbershop_id: params.barbershopId,
        items: params.items,
        total_amount: params.totalAmount,
        status: 'pendente',
      })
      .select()
      .single();

    if (error) {
      console.error('Create order error:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Create order exception:', error);
    return { data: null, error: error.message };
  }
}

export async function cancelOrder(orderId: string) {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('product_orders')
      .update({ status: 'cancelado' })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Cancel order error:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Cancel order exception:', error);
    return { data: null, error: error.message };
  }
}
