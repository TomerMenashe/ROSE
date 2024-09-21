import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { height, width } = Dimensions.get('window');

const PhotoEscapeLimerickScreen = ({ limerick }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Limerick at the top */}
      <View style={styles.limerickContainer}>
        <Text style={styles.limerickText}>{limerick}</Text>
      </View>

      {/* Button at the bottom */}
      <Pressable
        style={styles.button}
        onPress={() => navigation.navigate('PhotoEscapeCamera')}
      >
        <Text style={styles.buttonText}>Take a Picture!</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  limerickContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    width: width * 0.9,  // 90% width of the screen
    paddingTop: 50,  // Add padding to push limerick down a bit
  },
  limerickText: {
    fontSize: 24,
    textAlign: 'center',
    color: '#333',
  },
  button: {
    backgroundColor: '#FF4B4B',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginBottom: 30,  // Push button a bit higher from the bottom
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PhotoEscapeLimerickScreen;
