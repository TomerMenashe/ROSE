import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, Pressable, ImageBackground, Dimensions } from 'react-native';

const { height, width } = Dimensions.get('window');  // Get screen dimensions

const JoinGameScreen = () => {
  const [gamePin, setGamePin] = useState('');

  return (
    <ImageBackground
      source={require('../../assets/joinGame.jpeg')}  // Join game background image
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={styles.title}>Rose</Text>

        {/* Game PIN Input */}
        <TextInput
          style={styles.input}
          placeholder="Game PIN"
          placeholderTextColor="#808080"
          value={gamePin}
          keyboardType="numeric"
          onChangeText={setGamePin}
        />

        {/* Join Game Button */}
        <Pressable style={styles.button} onPress={() => {}}>
          <Text style={styles.buttonText}>Join Game</Text>
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
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 40,  // Adjust margin
  },
  input: {
    height: 50,
    borderColor: '#FF4B4B',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    width: '80%',
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
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

export default JoinGameScreen;
