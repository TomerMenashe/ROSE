// RoseApp/src/games/questions_and_tasks/PersonalQuestion.js

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { useNavigation, useRoute } from '@react-navigation/native';
import { firebase } from '../../firebase/firebase';
import * as FileSystem from 'expo-file-system';

const { width, height } = Dimensions.get('window');

const PersonalQuestion = () => {
  const [question, setQuestion] = useState('');
  const [player1Answer, setPlayer1Answer] = useState('');
  const [player2Guess, setPlayer2Guess] = useState('');
  const [role, setRole] = useState(null); // 'Player1' or 'Player2'
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fadeValue = useSharedValue(0);
  const scaleValue = useSharedValue(0.8);

  const navigation = useNavigation();
  const route = useRoute();
  const { pin, name, selfieURL } = route.params || {};

  useEffect(() => {
    if (!pin || !name) {
      Alert.alert('Error', 'Missing game information.');
      navigation.goBack();
      return;
    }

    const roomRef = firebase.database().ref(`rooms/${pin}/personalQuestion`);

    const fetchQuestion = async () => {
      try {
        const storageRef = firebase.storage().ref('personal_questions_rose.txt');
        const url = await storageRef.getDownloadURL();
        const downloadPath = `${FileSystem.documentDirectory}personal_questions_rose.txt`;
        const { uri } = await FileSystem.downloadAsync(url, downloadPath);
        const content = await FileSystem.readAsStringAsync(uri);
        const questions = content.split('\n').filter(q => q.trim() !== '');
        const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
        setQuestion(randomQuestion);

        // Determine roles based on existing answers
        const p1Snapshot = await roomRef.child('player1Answer').once('value');
        if (!p1Snapshot.exists()) {
          setRole('Player1');
        } else {
          setRole('Player2');
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching question:', error);
        Alert.alert('Error', 'Failed to fetch the question. Please try again.');
        navigation.goBack();
      }
    };

    fetchQuestion();

    // Animation setup
    fadeValue.value = withTiming(1, { duration: 2000, easing: Easing.out(Easing.ease) });
    scaleValue.value = withTiming(1, { duration: 2000, easing: Easing.out(Easing.ease) });

    return () => {};
  }, [pin, name, navigation, fadeValue, scaleValue]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeValue.value,
    transform: [{ scale: scaleValue.value }],
  }));

  const handlePlayer1Submit = async () => {
    if (player1Answer.trim() === '') {
      Alert.alert('Validation', 'Please enter your answer.');
      return;
    }

    setIsSubmitting(true);
    const roomRef = firebase.database().ref(`rooms/${pin}/personalQuestion`);

    try {
      await roomRef.child('player1Answer').set(player1Answer.trim());
      Alert.alert('Success', 'Your answer has been submitted.');
      setIsSubmitting(false);
      // Optionally, you can disable input or navigate to waiting screen
    } catch (error) {
      console.error('Error submitting answer:', error);
      Alert.alert('Error', 'Failed to submit your answer. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handlePlayer2Submit = async () => {
    if (player2Guess.trim() === '') {
      Alert.alert('Validation', 'Please enter your guess.');
      return;
    }

    setIsSubmitting(true);
    const roomRef = firebase.database().ref(`rooms/${pin}/personalQuestion`);

    try {
      await roomRef.child('player2Guess').set(player2Guess.trim());

      // Listen for both answers to be present
      roomRef.on('value', async (snapshot) => {
        const data = snapshot.val();
        if (data.player1Answer && data.player2Guess) {
          // Call backend function to get GPT comment
          const gptComment = await fetchGptComment(question, data.player1Answer, data.player2Guess);

          // Navigate to PersonalQuestionFeedback screen with all necessary data
          navigation.navigate('PersonalQuestionFeedback', { 
            pin, 
            name, 
            selfieURL, 
            question, 
            player1Answer: data.player1Answer, 
            player2Guess: data.player2Guess, 
            gptComment 
          });

          roomRef.off(); // Remove listener after navigation
        }
      });

      setIsSubmitting(false);
    } catch (error) {
      console.error('Error submitting guess:', error);
      Alert.alert('Error', 'Failed to submit your guess. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Function to call backend and fetch GPT comment
  const fetchGptComment = async (question, answer1, answer2) => {
    try {
      const response = await fetch('https://your-backend-endpoint.com/generate-comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question, answer1, answer2 }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch GPT comment.');
      }

      const data = await response.json();
      return data.comment;
    } catch (error) {
      console.error('Error fetching GPT comment:', error);
      return 'What a fascinating exchange of thoughts!';
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {isLoading ? (
        <ActivityIndicator size="large" color="#FF4B4B" />
      ) : (
        <>
          <Animated.View style={[styles.textContainer, animatedStyle]}>
            <Text style={styles.questionText}>{question}</Text>
          </Animated.View>

          {role === 'Player1' ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Enter your answer..."
                placeholderTextColor="#CCCCCC"
                value={player1Answer}
                onChangeText={setPlayer1Answer}
                multiline
              />
              <TouchableOpacity style={styles.button} onPress={handlePlayer1Submit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Submit Answer</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Enter your guess..."
                placeholderTextColor="#CCCCCC"
                value={player2Guess}
                onChangeText={setPlayer2Guess}
                multiline
              />
              <TouchableOpacity style={styles.button} onPress={handlePlayer2Submit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Submit Guess</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </>
      )}
    </KeyboardAvoidingView>
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
  questionText: {
    fontSize: width * 0.06,
    color: '#FF4B4B',
    textAlign: 'center',
    textShadowColor: '#FF4B4B',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  input: {
    width: '100%',
    height: 100,
    backgroundColor: '#1E1E1E',
    color: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    textAlignVertical: 'top',
    marginBottom: 20,
    fontSize: width * 0.045,
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
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: width * 0.05,
    fontWeight: 'bold',
  },
});

export default PersonalQuestion;