import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const RiwayatScreen = () => {
  const navigation = useNavigation();

  // Sample order history data
  const orderHistory = [
    {
      id: '1',
      type: 'Cuci & Setrika',
      items: [
        { name: 'Kaos', qty: 3 },
        { name: 'Celana', qty: 2 }
      ],
      status: 'Selesai',
      date: '15 Dec 2024',
      totalPrice: 50000,
      orderNumber: 'LD123456789'
    },
    {
      id: '2',
      type: 'Cuci Sepatu',
      items: [
        { name: 'Sneakers', qty: 1 }
      ],
      status: 'Selesai',
      date: '13 Dec 2024',
      totalPrice: 35000,
      orderNumber: 'LD123456788'
    },
    {
      id: '3',
      type: 'Setrika',
      items: [
        { name: 'Kemeja', qty: 4 },
        { name: 'Celana', qty: 3 }
      ],
      status: 'Selesai',
      date: '10 Dec 2024',
      totalPrice: 45000,
      orderNumber: 'LD123456787'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Selesai':
        return '#4CAF50';
      case 'Dalam Proses':
        return '#FFA000';
      default:
        return '#999';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Selesai':
        return 'check-circle';
      case 'Dalam Proses':
        return 'schedule';
      default:
        return 'info';
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Remove back button */}
        {/* Remove title "Riwayat Pesanan" */}
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {orderHistory.map((order) => (
          <TouchableOpacity
            key={order.id}
            style={styles.orderCard}
            // onPress={() => handleOrderPress(order)}
          >
            {/* Order Header */}
            <View style={styles.orderHeader}>
              <View style={styles.orderTypeContainer}>
                <Icon name="local-laundry-service" size={20} color="#0391C4" />
                <Text style={styles.orderType}>{order.type}</Text>
              </View>
              <View style={[
                styles.statusContainer,
                { backgroundColor: `${getStatusColor(order.status)}15` }
              ]}>
                <Icon 
                  name={getStatusIcon(order.status)} 
                  size={16} 
                  color={getStatusColor(order.status)} 
                  style={styles.statusIcon}
                />
                <Text style={[
                  styles.statusText,
                  { color: getStatusColor(order.status) }
                ]}>{order.status}</Text>
              </View>
            </View>

            {/* Order Details */}
            <View style={styles.orderDetails}>
              <Text style={styles.orderNumber}>
                Order #{order.orderNumber}
              </Text>
              <Text style={styles.orderDate}>{order.date}</Text>
            </View>

            {/* Items List */}
            <View style={styles.itemsList}>
              {order.items.map((item, index) => (
                <Text key={index} style={styles.itemText}>
                  {item.qty}x {item.name}
                </Text>
              ))}
            </View>

            {/* Order Footer */}
            <View style={styles.orderFooter}>
              <Text style={styles.totalLabel}>Total Pembayaran</Text>
              <Text style={styles.totalPrice}>
                Rp {order.totalPrice.toLocaleString()}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    backgroundColor: '#0391C4',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  orderTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    marginBottom: 15,
  },
  orderNumber: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
  },
  itemsList: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 15,
    marginBottom: 15,
  },
  itemText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 15,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0391C4',
  },
});

export default RiwayatScreen;