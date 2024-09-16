import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';

const SplashScreen = ({ navigation }) => {
  const fadeAnimR = useRef(new Animated.Value(0)).current;
  const fadeAnimO = useRef(new Animated.Value(0)).current;
  const fadeAnimS = useRef(new Animated.Value(0)).current;
  const fadeAnimE = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequentially animate each letter
    Animated.sequence([
      Animated.timing(fadeAnimR, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnimO, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnimS, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnimE, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate to Login after 4 seconds
    setTimeout(() => {
      navigation.replace('Login');  // Redirect to login screen
    }, 4000);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.letterContainer}>
        <Animated.Text style={[styles.letter, { opacity: fadeAnimR }]}>R</Animated.Text>
        <Animated.Text style={[styles.letter, { opacity: fadeAnimO }]}>O</Animated.Text>
        <Animated.Text style={[styles.letter, { opacity: fadeAnimS }]}>S</Animated.Text>
        <Animated.Text style={[styles.letter, { opacity: fadeAnimE }]}>E</Animated.Text>
      </View>
      <Image source={require('../../assets/rose.gif')} style={styles.logo} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  letter: {
    fontSize: 60,
    color: '#FFFFFF',  // White text
    marginHorizontal: 10,
  },
  logo: {
    width: 150, // Adjust based on your requirements
    height: 150,
    resizeMode: 'contain',
  },
});

export default SplashScreen;
