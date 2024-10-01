// /src/screens/MemoryGameLoading.js

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { firebase } from '../../firebase/firebase'; // Adjust the path as necessary
import { useNavigation, useRoute } from '@react-navigation/native';
import usePreventBack from "../../components/usePreventBack";

const MemoryGameLoading = () => {
    usePreventBack(); // **Added Hook Call**
    const navigation = useNavigation();
    const route = useRoute();
    const { pin, name, selfieURL } = route.params || {};
    const [loading, setLoading] = useState(true);

    // Firebase references
    const roomRef = useRef(null);
    const gameRef = useRef(null);

    useEffect(() => {
        if (!pin || !name) {
            // If missing game information, navigate back without showing an alert
            navigation.goBack();
            return;
        }

        // Initialize Firebase references
        roomRef.current = firebase.database().ref(`room/${pin}`);
        gameRef.current = roomRef.current.child('memoryGame');

        // Reference to the faceSwaps node
        const faceSwapsRef = roomRef.current.child('faceSwaps');

        // Listener for changes in faceSwaps
        const onFaceSwapsChange = async (snapshot) => {
            const faceSwapsData = snapshot.val();

            if (faceSwapsData) {
                const faceSwapsKeys = Object.keys(faceSwapsData).slice(0, 8); // Get first 8 faceSwaps

                let cardValues = [];

                faceSwapsKeys.forEach((key) => {
                    const swapEntry = faceSwapsData[key];

                    if (
                        swapEntry &&
                        swapEntry.url1 &&
                        Array.isArray(swapEntry.url1) &&
                        swapEntry.url1[0] &&
                        swapEntry.url2 &&
                        Array.isArray(swapEntry.url2) &&
                        swapEntry.url2[0]
                    ) {
                        cardValues.push({ imageUrl: swapEntry.url1[0], pairId: key });
                        cardValues.push({ imageUrl: swapEntry.url2[0], pairId: key });
                    } else {
                        console.warn(`Invalid URLs for faceSwap key: ${key}`);
                    }
                });

                // Check if we have at least sixteen URLs (eight pairs)
                if (cardValues.length >= 16) {
                    try {
                        // Shuffle the card values
                        shuffleArray(cardValues);

                        // Create card objects
                        const newCards = cardValues.map((value, index) => ({
                            id: index,
                            imageUrl: value.imageUrl,
                            pairId: value.pairId,
                            isFlipped: false,
                            isMatched: false,
                        }));

                        // Initial game state
                        const initialGameState = {
                            cards: newCards,
                            currentPlayer: name,
                            playerScores: { [name]: 0 },
                            gameOver: false,
                        };

                        // Set the game state in Firebase
                        await gameRef.current.set(initialGameState);

                        // Prefetch images
                        const imageUrls = newCards.map(card => card.imageUrl);
                        await prefetchImages(imageUrls);

                        // Navigate to the MemoryGame screen
                        navigation.replace('MemoryGame', { pin, name, selfieURL });

                        // Stop loading
                        setLoading(false);
                    } catch (error) {
                        console.error('Error setting up game:', error);
                        // Do not set any error state or show alerts; keep loading
                    }
                } else {
                    console.warn('Not enough card values to start the game.');
                }
            }
            // If faceSwapsData is null or insufficient, do nothing and keep loading
        };

        // Attach the listener
        faceSwapsRef.on('value', onFaceSwapsChange);

        // Cleanup listener on unmount
        return () => {
            faceSwapsRef.off('value', onFaceSwapsChange);
        };
    }, [pin, name, navigation, selfieURL]);

    // Function to shuffle the array (Fisher-Yates shuffle)
    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    };

    // Function to prefetch images
    const prefetchImages = async (urls) => {
        try {
            const prefetchPromises = urls.map(url => Image.prefetch(url));
            const results = await Promise.all(prefetchPromises);

            // Check if all images were prefetched successfully
            const allPrefetched = results.every(result => result === true);
            if (!allPrefetched) {
                console.warn('One or more images failed to prefetch.');
                // Do not throw an error; proceed anyway
            }
        } catch (prefetchError) {
            console.error('Error prefetching images:', prefetchError);
            // Do not throw an error; proceed anyway
        }
    };

    return (
        <View style={styles.container}>
            {loading && (
                <>
                    <ActivityIndicator size="large" color="#FF4B4B" />
                    <Text style={styles.loadingText}>Loading game...</Text>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#101010',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 18,
        color: '#FFCC00',
        textAlign: 'center',
    },
});

export default MemoryGameLoading;
