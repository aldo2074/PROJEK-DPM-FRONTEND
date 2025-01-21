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
  Platform,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CART_URL } from '../../../backend/config/config';

const { width } = Dimensions.get('window');

const CuciSetrikaScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  const clothingTypes = [
    { 
      id: 1, 
      name: 'Kaos', 
      price: 1000,
      description: 'Kaos lengan pendek/panjang',
      icon: require('../../../assets/icons/kaos-icon.png') 
    },
    { 
      id: 2, 
      name: 'Kemeja', 
      price: 1500,
      description: 'Kemeja formal/casual',
      icon: require('../../../assets/icons/kemeja-icon.png') 
    },
    { 
      id: 3, 
      name: 'Celana', 
      price: 1500,
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

  const handleAddToCart = async () => {
    const totalPrice = calculateTotalPrice();
    if (totalPrice < 5000) {
      Alert.alert(
        'Pesanan Minimal',
        'Total pembayaran harus minimal Rp 5.000',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        navigation.navigate('Login');
        return;
      }

      const selectedItems = clothingTypes
        .filter(type => quantities[type.name] > 0)
        .map(type => ({
          name: type.name,
          quantity: quantities[type.name],
          price: type.price
        }));

      const cartData = {
        service: 'Cuci & Setrika',
        items: selectedItems,
        totalPrice: calculateTotalPrice()
      };

      await axios.post(`${CART_URL}/add`, cartData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

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

      setQuantities({
        'Kaos': 0,
        'Kemeja': 0,
        'Celana': 0
      });

    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Gagal menambahkan ke keranjang'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBackground}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cuci & Setrika</Text>
          <Text style={styles.headerSubtitle}>Layanan premium untuk pakaian Anda</Text>
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
              2-3 hari kerja dengan deterjen premium dan pewangi berkualitas
            </Text>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Pilih Jenis Pakaian</Text>
          
          {clothingTypes.map((type) => (
            <View key={type.id} style={styles.itemContainer}>
              <View style={styles.itemLeft}>
                <View style={styles.iconContainer}>
                  <Image source={type.icon} style={styles.itemIcon} />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{type.name}</Text>
                  <Text style={styles.itemDescription}>{type.description}</Text>
                  <Text style={styles.itemPrice}>Rp {type.price.toLocaleString()}/pcs</Text>
                </View>
              </View>
              
              <View style={styles.quantityContainer}>
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(type.name, -1)}
                >
                  <Icon name="remove" size={20} color="#0391C4" />
                </TouchableOpacity>
                
                <TextInput
                  style={styles.quantityInput}
                  value={quantities[type.name].toString()}
                  onChangeText={(value) => updateQuantity(type.name, value)}
                  keyboardType="number-pad"
                />
                
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(type.name, 1)}
                >
                  <Icon name="add" size={20} color="#0391C4" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Price Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Ringkasan Pesanan</Text>
          
          {clothingTypes.map((type) => (
            quantities[type.name] > 0 && (
              <View key={type.id} style={styles.summaryItem}>
                <Text style={styles.summaryText}>
                  {type.name} x {quantities[type.name]}
                </Text>
                <Text style={styles.summaryValue}>
                  Rp {(type.price * quantities[type.name]).toLocaleString()}
                </Text>
              </View>
            )
          ))}
          
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total</Text>
            <Text style={styles.totalPrice}>
              Rp {calculateTotalPrice().toLocaleString()}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtonsContainer}>
        <TouchableOpacity
          style={[
            styles.cartButton,
            !hasItems && styles.disabledButton
          ]}
          onPress={handleAddToCart}
          disabled={!hasItems || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#0391C4" />
          ) : (
            <>
              <Icon name="shopping-cart" size={24} color="#0391C4" />
              <Text style={styles.cartButtonText}>Tambah ke Keranjang</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <Toast />
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
  contentContainer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 180 : 160,
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
  itemContainer: {
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
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    backgroundColor: '#E6F2FF',
    borderRadius: 15,
    padding: 12,
    marginRight: 15,
  },
  itemIcon: {
    width: 35,
    height: 35,
    resizeMode: 'contain',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  itemPrice: {
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
  quantityInput: {
    width: 50,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  summaryContainer: {
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
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  totalText: {
    fontSize: 14,
    color: '#666',
  },
  totalPrice: {
    fontSize: 14,
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
  disabledButton: {
    backgroundColor: '#B0E0FF',
  },
});

export default CuciSetrikaScreen;