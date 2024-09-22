import React, { useState } from "react";
import { Alert, Pressable, Text, View, StyleSheet, ActivityIndicator, ImageBackground } from "react-native";
import { firebase } from "../../firebase/firebase";
import { getFunctions, httpsCallable } from 'firebase/functions';  // Import Firebase functions
import { useNavigation } from '@react-navigation/native';  // Import navigation hook

const PhotoEscapeLimerickScreen = ({ route }) => {
    const navigation = useNavigation();
    const { pin, gameNumber = 1 } = route.params;  // Get the pin and game number
    const [limerickResponse, setLimerickResponse] = useState('');  // State to hold the limerick response
    const [loading, setLoading] = useState(false);  // State to handle loading UI

    const functions = getFunctions(firebase.app(), 'us-central1');  // Initialize Firebase Functions

    // Function to call the generateItemAndLimerick Firebase function
    const callGenerateItemAndLimerick = async () => {
        try {
            const generateItemAndLimerick = httpsCallable(functions, 'generateItemAndLimerick');
            const result = await generateItemAndLimerick();
            const { item, limerick } = result.data;
            const response = `Limerick: ${limerick}\n\nHint: The item is related to a ${item}`;
            setLimerickResponse(response);  // Fixing the setTestResponse to setLimerickResponse
            Alert.alert('Generated Limerick', response);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to generate a limerick. Please try again.');
        }
    };

    // Navigate to the camera screen
    const startSearch = () => {
        navigation.navigate('PhotoEscapeCamera', { pin, gameNumber });
    };

    return (
        <ImageBackground
            source={require('./assets/background.jpeg')}  // Set your background image here
            style={styles.background}
            resizeMode="cover"
        >
            <View style={styles.container}>
                <Text style={styles.header}>Find the Object</Text>

                {/* Loading Indicator */}
                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    <>
                        {/* Display the limerick and hint about the item */}
                        <Text style={styles.limerickText}>{limerickResponse}</Text>
                    </>
                )}

                {/* Button to start generating the limerick */}
                <Pressable style={styles.button} onPress={callGenerateItemAndLimerick} disabled={loading}>
                    <Text style={styles.buttonText}>Generate Limerick</Text>
                </Pressable>

                {/* Button to start searching for the object */}
                <Pressable style={styles.button} onPress={startSearch} disabled={loading}>
                    <Text style={styles.buttonText}>Start Search</Text>
                </Pressable>
            </View>
        </ImageBackground>
    );
};

// Styles for the component
const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',  // Change color to white for better visibility on background
        marginBottom: 20,
    },
    limerickText: {
        fontSize: 18,
        color: '#FFFFFF',  // Change to white for better contrast on background
        textAlign: 'center',
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    button: {
        backgroundColor: '#FF4B4B',  // Red button style
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 10,
        marginBottom: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default PhotoEscapeLimerickScreen;
