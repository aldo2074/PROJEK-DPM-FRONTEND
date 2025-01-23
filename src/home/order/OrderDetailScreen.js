import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { ORDER_URL } from '../../../api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OrderDetailScreen = ({ route, navigation }) => {
  const { order } = route.params;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCancelOrder = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.put(
        `${ORDER_URL}/${order._id}/cancel`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        Alert.alert('Sukses', 'Pesanan berhasil dibatalkan');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal membatalkan pesanan');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Dalam Proses': return '#FF9800';
      case 'Selesai': return '#4CAF50';
      case 'Dibatalkan': return '#F44336';
      default: return '#999';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Pesanan</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Order Status */}
        <View style={styles.section}>
          <View style={styles.statusContainer}>
            <Text style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
              {order.status}
            </Text>
          </View>
          <Text style={styles.orderNumber}>Order #{order.orderNumber}</Text>
          <Text style={styles.orderDate}>Dibuat pada {formatDate(order.orderDate)}</Text>
        </View>

        {/* Services and Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detail Layanan</Text>
          {order.items.map((service, index) => (
            <View key={index} style={styles.serviceContainer}>
              <Text style={styles.serviceName}>{service.service}</Text>
              {service.items.map((item, idx) => (
                <View key={idx} style={styles.itemRow}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                  <Text style={styles.itemPrice}>Rp {item.price.toLocaleString()}</Text>
                </View>
              ))}
              <View style={styles.serviceTotalRow}>
                <Text style={styles.serviceTotalLabel}>Total {service.service}</Text>
                <Text style={styles.serviceTotalPrice}>Rp {service.totalPrice.toLocaleString()}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Delivery Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi Pengiriman</Text>
          <View style={styles.infoRow}>
            <Icon name="local-shipping" size={20} color="#666" />
            <Text style={styles.infoText}>
              {order.deliveryMethod === 'pickup' ? 'Jemput & Antar' : 'Antar Langsung'}
            </Text>
          </View>
          {order.deliveryMethod === 'pickup' && order.deliveryAddress && (
            <View style={styles.infoRow}>
              <Icon name="location-on" size={20} color="#666" />
              <Text style={styles.infoText}>{order.deliveryAddress}</Text>
            </View>
          )}
        </View>

        {/* Payment Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi Pembayaran</Text>
          <View style={styles.infoRow}>
            <Icon name="payment" size={20} color="#666" />
            <Text style={styles.infoText}>
              {order.paymentMethod === 'cash' ? 'Tunai' : 'DANA'}
            </Text>
          </View>
          <View style={styles.paymentBreakdown}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Subtotal</Text>
              <Text style={styles.paymentValue}>Rp {order.subtotal.toLocaleString()}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Biaya Pengiriman</Text>
              <Text style={styles.paymentValue}>Rp {order.deliveryFee.toLocaleString()}</Text>
            </View>
            <View style={[styles.paymentRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Pembayaran</Text>
              <Text style={styles.totalValue}>Rp {order.totalAmount.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {order.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Catatan</Text>
            <Text style={styles.notes}>{order.notes}</Text>
          </View>
        )}
      </ScrollView>

      {/* Cancel Button (only show for orders in process) */}
      {order.status === 'Dalam Proses' && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              Alert.alert(
                'Batalkan Pesanan',
                'Apakah Anda yakin ingin membatalkan pesanan ini?',
                [
                  { text: 'Tidak' },
                  { text: 'Ya', onPress: handleCancelOrder }
                ]
              );
            }}
          >
            <Text style={styles.cancelButtonText}>Batalkan Pesanan</Text>
          </TouchableOpacity>
        </View>
      )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  serviceContainer: {
    marginBottom: 16,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemName: {
    flex: 2,
    fontSize: 14,
    color: '#666',
  },
  itemQuantity: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  itemPrice: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  serviceTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
    marginTop: 8,
  },
  serviceTotalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  serviceTotalPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0391C4',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  paymentBreakdown: {
    marginTop: 12,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
  },
  paymentValue: {
    fontSize: 14,
    color: '#333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0391C4',
  },
  notes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  bottomContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    backgroundColor: '#F44336',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OrderDetailScreen; 