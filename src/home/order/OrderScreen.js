import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const OrderScreen = () => {
  const navigation = useNavigation();

  // Sample data for active orders
  const activeOrders = [
    {
      id: '1',
      service: 'Cuci & Setrika',
      status: 'Dalam Proses',
      date: '14 Dec 2024',
      items: '4 pcs',
      price: 'Rp 50.000',
      estimatedDone: '16 Dec 2024',
      iconName: 'local-laundry-service',
    },
    {
      id: '2',
      service: 'Setrika',
      status: 'Menunggu Pickup',
      date: '14 Dec 2024',
      items: '2 kg',
      price: 'Rp 30.000',
      estimatedDone: '15 Dec 2024',
      iconName: 'iron',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Dalam Proses':
        return '#FF9800';
      case 'Menunggu Pickup':
        return '#2196F3';
      default:
        return '#999';
    }
  };

  const OrderCard = ({ order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => {}}
    >
      <View style={styles.orderHeader}>
        <View style={styles.serviceInfo}>
          <View style={styles.iconContainer}>
            <Icon name={order.iconName} size={24} color="#0391C4" />
          </View>
          <View>
            <Text style={styles.serviceName}>{order.service}</Text>
            <Text style={styles.orderDate}>{order.date}</Text>
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
          <Text style={styles.detailText}>{order.items}</Text>
        </View>
        <View style={styles.detailItem}>
          <Icon name="attach-money" size={20} color="#666" />
          <Text style={styles.detailText}>{order.price}</Text>
        </View>
        <View style={styles.detailItem}>
          <Icon name="access-time" size={20} color="#666" />
          <Text style={styles.detailText}>Selesai: {order.estimatedDone}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pesanan Saya</Text>
      </View>

      <ScrollView 
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {activeOrders.length > 0 ? (
          activeOrders.map(order => (
            <OrderCard key={order.id} order={order} />
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
});

export default OrderScreen;