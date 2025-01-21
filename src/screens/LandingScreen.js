import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  ImageBackground, 
  StatusBar,
  Animated,
  Dimensions,
  Easing 
} from 'react-native';
import LaundryLogo from '../../assets/icons/laundry-logo.png';
import BackgroundImage from '../../assets/background.jpg';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const LandingScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();

    const floatLogo = () => {
      Animated.sequence([
        Animated.timing(logoAnim, {
          toValue: -10,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(logoAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        })
      ]).start(() => floatLogo());
    };

    floatLogo();
  }, []);

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground 
        source={BackgroundImage} 
        style={styles.container}
        imageStyle={styles.backgroundImage}
      >
        <View style={styles.overlay}>
          <Animated.View 
            style={[
              styles.mainBox,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Animated.View 
              style={[
                styles.logoContainer,
                {
                  transform: [{ translateY: logoAnim }]
                }
              ]}
            >
              <Image 
                source={LaundryLogo} 
                style={styles.logo} 
                resizeMode="contain"
              />
            </Animated.View>
            
            <Animated.View 
              style={[styles.textContainer, { opacity: fadeAnim }]}
            >
              <Text style={styles.title}>Laundrify</Text>
              <Text style={styles.subtitle}>Cepat • Bersih • Rapi</Text>
            </Animated.View>
            
            <Animated.Text 
              style={[styles.description, { opacity: fadeAnim }]}
            >
              Layanan laundry profesional dengan pickup & delivery
            </Animated.Text>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>Mulai</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ImageBackground>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    opacity: 0.85,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(3, 145, 196, 0.2)',
    paddingHorizontal: 15,
  },
  mainBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 20,
    padding: 25,
    paddingVertical: 35,
    width: '80%',
    maxWidth: 320,
    alignItems: 'center',
    shadowColor: '#0391C4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 12,
  },
  logoContainer: {
    backgroundColor: 'rgba(3, 145, 196, 0.08)',
    borderRadius: 15,
    padding: 18,
    marginBottom: 25,
  },
  logo: {
    width: windowWidth * 0.4,
    height: windowHeight * 0.13,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontFamily: 'MavenPro-Bold',
    color: '#0391C4',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'MavenPro-SemiBold',
    color: '#444',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'MavenPro-Regular',
    paddingHorizontal: 15,
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: '#0391C4',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: '75%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 17,
    fontFamily: 'MavenPro-Bold',
    letterSpacing: 0.5,
  },
});

LandingScreen.navigationOptions = {
  headerShown: false,
  gestureEnabled: false,
};

export default LandingScreen;
