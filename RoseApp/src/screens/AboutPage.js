import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import * as Font from 'expo-font'; // Import for loading fonts

const AboutPage = ({ navigation }) => {
  // Phrases to display in a typing effect
  const phrases = [
    "Welcome to Rose",
    "where love blossoms beyond the ordinary.",
    "Say goodbye to the usual dating games and dive into a world of romance and mystery.",
    "Our mini-games, powered by AI, spark creativity, love, and laughter - bringing excitement into every step.",
    "We use technology to bring back human connection.",
    "Will you dare to play?"
  ];

  const animationDuration = 3000; // Animation duration for each phrase
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
          <Animated.View key={phraseIndex} style={[styles.phraseContainer, getAnimatedStyle(phraseIndex)]}>
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
    paddingHorizontal: 20, // Add padding to avoid text touching the screen edges
  },
  textContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%', // Ensure text container uses full screen width
  },
  phraseContainer: {
    marginVertical: 15, // Add margin between phrases for spacing
    width: '100%', // Ensure the phrases take up full width of the container
    alignItems: 'center',
  },
  phrase: {
    fontSize: 32, // Larger font size for more emphasis
    color: '#FF0000', // Red neon color
    fontFamily: 'Neon-Glow', // Custom font
    textAlign: 'center', // Center-align text to prevent breaking in strange places
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
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 25,
    marginTop: 40, // Spacing from the bottom of the phrases
    shadowColor: '#FF4500',
    shadowRadius: 20,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 0 },
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontFamily: 'Neon-Glow', // Use the same neon font for the button
    textShadowColor: '#FF4500',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});

export default AboutPage;
