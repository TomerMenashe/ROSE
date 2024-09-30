import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, ActivityIndicator } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { useNavigation, useRoute } from '@react-navigation/native';
import { firebase } from '../../firebase/firebase';
import * as FileSystem from 'expo-file-system';

const { width, height } = Dimensions.get('window');

const LoveQuestion = () => {
  const [question, setQuestion] = useState('');
  const navigation = useNavigation();
  const route = useRoute();
  const { pin, name, selfieURL } = route.params || {};
  const fadeValue = useSharedValue(0);
  const scaleValue = useSharedValue(0.8);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [areBothReady, setAreBothReady] = useState(false);
  const [isOtherPlayerReady, setIsOtherPlayerReady] = useState(false);

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
        } else if (readyPlayers.length === 1) {
          if (readyPlayers[0] !== name) {
            setIsOtherPlayerReady(true);
          }
        }
      }
    };

    roomRef.on('value', handleReadyStatus);

    return () => {
      roomRef.off('value', handleReadyStatus);
    };
  }, [pin, name]);

  const handleReady = async () => {
    try {
      const readyRef = firebase.database().ref(`room/${pin}/readyStatus/${name}`);
      await readyRef.set(true);
      setIsPlayerReady(true);
    } catch (error) {
      console.error('Error setting ready status:', error);
      Alert.alert('Error', 'Failed to set ready status. Please try again.');
    }
  };

  const handleProceed = () => {
    if (!pin || !name || !selfieURL) {
      Alert.alert('Error', 'Missing game information. Please try again.');
      return;
    }

    navigation.navigate('PersonalQuestion', { pin, name, selfieURL });
  };

  // Animated styles for question and proceed button
  const questionAnimatedStyle = useAnimatedStyle(() => ({
    opacity: areBothReady ? withTiming(1, { duration: 1000 }) : withTiming(0, { duration: 500 }),
    transform: [{ scale: areBothReady ? withTiming(1, { duration: 1000 }) : withTiming(0.8, { duration: 500 }) }],
  }));

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#FF4B4B" />
      ) : (
        <>
          <Animated.View style={[styles.textContainer, questionAnimatedStyle]}>
            <Text style={styles.promptText}>
              For a moment,
              let's take little break from the games and turn our attention to our significant other. 
              Sit back, relax and look into each other's eyes.
              Open your heart, be honest as much as you can and ask your partner the next question -
            </Text>
          </Animated.View>

          {!areBothReady && !isPlayerReady && (
            <TouchableOpacity style={styles.readyButton} onPress={handleReady}>
              <Text style={styles.readyButtonText}>Ready</Text>
            </TouchableOpacity>
          )}

          {isPlayerReady && !areBothReady && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color="#FF4B4B" />
              <Text style={styles.waitingText}>Waiting for the other player...</Text>
            </View>
          )}

          {areBothReady && (
            <Animated.View
              entering={FadeIn.duration(500)}
              exiting={FadeOut.duration(500)}
              style={styles.questionContainer}
            >
              <Text style={styles.questionText}>{question}</Text>
              <TouchableOpacity style={styles.button} onPress={handleProceed}>
                <Text style={styles.buttonText}>Proceed</Text>
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
  textContainer: {
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  promptText: {
    fontSize: width * 0.05,
    color: '#FF4B4B',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: '#FF4B4B',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  readyButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 5,
    marginTop: 20,
  },
  readyButtonText: {
    color: '#FFFFFF',
    fontSize: width * 0.05,
    fontWeight: 'bold',
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
  },
  questionText: {
    fontSize: width * 0.06,
    color: '#FF4B4B',
    textAlign: 'center',
    textShadowColor: '#FF4B4B',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FF4B4B',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    shadowColor: '#FF4B4B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: width * 0.05,
    fontWeight: 'bold',
  },
});

export default LoveQuestion;