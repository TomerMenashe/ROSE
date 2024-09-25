// /src/games/photoEscape/PhotoEscapeReadyScreen.js

import React from 'react';
import { View, Text, StyleSheet, ImageBackground, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

const PhotoEscapeReadyScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { pin, name, selfieURL } = route.params || {};

  // This screen can be used for any pre-game setup or waiting period.

  return (
      <ImageBackground
          source={require('./assets/background.jpeg')}
          style={styles.background}
          resizeMode="cover"
      >
        <View style={styles.container}>
          <Text style={styles.title}>Waiting for the game to start...</Text>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(16,16,16,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default PhotoEscapeReadyScreen;
