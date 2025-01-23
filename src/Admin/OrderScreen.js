import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
} from 'react-native';
import axios from 'axios';
import { ORDER_URL } from '../../api';
import Toast from 'react-native-toast-message';

const OrderScreen = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${ORDER_URL}/admin/orders`);
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleCompleteOrder = async (orderId, userId) => {
    try {
      const response = await axios.put(`${ORDER_URL}/admin/complete/${orderId}`, {
        userId: userId,
        status: 'completed'
      });

      if (response.data.success) {
        // Kirim notifikasi ke user
        await sendNotificationToUser(userId, orderId);
        
        Toast.show({
          type: 'success',
          text1: 'Sukses',
          text2: 'Status pesanan berhasil diperbarui',
        });

        // Refresh daftar pesanan
        fetchOrders();
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Gagal memperbarui status pesanan',
      });
    }
  };

  const sendNotificationToUser = async (userId, orderId) => {
    try {
      await axios.post(`${ORDER_URL}/notifications/send`, {
        userId: userId,
        orderId: orderId,
        title: 'Pesanan Selesai',
        message: 'Pesanan Anda telah selesai. Silakan ambil di outlet kami.',
        type: 'order_completed'
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{item.orderId}</Text>
        <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>

      <View style={styles.orderDetails}>
        <Text style={styles.customerName}>Customer: {item.userName}</Text>
        <Text style={styles.serviceType}>Layanan: {item.serviceName}</Text>
        <Text style={styles.orderStatus}>Status: {item.status}</Text>
      </View>

      {item.status !== 'completed' && (
        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => {
            Alert.alert(
              'Konfirmasi',
              'Apakah Anda yakin pesanan ini telah selesai?',
              [
                { text: 'Batal', style: 'cancel' },
                { text: 'Ya', onPress: () => handleCompleteOrder(item.orderId, item.userId) }
              ]
            );
          }}
        >
          <Text style={styles.completeButtonText}>Selesaikan Pesanan</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Daftar Pesanan</Text>
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.orderId.toString()}
        contentContainerStyle={styles.listContainer}
      />
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 16,
    color: '#333',
  },
  listContainer: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0391C4',
  },
  orderDate: {
    color: '#666',
  },
  orderDetails: {
    marginBottom: 12,
  },
  customerName: {
    fontSize: 15,
    marginBottom: 4,
  },
  serviceType: {
    fontSize: 15,
    marginBottom: 4,
  },
  orderStatus: {
    fontSize: 15,
    color: '#666',
  },
  completeButton: {
    backgroundColor: '#0391C4',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default OrderScreen; 