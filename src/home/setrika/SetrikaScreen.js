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

const SetrikaScreen = () => {
  const navigation = useNavigation();

  const clothingTypes = [
    { 
      id: 1, 
      name: 'Kaos', 
      price: 500,
      description: 'Kaos lengan pendek/panjang',
      icon: require('../../../assets/icons/kaos-icon.png') 
    },
    { 
      id: 2, 
      name: 'Kemeja', 
      price: 1000,
      description: 'Kemeja formal/casual',
      icon: require('../../../assets/icons/kemeja-icon.png') 
    },
    { 
      id: 3, 
      name: 'Celana', 
      price: 1000,
      description: 'Celana panjang/pendek',
      icon: require('../../../assets/icons/celana-icon.png') 
    }
  ];

  const [quantities, setQuantities] = useState({
    'Kaos': 0,
    'Kemeja': 0,
    'Celana': 0
  });

  const updateQuantity = (type, value) => {
    setQuantities(prev => {
      const newValue = typeof value === 'number' ? prev[type] + value : parseInt(value, 10) || 0;
      return {
        ...prev,
        [type]: Math.max(0, newValue),
      };
    });
  };

  const calculateTotalPrice = () => {
    return clothingTypes.reduce((total, type) => {
      return total + (type.price * quantities[type.name]);
    }, 0);
  };

  const calculateTotalItems = () => {
    return Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  };

  const hasItems = Object.values(quantities).some(qty => qty > 0);

  const handleOrder = () => {
    const totalPrice = calculateTotalPrice();
    if (totalPrice < 2500) {
      Alert.alert(
        'Pesanan Minimal',
        'Total pembayaran harus minimal Rp 2.500. Silakan pilih lebih banyak pakaian.',
        [{ text: 'OK' }]
      );
    } else {
      navigation.navigate('OrderConfirmation');
    }
  };

  const handleAddToCart = () => {
    const totalPrice = calculateTotalPrice();
    if (totalPrice < 2500) {
      Alert.alert(
        'Pesanan Minimal',
        'Total pembayaran harus minimal Rp 2.500. Silakan pilih lebih banyak pakaian.',
        [{ text: 'OK' }]
      );
      return;
    }

    const selectedItems = clothingTypes
      .filter(type => quantities[type.name] > 0)
      .map(type => ({
        name: type.name,
        quantity: quantities[type.name],
        price: type.price,
      }));

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
          <Text style={styles.headerTitle}>Setrika</Text>
          <Text style={styles.headerSubtitle}>Layanan setrika premium untuk pakaian Anda</Text>
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
              1-2 hari kerja dengan hasil setrika rapi dan profesional
            </Text>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Pilih Jenis Pakaian</Text>
          
          {clothingTypes.map((type) => (
            <View key={type.id} style={styles.clothingItemContainer}>
              <View style={styles.clothingItemLeft}>
                <View style={styles.clothingIconContainer}>
                  <Image source={type.icon} style={styles.clothingIcon} />
                </View>
                <View style={styles.clothingTextContainer}>
                  <Text style={styles.clothingName}>{type.name}</Text>
                  <Text style={styles.clothingDescription}>{type.description}</Text>
                  <Text style={styles.clothingPrice}>
                    Rp {type.price.toLocaleString()}/pcs
                  </Text>
                </View>
              </View>
              
              <View style={styles.quantityContainer}>
                <TouchableOpacity 
                  style={[ 
                    styles.quantityButton, 
                    quantities[type.name] === 0 && styles.quantityButtonDisabled 
                  ]}
                  onPress={() => updateQuantity(type.name, -1)}
                >
                  <Text style={[ 
                    styles.quantityButtonText, 
                    quantities[type.name] === 0 && styles.quantityButtonTextDisabled 
                  ]}>-</Text>
                </TouchableOpacity>
                
                <TextInput 
                  style={styles.quantityInput}
                  value={quantities[type.name].toString()}
                  onChangeText={(text) => updateQuantity(type.name, text)}
                  keyboardType="numeric"
                />
                
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(type.name, 1)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {hasItems && (
          <View style={styles.totalPriceContainer}>
            <Text style={styles.summaryTitle}>Ringkasan Pesanan</Text>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryText}>Total Item:</Text>
              <Text style={styles.summaryValue}>{calculateTotalItems()} pcs</Text>
            </View>
            
            <View style={styles.totalPriceBreakdown}>
              {clothingTypes.map((type) => {
                const itemTotal = type.price * quantities[type.name];
                if (itemTotal > 0) {
                  return (
                    <View key={type.id} style={styles.priceBreakdownItem}>
                      <Text style={styles.priceBreakdownText}>
                        {type.name} ({quantities[type.name]} pcs)
                      </Text>
                      <Text style={styles.priceBreakdownValue}>
                        Rp {itemTotal.toLocaleString()}
                      </Text>
                    </View>
                  );
                }
                return null;
              })}
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

      {hasItems && (
        <View style={styles.bottomButtonsContainer}>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={handleAddToCart}
          >
            <Icon name="shopping-cart" size={24} color="#0391C4" />
            <Text style={styles.cartButtonText}>Masukkan Keranjang</Text>
          </TouchableOpacity>
        </View>
      )}

      {!hasItems && (
        <View style={styles.bottomButtonsContainer}>
          <TouchableOpacity 
            style={[styles.singleButton, styles.disabledButton]} 
            disabled={true}
          >
            <Text style={styles.orderButtonText}>Pilih Pakaian</Text>
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
  clothingItemContainer: {
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
  clothingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  clothingIconContainer: {
    backgroundColor: '#E6F2FF',
    borderRadius: 15,
    padding: 12,
    marginRight: 15,
  },
  clothingIcon: {
    width: 35,
    height: 35,
    resizeMode: 'contain',
  },
  clothingTextContainer: {
    flex: 1,
  },
  clothingName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  clothingDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  clothingPrice: {
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

export default SetrikaScreen;