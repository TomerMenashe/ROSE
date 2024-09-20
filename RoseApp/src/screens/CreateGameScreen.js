import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ImageBackground, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { firebase } from '../firebase/firebase';

const { height, width } = Dimensions.get('window');

const CreateGameScreen = () => {
  const [pin, setPin] = useState(generatePin());
  const navigation = useNavigation();
  const currentUser = firebase.auth().currentUser;

  // Function to generate a random 4-digit PIN
  function generatePin() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  const handleCreateGame = () => {
    const roomRef = firebase.database().ref(`room/${pin}`);
    console.log("Generated PIN in CreateGameScreen:", pin);  // LOG PIN GENERATION

    roomRef.set({
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      participants: {
        [currentUser.uid]: { name: currentUser.displayName }
      }
    }).then(() => {
      console.log("Room created successfully in Firebase with PIN:", pin);  // LOG SUCCESSFUL ROOM CREATION
      // Navigate to the RoomScreen and pass the generated pin
      navigation.navigate('Room', { pin });
      console.log("Navigating to RoomScreen with PIN:", pin);  // LOG NAVIGATION TO ROOMSCREEN
    }).catch((error) => {
      console.error("Error creating room:", error);
    });
  };

  return (
    <ImageBackground
      source={require('../../assets/joinGame.jpeg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={styles.title}>Create Game</Text>
        <Text style={styles.pinText}>Generated PIN: {pin}</Text>

        <Pressable style={styles.button} onPress={handleCreateGame}>
          <Text style={styles.buttonText}>Create Game</Text>
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 40,
  },
  pinText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FF4B4B',
    paddingVertical: 15,
    borderRadius: 10,
    width: width * 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreateGameScreen;
