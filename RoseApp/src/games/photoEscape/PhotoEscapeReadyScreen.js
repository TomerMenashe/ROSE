import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Modal, StyleSheet, Dimensions } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { firebase } from '../../firebase/firebase';  // Ensure this path is correct and Firebase is properly initialized

// Get device width and height for responsiveness
const { width, height } = Dimensions.get('window');

const PhotoEscapeReadyScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);  // State to manage modal visibility
  const [isReady, setIsReady] = useState(false);  // State to manage player's readiness
  const [otherPlayerReady, setOtherPlayerReady] = useState(false);  // Check if the other player is ready
  const route = useRoute();
  const navigation = useNavigation();
  const { pin } = route.params || {};  // Safely access pin and avoid undefined issues

  // Debugging to check if the PIN is correctly received
  console.log('Game PIN:', pin);

  const currentUser = firebase.auth().currentUser;  // Get current authenticated user

  if (!currentUser) {
    console.error('No user is authenticated.');
    return null;
  }

  // Mark the current player as ready in Firebase
  const handleReadyPress = () => {
    const roomRef = firebase.database().ref(`room/${pin}/participants/${currentUser.uid}`);

    roomRef.update({ ready: true }).then(() => {
      setIsReady(true);  // Mark this player as ready in the app's state
    }).catch((error) => {
      console.error('Error updating Firebase:', error);
    });
  };

  useEffect(() => {
    // Listen for other players' readiness
    const roomRef = firebase.database().ref(`room/${pin}/participants`);

    const participantListener = roomRef.on('value', (snapshot) => {
      if (snapshot.exists()) {
        const participants = snapshot.val();
        const otherPlayers = Object.values(participants).filter(p => p.name !== currentUser.displayName);

        if (otherPlayers.length > 0 && otherPlayers[0].ready) {
          setOtherPlayerReady(true);  // Other player is ready
        }

        // Navigate to the game when both players are ready
        if (isReady && otherPlayerReady) {
          navigation.navigate('PhotoEscapeGame', { pin });
        }
      } else {
        console.error('Snapshot does not exist.');
      }
    });

    return () => roomRef.off('value', participantListener);  // Clean up the listener
  }, [isReady, otherPlayerReady, pin, navigation, currentUser.displayName]);

  return (
    <ImageBackground
      source={require('./assets/background.jpeg')}  // Ensure the path to the background image is correct
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={styles.title}>Photo Escape</Text>

        {/* Display the game PIN */}
        {pin ? (
          <Text style={styles.pinText}>Game PIN: {pin}</Text>
        ) : (
          <Text style={styles.errorText}>Error: No PIN provided</Text>  // Debugging error text if no pin
        )}

        {/* Ready Button */}
        <TouchableOpacity style={styles.readyButton} onPress={handleReadyPress} disabled={isReady}>
          <Text style={styles.readyButtonText}>
            {isReady ? 'Waiting for other player...' : 'READY'}
          </Text>
        </TouchableOpacity>

        {/* Question Mark Button */}
        <TouchableOpacity style={styles.questionMark} onPress={() => setModalVisible(true)}>
          <Text style={styles.questionMarkText}>?</Text>
        </TouchableOpacity>

        {/* Modal for explanation */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>How to Play: In Photo Escape, solve puzzles quickly to escape!</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
};

// CSS-like styles using React Native's StyleSheet
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
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  pinText: {
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 20,
  },
  errorText: {
    fontSize: 24,
    color: 'red',
    marginBottom: 20,
  },
  readyButton: {
    backgroundColor: '#FF4B4B',  // Red background color
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 60,
    marginBottom: 20,
  },
  readyButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  questionMark: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  questionMarkText: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',  // Transparent background
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 15,
  },
  closeButton: {
    backgroundColor: '#FF4B4B',
    borderRadius: 10,
    padding: 10,
    width: 100,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default PhotoEscapeReadyScreen;
