import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert
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

  // Fetch orders when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchOrders();
    }, [])
  );

  // Handle new order data from OrderConfirmationScreen
  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.orderData) {
        const newOrder = {
          ...route.params.orderData,
          _id: Date.now().toString(), // Generate temporary ID
          orderNumber: generateOrderNumber(),
          status: 'Dalam Proses',
          createdAt: new Date().toISOString()
        };
        
        // Add new order to the beginning of the list
        setOrders(prevOrders => [newOrder, ...prevOrders]);
        
        // Clear the route params
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
        setOrders(response.data.orders);
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

  // Generate unique order number
  const generateOrderNumber = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD${timestamp}${random}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Dalam Proses':
        return '#FF9800';
      case 'Menunggu Pickup':
        return '#2196F3';
      case 'Selesai':
        return '#4CAF50';
      case 'Dibatalkan':
        return '#F44336';
      default:
        return '#999';
    }
  };

  const navigateToOrderDetail = (order) => {
    navigation.navigate('OrderDetail', { order });
  };

  const OrderCard = ({ order }) => {
    const totalItems = order.items.reduce((sum, service) => 
      sum + service.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => navigateToOrderDetail(order)}
      >
        <View style={styles.orderHeader}>
          <View style={styles.serviceInfo}>
            <View style={styles.iconContainer}>
              <Icon name="local-laundry-service" size={24} color="#0391C4" />
            </View>
            <View>
              <Text style={styles.serviceName}>Order #{order.orderNumber}</Text>
              <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
            <Text style={styles.statusText}>{order.status}</Text>
          </View>
        </View>

        <View style={styles.orderDivider} />

        <View style={styles.orderDetails}>
          <View style={styles.detailItem}>
            <Icon name="local-laundry-service" size={20} color="#666" />
            <Text style={styles.detailText}>{totalItems} items</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="attach-money" size={20} color="#666" />
            <Text style={styles.detailText}>Rp {order.totalAmount.toLocaleString()}</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="access-time" size={20} color="#666" />
            <Text style={styles.detailText}>
              Selesai: {formatDate(order.estimatedDoneDate)}
            </Text>
          </View>
        </View>

        {order.deliveryMethod === 'pickup' && (
          <View style={styles.deliveryInfo}>
            <Icon name="local-shipping" size={20} color="#666" />
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

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {[
          { icon: 'home', screen: 'Home', active: false },
          { icon: 'receipt-long', screen: 'Order', active: true },
          { icon: 'chat', screen: 'Chat', active: false },
          { icon: 'person', screen: 'Profile', active: false }
        ].map((nav, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.navItem, nav.active ? styles.activeNavItem : null]}
            onPress={() => navigation.navigate(nav.screen)}
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
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#E6F2FF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  orderDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 15,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E6E6E6',
    elevation: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  activeNavItem: {
    backgroundColor: '#E6F2FF',
    borderRadius: 20,
  },
  navIcon: {
    color: '#999',
  },
  activeNavIcon: {
    color: '#0391C4',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  deliveryText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  }
});

export default OrderScreen;