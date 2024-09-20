import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Modal, StyleSheet, Dimensions } from 'react-native';

// Get device width and height for responsiveness
const { width, height } = Dimensions.get('window');

const GameStartPage = () => {
  const [modalVisible, setModalVisible] = useState(false); // State to manage modal visibility

  return (
    <ImageBackground 
      source={require('../../assets/startGameBackground.jpg')}  // Path to your background image
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={styles.title}>TRIVIA WARS</Text>

        {/* Ready Button */}
        <TouchableOpacity style={styles.readyButton} onPress={() => alert('Ready to start!')}>
          <Text style={styles.readyButtonText}>READY</Text>
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
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>How to Play: Answer the trivia questions correctly to win the game!</Text>
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

export default GameStartPage;
