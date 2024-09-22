import React, { useState, useEffect } from "react";
import { Alert, Text, View, StyleSheet, ActivityIndicator, ImageBackground, TouchableOpacity } from "react-native";
import { firebase } from "../../firebase/firebase";
import { getFunctions, httpsCallable } from 'firebase/functions';  // Import Firebase functions
import { useNavigation } from '@react-navigation/native';  // Import navigation hook

const PhotoEscapeLimerickScreen = ({ route }) => {
    const navigation = useNavigation();
    const { pin, gameNumber = 1 } = route.params;  // Get the pin and game number
    const [limerickResponse, setLimerickResponse] = useState('');  // State to hold the limerick response
    const [loading, setLoading] = useState(false);  // State to handle loading UI
    const [itemName, setItemName] = useState('');  // State to store the item name

    const functions = getFunctions(firebase.app(), 'us-central1');  // Initialize Firebase Functions

    // Function to call the getHamshir Firebase function with a static object ('bottle')
    const callGenerateItemAndLimerick = async () => {
        setLoading(true);  // Show the loading indicator
        try {
            const getItem = httpsCallable(functions, 'getRandomItem')
            const resultItem = await getItem();
            const selectedItem = resultItem.data;
            const getHamshir = httpsCallable(functions, 'getHamshir');
            const result = await getHamshir({ item: selectedItem});  // Pass 'bottle' as the static object

            const { response } = result.data;  // Extract the limerick response from backend
            setLimerickResponse(response);  // Set the response in the state to display it
            setItemName(selectedItem);  // Set the item name (could be dynamic if you modify the backend)
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to generate a limerick. Please try again.');
        } finally {
            setLoading(false);  // Hide the loading indicator
        }
    };

    // Automatically call the function when the screen loads
    useEffect(() => {
        callGenerateItemAndLimerick();
    }, []);

    // Navigate to the camera screen, passing the item name
    const startSearch = () => {
        navigation.navigate('PhotoEscapeCamera', { pin, gameNumber, itemName });  // Pass the item name along with pin and gameNumber
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
                    <ActivityIndicator size="large" color="#FFFFFF" />
                ) : (
                    <>
                        {/* Display the limerick */}
                        <Text style={styles.limerickText}>{limerickResponse}</Text>
                    </>
                )}

                {/* Button to start searching for the object */}
                <View style={styles.searchButtonContainer}>
                    <Text style={styles.hintText}>When ready, tap below to start searching!</Text>
                    <TouchableOpacity style={styles.button} onPress={startSearch} disabled={loading}>
                        <Text style={styles.buttonText}>Start Search</Text>
                    </TouchableOpacity>
                </View>
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
        fontSize: 32,  // Increased size
        fontWeight: 'bold',
        color: '#FFFFFF',  // Change color to white for better visibility on background
        marginBottom: 20,
        textAlign: 'center',
    },
    limerickText: {
        fontSize: 24,  // Make the limerick text bigger
        color: '#FFFFFF',  // Change to white for better contrast on background
        textAlign: 'center',
        marginBottom: 30,  // Add more margin for better spacing
        paddingHorizontal: 20,
        fontStyle: 'italic',  // Add a bit of styling
        lineHeight: 34,  // Increase line height for better readability
    },
    searchButtonContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    hintText: {
        fontSize: 16,
        color: '#FFFFFF',
        marginBottom: 10,
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
