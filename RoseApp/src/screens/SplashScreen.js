import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

const SplashScreen = ({ navigation }) => {
  // Initialize shared values for each letter's opacity
  const fadeR = useSharedValue(0);
  const fadeO = useSharedValue(0);
  const fadeS = useSharedValue(0);
  const fadeE = useSharedValue(0);

  // Define animated styles for each letter
  const animatedStyleR = useAnimatedStyle(() => ({
    opacity: fadeR.value,
  }));

  const animatedStyleO = useAnimatedStyle(() => ({
    opacity: fadeO.value,
  }));

  const animatedStyleS = useAnimatedStyle(() => ({
    opacity: fadeS.value,
  }));

  const animatedStyleE = useAnimatedStyle(() => ({
    opacity: fadeE.value,
  }));

  useEffect(() => {
    // Sequentially animate each letter's opacity
    fadeR.value = withTiming(1, { duration: 800 }, () => {
      fadeO.value = withTiming(1, { duration: 500 }, () => {
        fadeS.value = withTiming(1, { duration: 500 }, () => {
          fadeE.value = withTiming(1, { duration: 500 }, () => {
            // Navigate to Login screen after all animations complete
            runOnJS(navigateToLogin)();
          });
        });
      });
    });
  }, []);

  // Function to handle navigation
  const navigateToLogin = () => {
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.letterContainer}>
        <Animated.Text style={[styles.letter, animatedStyleR]}>R</Animated.Text>
        <Animated.Text style={[styles.letter, animatedStyleO]}>O</Animated.Text>
        <Animated.Text style={[styles.letter, animatedStyleS]}>S</Animated.Text>
        <Animated.Text style={[styles.letter, animatedStyleE]}>E</Animated.Text>
      </View>
      <Image
        source={require('../../assets/rose.gif')}
        style={styles.logo}
        resizeMode="contain"
      />
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
    color: '#FFFFFF', // White text
    marginHorizontal: 10,
  },
  logo: {
    width: 150, // Adjust based on your requirements
    height: 150,
    // Removed resizeMode from style as it's now a prop
  },
});

export default SplashScreen;
