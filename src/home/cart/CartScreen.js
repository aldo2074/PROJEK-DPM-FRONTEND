import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Image
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CART_URL } from '../../../backend/config/config';
import Toast from 'react-native-toast-message';

const CartScreen = () => {
  const navigation = useNavigation();
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCart = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        navigation.navigate('Login');
        return;
      }

      const response = await axios.get(CART_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setCartItems(response.data.items || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'Gagal mengambil data keranjang',
        position: 'bottom'
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchCart();
  }, []);

  // Refresh cart when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchCart();
    }, [])
  );

  const handleRemoveItem = async (serviceId) => {
    Alert.alert(
      'Hapus Item',
      'Apakah Anda yakin ingin menghapus item ini?',
      [
        {
          text: 'Batal',
          style: 'cancel'
        },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('authToken');
              await axios.delete(`${CART_URL}/remove/${serviceId}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
              
              Toast.show({
                type: 'success',
                text1: 'Berhasil',
                text2: 'Item berhasil dihapus dari keranjang',
                position: 'bottom'
              });
              
              fetchCart();
            } catch (error) {
              console.error('Error removing item:', error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.error || 'Gagal menghapus item',
                position: 'bottom'
              });
            }
          }
        }
      ]
    );
  };

  const handleClearCart = async () => {
    Alert.alert(
      'Kosongkan Keranjang',
      'Apakah Anda yakin ingin mengosongkan keranjang?',
      [
        {
          text: 'Batal',
          style: 'cancel'
        },
        {
          text: 'Kosongkan',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('authToken');
              await axios.delete(`${CART_URL}/clear`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
              
              Toast.show({
                type: 'success',
                text1: 'Berhasil',
                text2: 'Keranjang berhasil dikosongkan',
                position: 'bottom'
              });
              
              setCartItems([]);
            } catch (error) {
              console.error('Error clearing cart:', error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.error || 'Gagal mengosongkan keranjang',
                position: 'bottom'
              });
            }
          }
        }
      ]
    );
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Keranjang Kosong',
        text2: 'Silakan tambahkan item ke keranjang',
        position: 'bottom'
      });
      return;
    }
    navigation.navigate('OrderConfirmation');
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, service) => total + service.totalPrice, 0);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0391C4" />
      </View>
    );
  }

  const getServiceIcon = (serviceName) => {
    switch (serviceName) {
      case 'Cuci & Setrika':
        return 'local-laundry-service';
      case 'Setrika':
        return 'iron';
      case 'Alas Kasur':
        return 'bed';
      case 'Cuci Sepatu':
        return 'cleaning-services';
      default:
        return 'local-laundry-service';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBackground}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Keranjang Saya</Text>
          <Text style={styles.headerSubtitle}>Pesanan yang telah Anda pilih</Text>
        </View>
      </View>

      {cartItems.length > 0 ? (
        <>
          <ScrollView 
            style={styles.content}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          >
            {cartItems.map((service, index) => (
              <View key={service._id} style={styles.serviceCard}>
                <View style={styles.serviceHeader}>
                  <View style={styles.serviceIconContainer}>
                    <Icon 
                      name={getServiceIcon(service.service)}
                      size={24} 
                      color="#0391C4" 
                    />
                  </View>
                  <View style={styles.serviceTitleContainer}>
                    <Text style={styles.serviceName}>{service.service}</Text>
                    <Text style={styles.serviceItemCount}>
                      {service.items.reduce((sum, item) => sum + item.quantity, 0)} item
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveItem(service._id)}
                    style={styles.removeButton}
                  >
                    <Icon name="delete-outline" size={24} color="#FF3B30" />
                  </TouchableOpacity>
                </View>

                {service.items.map((item, itemIndex) => (
                  <View key={itemIndex} style={styles.itemRow}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                      <Text style={styles.itemPrice}>
                        Rp {(item.price * item.quantity).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                ))}

                <View style={styles.serviceTotal}>
                  <Text style={styles.serviceTotalLabel}>Subtotal</Text>
                  <Text style={styles.serviceTotalPrice}>
                    Rp {service.totalPrice.toLocaleString()}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.bottomContainer}>
            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>Total Pembayaran</Text>
              <Text style={styles.totalPrice}>
                Rp {cartItems.reduce((sum, item) => sum + item.totalPrice, 0).toLocaleString()}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={() => navigation.navigate('OrderConfirmation')}
            >
              <Text style={styles.checkoutButtonText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="shopping-cart" size={80} color="#CCC" />
          <Text style={styles.emptyText}>Keranjang Anda masih kosong</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.shopButtonText}>Mulai Belanja</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerBackground: {
    backgroundColor: '#0391C4',
    height: Platform.OS === 'ios' ? 140 : 120,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    color: '#E6F2FF',
    fontSize: 14,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  serviceCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  serviceIconContainer: {
    backgroundColor: '#E6F2FF',
    padding: 10,
    borderRadius: 12,
    marginRight: 12,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceTitleContainer: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  serviceItemCount: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    padding: 5,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
    marginRight: 15,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0391C4',
    minWidth: 80,
    textAlign: 'right',
  },
  serviceTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  serviceTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  serviceTotalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0391C4',
  },
  bottomContainer: {
    backgroundColor: 'white',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0391C4',
  },
  checkoutButton: {
    backgroundColor: '#0391C4',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#0391C4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
    marginBottom: 30,
    textAlign: 'center',
  },
  shopButton: {
    backgroundColor: '#0391C4',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: '#0391C4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  shopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CartScreen;