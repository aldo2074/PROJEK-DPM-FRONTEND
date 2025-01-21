import React, { useState } from 'react';
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
import MapView, { Marker } from 'react-native-maps';

const OrderConfirmationScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null); // Track selected location
  const [mapVisible, setMapVisible] = useState(false); // Control map visibility

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

  // Validate order details
  const validateOrder = () => {
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

  // Handle order confirmation
  const handleConfirmOrder = async () => {
    if (!validateOrder()) return;

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Navigate to success screen
      navigation.replace('OrderSuccess');
    } catch (error) {
      Alert.alert(
        'Error',
        'Terjadi kesalahan saat memproses pesanan. Silakan coba lagi.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
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

  const handleMapPress = (event) => {
    const { coordinate } = event.nativeEvent;
    setSelectedLocation(coordinate);
    setAddress(`Lat: ${coordinate.latitude}, Lng: ${coordinate.longitude}`);
    setMapVisible(false); // Close the map after selection
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Order Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ringkasan Pesanan</Text>
          <View style={styles.orderItem}>
            <Icon name="local-laundry-service" size={24} color="#0391C4" />
            <View style={styles.orderItemContent}>
              <Text style={styles.orderItemTitle}>Cuci & Setrika</Text>
              <Text style={styles.orderItemSubtitle}>3 items • 2-3 hari kerja</Text>
            </View>
            <Text style={styles.orderItemPrice}>Rp 50.000</Text>
          </View>
        </View>

        {/* Delivery Method */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Metode Pengiriman</Text>
          {deliveryMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.deliveryMethod,
                deliveryMethod === method.id && styles.selectedDelivery,
              ]}
              onPress={() => setDeliveryMethod(method.id)}
            >
              <Icon name={method.icon} size={24} color="#0391C4" />
              <View style={styles.deliveryMethodContent}>
                <Text style={styles.methodTitle}>{method.name}</Text>
                <Text style={styles.methodDescription}>{method.description}</Text>
              </View>
              <View style={styles.radioButton}>
                {deliveryMethod === method.id && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Address Input (for pickup method) */}
        {deliveryMethod === 'pickup' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Alamat Pengambilan</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan alamat lengkap"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={styles.mapButton}
              onPress={() => setMapVisible(true)}
            >
              <Text style={styles.mapButtonText}>Pilih Lokasi di Peta</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Map View */}
        {mapVisible && (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: -6.200000,
                longitude: 106.816666,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
              onPress={handleMapPress}
            >
              {selectedLocation && (
                <Marker coordinate={selectedLocation} />
              )}
            </MapView>
            <TouchableOpacity
              style={styles.closeMapButton}
              onPress={() => setMapVisible(false)}
            >
              <Text style={styles.closeMapButtonText}>Tutup Peta</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Additional Notes */}
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

        {/* Payment Methods */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Metode Pembayaran</Text>
          {paymentMethods.map(renderPaymentMethod)}
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomContainer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Total Pembayaran</Text>
          <Text style={styles.priceValue}>Rp 50.000</Text>
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
            <Text style={styles.confirmButtonText}>Konfirmasi Pesanan</Text>
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
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderItemContent: {
    flex: 1,
    marginLeft: 15,
  },
  orderItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  orderItemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  orderItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0391C4',
  },
  deliveryMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedDelivery: {
    backgroundColor: '#E6F2FF',
    borderColor: '#0391C4',
  },
  deliveryMethodContent: {
    flex: 1,
    marginLeft: 15,
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
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  methodDescription: {
    fontSize: 14,
    color: '#666',
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
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 15,
    fontSize: 14,
    color: '#333',
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  bottomContainer: {
    backgroundColor: '#fff',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    borderTopWidth: 1,
    borderTopColor: '#E6E6E6',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0391C4',
  },
  confirmButton: {
    backgroundColor: '#0391C4',
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#B0E0FF',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mapContainer: {
    height: 300,
    marginBottom: 20,
  },
  map: {
    flex: 1,
    borderRadius: 10,
  },
  mapButton: {
    backgroundColor: '#0391C4',
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  closeMapButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 20,
  },
  closeMapButtonText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default OrderConfirmationScreen;
