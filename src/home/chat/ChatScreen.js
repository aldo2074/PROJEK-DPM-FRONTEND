import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Linking
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BOT_RESPONSES = {
  GREETING: [
    "👋 Halo! Selamat datang di Laundry App. Ada yang bisa saya bantu?",
    "✨ Hai! Saya siap membantu Anda dengan layanan laundry kami"
  ],
  SERVICES: [
    "🧺 Layanan yang tersedia:\n\n1. Cuci & Setrika\n2. Setrika\n3. Cuci Sepatu\n4. Cuci Alas Kasur"
  ],
  PRICES: {
    "cuci setrika": "💰 Harga Cuci & Setrika:\n• Kaos: Rp 7.000/pc\n• Kemeja: Rp 8.000/pc\n• Celana: Rp 8.000/pc",
    "setrika": "💰 Harga Setrika:\n• Kaos: Rp 5.000/pc\n• Kemeja: Rp 6.000/pc\n• Celana: Rp 6.000/pc", 
    "cuci sepatu": "💰 Harga cuci sepatu: Rp 35.000/pasang",
    "alas kasur": "💰 Harga cuci alas kasur: Rp 50.000/piece"
  },
  PROCESS: {
    "cuci setrika": "⏱️ Proses cuci & setrika:\n• Regular: 2-3 hari kerja\n• Express: 1 hari kerja (tambahan 50%)",
    "setrika": "⏱️ Proses setrika:\n• Regular: 1-2 hari kerja\n• Express: 1 hari kerja (tambahan 50%)",
    "cuci sepatu": "⏱️ Proses cuci sepatu:\n• Regular: 2-3 hari kerja\n• Express: 1 hari kerja (tambahan 50%)",
    "alas kasur": "⏱️ Proses cuci alas kasur:\n• Regular: 3-4 hari kerja\n• Express: 2 hari kerja (tambahan 50%)"
  },
  DEFAULT: "❓ Maaf, saya tidak mengerti.\n\n💡 Silakan gunakan kata kunci berikut:\n\n1️⃣ 'layanan' - untuk melihat layanan\n2️⃣ 'harga' - untuk informasi harga\n3️⃣ 'proses' - untuk waktu pengerjaan\n\n📱 Atau hubungi CS kami di:\nWhatsApp: 081212341234"
};

const priceList = {
  'Cuci & Setrika': {
    'Kaos': 1000,
    'Kemeja': 1500,
    'Celana': 1500
  },
  'Setrika': {
    'Kaos': 500,
    'Kemeja': 1000,
    'Celana': 1000
  },
  'Alas Kasur': {
    'Sprei': 7000,
    'Sarung Bantal': 3000
  },
  'Cuci Sepatu': {
    'Sepatu': 35000
  }
};

const getBotResponse = (message) => {
  const lowercaseMsg = message.toLowerCase();
  
  if (lowercaseMsg.includes('halo') || lowercaseMsg.includes('hi')) {
    return BOT_RESPONSES.GREETING[Math.floor(Math.random() * BOT_RESPONSES.GREETING.length)];
  }
  
  if (lowercaseMsg.includes('layanan') || lowercaseMsg.includes('jasa')) {
    return BOT_RESPONSES.SERVICES[0];
  }

  if (lowercaseMsg.includes('harga')) {
    if (lowercaseMsg.includes('cuci setrika')) {
      return BOT_RESPONSES.PRICES["cuci setrika"];
    }
    if (lowercaseMsg.includes('cuci sepatu')) {
      return BOT_RESPONSES.PRICES["cuci sepatu"];
    }
    if (lowercaseMsg.includes('alas kasur')) {
      return BOT_RESPONSES.PRICES["alas kasur"];
    }
    return "Silakan sebutkan layanan spesifik yang ingin Anda ketahui harganya.";
  }

  if (lowercaseMsg.includes('proses') || lowercaseMsg.includes('waktu')) {
    if (lowercaseMsg.includes('cuci setrika')) {
      return BOT_RESPONSES.PROCESS["cuci setrika"];
    }
    if (lowercaseMsg.includes('cuci sepatu')) {
      return BOT_RESPONSES.PROCESS["cuci sepatu"];
    }
    if (lowercaseMsg.includes('alas kasur')) {
      return BOT_RESPONSES.PROCESS["alas kasur"];
    }
    return "Silakan sebutkan layanan spesifik yang ingin Anda ketahui prosesnya.";
  }

  return BOT_RESPONSES.DEFAULT;
};

const ChatScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [socket, setSocket] = useState(null);
  const [userId, setUserId] = useState(null);
  const scrollViewRef = useRef();

  const services = [
    {
      name: 'Cuci & Setrika',
      items: [
        { name: 'Kaos', price: 7000 },
        { name: 'Kemeja', price: 8000 },
        { name: 'Celana', price: 8000 }
      ],
      time: '2-3 hari kerja'
    },
    {
      name: 'Setrika',
      items: [
        { name: 'Kaos', price: 5000 },
        { name: 'Kemeja', price: 6000 },
        { name: 'Celana', price: 6000 }
      ],
      time: '1-2 hari kerja'
    },
    {
      name: 'Alas Kasur',
      items: [
        { name: 'Sprei', price: 20000 },
        { name: 'Bed Cover Single', price: 25000 },
        { name: 'Bed Cover Double', price: 30000 }
      ],
      time: '2-3 hari kerja'
    },
    {
      name: 'Cuci Sepatu',
      items: [
        { name: 'Sepatu', price: 35000 }
      ],
      time: '2-3 hari kerja'
    }
  ];

  const generateResponse = (message) => {
    const lowercaseMsg = message.toLowerCase().trim();
    
    // Single word matching arrays
    const greetings = ['halo', 'hi', 'hey', 'hai', 'hello', 'pagi', 'siang', 'sore', 'malam'];
    const serviceKeywords = ['layanan', 'jasa', 'service', 'laundry', 'cuci', 'setrika', 'sepatu', 'kasur'];
    const priceKeywords = ['harga', 'biaya', 'tarif', 'ongkos', 'bayar', 'berapa'];
    const timeKeywords = ['proses', 'lama', 'durasi', 'waktu', 'kapan', 'selesai', 'jadi', 'estimasi'];
    
    // Split message into words for individual word matching
    const words = lowercaseMsg.split(' ');
    
    // Check each word against keyword arrays
    for (const word of words) {
      // Greeting check
      if (greetings.includes(word)) {
        return BOT_RESPONSES.GREETING[Math.floor(Math.random() * BOT_RESPONSES.GREETING.length)];
      }
      
      // Service check
      if (serviceKeywords.includes(word)) {
        if (lowercaseMsg.includes('cuci') && lowercaseMsg.includes('setrika')) {
          return BOT_RESPONSES.PRICES["cuci setrika"];
        }
        if (word === 'sepatu' || lowercaseMsg.includes('sepatu')) {
          return BOT_RESPONSES.PRICES["cuci sepatu"];
        }
        if (word === 'kasur' || lowercaseMsg.includes('kasur')) {
          return BOT_RESPONSES.PRICES["alas kasur"];
        }
        if (word === 'setrika') {
          return BOT_RESPONSES.PRICES["setrika"];
        }
        return BOT_RESPONSES.SERVICES[0];
      }
      
      // Price check
      if (priceKeywords.includes(word)) {
        if (lowercaseMsg.includes('cuci') && lowercaseMsg.includes('setrika')) {
          return BOT_RESPONSES.PRICES["cuci setrika"];
        }
        if (lowercaseMsg.includes('sepatu')) {
          return BOT_RESPONSES.PRICES["cuci sepatu"];
        }
        if (lowercaseMsg.includes('kasur')) {
          return BOT_RESPONSES.PRICES["alas kasur"];
        }
        if (lowercaseMsg.includes('setrika')) {
          return BOT_RESPONSES.PRICES["setrika"];
        }
        return "Silakan sebutkan layanan spesifik yang ingin Anda ketahui harganya:\n\n1. Cuci & Setrika\n2. Setrika saja\n3. Cuci Sepatu\n4. Cuci Alas Kasur\n\nAtau hubungi CS kami di WhatsApp: 081212341234";
      }
      
      // Time/Process check
      if (timeKeywords.includes(word)) {
        if (lowercaseMsg.includes('cuci') && lowercaseMsg.includes('setrika')) {
          return BOT_RESPONSES.PROCESS["cuci setrika"];
        }
        if (lowercaseMsg.includes('sepatu')) {
          return BOT_RESPONSES.PROCESS["cuci sepatu"];
        }
        if (lowercaseMsg.includes('kasur')) {
          return BOT_RESPONSES.PROCESS["alas kasur"];
        }
        if (lowercaseMsg.includes('setrika')) {
          return BOT_RESPONSES.PROCESS["setrika"];
        }
        return "Silakan sebutkan layanan spesifik yang ingin Anda ketahui waktu prosesnya:\n\n1. Cuci & Setrika\n2. Setrika saja\n3. Cuci Sepatu\n4. Cuci Alas Kasur\n\nAtau hubungi CS kami di WhatsApp: 081212341234";
      }
    }

    // Additional single-word service checks
    if (lowercaseMsg === 'cuci') {
      return "Kami menyediakan layanan:\n1. Cuci & Setrika\n2. Cuci Sepatu\n3. Cuci Alas Kasur\n\nSilakan tanyakan detail harga atau proses untuk layanan spesifik.";
    }
    
    if (lowercaseMsg === 'setrika') {
      return BOT_RESPONSES.PRICES["setrika"];
    }
    
    if (lowercaseMsg === 'sepatu') {
      return BOT_RESPONSES.PRICES["cuci sepatu"];
    }
    
    if (lowercaseMsg === 'kasur') {
      return BOT_RESPONSES.PRICES["alas kasur"];
    }

    // Default response if no keywords match
    return "❓ Maaf, saya tidak mengerti.\n\n💡 Silakan gunakan kata kunci berikut:\n\n1️⃣ 'layanan' - untuk melihat layanan\n2️⃣ 'harga' - untuk informasi harga\n3️⃣ 'proses' - untuk waktu pengerjaan\n4️⃣ Atau ketik langsung:\n   • cuci\n   • setrika\n   • sepatu\n   • kasur\n\n📱 Butuh bantuan? Hubungi CS kami:\nWhatsApp: 081212341234";
  };

  const handleSend = () => {
    if (inputText.trim() === '') return;

    const newMessages = [
      ...messages,
      { id: Date.now().toString(), text: inputText, type: 'user' },
      { id: (Date.now() + 1).toString(), text: generateResponse(inputText), type: 'bot' }
    ];
    
    setMessages(newMessages);
    setInputText('');

    // Handle price inquiries
    const lowerMessage = inputText.toLowerCase();
    if (lowerMessage.includes('harga') || lowerMessage.includes('tarif')) {
      let priceResponse = 'Berikut daftar harga layanan kami:\n\n';
      
      Object.entries(priceList).forEach(([service, items]) => {
        priceResponse += `${service}:\n`;
        Object.entries(items).forEach(([item, price]) => {
          priceResponse += `${item}: Rp ${price.toLocaleString()}\n`;
        });
        priceResponse += '\n';
      });

      const botResponse = {
        id: Date.now() + 1,
        text: priceResponse,
        type: 'bot',
        timestamp: new Date().toISOString()
      };

      setTimeout(() => {
        setMessages(prevMessages => [...prevMessages, botResponse]);
      }, 1000);
    }
  };

  useEffect(() => {
    const initializeSocket = async () => {
      const storedUserId = await AsyncStorage.getItem('userId');
      setUserId(storedUserId);

      const newSocket = io('http://172.20.10.3:3000');
      setSocket(newSocket);

      newSocket.on('message', (message) => {
        setMessages(prevMessages => [...prevMessages, message]);
      });

      return () => newSocket.close();
    };

    initializeSocket();
  }, []);

  const renderSuggestions = () => (
    <View style={styles.suggestionsContainer}>
      <View style={styles.suggestionsRow}>
        <TouchableOpacity 
          style={styles.suggestionButton}
          onPress={() => setInputText('Apa saja layanan yang tersedia?')}
        >
          <MaterialCommunityIcons name="washing-machine" size={24} color="#0391C4" />
          <Text style={styles.suggestionText}>Layanan</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.suggestionButton}
          onPress={() => setInputText('Berapa harga layanannya?')}
        >
          <MaterialCommunityIcons name="cash" size={24} color="#0391C4" />
          <Text style={styles.suggestionText}>Harga</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.suggestionsRow, { justifyContent: 'center' }]}>
        <TouchableOpacity 
          style={[styles.suggestionButton, { width: '48%' }]}
          onPress={() => setInputText('Berapa lama prosesnya?')}
        >
          <MaterialCommunityIcons name="clock-outline" size={24} color="#0391C4" />
          <Text style={styles.suggestionText}>Waktu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const handleWhatsAppPress = () => {
    const phoneNumber = '081212341234';
    const message = 'Halo, saya ingin bertanya tentang layanan laundry';
    const url = `whatsapp://send?phone=62${phoneNumber.slice(1)}&text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          throw new Error('WhatsApp not installed');
        }
      })
      .catch(err => {
        console.error('Error opening WhatsApp:', err);
        // Fallback to normal phone call
        Linking.openURL(`tel:${phoneNumber}`);
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="#0391C4" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.headerBackground}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Chat</Text>
            <Text style={styles.headerSubtitle}>Tanya tentang layanan kami</Text>
          </View>
        </View>
      </View>

      <View style={styles.mainContent}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
        >
          {renderSuggestions()}
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageWrapper,
                message.type === 'user' ? styles.userMessage : styles.botMessage
              ]}
            >
              {message.type === 'bot' && (
                <MaterialCommunityIcons name="robot" size={24} color="#0391C4" style={styles.botIcon} />
              )}
              <View
                style={[
                  styles.messageBubble,
                  message.type === 'user' ? styles.userBubble : styles.botBubble
                ]}
              >
                <Text style={[
                  styles.messageText,
                  message.type === 'user' ? styles.userMessageText : styles.botMessageText
                ]}>
                  {message.text}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ketik pesan Anda di sini..."
            placeholderTextColor="#666"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Icon name="send" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {[
          { id: 'home', icon: 'home', screen: 'Home', active: false },
          { id: 'order', icon: 'receipt', screen: 'Order', active: false },
          { id: 'chat', icon: 'chat', screen: 'Chat', active: true },
          { id: 'profile', icon: 'person', screen: 'Profile', active: false }
        ].map((nav) => (
          <TouchableOpacity
            key={nav.id}
            style={[styles.navItem, nav.active ? styles.activeNavItem : null]}
            onPress={() => navigation.navigate(nav.screen)}
          >
            <Icon
              name={nav.icon}
              size={25}
              style={[styles.navIcon, nav.active ? styles.activeNavIcon : null]}
            />
          </TouchableOpacity>
        ))}
      </View>
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
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight + 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  header: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  mainContent: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  suggestionsContainer: {
    padding: 16,
    backgroundColor: 'rgba(3, 145, 196, 0.08)',
    borderRadius: 20,
    margin: 16,
    marginTop: 8,
  },
  suggestionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  suggestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    width: '48%',
    justifyContent: 'center',
  },
  suggestionText: {
    marginLeft: 10,
    color: '#0391C4',
    fontSize: 15,
    fontWeight: '600',
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  botMessage: {
    justifyContent: 'flex-start',
  },
  botIcon: {
    marginRight: 8,
    marginTop: 4,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 16,
    borderRadius: 20,
    flexDirection: 'column',
  },
  userBubble: {
    backgroundColor: '#0391C4',
    borderBottomRightRadius: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  botBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 24,
    letterSpacing: 0.3,
  },
  userMessageText: {
    color: '#FFFFFF',
    textAlign: 'left',
  },
  botMessageText: {
    color: '#333333',
    textAlign: 'left',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 12,
    fontSize: 16,
    maxHeight: 100,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sendButton: {
    width: 48,
    height: 48,
    backgroundColor: '#0391C4',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  sendButtonDisabled: {
    backgroundColor: '#CCE4FF',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E6E6E6',
    elevation: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    paddingBottom: Platform.OS === 'ios' ? 25 : 12,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 20,
    minWidth: 60,
  },
  activeNavItem: {
    backgroundColor: '#E6F2FF',
  },
  navIcon: {
    color: '#999999',
  },
  activeNavIcon: {
    color: '#0391C4',
  },
});

export default ChatScreen;