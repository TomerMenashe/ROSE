// /src/screens/PhotoEscapeReadyScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ImageBackground, StyleSheet, Dimensions, Modal } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { firebase } from '../../firebase/firebase';

const { height, width } = Dimensions.get('window');

const PhotoEscapeReadyScreen = () => {
  const [isReady, setIsReady] = useState(false);
  const [participants, setParticipants] = useState({});
  const [allReady, setAllReady] = useState(false);
  const [navigated, setNavigated] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const { pin, name, selfieURL } = route.params || {};

  const handleStartGame = () => {
    const roomRef = firebase.database().ref(`room/${pin}/participants/${name}`);

    roomRef.update({
      ready: true,
    }).then(() => {
      setIsReady(true);
    }).catch((error) => {
      console.error('Error updating Firebase:', error);
    });
  };

  useEffect(() => {
    const roomRef = firebase.database().ref(`room/${pin}/participants`);

    const participantListener = roomRef.on('value', (snapshot) => {
      if (snapshot.exists()) {
        const participantsData = snapshot.val();
        setParticipants(participantsData);

        const allParticipantsReady = Object.values(participantsData).every(participant => participant.ready === true);
        setAllReady(allParticipantsReady);

        if (allParticipantsReady && !navigated) {
          setNavigated(true);
          navigation.navigate('PhotoEscapeLimerick', { pin, name, selfieURL });
        }
      }
    });

    return () => roomRef.off('value', participantListener);
  }, [pin, navigation, navigated]);

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  return (
      <ImageBackground
          source={require('./assets/background.jpeg')}
          style={styles.background}
          resizeMode="cover"
      >
        <View style={styles.container}>
          <Text style={styles.title}>PhotoEscape</Text>

          <Pressable style={styles.button} onPress={handleStartGame}>
            <Text style={styles.buttonText}>{isReady ? 'Waiting for others...' : 'Ready'}</Text>
          </Pressable>

          {!allReady && isReady && (
              <Text style={styles.waitingText}>Waiting for other players to be ready...</Text>
          )}

          <Pressable style={styles.questionMark} onPress={toggleModal}>
            <Text style={styles.questionMarkText}>?</Text>
          </Pressable>

          <Modal
              transparent={true}
              visible={modalVisible}
              animationType="slide"
              onRequestClose={toggleModal}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>How to Play</Text>
                <Text style={styles.modalText}>
                  2 players get the same limerick about an object to find. When you are ready, press the 'Ready' button.
                  You will need to take a picture with the object you think matches the limerick. The first to find the object wins!
                </Text>

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
    marginBottom: 40,
  },
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
