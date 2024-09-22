import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, Pressable, Dimensions, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

// Import Firebase
import { firebase } from '../firebase/firebase';  // Adjust the path as needed

const { height, width } = Dimensions.get('window');  // Get the screen height and width

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);  // State to hold the current user

  // Initialize shared values for each letter's opacity
  const fadeAnim1 = useSharedValue(0);
  const fadeAnim2 = useSharedValue(0);
  const fadeAnim3 = useSharedValue(0);
  const fadeAnim4 = useSharedValue(0);
  const fadeAnim5 = useSharedValue(0); // For the rest of the sentence

  // Define animated styles for each letter
  const animatedStyle1 = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim1.value,
    };
  });

  const animatedStyle2 = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim2.value,
    };
  });

  const animatedStyle3 = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim3.value,
    };
  });

  const animatedStyle4 = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim4.value,
    };
  });

  const animatedStyle5 = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim5.value,
    };
  });

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
      // Sequentially animate each letter's opacity
      fadeAnim1.value = withTiming(1, { duration: 500 }, () => {
        fadeAnim2.value = withTiming(1, { duration: 500 }, () => {
          fadeAnim3.value = withTiming(1, { duration: 500 }, () => {
            fadeAnim4.value = withTiming(1, { duration: 500 }, () => {
              fadeAnim5.value = withTiming(1, { duration: 500 });
            });
          });
        });
      });
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
        {/* Admin Name at the Top */}
        <View style={styles.adminContainer}>
          <Animated.Text style={[styles.adminText, animatedStyle1]}>
            {username.charAt(0).toUpperCase()}
          </Animated.Text>
          <Animated.Text style={[styles.adminText, animatedStyle2]}>
            {username.charAt(1).toUpperCase()}
          </Animated.Text>
          <Animated.Text style={[styles.adminText, animatedStyle3]}>
            {username.charAt(2).toUpperCase()}
          </Animated.Text>
          <Animated.Text style={[styles.adminText, animatedStyle4]}>
            {username.slice(3).toUpperCase()} {/* Display the rest of the username */}
          </Animated.Text>
        </View>

        <View style={styles.greetingContainer}>
          {/* Animated Greeting */}
          <Animated.Text style={[styles.greeting, animatedStyle5]}>
            Are you ready to get in Love?
          </Animated.Text>
        </View>

        {/* Create Game Button */}
        <Pressable style={styles.button} onPress={() => navigation.navigate('CreateGame')}>
          <Text style={styles.buttonText}>Create Game</Text>
        </Pressable>

        {/* Join Game Button */}
        <Pressable style={styles.button} onPress={() => navigation.navigate('JoinGame')}>
          <Text style={styles.buttonText}>Join Game</Text>
        </Pressable>
      </ScrollView>

      {/* Settings Button */}
      <Pressable style={styles.settingsButton} onPress={() => navigation.navigate('Settings')}>
        <Text style={styles.settingsText}>⚙️</Text>
      </Pressable>
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
  adminContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 90,  // Increased space below the admin name
    marginTop: -100,   // Move the admin name higher on the screen
  },
  adminText: {
    fontSize: 34,
    fontWeight: 'bold',
    fontFamily: 'Doodle-Font',  // Custom font for the admin name
    color: '#FFFFFF',
  },
  greetingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 150,  // Increased space below the greeting
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
