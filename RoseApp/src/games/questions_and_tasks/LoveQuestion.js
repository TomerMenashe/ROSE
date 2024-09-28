import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, ActivityIndicator } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { useNavigation, useRoute } from '@react-navigation/native';
import { firebase } from '../../firebase/firebase';
import * as FileSystem from 'expo-file-system';

const { width, height } = Dimensions.get('window');

const LoveQuestion = () => {
  const [question, setQuestion] = useState('');
  const navigation = useNavigation();
  const route = useRoute();
  const { pin } = route.params; // Updated to receive 'pin' instead of 'roomId'
  const fadeValue = useSharedValue(0);
  const scaleValue = useSharedValue(0.8);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const storageRef = firebase.storage().ref('love_questions_rose.txt');
        const url = await storageRef.getDownloadURL();
        const response = await FileSystem.downloadAsync(url, FileSystem.documentDirectory + 'love_questions_rose.txt');
        const content = await FileSystem.readAsStringAsync(response.uri);
        const questions = content.split('\n').filter(q => q.trim() !== '');
        const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
        
        // Store the question in Firebase Realtime Database using 'pin'
        const roomRef = firebase.database().ref(`rooms/${pin}`);
        await roomRef.child('currentQuestion').set(randomQuestion);
        
        setIsLoading(false); // Stop loading after fetching
      } catch (error) {
        console.error('Error fetching question:', error);
        Alert.alert('Error', 'Failed to fetch question. Please try again.');
        setIsLoading(false); // Stop loading even if there's an error
      }
    };

    const listenForQuestionChanges = () => {
      const roomRef = firebase.database().ref(`rooms/${pin}`);
      roomRef.child('currentQuestion').on('value', (snapshot) => {
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
      const roomRef = firebase.database().ref(`rooms/${pin}`);
      roomRef.child('currentQuestion').off();
    };
  }, [pin]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeValue.value,
    transform: [{ scale: scaleValue.value }],
  }));

  const handleProceed = () => {
    navigation.navigate('NextAdventureScreen'); // Replace with the actual screen name
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#FF4B4B" />
      ) : (
        <>
          <Animated.View style={[styles.textContainer, animatedStyle]}>
            <Text style={styles.promptText}>
              Let's take a small break from games and focus on each other. Try asking each other the next question and give your honest answer to each other.
            </Text>
            <Text style={styles.questionText}>{question}</Text>
          </Animated.View>
          <TouchableOpacity style={styles.button} onPress={handleProceed}>
            <Text style={styles.buttonText}>Proceed</Text>
          </TouchableOpacity>
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
  questionText: {
    fontSize: width * 0.06,
    color: '#FF4B4B',
    textAlign: 'center',
    textShadowColor: '#FF4B4B',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
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
