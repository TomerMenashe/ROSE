// RoseApp/src/games/questions_and_tasks/PersonalQuestion.js

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { useNavigation, useRoute } from '@react-navigation/native';
import { firebase } from '../../firebase/firebase';
import * as FileSystem from 'expo-file-system';

const { width } = Dimensions.get('window');

const PersonalQuestion = () => {
  const [question, setQuestion] = useState('');
  const [subjectAnswer, setSubjectAnswer] = useState('');
  const [guesserGuess, setGuesserGuess] = useState('');
  const [role, setRole] = useState(null); // 'Subject' or 'Guesser'
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [guesserName, setGuesserName] = useState('');
  const [processingResult, setProcessingResult] = useState(false);

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

    const roomRef = firebase.database().ref(`room/${pin}/personalQuestion`);

    const setupGame = async () => {
      try {
        // Check if roles are already set
        const rolesSnapshot = await roomRef.child('roles').once('value');
        if (!rolesSnapshot.exists()) {
          // Roles not set, set them now
          const participantsSnapshot = await firebase.database().ref(`room/${pin}/participants`).once('value');
          const participantsData = participantsSnapshot.val();
          const participantNames = Object.keys(participantsData);

          if (participantNames.length < 2) {
            Alert.alert('Error', 'Not enough participants.');
            navigation.goBack();
            return;
          }

          // Randomly assign subject and guesser
          const shuffledNames = participantNames.sort(() => 0.5 - Math.random());
          const [subject, guesser] = shuffledNames;

          // Store in database
          await roomRef.child('roles').set({ subjectName: subject, guesserName: guesser });

          // Set local state
          setSubjectName(subject);
          setGuesserName(guesser);

          setRole(name === subject ? 'Subject' : 'Guesser');
        } else {
          // Roles already set, get them
          const rolesData = rolesSnapshot.val();
          setSubjectName(rolesData.subjectName);
          setGuesserName(rolesData.guesserName);

          setRole(name === rolesData.subjectName ? 'Subject' : 'Guesser');
        }

        // Fetch or generate question
        const questionSnapshot = await roomRef.child('question').once('value');
        if (!questionSnapshot.exists()) {
          // Fetch and store question
          const storageRef = firebase.storage().ref('personal_questions_rose.txt');
          const url = await storageRef.getDownloadURL();
          const downloadPath = `${FileSystem.documentDirectory}personal_questions_rose.txt`;
          const { uri } = await FileSystem.downloadAsync(url, downloadPath);
          const content = await FileSystem.readAsStringAsync(uri);
          const questions = content.split('\n').filter(q => q.trim() !== '');
          const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

          // Store question in database
          await roomRef.child('question').set(randomQuestion);

          // Set local state
          setQuestion(randomQuestion);
        } else {
          // Question already exists
          setQuestion(questionSnapshot.val());
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error setting up game:', error);
        Alert.alert('Error', 'Failed to set up the game. Please try again.');
        navigation.goBack();
      }
    };

    setupGame();

    // Animation setup
    fadeValue.value = withTiming(1, { duration: 2000, easing: Easing.out(Easing.ease) });
    scaleValue.value = withTiming(1, { duration: 2000, easing: Easing.out(Easing.ease) });

    return () => {};
  }, [pin, name, navigation, fadeValue, scaleValue]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeValue.value,
    transform: [{ scale: scaleValue.value }],
  }));


  const handleSubjectSubmit = async () => {
    if (subjectAnswer.trim() === '') {
      Alert.alert('Validation', 'Please enter your answer.');
      return;
    }

    setIsSubmitting(true);
    const roomRef = firebase.database().ref(`room/${pin}/personalQuestion`);

    try {
      await roomRef.child('subjectAnswer').set({
        name: name,
        answer: subjectAnswer.trim(),
      });
      Alert.alert('Success', 'Your answer has been submitted.');
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error submitting answer:', error);
      Alert.alert('Error', 'Failed to submit your answer. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleGuesserSubmit = async () => {
    if (guesserGuess.trim() === '') {
      Alert.alert('Validation', 'Please enter your guess.');
      return;
    }

    setIsSubmitting(true);
    const roomRef = firebase.database().ref(`room/${pin}/personalQuestion`);

    try {
      await roomRef.child('guesserGuess').set({
        name: name,
        guess: guesserGuess.trim(),
      });
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error submitting guess:', error);
      Alert.alert('Error', 'Failed to submit your guess. Please try again.');
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const roomRef = firebase.database().ref(`room/${pin}/personalQuestion`);

    const onDataChange = async (snapshot) => {
      const data = snapshot.val();
      if (data.subjectAnswer && data.guesserGuess && !processingResult) {
        setProcessingResult(true);
        try {
          // Call backend function to get GPT comment
          const getPersonalQuestionFeedback = firebase.functions().httpsCallable('getPersonalQuestionFeedback');

          const response = await getPersonalQuestionFeedback({
            subjectName: data.subjectAnswer.name,
            subjectAnswer: data.subjectAnswer.answer,
            guesserName: data.guesserGuess.name,
            guesserGuess: data.guesserGuess.guess,
            question: data.question || question,
          });

          const gptComment = response.data.comment;

          // Navigate to PersonalQuestionFeedback screen with all necessary data
          navigation.navigate('PersonalQuestionFeedback', {
            pin,
            name,
            selfieURL,
            question: data.question || question,
            subjectName: data.subjectAnswer.name,
            subjectAnswer: data.subjectAnswer.answer,
            guesserName: data.guesserGuess.name,
            guesserGuess: data.guesserGuess.guess,
            gptComment,
          });

          roomRef.off('value', onDataChange);
        } catch (error) {
          console.error('Error fetching GPT comment:', error);
          Alert.alert('Error', 'Failed to fetch feedback. Please try again.');
          setProcessingResult(false);
        }
      }
    };

    roomRef.on('value', onDataChange);

    return () => {
      roomRef.off('value', onDataChange);
    };
  }, [pin, question, processingResult, name, selfieURL, navigation]);

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
            <Text style={styles.questionText}>
              {`Question for ${subjectName}:`}
            </Text>
            <Text style={styles.questionText}>{question}</Text>
          </Animated.View>

          {role === 'Subject' ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Enter your answer..."
                placeholderTextColor="#CCCCCC"
                value={subjectAnswer}
                onChangeText={setSubjectAnswer}
                multiline
              />
              <TouchableOpacity style={styles.button} onPress={handleSubjectSubmit} disabled={isSubmitting}>
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
                placeholder={`Guess ${subjectName}'s answer...`}
                placeholderTextColor="#CCCCCC"
                value={guesserGuess}
                onChangeText={setGuesserGuess}
                multiline
              />
              <TouchableOpacity style={styles.button} onPress={handleGuesserSubmit} disabled={isSubmitting}>
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