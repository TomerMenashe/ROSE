import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { useNavigation, useRoute } from '@react-navigation/native';
import { firebase } from '../../firebase/firebase';
import usePreventBack from "../../components/usePreventBack"; // **Added Import**

const { width } = Dimensions.get('window');

const PersonalQuestionFeedback = () => {
  usePreventBack(); // **Added Hook Call**
  const navigation = useNavigation();
  const route = useRoute();
  const {
    pin,
    name,
    selfieURL,
    question,
    subjectName,
    subjectAnswer,
    guesserName,
    guesserGuess,
    gptComment,
  } = route.params || {}; // Updated destructuring

  const fadeValue = useSharedValue(0);
  const scaleValue = useSharedValue(0.8);

  const [isClearing, setIsClearing] = React.useState(false); // **New State for Loader**

  React.useEffect(() => {
    fadeValue.value = withTiming(1, {
      duration: 2000,
      easing: Easing.out(Easing.ease),
    });
    scaleValue.value = withTiming(1, {
      duration: 2000,
      easing: Easing.out(Easing.ease),
    });
  }, [fadeValue, scaleValue]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeValue.value,
    transform: [{ scale: scaleValue.value }],
  }));

  const handleReturn = async () => { // **Updated Function**
    setIsClearing(true); // **Show Loader**

    try {
      const roomRef = firebase.database().ref(`room/${pin}/personalQuestion`);

      // Remove generated fields
      await Promise.all([
        roomRef.child('question').remove(),
        roomRef.child('subjectAnswer').remove(),
        roomRef.child('guesserGuess').remove(),
        roomRef.child('feedback').remove(),
      ]);

      // Navigate to the next screen after clearing
      navigation.replace('GameController', { pin, name, selfieURL });
    } catch (error) {
      console.error('Error clearing game data:', error);
      Alert.alert('Error', 'Failed to prepare for the next adventure. Please try again.');
      setIsClearing(false); // **Hide Loader on Error**
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Animated.View style={[styles.commentContainer, animatedStyle]}>
        <Text style={styles.commentText}>
          {typeof gptComment === 'string'
            ? gptComment
            : JSON.stringify(gptComment) || 'No feedback available.'}
        </Text>
      </Animated.View>
      
      <View style={styles.answersContainer}>
        <View style={styles.userAnswer}>
          <Text style={styles.userLabel}>{subjectName} wrote:</Text>
          <Text style={styles.answerText}>{subjectAnswer}</Text>
        </View>
        <View style={styles.userAnswer}>
          <Text style={styles.userLabel}>{guesserName} guessed:</Text>
          <Text style={styles.answerText}>{guesserGuess}</Text>
        </View>
      </View>

      {/* **Loader Display While Clearing Data** */}
      {isClearing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#FF4B4B" />
          <Text style={styles.loadingText}>Preparing next adventure...</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleReturn}>
          <Text style={styles.buttonText}>Next adventure</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#101010',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  commentContainer: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  commentText: {
    fontSize: width * 0.05,
    color: '#FF4B4B',
    textAlign: 'center',
    textShadowColor: '#FF4B4B',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  answersContainer: {
    width: '100%',
    marginBottom: 40,
  },
  userAnswer: {
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  userLabel: {
    fontSize: width * 0.045,
    color: '#FF4B4B',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  answerText: {
    fontSize: width * 0.04,
    color: '#FFFFFF',
    textAlign: 'center',
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
    width: '80%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: width * 0.05,
    fontWeight: 'bold',
  },
  loaderContainer: { // **New Styles for Loader**
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#FF4B4B',
    fontSize: width * 0.045,
    textAlign: 'center',
  },
});

export default PersonalQuestionFeedback;