import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, ImageBackground, StyleSheet, Dimensions, Modal } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';  // Import navigation and route hooks
import { firebase } from '../../firebase/firebase';  // Ensure your Firebase is initialized

const { height, width } = Dimensions.get('window');  // Get screen dimensions

const PhotoEscapeReadyScreen = () => {
  const [isReady, setIsReady] = useState(false);  // Track whether this player is ready
  const [participants, setParticipants] = useState({});  // Store participants' data
  const [allReady, setAllReady] = useState(false);  // Track if all players are ready
  const [navigated, setNavigated] = useState(false);  // Ensure we navigate only once
  const [modalVisible, setModalVisible] = useState(false);  // Track modal visibility

  const navigation = useNavigation();  // Hook to navigate between screens
  const route = useRoute();  // Get the current route params (for the game pin)
  const { pin } = route.params || {};  // Safely get the game pin from route parameters

  const currentUser = firebase.auth().currentUser;

  if (!currentUser) {
    console.error('No authenticated user.');
    return null;
  }

  console.log(`Current User UID: ${currentUser.uid}`);  // Log the current user's UID

  // Function to handle when the player presses "Ready"
  const handleStartGame = () => {
    const roomRef = firebase.database().ref(`room/${pin}/participants/${currentUser.uid}`);

    // Check if the user is already in the database
    roomRef.once('value', (snapshot) => {
      if (!snapshot.exists()) {
        const participantsRef = firebase.database().ref(`room/${pin}/participants`);
        participantsRef.once('value', (participantsSnapshot) => {
          const participantsData = participantsSnapshot.val();
          const existingPlayer = Object.values(participantsData).find(participant => participant.name === (currentUser.displayName || `Player ${currentUser.uid}`));

          if (existingPlayer) {
            console.log('Player with the same name already exists. Updating existing entry...');
            const existingPlayerKey = Object.keys(participantsData).find(key => participantsData[key].name === existingPlayer.name);
            firebase.database().ref(`room/${pin}/participants/${existingPlayerKey}`).update({
              ready: true
            });
          } else {
            roomRef.set({
              name: currentUser.displayName || `Player ${currentUser.uid}`,  // Ensure name is set
              ready: true  // Set the ready status to true
            });
          }
        });
      } else {
        roomRef.update({
          ready: true  // Update the ready status to true
        });
      }
    }).then(() => {
      setIsReady(true);
      console.log(`Player ${currentUser.uid} is now ready.`);
    }).catch((error) => {
      console.error('Error updating Firebase:', error);
    });
  };

  // Listen for changes in the participants' data in Firebase
  useEffect(() => {
    const roomRef = firebase.database().ref(`room/${pin}/participants`);

    const participantListener = roomRef.on('value', (snapshot) => {
      if (snapshot.exists()) {
        const participantsData = snapshot.val();
        console.log('Participants Data from Firebase:', participantsData);
        setParticipants(participantsData);

        const allParticipantsReady = Object.values(participantsData).every(participant => participant.ready === true);
        setAllReady(allParticipantsReady);

        if (allParticipantsReady && !navigated) {
          console.log('All players are ready. Navigating to the limerick screen.');
          setNavigated(true);
          navigation.navigate('PhotoEscapeLimerick', { pin });
        }
      }
    });

    return () => roomRef.off('value', participantListener);
  }, [pin, navigation, navigated]);

  // Show or hide the modal
  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  return (
    <ImageBackground
      source={require('./assets/background.jpeg')}  // PhotoEscape ready background image
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={styles.title}>PhotoEscape</Text>

        {/* Ready Button */}
        <Pressable style={styles.button} onPress={handleStartGame}>
          <Text style={styles.buttonText}>{isReady ? 'Waiting for others...' : 'Ready'}</Text>
        </Pressable>

        {/* Display a message when waiting for other players */}
        {!allReady && isReady && (
          <Text style={styles.waitingText}>Waiting for other players to be ready...</Text>
        )}

        {/* Question mark button for instructions */}
        <Pressable style={styles.questionMark} onPress={toggleModal}>
          <Text style={styles.questionMarkText}>?</Text>
        </Pressable>

        {/* Modal for the "How to Play" explanation */}
        <Modal
          transparent={true}
          visible={modalVisible}
          animationType="slide"
          onRequestClose={toggleModal}  // Close when back button is pressed
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>How to Play</Text>
              <Text style={styles.modalText}>
                2 players get the same limerick about an object to find. When you are ready, press the 'Next' button.
                You will need to take a picture with the object you think matches the limerick. The first to find the object wins!
              </Text>

              {/* Close button */}
              <Pressable style={styles.modalButton} onPress={toggleModal}>
                <Text style={styles.modalButtonText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
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
  button: {
    backgroundColor: '#FF4B4B',  // Red color for the Ready button
    paddingVertical: 20,
    borderRadius: 20,
    width: width * 0.8,
    height: height * 0.08,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  waitingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 20,
  },
  questionMark: {
    position: 'absolute',
    bottom: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',  // Transparent black background
    padding: 10,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionMarkText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',  // Semi-transparent overlay
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF4B4B',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#FF4B4B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PhotoEscapeReadyScreen;
