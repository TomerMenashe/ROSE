import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, ScrollView } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const PersonalQuestionFeedback = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { pin, name, selfieURL, question, player1Answer, player2Guess, gptComment } = route.params || {};

  const fadeValue = useSharedValue(0);
  const scaleValue = useSharedValue(0.8);

  React.useEffect(() => {
    fadeValue.value = withTiming(1, { duration: 2000, easing: Easing.out(Easing.ease) });
    scaleValue.value = withTiming(1, { duration: 2000, easing: Easing.out(Easing.ease) });
  }, [fadeValue, scaleValue]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeValue.value,
    transform: [{ scale: scaleValue.value }],
  }));

  const handleReturn = () => {
    navigation.navigate('GameController', { pin, name, selfieURL });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Animated.View style={[styles.commentContainer, animatedStyle]}>
        <Text style={styles.commentText}>{gptComment}</Text>
      </Animated.View>
      
      <View style={styles.answersContainer}>
        <View style={styles.userAnswer}>
          <Text style={styles.userLabel}>Player 1 wrote:</Text>
          <Text style={styles.answerText}>{player1Answer}</Text>
        </View>
        <View style={styles.userAnswer}>
          <Text style={styles.userLabel}>Player 2 guessed:</Text>
          <Text style={styles.answerText}>{player2Guess}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleReturn}>
        <Text style={styles.buttonText}>Return to Game</Text>
      </TouchableOpacity>
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
});

export default PersonalQuestionFeedback;
