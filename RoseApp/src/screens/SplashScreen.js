import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

const SplashScreen = ({ navigation }) => {
  // Initialize shared values for each letter's opacity and scale
  const fadeR = useSharedValue(0);
  const scaleR = useSharedValue(0.5);

  const fadeO = useSharedValue(0);
  const scaleO = useSharedValue(0.5);

  const fadeS = useSharedValue(0);
  const scaleS = useSharedValue(0.5);

  const fadeE = useSharedValue(0);
  const scaleE = useSharedValue(0.5);

  // Shared values for the logo animation
  const logoScale = useSharedValue(0.5); // Start from a smaller scale for more noticeable scaling
  const logoOpacity = useSharedValue(0);

  // Define animated styles for each letter
  const animatedStyleR = useAnimatedStyle(() => ({
    opacity: fadeR.value,
    transform: [{ scale: scaleR.value }],
  }));

  const animatedStyleO = useAnimatedStyle(() => ({
    opacity: fadeO.value,
    transform: [{ scale: scaleO.value }],
  }));

  const animatedStyleS = useAnimatedStyle(() => ({
    opacity: fadeS.value,
    transform: [{ scale: scaleS.value }],
  }));

  const animatedStyleE = useAnimatedStyle(() => ({
    opacity: fadeE.value,
    transform: [{ scale: scaleE.value }],
  }));

  const animatedLogoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  useEffect(() => {
    // Animate each letter with increased duration and delay
    fadeR.value = withTiming(1, {
      duration: 1500,
      easing: Easing.out(Easing.ease),
    });
    scaleR.value = withSpring(1, {
      damping: 10,
      stiffness: 100,
    });

    fadeO.value = withDelay(
      500,
      withTiming(1, {
        duration: 1500,
        easing: Easing.out(Easing.ease),
      })
    );
    scaleO.value = withDelay(
      500,
      withSpring(1, {
        damping: 10,
        stiffness: 100,
      })
    );

    fadeS.value = withDelay(
      1000,
      withTiming(1, {
        duration: 1500,
        easing: Easing.out(Easing.ease),
      })
    );
    scaleS.value = withDelay(
      1000,
      withSpring(1, {
        damping: 10,
        stiffness: 100,
      })
    );

    fadeE.value = withDelay(
      1500,
      withTiming(1, {
        duration: 1500,
        easing: Easing.out(Easing.ease),
      })
    );
    scaleE.value = withDelay(
      1500,
      withSpring(1, {
        damping: 10,
        stiffness: 100,
      })
    );

    // Start the logo animation after the last letter animation completes
    setTimeout(() => {
      logoOpacity.value = withTiming(1, {
        duration: 1000,
        easing: Easing.out(Easing.ease),
      });
      logoScale.value = withTiming(
        1,
        {
          duration: 4000,
          easing: Easing.out(Easing.ease),
        },
        () => {
          // Navigate to Login screen after logo animation completes
          runOnJS(navigateToLogin)();
        }
      );
    }, 1000); // Delay equal to the total duration of letter animations
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
      <Animated.Image
        source={require('../../assets/rose.gif')}
        style={[styles.logo, animatedLogoStyle]}
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
  },
});

export default SplashScreen;
