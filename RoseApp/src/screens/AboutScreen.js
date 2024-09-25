import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Pressable, Text, Dimensions, Platform, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import * as Font from 'expo-font';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RFPercentage } from "react-native-responsive-fontsize"; // For responsive font sizes

const { width, height } = Dimensions.get('window');

const AboutScreen = ({ navigation }) => {
  const [fontLoaded, setFontLoaded] = useState(false);

  const phrases = [
    'Welcome to Rose',
    'where love blossoms beyond the ordinary.',
    'Say goodbye to the usual dating games and dive into a world of romance and mystery.',
    'Our mini-games, powered by AI, spark creativity, love, and laughter - bringing excitement into every step.',
    'We use technology to bring back human connection.',
    'Will you dare to play?',
  ];

  const animationDuration = 3000;
  const phraseTimings = phrases.map((_, i) => i * 4000);

  // Initialize shared values
  const fadeValues = phrases.map(() => useSharedValue(0));
  const scaleValues = phrases.map(() => useSharedValue(0.5));

  // Load custom font
  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          'Neon-Glow': require('../../assets/fonts/neon-glow.ttf'),
        });
        setFontLoaded(true);
      } catch (error) {
        console.error('Error loading font:', error);
      }
    };
    loadFonts();
  }, []);

  // Define animated styles
  const getAnimatedStyle = useCallback((phraseIndex) => {
    return useAnimatedStyle(() => ({
      opacity: fadeValues[phraseIndex].value,
      transform: [{ scale: scaleValues[phraseIndex].value }],
    }));
  }, [fadeValues, scaleValues]);

  useEffect(() => {
    phrases.forEach((_, phraseIndex) => {
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
  }, [fadeValues, scaleValues, phraseTimings, animationDuration, phrases]);

  const handlePress = () => {
    navigation.navigate('Welcome');
  };

  if (!fontLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const RenderPhrase = React.memo(({ phrase, phraseIndex }) => {
    const animatedStyle = getAnimatedStyle(phraseIndex);
    return (
      <Animated.View
        key={phraseIndex}
        style={[styles.phraseContainer, animatedStyle]}
      >
        <Animated.Text style={styles.phrase}>{phrase}</Animated.Text>
      </Animated.View>
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.textContainer}>
          {phrases.map((phrase, phraseIndex) => (
            <RenderPhrase key={phraseIndex} phrase={phrase} phraseIndex={phraseIndex} />
          ))}
        </View>

        <Pressable style={styles.button} onPress={handlePress}>
          <Text style={styles.buttonText}>Play</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.02, // Added vertical padding
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: RFPercentage(3), // Responsive font size
  },
  textContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  phraseContainer: {
    marginVertical: height * 0.015,
    width: '100%',
    alignItems: 'center',
  },
  phrase: {
    fontSize: RFPercentage(3.5), // Responsive font size
    color: '#FF0000',
    fontFamily: 'Neon-Glow',
    textAlign: 'center',
    textShadowColor: '#FF0000',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    ...Platform.select({
      ios: {
        shadowOpacity: 1,
        shadowColor: '#FF4500',
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 0 },
      },
      android: {
        elevation: 10,
      },
    }),
  },
  button: {
    backgroundColor: '#FF0000',
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.12,
    borderRadius: width * 0.03,
    marginTop: height * 0.05,
    ...Platform.select({
      ios: {
        shadowColor: '#FF4500',
        shadowRadius: 20,
        shadowOpacity: 1,
        shadowOffset: { width: 0, height: 0 },
      },
      android: {
        elevation: 10,
      },
    }),
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: RFPercentage(2.5), // Responsive font size
    fontFamily: 'Neon-Glow',
    textShadowColor: '#FF4500',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});

export default AboutScreen;
