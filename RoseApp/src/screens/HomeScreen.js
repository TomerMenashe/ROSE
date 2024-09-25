// /src/screens/HomeScreen.js

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, Pressable, Dimensions, ScrollView, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useNavigation, useRoute } from '@react-navigation/native';

const { height, width } = Dimensions.get('window');

const HomeScreen = ({ navigation, route }) => {
  const { name, imageUrl } = route.params || {}; // Access name and imageUrl from route params

  // Initialize shared values for each letter's opacity
  const fadeAnim1 = useSharedValue(0);
  const fadeAnim2 = useSharedValue(0);
  const fadeAnim3 = useSharedValue(0);
  const fadeAnim4 = useSharedValue(0);
  const fadeAnim5 = useSharedValue(0);

  // Define animated styles for each letter
  const animatedStyle1 = useAnimatedStyle(() => ({ opacity: fadeAnim1.value }));
  const animatedStyle2 = useAnimatedStyle(() => ({ opacity: fadeAnim2.value }));
  const animatedStyle3 = useAnimatedStyle(() => ({ opacity: fadeAnim3.value }));
  const animatedStyle4 = useAnimatedStyle(() => ({ opacity: fadeAnim4.value }));
  const animatedStyle5 = useAnimatedStyle(() => ({ opacity: fadeAnim5.value }));

  // Animate the letters when the user is set
  useEffect(() => {
    if (name) {
      fadeAnim1.value = withTiming(1, { duration: 500 }, () => {
        fadeAnim2.value = withTiming(1, { duration: 500 }, () => {
          fadeAnim3.value = withTiming(1, { duration: 500 }, () => {
            fadeAnim4.value = withTiming(1, { duration: 500 }, () => {
              fadeAnim5.value = withTiming(1, { duration: 500 });
            });
          });
        });
      });
    }
  }, [name]);

  if (!name) {
    return null;
  }

  return (
      <ImageBackground
          source={require('../../assets/createGameBack.jpeg')}
          style={styles.background}
          resizeMode="cover"
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Display the user's name with animated letters */}
          <View style={styles.adminContainer}>
            <Animated.Text style={[styles.adminText, animatedStyle1]}>
              {name.charAt(0).toUpperCase()}
            </Animated.Text>
            <Animated.Text style={[styles.adminText, animatedStyle2]}>
              {name.charAt(1)?.toUpperCase()}
            </Animated.Text>
            <Animated.Text style={[styles.adminText, animatedStyle3]}>
              {name.charAt(2)?.toUpperCase()}
            </Animated.Text>
            <Animated.Text style={[styles.adminText, animatedStyle4]}>
              {name.slice(3).toUpperCase()}
            </Animated.Text>
          </View>

          {/* Display the uploaded selfie image */}
          {imageUrl && (
              <Image source={{ uri: imageUrl }} style={styles.selfieImage} />
          )}

          <View style={styles.greetingContainer}>
            <Animated.Text style={[styles.greeting, animatedStyle5]}>
              Are you ready to get in Love?
            </Animated.Text>
          </View>

          {/* Create Game Button */}
          <Pressable
              style={styles.button}
              onPress={() => navigation.navigate('CreateGame', { name, imageUrl })}
          >
            <Text style={styles.buttonText}>Create Game</Text>
          </Pressable>

          {/* Join Game Button */}
          <Pressable
              style={styles.button}
              onPress={() => navigation.navigate('JoinGame', { name, imageUrl })}
          >
            <Text style={styles.buttonText}>Join Game</Text>
          </Pressable>
        </ScrollView>

        {/* Settings Button */}
        <Pressable
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.settingsText}>⚙️</Text>
        </Pressable>
      </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  adminContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 90,
    marginTop: -100,
  },
  adminText: {
    fontSize: 34,
    fontWeight: 'bold',
    fontFamily: 'Doodle-Font',
    color: '#FFFFFF',
  },
  greetingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 150,
  },
  greeting: {
    fontSize: 27,
    fontFamily: 'Doodle-Font',
    color: '#FFFFFF',
  },
  selfieImage: {
    width: 150, // Adjusted to make it circular
    height: 150, // Adjusted to make it circular
    borderRadius: 75, // Half of width and height
    borderColor: '#FF0000', // Red border color
    borderWidth: 4, // Thicker border for glow effect
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10, // For Android shadow
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#FF4B4B',
    paddingVertical: 20,
    borderRadius: 20,
    marginBottom: 40,
    width: width * 0.8,
    height: height * 0.08,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 5, // For Android shadow
  },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  settingsButton: {
    position: 'absolute',
    bottom: 50,
    right: 20,
    backgroundColor: '#FF4B4B',
    padding: 10,
    borderRadius: 35, // To make it circular
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 5, // For Android shadow
  },
  settingsText: { fontSize: 24, color: '#FFFFFF' },
});

export default HomeScreen;
