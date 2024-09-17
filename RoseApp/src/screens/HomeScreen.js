import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Animated, Dimensions, ScrollView } from 'react-native';
// Import Firebase
import { firebase } from '../firebase/firebase';  // Adjust the path as needed

const { height, width } = Dimensions.get('window');  // Get the screen height and width

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);  // State to hold the current user

  const fadeAnim1 = useRef(new Animated.Value(0)).current;
  const fadeAnim2 = useRef(new Animated.Value(0)).current;
  const fadeAnim3 = useRef(new Animated.Value(0)).current;
  const fadeAnim4 = useRef(new Animated.Value(0)).current;
  const fadeAnim5 = useRef(new Animated.Value(0)).current; // For the rest of the sentence

  // Subscribe to authentication state changes
  useEffect(() => {
    const subscriber = firebase.auth().onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        // If user is not logged in, navigate to Login screen
        navigation.replace('Login');
      }
    });
    return subscriber; // Unsubscribe on unmount
  }, []);

  // Animate the letters when the user is set
  useEffect(() => {
    if (user) {
      Animated.sequence([
        Animated.timing(fadeAnim1, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim2, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim3, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim4, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim5, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [user]);

  if (!user) {
    // Render nothing or a loader until the user is fetched
    return null;
  }

  const username = user.displayName ? user.displayName : user.email;

  return (
      <ImageBackground
          source={require('../../assets/createGameBack.jpeg')}  // Background image
          style={styles.background}
          resizeMode="cover"
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.greetingContainer}>
            {/* Animated Greeting */}
            <Animated.Text style={[styles.letter, { opacity: fadeAnim1 }]}>
              {username.charAt(0).toUpperCase()}
            </Animated.Text>
            <Animated.Text style={[styles.letter, { opacity: fadeAnim2 }]}>
              {username.charAt(1).toUpperCase()}
            </Animated.Text>
            <Animated.Text style={[styles.letter, { opacity: fadeAnim3 }]}>
              {username.charAt(2).toUpperCase()}
            </Animated.Text>
            <Animated.Text style={[styles.letter, { opacity: fadeAnim4 }]}>
              {username.slice(3).toUpperCase()}{/* Display the rest of the username */}
            </Animated.Text>
            <Animated.Text style={[styles.greeting, { opacity: fadeAnim5 }]}>
              , Are you ready to get in Love?
            </Animated.Text>
          </View>

          {/* Create Game Button */}
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CreateGame')}>
            <Text style={styles.buttonText}>Create Game</Text>
          </TouchableOpacity>

          {/* Join Game Button */}
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('JoinGame')}>
            <Text style={styles.buttonText}>Join Game</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Settings Button */}
        <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.settingsText}>⚙️</Text>
        </TouchableOpacity>
      </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  greetingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,  // Increased space below the greeting
    marginTop: -70,   // Move the greeting higher on the screen
  },
  letter: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Doodle-Font',  // Custom font for animation
    color: '#FFFFFF',
  },
  greeting: {
    fontSize: 27,
    fontFamily: 'Doodle-Font',  // Custom font for "Are you ready"
    color: '#FFFFFF',
  },
  button: {
    backgroundColor: '#FF4B4B',
    paddingVertical: 20,  // Adjusted padding
    borderRadius: 20,     // Adjusted radius for a smoother look
    marginBottom: 40,     // Increased margin to create more space between buttons
    width: width * 0.8,   // 80% of the screen width
    height: height * 0.08, // 8% of the screen height to make buttons large
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  settingsButton: {
    position: 'absolute',
    bottom: 50,
    right: 20,
    backgroundColor: '#FF4B4B',
    padding: 10,
    borderRadius: 70,
  },
  settingsText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
});

export default HomeScreen;
