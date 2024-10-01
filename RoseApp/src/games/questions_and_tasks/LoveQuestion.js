import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, ActivityIndicator } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { useNavigation, useRoute } from '@react-navigation/native';
import { firebase } from '../../firebase/firebase';
import * as FileSystem from 'expo-file-system';
import usePreventBack from "../../components/usePreventBack";

const { width, height } = Dimensions.get('window');

const LoveQuestion = () => {
  usePreventBack(); // **Added Hook Call**
  const [question, setQuestion] = useState('');
  const navigation = useNavigation();
  const route = useRoute();
  const { pin, name, selfieURL } = route.params || {};
  const fadeValue = useSharedValue(0);
  const scaleValue = useSharedValue(0.8);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [areBothReady, setAreBothReady] = useState(false);

  // Shared values for intro text animation after ready
  const introFontSize = useSharedValue(width * 0.05);
  const introColor = useSharedValue(1); // 1 for full red, 0 for pale color

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const storageRef = firebase.storage().ref('love_questions_rose.txt');
        const url = await storageRef.getDownloadURL();
        const response = await FileSystem.downloadAsync(url, FileSystem.documentDirectory + 'love_questions_rose.txt');
        const content = await FileSystem.readAsStringAsync(response.uri);
        const questions = content.split('\n').filter(q => q.trim() !== '');
        const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
        
        // Remove the number from the beginning of the question
        const cleanedQuestion = randomQuestion.replace(/^\d+\.\s*/, '');
        
        // Store the cleaned question in Firebase Realtime Database using 'pin'
        const roomRef = firebase.database().ref(`room/${pin}`);
        await roomRef.child('currentLoveQuestion').set(cleanedQuestion);
        
        setIsLoading(false); // Stop loading after fetching
      } catch (error) {
        console.error('Error fetching question:', error);
        Alert.alert('Error', 'Failed to fetch question. Please try again.');
        setIsLoading(false); // Stop loading even if there's an error
      }
    };

    const listenForQuestionChanges = () => {
      const roomRef = firebase.database().ref(`room/${pin}`);
      roomRef.child('currentLoveQuestion').on('value', (snapshot) => {
        if (snapshot.exists()) {
          setQuestion(snapshot.val());
        }
      });
    };

    fetchQuestion();
    listenForQuestionChanges();

    // Animate the intro text when the component mounts
    fadeValue.value = withTiming(1, { duration: 2000, easing: Easing.out(Easing.ease) });
    scaleValue.value = withTiming(1, { duration: 2000, easing: Easing.out(Easing.ease) });

    return () => {
      const roomRef = firebase.database().ref(`room/${pin}`);
      roomRef.child('currentLoveQuestion').off();
    };
  }, [pin]);

  useEffect(() => {
    const roomRef = firebase.database().ref(`room/${pin}/readyStatus`);

    const handleReadyStatus = (snapshot) => {
      const statuses = snapshot.val();
      if (statuses) {
        const players = Object.keys(statuses);
        const readyPlayers = players.filter(player => statuses[player] === true);
        if (readyPlayers.length === 2) {
          setAreBothReady(true);
        }
      }
    };

    roomRef.on('value', handleReadyStatus);

    return () => {
      roomRef.off('value', handleReadyStatus);
    };
  }, [pin]);

  const handleReady = async () => {
    try {
      const readyRef = firebase.database().ref(`room/${pin}/readyStatus/${name}`);
      await readyRef.set(true);
      setIsPlayerReady(true);

      // Animate intro text to become smaller and more pale
      introFontSize.value = withTiming(width * 0.04, { duration: 1000, easing: Easing.out(Easing.ease) });
      introColor.value = withTiming(0.5, { duration: 1000, easing: Easing.out(Easing.ease) }); // Transition to pale color
    } catch (error) {
      console.error('Error setting ready status:', error);
      Alert.alert('Error', 'Failed to set ready status. Please try again.');
    }
  };

  const handleDone = async () => {
    try {
      // Delete 'currentLoveQuestion' from Firebase
      const roomRef = firebase.database().ref(`room/${pin}`);
      await roomRef.child('currentLoveQuestion').remove();

      // Optionally, reset readiness statuses for a new round
      await roomRef.child('readyStatus').remove();

      // Navigate back or to another screen as needed
      navigation.navigate('PersonalQuestion', { pin, name, selfieURL });
    } catch (error) {
      console.error('Error completing the round:', error);
      Alert.alert('Error', 'Failed to complete the round. Please try again.');
    }
  };

  // Animated style for the intro text
  const promptAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeValue.value,
    transform: [{ scale: scaleValue.value }],
    fontSize: introFontSize.value,
    color: `rgba(255, 75, 75, ${introColor.value})`,
  }));

  // Animated style for the question and done button
  const questionAnimatedStyle = useAnimatedStyle(() => ({
    opacity: areBothReady ? withTiming(1, { duration: 1000 }) : 0,
    transform: [{ scale: areBothReady ? withTiming(1, { duration: 1000 }) : 0.8 }],
  }));

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#FF4B4B" />
      ) : (
        <>
          {/* Intro Text */}
          <Animated.Text style={[styles.promptText, promptAnimatedStyle]}>
            For a moment, let's take a little break from the games and turn our attention to our significant other. Sit back, relax, and look into each other's eyes. Open your heart, be as honest as you can, and ask your partner the next question -
          </Animated.Text>

          {/* Ready Button */}
          {!areBothReady && !isPlayerReady && (
            <TouchableOpacity style={styles.readyButton} onPress={handleReady}>
              <Text style={styles.readyButtonText}>Ready</Text>
            </TouchableOpacity>
          )}

          {/* Waiting Indicator */}
          {isPlayerReady && !areBothReady && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color="#FF4B4B" />
              <Text style={styles.waitingText}>Waiting for the other player...</Text>
            </View>
          )}

          {/* Question and Done Button */}
          {areBothReady && (
            <Animated.View style={[styles.questionContainer, questionAnimatedStyle]}>
              <Text style={styles.questionText}>{question}</Text>
              <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101010',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  promptText: {
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: '#FF4B4B',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    paddingHorizontal: 20,
  },
  readyButton: {
    backgroundColor: '#FF4B4B',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    shadowColor: '#FF4B4B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 5,
    marginTop: 20,
    // Glowing effect
    shadowColor: '#FF4B4B',
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  readyButtonText: {
    color: '#FFFFFF',
    fontSize: width * 0.05,
    fontWeight: 'bold',
      // Add some text shadow for better visibility
    textShadowColor: '#FF4B4B',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  waitingText: {
    color: '#FFFFFF',
    fontSize: width * 0.04,
    marginLeft: 10,
  },
  questionContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  questionText: {
    fontSize: width * 0.07, // Increased font size
    color: '#FF4B4B',
    textAlign: 'center',
    textShadowColor: '#FF4B4B',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginBottom: 20,
  },
  doneButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
    position: 'absolute',
    bottom: -140,
  },
  doneButtonText: {
    color: '#FF4B4B',
    fontSize: width * 0.045,
    fontWeight: 'bold',
    // Add some text shadow for better visibility
    textShadowColor: '#FF4B4B',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
});

export default LoveQuestion;