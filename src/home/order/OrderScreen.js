import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ORDER_URL } from '../../../api';

const OrderScreen = ({ route }) => {
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchOrders();
    }, [])
  );

  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.orderData) {
        const newOrder = {
          ...route.params.orderData,
          _id: Date.now().toString(),
          orderNumber: generateOrderNumber(),
          status: 'Menunggu Konfirmasi',
          createdAt: new Date().toISOString()
        };
        setOrders(prevOrders => [newOrder, ...prevOrders]);
        navigation.setParams({ orderData: null });
      }
    }, [route.params?.orderData])
  );

  const fetchOrders = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
        return;
      }

      const response = await axios.get(ORDER_URL, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const ordersWithDates = response.data.orders.map(order => ({
          ...order,
          createdAt: order.createdAt || order.orderDate || new Date().toISOString()
        }));
        setOrders(ordersWithDates);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('userToken');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      } else {
        Alert.alert('Error', 'Gagal mengambil data pesanan');
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, []);

  const generateOrderNumber = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD${timestamp}${random}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Tanggal tidak tersedia';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Format tanggal tidak valid';
      
      return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Error format tanggal';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Dalam Proses':
        return '#FF9800';  // Orange
      case 'Menunggu Pickup':
        return '#2196F3';  // Blue
      case 'Menunggu Konfirmasi':
        return '#9C27B0';  // Purple  
      case 'Selesai':
        return '#4CAF50';  // Green
      case 'Dibatalkan':
        return '#F44336';  // Red
      default:
        return '#999';     // Grey
    }
  };

  const navigateToOrderDetail = (order) => {
    navigation.navigate('OrderDetail', { order });
  };

  const OrderCard = ({ order }) => {
    const totalItems = order.items.reduce((sum, service) => 
      sum + service.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );

    const displayDate = formatDate(order.createdAt || order.orderDate);
    const estimatedDoneDate = formatDate(order.estimatedDoneDate);

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => navigateToOrderDetail(order)}
      >
        <View style={styles.orderHeader}>
          <View style={styles.serviceInfo}>
            <View style={styles.iconContainer}>
              <Icon name="receipt" size={24} color="#0391C4" />
            </View>
            <View>
              <Text style={styles.serviceName}>Order #{order.orderNumber}</Text>
              <Text style={styles.orderDate}>{displayDate}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
            <Text style={styles.statusText}>{order.status}</Text>
          </View>
        </View>

        <View style={styles.orderDivider} />

        <View style={styles.orderDetails}>
          <View style={styles.detailItem}>
            <Icon name="inventory-2" size={24} color="#0391C4" />
            <Text style={styles.detailText}>{totalItems} Items</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="payments" size={24} color="#0391C4" />
            <Text style={styles.detailText}>
              Rp {order.totalAmount?.toLocaleString('id-ID') || '0'}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="event" size={24} color="#0391C4" />
            <Text style={styles.detailText}>{estimatedDoneDate}</Text>
          </View>
        </View>

        {order.deliveryMethod === 'pickup' && (
          <View style={styles.deliveryInfo}>
            <Icon name="local-shipping" size={22} color="#666" />
            <Text style={styles.deliveryText}>Jemput & Antar</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0391C4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pesanan Saya</Text>
      </View>

      <ScrollView 
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0391C4']}
          />
        }
      >
        {orders.length > 0 ? (
          orders.map(order => (
            <OrderCard key={order._id} order={order} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="inbox" size={60} color="#999" />
            <Text style={styles.emptyText}>Tidak ada pesanan aktif</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        {[
          { icon: 'home', screen: 'Home', active: false },
          { icon: 'receipt', screen: 'Order', active: true },
          { icon: 'chat', screen: 'Chat', active: false },
          { icon: 'person', screen: 'Profile', active: false }
        ].map((nav, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.navItem, nav.active ? styles.activeNavItem : null]}
            onPress={() => navigation.navigate(nav.screen)}
            activeOpacity={0.9}
          >
            <Icon
              name={nav.icon}
              size={25}
              style={[styles.navIcon, nav.active ? styles.activeNavIcon : null]}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    backgroundColor: '#0391C4',
    paddingTop: 55,
    paddingBottom: 28,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'nowrap',
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.7,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#E6F2FF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  orderDate: {
    fontSize: 13,
    color: '#7F8C8D',
    letterSpacing: 0.2,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
    textAlign: 'center',
    lineHeight: 18,
  },
  orderDivider: {
    height: 1,
    backgroundColor: '#EAEAEA',
    marginVertical: 14,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 4,
  },
  detailItem: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#2C3E50',
    fontWeight: '500',
    letterSpacing: 0.2,
    textAlign: 'center',
    lineHeight: 18,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
    paddingHorizontal: 8,
  },
  deliveryText: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
    letterSpacing: 0.2,
    marginLeft: 10,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E6E6E6',
    elevation: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    paddingBottom: Platform.OS === 'ios' ? 25 : 12,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 20,
    minWidth: 60,
  },
  activeNavItem: {
    backgroundColor: '#E6F2FF',
  },
  navIcon: {
    color: '#999',
  },
  activeNavIcon: {
    color: '#0391C4',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    marginBottom: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#95A5A6',
    marginTop: 16,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
  },
});

export default OrderScreen;