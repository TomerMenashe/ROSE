import React, { useState } from 'react';
import { View, Button, Text, StyleSheet, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getDatabase, ref, push } from 'firebase/database';

// Initialize Firebase Functions and Database
const functions = getFunctions();
const database = getDatabase();

const TestFaceSwap = () => {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userChoice, setUserChoice] = useState(null);

    // Function to call the swapFaces Cloud Function
    const handleFaceSwap = async () => {
        setLoading(true);
        setError(null);
        setResults(null);

        try {
            const swapFaces = httpsCallable(functions, 'swapFaces');
            const response = await swapFaces();
            setResults(response.data.results);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Function to handle saving the user's choice
    const handleSaveChoice = async () => {
        if (userChoice !== null) {
            try {
                const selectedPair = results[currentIndex];
                const choiceRef = ref(database, 'user_choices');
                await push(choiceRef, {
                    targetImagePair: selectedPair,
                    chosenUrl: userChoice === 1 ? selectedPair.url1 : selectedPair.url2,
                    timestamp: Date.now()
                });

                // Move to the next pair
                setCurrentIndex(currentIndex + 1);
                setUserChoice(null);
            } catch (error) {
                console.error('Error saving user choice:', error);
                setError('Failed to save choice. Please try again.');
            }
        }
    };

    // Render the question interface
    const renderQuestion = () => {
        if (results && currentIndex < results.length) {
            const pair = results[currentIndex];
            return (
                <View style={styles.questionContainer}>
                    <Text style={styles.questionText}>Who looks hotter?</Text>
                    <View style={styles.imageRow}>
                        <TouchableOpacity onPress={() => setUserChoice(1)} style={[styles.choiceContainer, userChoice === 1 && styles.selected]}>
                            <Image source={{ uri: pair.url1.toString() }} style={styles.image} />
                            <Text style={styles.choiceText}>Choice 1</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setUserChoice(2)} style={[styles.choiceContainer, userChoice === 2 && styles.selected]}>
                            <Image source={{ uri: pair.url2.toString() }} style={styles.image} />
                            <Text style={styles.choiceText}>Choice 2</Text>
                        </TouchableOpacity>
                    </View>
                    <Button title="Submit Choice" onPress={handleSaveChoice} disabled={userChoice === null} />
                </View>
            );
        }

        if (results && currentIndex >= results.length) {
            return <Text style={styles.completeText}>Thank you for your responses!</Text>;
        }

        return null;
    };

    return (
        <View style={styles.container}>
            <Button title="Activate FaceSwap" onPress={handleFaceSwap} />
            {loading && <ActivityIndicator size="large" color="#0000ff" />}
            {renderQuestion()}
            {error && <Text style={styles.errorText}>Error: {error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    questionContainer: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 5,
        alignItems: 'center',
    },
    questionText: {
        fontSize: 18,
        marginBottom: 10,
        fontWeight: 'bold',
    },
    imageRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10,
    },
    choiceContainer: {
        alignItems: 'center',
        marginHorizontal: 10,
    },
    selected: {
        borderColor: 'blue',
        borderWidth: 2,
        borderRadius: 5,
    },
    image: {
        width: 150,
        height: 150,
        marginBottom: 5,
        borderRadius: 5,
    },
    choiceText: {
        fontSize: 16,
    },
    completeText: {
        fontSize: 18,
        marginTop: 20,
        color: 'green',
        fontWeight: 'bold',
    },
    errorText: {
        color: 'red',
        marginTop: 10,
    },
});

export default TestFaceSwap;
