import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  SafeAreaView,
  Alert,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ORDER_URL, AUTH_URL, VALIDATE_TOKEN_URL } from '../../../api';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OrderConfirmationScreen = ({ route }) => {
  const navigation = useNavigation();
  const { cartItems } = route.params || { cartItems: [] };
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState(null);
  const [token, setToken] = useState(null);

  // Payment methods data
  const paymentMethods = [
    { 
      id: 'cash', 
      name: 'Tunai', 
      iconType: 'material',
      icon: 'payments', 
      description: 'Pembayaran tunai saat serah terima' 
    },
    { 
      id: 'dana', 
      name: 'DANA', 
      iconType: 'image',
      icon: require('../../../assets/icons/dana-logo.png'),
      description: 'Pembayaran melalui DANA' 
    },
  ];

  // Delivery methods data
  const deliveryMethods = [
    {
      id: 'pickup',
      name: 'Jemput & Antar',
      icon: 'local-shipping',
      description: 'Kami akan menjemput dan mengantar pakaian Anda',
    },
    {
      id: 'direct',
      name: 'Antar Langsung',
      icon: 'directions-walk',
      description: 'Antar langsung ke outlet kami',
    },
  ];

  // Calculate total amount including delivery fee
  const deliveryFee = deliveryMethod === 'pickup' ? 5000 : 0;
  const subtotal = cartItems.reduce((sum, service) => sum + service.totalPrice, 0);
  const totalAmount = subtotal + deliveryFee;

  useEffect(() => {
    const initializeScreen = async () => {
      await checkToken();
    };
    initializeScreen();
  }, []);

  const checkToken = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      console.log('Token from storage:', userToken);

      if (!userToken) {
        console.log('Token not found in storage');
        handleSessionExpired('Token tidak ditemukan');
        return;
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;

      try {
        const response = await axios.get(`${AUTH_URL}/validate`);
        console.log('Token validation response:', response.data);

        if (response.data.success) {
          setToken(userToken);
        } else {
          handleSessionExpired('Token tidak valid');
        }
      } catch (error) {
        if (error.response?.status === 404) {
          console.error('Endpoint not found:', error.response.data);
          setToken(userToken);
        } else {
          console.error('Token validation error:', error.response?.data || error.message);
          handleSessionExpired(error.response?.data?.error || 'Gagal memvalidasi token');
        }
      }

    } catch (error) {
      console.error('Error checking token:', error);
      handleSessionExpired('Gagal memeriksa token');
    }
  };

  const handleSessionExpired = (message) => {
    console.log('Session expired:', message);
    
    AsyncStorage.multiRemove(['userToken', 'cartData'])
      .then(() => {
        Alert.alert(
          'Sesi Berakhir',
          message || 'Silakan login kembali untuk melanjutkan',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              },
            },
          ],
          { cancelable: false }
        );
      })
      .catch((error) => {
        console.error('Error removing data:', error);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      });
  };

  const handleConfirmOrder = async () => {
    if (!validateOrder()) return;
    setIsLoading(true);

    try {
      const currentToken = await AsyncStorage.getItem('userToken');
      console.log('Token for order:', currentToken);
      console.log('Cart Items:', cartItems); // Debug cartItems

      if (!currentToken) {
        handleSessionExpired('Token tidak ditemukan');
        return;
      }

      // Validate cart items first
      if (!cartItems || cartItems.length === 0) {
        Alert.alert('Error', 'Keranjang belanja kosong');
        setIsLoading(false);
        return;
      }

      // Prepare order data
      const orderData = {
        items: cartItems.map(service => ({
          service: service.service,
          items: service.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price || 0
          })),
          totalPrice: service.totalPrice
        })),
        totalAmount,
        deliveryFee,
        subtotal,
        deliveryMethod,
        deliveryAddress: deliveryMethod === 'pickup' ? address : '',
        paymentMethod: selectedPayment,
        notes: note || ''
      };

      console.log('Sending order data:', JSON.stringify(orderData, null, 2)); // Pretty print order data

      const response = await axios.post(
        `${ORDER_URL}/create`,
        orderData,
        {
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Order response:', response.data);

      if (response.data.success) {
        // Clear cart data
        await AsyncStorage.removeItem('cartData');
        
        // Navigate to success screen with order details
        navigation.replace('OrderSuccess', {
          orderNumber: response.data.order.orderNumber,
          totalAmount: response.data.order.totalAmount,
          deliveryMethod: response.data.order.deliveryMethod,
          estimatedDoneDate: response.data.order.estimatedDoneDate,
          items: response.data.order.items
        });
      } else {
        throw new Error(response.data.error || 'Gagal membuat pesanan');
      }

    } catch (error) {
      console.error('Error creating order:', error.response?.data || error);
      
      const errorMessage = error.response?.data?.error || 
                         error.message || 
                         'Terjadi kesalahan saat memproses pesanan';
      
      Alert.alert(
        'Error',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const validateOrder = () => {
    if (!cartItems || cartItems.length === 0) {
      Alert.alert('Error', 'Keranjang belanja kosong');
      return false;
    }

    if (!deliveryMethod) {
      Alert.alert('Error', 'Silakan pilih metode pengiriman');
      return false;
    }
    
    if (!selectedPayment) {
      Alert.alert('Error', 'Silakan pilih metode pembayaran');
      return false;
    }
    
    if (deliveryMethod === 'pickup' && !address.trim()) {
      Alert.alert('Error', 'Silakan masukkan alamat pengambilan');
      return false;
    }

    return true;
  };

  // Render payment method item
  const renderPaymentMethod = (method) => (
    <TouchableOpacity
      key={method.id}
      style={[
        styles.paymentMethod,
        selectedPayment === method.id && styles.selectedPayment,
      ]}
      onPress={() => setSelectedPayment(method.id)}
    >
      <View style={[styles.paymentMethodIconContainer]}>
        {method.iconType === 'material' ? (
          <Icon name={method.icon} size={24} color="#0391C4" />
        ) : (
          <Image 
            source={method.icon}
            style={styles.danaIcon}
            resizeMode="contain"
          />
        )}
      </View>
      <View style={styles.paymentMethodContent}>
        <Text style={styles.methodTitle}>{method.name}</Text>
        <Text style={styles.methodDescription}>{method.description}</Text>
      </View>
      <View style={styles.radioButton}>
        {selectedPayment === method.id && (
          <View style={styles.radioButtonSelected} />
        )}
      </View>
    </TouchableOpacity>
  );

  // Render service items
  const renderServiceItems = (service) => (
    <View key={service._id} style={styles.orderItem}>
      <Icon name="local-laundry-service" size={24} color="#0391C4" />
      <View style={styles.orderItemContent}>
        <Text style={styles.orderItemTitle}>{service.service}</Text>
        <Text style={styles.orderItemSubtitle}>
          {service.items.reduce((sum, item) => sum + item.quantity, 0)} items • 2-3 hari kerja
        </Text>
        <View style={styles.itemsList}>
          {service.items.map((item, index) => (
            <Text key={index} style={styles.itemDetail}>
              {item.name} ({item.quantity}x)
            </Text>
          ))}
        </View>
      </View>
      <Text style={styles.orderItemPrice}>
        Rp {service.totalPrice.toLocaleString()}
      </Text>
    </View>
  );

  // Add useEffect to check cart items on mount
  useEffect(() => {
    const checkCartItems = async () => {
      try {
        const savedCartData = await AsyncStorage.getItem('cartData');
        if (savedCartData) {
          const parsedCartData = JSON.parse(savedCartData);
          if (!parsedCartData || parsedCartData.length === 0) {
            Alert.alert(
              'Keranjang Kosong',
              'Silakan tambahkan item ke keranjang terlebih dahulu',
              [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack()
                }
              ]
            );
          }
        }
      } catch (error) {
        console.error('Error checking cart data:', error);
      }
    };

    checkCartItems();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Konfirmasi Pesanan</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Summary Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ringkasan Pesanan</Text>
          {cartItems.map(renderServiceItems)}
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalAmount}>
              Rp {subtotal.toLocaleString()}
            </Text>
          </View>
          {deliveryMethod === 'pickup' && (
            <View style={styles.deliveryFeeContainer}>
              <Text style={styles.totalLabel}>Biaya Pengiriman</Text>
              <Text style={styles.totalAmount}>
                Rp {deliveryFee.toLocaleString()}
              </Text>
            </View>
          )}
          <View style={styles.grandTotalContainer}>
            <Text style={styles.grandTotalLabel}>Total Pembayaran</Text>
            <Text style={styles.grandTotalAmount}>
              Rp {totalAmount.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Delivery Method Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Metode Pengiriman</Text>
          {deliveryMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodOption,
                deliveryMethod === method.id && styles.selectedMethod,
              ]}
              onPress={() => setDeliveryMethod(method.id)}
            >
              <View style={styles.methodIconContainer}>
                <Icon name={method.icon} size={24} color="#0391C4" />
              </View>
              <View style={styles.methodContent}>
                <Text style={styles.methodTitle}>{method.name}</Text>
                <Text style={styles.methodDescription}>{method.description}</Text>
                {method.id === 'pickup' && (
                  <Text style={styles.deliveryFeeText}>Biaya pengiriman Rp 5.000</Text>
                )}
              </View>
              <View style={styles.radioButton}>
                {deliveryMethod === method.id && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Address Input Card (for pickup method) */}
        {deliveryMethod === 'pickup' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Alamat Pengambilan</Text>
            <View style={styles.addressInputContainer}>
              <Icon name="location-on" size={20} color="#666666" style={styles.addressIcon} />
              <TextInput
                style={styles.addressInput}
                placeholder="Masukkan alamat lengkap pengambilan"
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
            <Text style={styles.addressHelper}>
              Masukkan alamat lengkap termasuk nomor rumah/gedung, RT/RW, dan kode pos
            </Text>
          </View>
        )}

        {/* Additional Notes Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Catatan Tambahan</Text>
          <TextInput
            style={styles.input}
            placeholder="Tambahkan catatan khusus (opsional)"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Payment Methods Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Metode Pembayaran</Text>
          {paymentMethods.map(renderPaymentMethod)}
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomContainer}>
        <View style={styles.priceContainer}>
          <View>
            <Text style={styles.priceLabel}>Total Pembayaran</Text>
            {deliveryMethod === 'pickup' && (
              <Text style={styles.deliveryFeeInfo}>Termasuk biaya pengiriman</Text>
            )}
          </View>
          <Text style={styles.priceValue}>
            Rp {totalAmount.toLocaleString()}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!deliveryMethod || !selectedPayment || isLoading) && styles.disabledButton,
          ]}
          disabled={!deliveryMethod || !selectedPayment || isLoading}
          onPress={handleConfirmOrder}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="check-circle" size={24} color="#FFFFFF" style={styles.confirmButtonIcon} />
              <Text style={styles.confirmButtonText}>Konfirmasi Pesanan</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedMethod: {
    backgroundColor: '#E6F2FF',
    borderColor: '#0391C4',
  },
  methodIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodContent: {
    flex: 1,
    marginRight: 8,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 14,
    color: '#666666',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#333333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  bottomSpacing: {
    height: 100,
  },
  bottomContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666666',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0391C4',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0391C4',
    padding: 16,
    borderRadius: 12,
  },
  confirmButtonIcon: {
    marginRight: 8,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#B0E0FF',
  },
  // Existing styles for order items
  orderItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  orderItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  orderItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  orderItemSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  itemsList: {
    marginTop: 4,
  },
  itemDetail: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  orderItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0391C4',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalLabel: {
    fontSize: 14,
    color: '#666666',
  },
  totalAmount: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedPayment: {
    backgroundColor: '#E6F2FF',
    borderColor: '#0391C4',
  },
  paymentMethodIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  danaIcon: {
    width: 32,
    height: 32,
    margin: 6,
  },
  paymentMethodContent: {
    flex: 1,
    justifyContent: 'center',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#0391C4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0391C4',
  },
  addressInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 12,
  },
  addressIcon: {
    marginRight: 12,
    marginTop: 4,
  },
  addressInput: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 0,
  },
  addressHelper: {
    fontSize: 12,
    color: '#666666',
    marginTop: 8,
    marginLeft: 4,
  },
  deliveryFeeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  grandTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    borderTopStyle: 'dashed',
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  grandTotalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0391C4',
  },
  deliveryFeeText: {
    fontSize: 12,
    color: '#0391C4',
    marginTop: 4,
  },
  deliveryFeeInfo: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
});

export default OrderConfirmationScreen;
