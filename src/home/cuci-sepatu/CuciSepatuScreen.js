import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  TextInput,
  Dimensions,
  SafeAreaView,
  Alert,
  Platform,
  ActivityIndicator,
  Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { CART_URL } from '../../../api';

const { width } = Dimensions.get('window');

const CuciSepatuScreen = ({ route }) => {
  const params = route?.params || {};
  
  const {
    editMode = false,
    serviceId = null,
    quantity: initialQuantity = 0
  } = params;

  const navigation = useNavigation();
  const [quantity, setQuantity] = useState(initialQuantity);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showExistingServiceModal, setShowExistingServiceModal] = useState(false);
  
  const PRICE_PER_PAIR = 35000;

  const calculateTotalPrice = () => {
    return quantity * PRICE_PER_PAIR;
  };

  const handleReset = () => {
    setQuantity(0);
    setHasChanges(false);
  };

  const handleSubmit = async () => {
    try {
      if (quantity === 0) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Pilih minimal 1 pasang sepatu',
          position: 'bottom'
        });
        return;
      }

      setIsLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Sesi anda telah berakhir',
          position: 'bottom'
        });
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
        return;
      }

      const totalPrice = quantity * PRICE_PER_PAIR;

      const cartData = {
        service: 'Cuci Sepatu',
        items: [{
          name: 'Deep Clean',
          quantity: parseInt(quantity),
          price: PRICE_PER_PAIR
        }],
        totalPrice: parseFloat(totalPrice),
        serviceId: params?.serviceId || null,
        isEdit: Boolean(editMode)
      };

      console.log('Sending cart data:', cartData);

      const response = await axios.post(CART_URL, cartData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Cart response:', response.data);

      if (response.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Berhasil',
          text2: editMode ? 'Layanan berhasil diperbarui' : 'Layanan berhasil ditambahkan',
          position: 'bottom'
        });

        handleReset();
        navigation.navigate('Cart', { refresh: true });
      }
    } catch (error) {
      if (error.response?.data) {
        console.log('Server response:', error.response.data);
      } else {
        console.log('Error:', error.message);
      }
      
      if (error.response?.status === 401) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Sesi anda telah berakhir',
          position: 'bottom'
        });
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      } else if (error.response?.data?.existingService) {
        setShowExistingServiceModal(true);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.response?.data?.error || 'Gagal menambahkan ke keranjang',
          position: 'bottom'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBackground}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cuci Sepatu</Text>
          <Text style={styles.headerSubtitle}>Layanan cuci sepatu profesional</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoCard}>
          <Icon 
            name="access-time" 
            size={24} 
            color="#0391C4"
            style={styles.infoIcon}
          />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Estimasi Pengerjaan</Text>
            <Text style={styles.infoText}>
              3-4 hari kerja dengan treatment khusus dan bahan pembersih premium
            </Text>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Layanan Cuci Sepatu</Text>
          
          <View style={styles.shoeItemContainer}>
            <View style={styles.shoeItemLeft}>
              <View style={styles.shoeIconContainer}>
                <Image 
                  source={require('../../../assets/icons/shoes-icon.png')} 
                  style={styles.shoeIcon} 
                />
              </View>
              <View style={styles.shoeTextContainer}>
                <Text style={styles.shoeName}>Deep Clean</Text>
                <Text style={styles.shoeDescription}>
                  Cuci sepatu menyeluruh dengan treatment premium
                </Text>
                <Text style={styles.shoePrice}>
                  Rp {PRICE_PER_PAIR.toLocaleString()}/pasang
                </Text>
              </View>
            </View>
            
            <View style={styles.quantityContainer}>
              <TouchableOpacity 
                style={[
                  styles.quantityButton, 
                  quantity === 0 && styles.quantityButtonDisabled
                ]}
                onPress={() => setQuantity(Math.max(0, quantity - 1))}
              >
                <Text style={[
                  styles.quantityButtonText,
                  quantity === 0 && styles.quantityButtonTextDisabled
                ]}>-</Text>
              </TouchableOpacity>
              
              <TextInput 
                style={styles.quantityInput}
                value={quantity.toString()}
                onChangeText={(text) => {
                  const newQuantity = parseInt(text) || 0;
                  setQuantity(Math.max(0, newQuantity));
                }}
                keyboardType="numeric"
              />
              
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {quantity > 0 && (
          <View style={styles.totalPriceContainer}>
            <Text style={styles.summaryTitle}>Ringkasan Pesanan</Text>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryText}>Total Item:</Text>
              <Text style={styles.summaryValue}>{quantity} pasang</Text>
            </View>
            
            <View style={styles.totalPriceBreakdown}>
              <View style={styles.priceBreakdownItem}>
                <Text style={styles.priceBreakdownText}>
                  Deep Clean ({quantity} pasang)
                </Text>
                <Text style={styles.priceBreakdownValue}>
                  Rp {calculateTotalPrice().toLocaleString()}
                </Text>
              </View>
              <View style={styles.totalPriceDivider} />
              <View style={styles.priceBreakdownItem}>
                <Text style={styles.totalPriceLabel}>Total Pembayaran</Text>
                <Text style={styles.totalPriceValue}>
                  Rp {calculateTotalPrice().toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {quantity > 0 ? (
        <View style={styles.bottomButtonsContainer}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleReset}
            disabled={isLoading}
          >
            <Icon name="refresh" size={20} color="#FF3B30" />
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.cartButton}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Icon name="shopping-cart" size={24} color="#0391C4" />
            <Text style={styles.cartButtonText}>
              {editMode ? 'Simpan Perubahan' : 'Masukkan Keranjang'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.bottomButtonsContainer}>
          <TouchableOpacity 
            style={[styles.singleButton, styles.disabledButton]}
            disabled={true}
          >
            <Text style={styles.orderButtonText}>Pilih Jumlah Sepatu</Text>
          </TouchableOpacity>
        </View>
      )}

      {showExistingServiceModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Icon name="error-outline" size={50} color="#FF3B30" />
            <Text style={styles.modalTitle}>Layanan Sudah Ada</Text>
            <Text style={styles.modalText}>
              Anda sudah memiliki layanan ini di keranjang. Silakan selesaikan atau hapus layanan yang ada terlebih dahulu.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowExistingServiceModal(false);
                navigation.navigate('Cart');
              }}
            >
              <Text style={styles.modalButtonText}>Lihat Keranjang</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalSecondaryButton}
              onPress={() => setShowExistingServiceModal(false)}
            >
              <Text style={styles.modalSecondaryButtonText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  headerBackground: {
    backgroundColor: '#0391C4',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    paddingBottom: 20,
    shadowColor: '#0391C4',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
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
  contentContainer: {
    padding: 20,
    paddingBottom: 180,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E6F2FF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0391C4',
    marginBottom: 4,
  },
  infoText: {
    color: '#666',
    fontSize: 13,
    lineHeight: 18,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  shoeItemContainer: {
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
  shoeItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  shoeIconContainer: {
    backgroundColor: '#E6F2FF',
    borderRadius: 15,
    padding: 12,
    marginRight: 15,
  },
  shoeIcon: {
    width: 35,
    height: 35,
    resizeMode: 'contain',
  },
  shoeTextContainer: {
    flex: 1,
  },
  shoeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  shoeDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  shoePrice: {
    fontSize: 15,
    color: '#0391C4',
    fontWeight: '600',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  quantityButton: {
    backgroundColor: '#E6F2FF',
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: '#F5F5F5',
  },
  quantityButtonText: {
    fontSize: 18,
    color: '#0391C4',
  },
  quantityButtonTextDisabled: {
    color: '#D0D0D0',
  },
  quantityInput: {
    width: 50,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalPriceContainer: {
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
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  summaryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0391C4',
  },
  totalPriceBreakdown: {
    marginTop: 10,
  },
  priceBreakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceBreakdownText: {
    fontSize: 14,
    color: '#666',
  },
  priceBreakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0391C4',
  },
  totalPriceDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 10,
  },
  totalPriceLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalPriceValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0391C4',
  },
  bottomButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 15,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    flexDirection: 'row',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE5E5',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  resetButtonText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  cartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6F2FF',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#0391C4',
  },
  cartButtonText: {
    color: '#0391C4',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  singleButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#B0E0FF',
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: '#0391C4',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalSecondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalSecondaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CuciSepatuScreen;