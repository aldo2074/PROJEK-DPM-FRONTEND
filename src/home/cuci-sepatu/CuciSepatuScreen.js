import React, { useState } from 'react';
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
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const CuciSepatuScreen = () => {
  const navigation = useNavigation();
  const [quantity, setQuantity] = useState(0);
  
  const PRICE_PER_PAIR = 15000;

  const calculateTotalPrice = () => {
    return quantity * PRICE_PER_PAIR;
  };

  const handleOrder = () => {
    if (quantity === 0) {
      Alert.alert(
        'Pesanan Minimal',
        'Silakan pilih minimal 1 pasang sepatu',
        [{ text: 'OK' }]
      );
    } else {
      navigation.navigate('OrderConfirmation');
    }
  };

  const handleAddToCart = () => {
    if (quantity === 0) {
      Alert.alert(
        'Pesanan Minimal',
        'Silakan pilih minimal 1 pasang sepatu',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Berhasil',
      'Pesanan berhasil ditambahkan ke keranjang',
      [
        {
          text: 'Lihat Keranjang',
          onPress: () => navigation.navigate('Cart')
        },
        {
          text: 'Lanjut Belanja',
          style: 'cancel'
        }
      ]
    );
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
            style={styles.cartButton}
            onPress={handleAddToCart}
          >
            <Icon name="shopping-cart" size={24} color="#0391C4" />
            <Text style={styles.cartButtonText}>Masukkan Keranjang</Text>
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
    flexDirection: 'column',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  orderButton: {
    backgroundColor: '#0391C4',
    borderRadius: 12,
    paddingVertical: 14,
    width: '100%',
  },
  orderButtonContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderButtonTextContainer: {
    alignItems: 'center',
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  orderButtonPrice: {
    color: '#E6F2FF',
    fontSize: 14,
  },
  cartButton: {
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
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#B0E0FF',
  },
});

export default CuciSepatuScreen;