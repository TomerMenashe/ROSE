// /src/screens/FaceSwap.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, TouchableOpacity, Dimensions, ImageBackground } from 'react-native';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getDatabase, ref, push, get } from 'firebase/database';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from 'react-native-reanimated';

// Initialize Firebase Functions and Database
const functions = getFunctions();
const database = getDatabase();
const { height, width } = Dimensions.get('window');

const FaceSwap = () => {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userChoice, setUserChoice] = useState(null);
    const [pin, setPin] = useState(null);

    // Shared values for animations
    const fadeAnim = useSharedValue(0);
    const slideAnim = useSharedValue(500);

    // Animated styles
    const fadeInStyle = useAnimatedStyle(() => ({
        opacity: fadeAnim.value,
    }));

    const slideInStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: slideAnim.value }],
    }));

    // Fetch the pin if it exists
    useEffect(() => {
        const fetchPin = async () => {
            try {
                const participantsRef = ref(database, 'room');
                const snapshot = await get(participantsRef);
                if (snapshot.exists()) {
                    snapshot.forEach((room) => {
                        const roomId = room.key;
                        const participants = room.val().participants;
                        if (participants) {
                            setPin(roomId);
                        }
                    });
                }
            } catch (error) {
                console.error("Error fetching the pin:", error);
            }
        };

        fetchPin();
    }, []);

    // Function to call the swapFaces Cloud Function
    const handleFaceSwap = async () => {
        setLoading(true);
        setError(null);
        setResults(null);

        try {
            const swapFaces = httpsCallable(functions, 'swapFaces');
            const response = await swapFaces();
            setResults(response.data.results);
            fadeAnim.value = withTiming(1, { duration: 1000 });
            slideAnim.value = withTiming(0, { duration: 1000 });
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
                const basePath = pin ? `room/${pin}/faceSwaps` : 'GeneralFaceSwaps';

                // Save the images
                const imagesRef = ref(database, `${basePath}/images`);
                await push(imagesRef, {
                    url1: selectedPair.url1,
                    url2: selectedPair.url2,
                    timestamp: Date.now(),
                });

                // Save the pick
                const picksRef = ref(database, `${basePath}/picks`);
                await push(picksRef, {
                    chosenUrl: userChoice === 1 ? selectedPair.url1 : selectedPair.url2,
                    timestamp: Date.now(),
                });

                // Move to the next pair with a slight delay for better experience
                setTimeout(() => {
                    setCurrentIndex(currentIndex + 1);
                    setUserChoice(null);
                    fadeAnim.value = 0;
                    slideAnim.value = 500;
                    fadeAnim.value = withTiming(1, { duration: 1000 });
                    slideAnim.value = withTiming(0, { duration: 1000 });
                }, 500);
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
                <Animated.View style={[styles.questionContainer, fadeInStyle]}>
                    <Text style={styles.questionText}>Who looks hotter?</Text>
                    <View style={styles.imageRow}>
                        <TouchableOpacity onPress={() => setUserChoice(1)} style={[styles.choiceContainer, userChoice === 1 && styles.selected]}>
                            <Image
                                source={{ uri: pair.url1.toString() }}
                                style={styles.image}
                                resizeMode="contain" // Ensures the entire image is visible
                            />
                            <Text style={styles.choiceText}>Choice 1</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setUserChoice(2)} style={[styles.choiceContainer, userChoice === 2 && styles.selected]}>
                            <Image
                                source={{ uri: pair.url2.toString() }}
                                style={styles.image}
                                resizeMode="contain" // Ensures the entire image is visible
                            />
                            <Text style={styles.choiceText}>Choice 2</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.submitButton} onPress={handleSaveChoice} disabled={userChoice === null}>
                        <Text style={styles.submitButtonText}>Submit Choice</Text>
                    </TouchableOpacity>
                </Animated.View>
            );
        }

        if (results && currentIndex >= results.length) {
            return <Text style={styles.completeText}>Thank you for your responses!</Text>;
        }

        return null;
    };

    return (
        <ImageBackground
            source={require('../../../assets/background.jpeg')}
            style={styles.background}
            resizeMode="cover"
        >
            <View style={styles.container}>
                <TouchableOpacity style={styles.activateButton} onPress={handleFaceSwap}>
                    <Text style={styles.activateButtonText}>Activate FaceSwap</Text>
                </TouchableOpacity>
                {loading && <ActivityIndicator size="large" color="#FFFFFF" />}
                {renderQuestion()}
                {error && <Text style={styles.errorText}>Error: {error}</Text>}
            </View>
        </ImageBackground>
    );
};

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
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background for better contrast
    },
    questionContainer: {
        marginTop: 20,
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // Slightly transparent background
        borderRadius: 20,
        alignItems: 'center',
        width: '90%',
    },
    questionText: {
        fontSize: 22,
        marginBottom: 10,
        fontWeight: 'bold',
        color: '#FF4B4B',
    },
    imageRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 20,
    },
    choiceContainer: {
        alignItems: 'center',
        marginHorizontal: 10,
    },
    selected: {
        borderColor: '#FFCC00',
        borderWidth: 3,
        borderRadius: 10,
    },
    image: {
        width: width * 0.4,
        height: height * 0.3,
        marginBottom: 5,
        borderRadius: 10,
    },
    choiceText: {
        fontSize: 16,
        color: '#FF4B4B',
    },
    completeText: {
        fontSize: 18,
        marginTop: 20,

        color: '#00FF00',
        fontWeight: 'bold',
    },
    errorText: {
        color: 'red',
        marginTop: 10,
    },
    activateButton: {
        backgroundColor: '#FF4B4B',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 25,
        marginBottom: 20,
    },
    activateButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    submitButton: {
        backgroundColor: '#4B94FF',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        marginTop: 20,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default FaceSwap;
