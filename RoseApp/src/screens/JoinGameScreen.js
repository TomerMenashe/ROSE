// /src/screens/JoinGameScreen.js

import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, Pressable, ImageBackground, Dimensions, TouchableOpacity } from 'react-native';
import { firebase } from '../firebase/firebase';
import { useNavigation, useRoute } from '@react-navigation/native';
import CustomButton from "../../assets/sounds/CustomButton";

const { height, width } = Dimensions.get('window');

const JoinGameScreen = () => {
  const [gamePin, setGamePin] = useState('');
  const [error, setError] = useState('');
  const navigation = useNavigation();
  const { params } = useRoute();
  const name = params?.name;
  const selfieURL = params?.imageUrl;

  const handleJoinGame = () => {
    if (!name || !selfieURL) {
      console.error('Name or selfieURL is undefined.');
      return;
    }

    if (!gamePin || gamePin.length < 4) {
      setError('Please enter a valid 4-digit PIN.');
      return;
    }

    firebase
        .database()
        .ref(`room/${gamePin}`)
        .once('value', (snapshot) => {
          if (snapshot.exists()) {
            const participantsRef = firebase.database().ref(`room/${gamePin}/participants`);
            participantsRef
                .child(name)
                .set({
                  name: name,
                  selfieURL: selfieURL,
                })
                .then(() => {
                  navigation.navigate('Room', { pin: gamePin, name, selfieURL });
                });
          } else {
            setError('Invalid PIN. Please try again.');
          }
        });
  };

  const handlePinChange = (text) => {
    if (text.length <= 4) {
      setGamePin(text);
    }
  };

  return (
      <ImageBackground
          source={require('../../assets/joinGame.jpeg')}
          style={styles.background}
          resizeMode="cover"
      >
        <View style={styles.container}>
          <Text style={styles.title}>Join Game</Text>

          {/* PIN Input Boxes */}
          <View style={styles.pinContainer}>
            {Array(4)
                .fill()
                .map((_, index) => (
                    <TouchableOpacity key={index} style={styles.pinBox} onPress={() => this.pinInput.focus()}>
                      <Text style={styles.pinText}>{gamePin[index] || ''}</Text>
                    </TouchableOpacity>
                ))}
            {/* Hidden TextInput to capture actual input */}
            <TextInput
                ref={(ref) => {
                  this.pinInput = ref;
                }}
                style={styles.hiddenInput}
                value={gamePin}
                keyboardType="numeric"
                maxLength={4}
                onChangeText={handlePinChange}
                autoFocus={true}
            />
          </View>

          {/* Error Message */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Join Game Button */}
          <CustomButton style={styles.button} onPress={handleJoinGame}>
            <Text style={styles.buttonText}>Join Game</Text>
          </CustomButton>
        </View>
      </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 40, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 40 },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 20,
  },
  pinBox: {
    borderColor: '#FF4B4B',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    height: 60,
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  pinText: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  hiddenInput: { position: 'absolute', opacity: 0 },
  button: {
    backgroundColor: '#FF4B4B',
    paddingVertical: 20,
    borderRadius: 20,
    width: width * 0.8,
    height: height * 0.08,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  errorText: { color: 'red', marginBottom: 10 },
});

export default JoinGameScreen;
