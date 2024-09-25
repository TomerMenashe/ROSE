import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable, Text, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import * as Font from 'expo-font'; // Import for loading fonts

const { width, height } = Dimensions.get('window');

const AboutScreen = ({ navigation }) => {
  // Phrases to display in a typing effect
  const phrases = [
    'Welcome to Rose',
    'where love blossoms beyond the ordinary.',
    'Say goodbye to the usual dating games and dive into a world of romance and mystery.',
    'Our mini-games, powered by AI, spark creativity, love, and laughter - bringing excitement into every step.',
    'We use technology to bring back human connection.',
    'Will you dare to play?',
  ];

  const animationDuration = 3000; // Animation duration for each phrase in milliseconds
  const phraseTimings = phrases.map((_, i) => i * 4000); // Staggered phrase appearance

  // Shared values for each phrase's opacity and scale
  const fadeValues = phrases.map(() => useSharedValue(0));
  const scaleValues = phrases.map(() => useSharedValue(0.5));

  // Load custom font
  useEffect(() => {
    Font.loadAsync({
      'Neon-Glow': require('../../assets/fonts/neon-glow.ttf'), // Adjust the path as needed
    }).then(() => {
      console.log('Font loaded');
    });
  }, []);

  // Define animated styles for each phrase
  const getAnimatedStyle = (phraseIndex) => {
    return useAnimatedStyle(() => ({
      opacity: fadeValues[phraseIndex].value,
      transform: [{ scale: scaleValues[phraseIndex].value }],
    }));
  };

  useEffect(() => {
    phrases.forEach((_, phraseIndex) => {
      // Animate each phrase with delays
      const totalDelay = phraseTimings[phraseIndex];

      fadeValues[phraseIndex].value = withDelay(
        totalDelay,
        withTiming(1, {
          duration: animationDuration,
          easing: Easing.out(Easing.ease),
        })
      );

      scaleValues[phraseIndex].value = withDelay(
        totalDelay,
        withTiming(1, {
          duration: animationDuration,
          easing: Easing.out(Easing.ease),
        })
      );
    });
  }, []);

  // Navigate to the "Welcome" screen when the button is pressed
  const handlePress = () => {
    navigation.navigate('Welcome');
  };

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        {phrases.map((phrase, phraseIndex) => (
          <Animated.View
            key={phraseIndex}
            style={[styles.phraseContainer, getAnimatedStyle(phraseIndex)]}
          >
            <Animated.Text style={styles.phrase}>{phrase}</Animated.Text>
          </Animated.View>
        ))}
      </View>

      {/* Add Play Button */}
      <Pressable style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>Play</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Black background
    justifyContent: 'center', // Center vertically
    alignItems: 'center',
    paddingHorizontal: width * 0.05, // 5% of screen width
  },
  textContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%', // Full width
  },
  phraseContainer: {
    marginVertical: height * 0.015, // 1.5% of screen height
    width: '100%', // Full width
    alignItems: 'center',
  },
  phrase: {
    fontSize: width * 0.08, // 8% of screen width
    color: '#FF0000', // Red neon color
    fontFamily: 'Neon-Glow', // Custom font
    textAlign: 'center', // Center-align text
    // Multiple shadow layers for intense neon glow effect
    textShadowColor: '#FF0000',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    shadowOpacity: 1,
    shadowColor: '#FF4500',
    shadowRadius: 20, // Bigger shadow radius for the glow effect
    shadowOffset: { width: 0, height: 0 },
  },
  button: {
    backgroundColor: '#FF0000', // Red button background
    paddingVertical: height * 0.02, // 2% of screen height
    paddingHorizontal: width * 0.12, // 12% of screen width
    borderRadius: width * 0.03, // 3% of screen width
    marginTop: height * 0.05, // 5% of screen height
    shadowColor: '#FF4500',
    shadowRadius: 20,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 0 },
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: width * 0.05, // 5% of screen width
    fontFamily: 'Neon-Glow', // Use the same neon font for the button
    textShadowColor: '#FF4500',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});

export default AboutScreen;
