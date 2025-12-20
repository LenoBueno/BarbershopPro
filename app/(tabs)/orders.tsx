import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
} from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

type Tab = 'products' | 'cart' | 'history';

export default function OrdersScreen() {
  const { client } = useAuth();
  const {
    products,
    orders,
    cart,
    loading,
    creating,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    checkout,
    cancelOrderById,
  } = useOrders(client?.id);

  const [activeTab, setActiveTab] = useState<Tab>('products');

  const handleAddToCart = (product: any) => {
    addToCart(product);
    Alert.alert('Sucesso', `${product.name} adicionado ao carrinho`);
  };

  const handleCheckout = async () => {
    if (!client) {
      Alert.alert('Erro', 'Você precisa estar logado');
      return;
    }

    if (cart.length === 0) {
      Alert.alert('Carrinho Vazio', 'Adicione produtos ao carrinho primeiro');
      return;
    }

    Alert.alert(
      'Confirmar Pedido',
      `Total: R$ ${getCartTotal().toFixed(2)}\n\nDeseja confirmar o pedido?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            const { error } = await checkout(client.id, client.barbershop_id);
            if (error) {
              Alert.alert('Erro', error);
            } else {
              Alert.alert('Sucesso!', 'Pedido realizado com sucesso', [
                { text: 'OK', onPress: () => setActiveTab('history') },
              ]);
            }
          },
        },
      ]
    );
  };

  const handleCancelOrder = (orderId: string) => {
    Alert.alert(
      'Cancelar Pedido',
      'Deseja realmente cancelar este pedido?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim',
          style: 'destructive',
          onPress: async () => {
            const { error } = await cancelOrderById(orderId);
            if (error) {
              Alert.alert('Erro', error);
            } else {
              Alert.alert('Sucesso', 'Pedido cancelado');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return colors.warning;
      case 'confirmado':
        return colors.info;
      case 'entregue':
        return colors.success;
      case 'cancelado':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'Pendente';
      case 'confirmado':
        return 'Confirmado';
      case 'entregue':
        return 'Entregue';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Screen>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Produtos</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'products' && styles.tabActive]}
            onPress={() => setActiveTab('products')}
          >
            <Ionicons
              name="storefront"
              size={20}
              color={activeTab === 'products' ? colors.primary : colors.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === 'products' && styles.tabTextActive]}>
              Produtos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'cart' && styles.tabActive]}
            onPress={() => setActiveTab('cart')}
          >
            <View style={styles.cartIconContainer}>
              <Ionicons
                name="cart"
                size={20}
                color={activeTab === 'cart' ? colors.primary : colors.textSecondary}
              />
              {cart.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cart.length}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.tabText, activeTab === 'cart' && styles.tabTextActive]}>
              Carrinho
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.tabActive]}
            onPress={() => setActiveTab('history')}
          >
            <Ionicons
              name="time"
              size={20}
              color={activeTab === 'history' ? colors.primary : colors.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
              Histórico
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Products Tab */}
          {activeTab === 'products' && (
            <FlatList
              data={products}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              renderItem={({ item }) => (
                <View style={styles.productCard}>
                  <View style={styles.productImage}>
                    <Ionicons name="cube" size={32} color={colors.primary} />
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productDescription}>{item.description}</Text>
                    <View style={styles.productFooter}>
                      <Text style={styles.productPrice}>R$ {item.price.toFixed(2)}</Text>
                      <Text style={styles.productStock}>
                        {item.stock_quantity > 0 ? `${item.stock_quantity} em estoque` : 'Esgotado'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.addButton, item.stock_quantity === 0 && styles.addButtonDisabled]}
                    onPress={() => handleAddToCart(item)}
                    disabled={item.stock_quantity === 0}
                  >
                    <Ionicons name="add" size={24} color={colors.background} />
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="cube-outline" size={48} color={colors.textTertiary} />
                  <Text style={styles.emptyText}>Nenhum produto disponível</Text>
                </View>
              }
            />
          )}

          {/* Cart Tab */}
          {activeTab === 'cart' && (
            <View style={styles.cartContainer}>
              <FlatList
                data={cart}
                keyExtractor={(item) => item.product.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => (
                  <View style={styles.cartItem}>
                    <View style={styles.cartItemImage}>
                      <Ionicons name="cube" size={24} color={colors.primary} />
                    </View>
                    <View style={styles.cartItemInfo}>
                      <Text style={styles.cartItemName}>{item.product.name}</Text>
                      <Text style={styles.cartItemPrice}>R$ {item.product.price.toFixed(2)}</Text>
                    </View>
                    <View style={styles.quantityControls}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                      >
                        <Ionicons name="remove" size={16} color={colors.text} />
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                      >
                        <Ionicons name="add" size={16} color={colors.text} />
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeFromCart(item.product.id)}
                    >
                      <Ionicons name="trash" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Ionicons name="cart-outline" size={48} color={colors.textTertiary} />
                    <Text style={styles.emptyText}>Carrinho vazio</Text>
                    <TouchableOpacity
                      style={styles.shopButton}
                      onPress={() => setActiveTab('products')}
                    >
                      <Text style={styles.shopButtonText}>Adicionar Produtos</Text>
                    </TouchableOpacity>
                  </View>
                }
              />

              {cart.length > 0 && (
                <View style={styles.cartFooter}>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>R$ {getCartTotal().toFixed(2)}</Text>
                  </View>
                  <Button
                    title="Finalizar Pedido"
                    onPress={handleCheckout}
                    loading={creating}
                  />
                </View>
              )}
            </View>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <FlatList
              data={orders}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              renderItem={({ item }) => (
                <View style={styles.orderCard}>
                  <View style={styles.orderHeader}>
                    <View>
                      <Text style={styles.orderDate}>{formatDate(item.created_at)}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                          {getStatusLabel(item.status)}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.orderTotal}>R$ {item.total_amount.toFixed(2)}</Text>
                  </View>

                  <View style={styles.orderItems}>
                    {item.items.map((orderItem: any, index: number) => {
                      const product = item.products?.find((p: any) => p.id === orderItem.product_id);
                      return (
                        <View key={index} style={styles.orderItem}>
                          <Text style={styles.orderItemName}>
                            {product?.name || 'Produto'} x{orderItem.quantity}
                          </Text>
                          <Text style={styles.orderItemPrice}>R$ {orderItem.price.toFixed(2)}</Text>
                        </View>
                      );
                    })}
                  </View>

                  {item.status === 'pendente' && (
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => handleCancelOrder(item.id)}
                    >
                      <Text style={styles.cancelButtonText}>Cancelar Pedido</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="receipt-outline" size={48} color={colors.textTertiary} />
                  <Text style={styles.emptyText}>Nenhum pedido realizado</Text>
                </View>
              }
            />
          )}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  cartIconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.error,
    borderRadius: borderRadius.full,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    ...typography.caption,
    color: colors.background,
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: spacing.lg,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  productDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  productPrice: {
    ...typography.h3,
    color: colors.primary,
  },
  productStock: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  shopButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  shopButtonText: {
    ...typography.button,
    color: colors.background,
  },
  cartContainer: {
    flex: 1,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cartItemImage: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  cartItemPrice: {
    ...typography.bodySmall,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    ...typography.body,
    color: colors.text,
    marginHorizontal: spacing.md,
    minWidth: 24,
    textAlign: 'center',
  },
  removeButton: {
    padding: spacing.sm,
  },
  cartFooter: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  totalLabel: {
    ...typography.h3,
    color: colors.text,
  },
  totalValue: {
    ...typography.h2,
    color: colors.primary,
  },
  orderCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  orderDate: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  orderTotal: {
    ...typography.h3,
    color: colors.primary,
  },
  orderItems: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  orderItemName: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  orderItemPrice: {
    ...typography.bodySmall,
    color: colors.text,
  },
  cancelButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...typography.bodySmall,
    color: colors.error,
    fontWeight: '600',
  },
});
