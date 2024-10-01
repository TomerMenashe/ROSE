// /src/screens/HomeScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, Pressable, ImageBackground, ScrollView, SafeAreaView } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import CustomButton from "../../assets/Sounds/CustomButton";

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation, route }) => {
  const { name, imageUrl } = route.params || {};

  const fadeAnim1 = useSharedValue(0);
  const fadeAnim2 = useSharedValue(0);
  const fadeAnim3 = useSharedValue(0);
  const fadeAnim4 = useSharedValue(0);
  const fadeAnim5 = useSharedValue(0);

  const animatedStyle1 = useAnimatedStyle(() => ({ opacity: fadeAnim1.value }));
  const animatedStyle2 = useAnimatedStyle(() => ({ opacity: fadeAnim2.value }));
  const animatedStyle3 = useAnimatedStyle(() => ({ opacity: fadeAnim3.value }));
  const animatedStyle4 = useAnimatedStyle(() => ({ opacity: fadeAnim4.value }));
  const animatedStyle5 = useAnimatedStyle(() => ({ opacity: fadeAnim5.value }));

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
    <SafeAreaView style={styles.safeArea}>
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
          <CustomButton
            style={styles.button}
            onPress={() => navigation.navigate('CreateGame', { name, imageUrl })}
          >
            <Text style={styles.buttonText}>Create Game</Text>
          </CustomButton>

          {/* Join Game Button */}
          <CustomButton
            style={styles.button}
            onPress={() => navigation.navigate('JoinGame', { name, imageUrl })}
          >
            <Text style={styles.buttonText}>Join Game</Text>
          </CustomButton>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000', // Ensure the background color covers the safe area
  },
  background: { 
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: height * 0.05, // 5% of screen height for top and bottom padding
    paddingHorizontal: width * 0.05, // 5% of screen width for left and right padding
  },
  adminContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    // Removed absolute positioning and negative margins for responsiveness
    marginBottom: height * 0.02, // 2% of screen height
  },
  adminText: {
    fontSize: Math.min(width, height) * 0.08, // 8% of the smaller screen dimension
    fontWeight: 'bold',
    fontFamily: 'Doodle-Font',
    color: '#FFFFFF',
    marginHorizontal: 2,
  },
  greetingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: height * 0.05, // 5% of screen height
  },
  greeting: {
    fontSize: Math.min(width, height) * 0.05, // 5% of the smaller screen dimension
    fontFamily: 'Doodle-Font',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  selfieImage: {
    width: Math.min(width, height) * 0.4, // 40% of the smaller screen dimension
    height: Math.min(width, height) * 0.4,
    borderRadius: Math.min(width, height) * 0.2,
    borderColor: '#FF0000',
    borderWidth: 4,
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
    marginVertical: height * 0.03, // 3% of screen height
  },
  button: {
    backgroundColor: '#FF0000', // Bright red color
    paddingVertical: height * 0.02, // 2% of screen height
    borderRadius: 20,
    marginBottom: height * 0.03, // 3% of screen height
    width: width * 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: { 
    color: '#FFFFFF', 
    fontSize: Math.min(width, height) * 0.04, // 4% of the smaller screen dimension
    fontWeight: 'bold' 
  },
});

export default HomeScreen;
