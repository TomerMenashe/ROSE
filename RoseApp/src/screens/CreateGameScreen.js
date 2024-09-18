import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ImageBackground, Dimensions } from 'react-native';

const { height, width } = Dimensions.get('window');  // Get screen dimensions

const CreateGameScreen = () => {
  const [pin, setPin] = useState(generatePin());

  // Function to generate a 4-digit PIN
  function generatePin() {
    return Math.floor(1000 + Math.random() * 9000).toString();  // Generates a random 4-digit pin
  }

  return (
    <ImageBackground
      source={require('../../assets/joinGame.jpeg')}  // Create game background image
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={styles.title}>Rose</Text>

        {/* Display the generated PIN */}
        <Text style={styles.pinText}>Your Game PIN: {pin}</Text>

        {/* Regenerate PIN Button */}
        <Pressable style={styles.button} onPress={() => setPin(generatePin())}>
          <Text style={styles.buttonText}>Generate New PIN</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 100,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 40,
  },
  pinText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#FF4B4B',
    paddingVertical: 20,  // Same padding as HomeScreen button
    borderRadius: 20,     // Same borderRadius as HomeScreen button
    width: width * 0.8,   // 80% of the screen width
    height: height * 0.08, // 8% of the screen height
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,     // Additional margin for spacing
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreateGameScreen;
