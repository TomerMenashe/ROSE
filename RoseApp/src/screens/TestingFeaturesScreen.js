import React, { useState } from "react";
import { Alert, Pressable, Text, View, StyleSheet } from "react-native";
import { firebase } from "../firebase/firebase";
import { getFunctions, httpsCallable } from 'firebase/functions';  // Import Firebase functions

const TestingFeaturesScreen = () => {
    const [testResponse, setTestResponse] = useState('');  // State to hold the test response

    // Initialize Firebase Functions inside the component
    const functions = getFunctions(firebase.app(), 'us-central1');  // Replace 'us-central1' with your region

    // Function to call the testGenerateResponse Firebase function
    const callTestGenerateResponse = async () => {
        try {
            const generateResponse = httpsCallable(functions, 'testGenerateResponse');
            const result = await generateResponse();
            const { response } = result.data;
            setTestResponse(response);
            Alert.alert('Test Response', response);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to get response from the server.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Here we test features</Text>

            <Pressable style={styles.testButton} onPress={callTestGenerateResponse}>
                <Text style={styles.buttonText}>Test Generate Response</Text>
            </Pressable>

            {/* Display Test Response */}
            {testResponse !== '' && (
                <View style={styles.responseContainer}>
                    <Text style={styles.responseText}>{testResponse}</Text>
                </View>
            )}
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',  // Center vertically
        alignItems: 'center',      // Center horizontally
        backgroundColor: '#f0f0f0', // Light background color
        padding: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 30,
    },
    testButton: {
        backgroundColor: '#4B94FF',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
        marginBottom: 20,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    responseContainer: {
        marginTop: 20,
        padding: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 10,
        width: '80%',
    },
    responseText: {
        fontSize: 16,
        color: '#000000',
        textAlign: 'center',
    },
});

export default TestingFeaturesScreen;
