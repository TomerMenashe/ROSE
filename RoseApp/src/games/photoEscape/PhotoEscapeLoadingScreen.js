// /src/screens/PhotoEscapeLoadingScreen.js

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fetchLimerick, fetchItem } from './PhotoEscapeGeneratingFunctions';
import { firebase } from '../../firebase/firebase';
import usePreventBack from "../../components/usePreventBack"; // Import Firebase

const PhotoEscapeLoadingScreen = () => {
    usePreventBack(); // **Added Hook Call**
    const navigation = useNavigation();
    const route = useRoute();
    const { pin, name, selfieURL } = route.params || {};
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!pin || !name || !selfieURL) {
            console.error('[PhotoEscapeLoadingScreen] Missing game information:', { pin, name, selfieURL });
            Alert.alert('Error', 'Missing game information.');
            navigation.goBack();
            return;
        }

        const fetchDataAndNavigate = async () => {
            try {
                // Fetch item and limerick concurrently
                const [fetchedItem, fetchedLimerick] = await Promise.all([
                    fetchItem(pin),
                    fetchLimerick(pin),
                ]);

                if (fetchedItem && fetchedLimerick) {
                    // Navigate to the desired screen within PhotoEscapeNavigator
                    navigation.replace('PhotoEscapeLimerick', {
                        pin,
                        name,
                        selfieURL,
                        item: fetchedItem,
                        limerick: fetchedLimerick,
                    });
                } else {
                    throw new Error('Failed to fetch item or limerick');
                }
            } catch (error) {
                console.error('[PhotoEscapeLoadingScreen] Error fetching data:', error);
                Alert.alert('Error', 'An error occurred while fetching data.');
                navigation.goBack();
            } finally {
                setIsLoading(false);
            }
        };

        fetchDataAndNavigate();
    }, [pin, name, selfieURL, navigation]);

    // Example function to be called when PhotoEscape game is completed
    const completeGame = async () => {
        const roomRef = firebase.database().ref(`room/${pin}`);

        try {
            await roomRef.update({ gameFlowCompleted: true });
            console.log('[PhotoEscape] gameFlowCompleted set to true');
        } catch (error) {
            console.error('[PhotoEscape] Error updating gameFlowCompleted:', error);
            Alert.alert('Error', 'Failed to update game status.');
        }
    };

    // Example: Call completeGame() when the game is completed
    // This could be triggered by a button press or after certain logic
    // For demonstration, we'll call it when the component unmounts
    useEffect(() => {
        return () => {
            completeGame();
        };
    }, []);

    return (
        <View style={styles.container}>
            {isLoading && (
                <>
                    <ActivityIndicator size="large" color="#FF4B4B" />
                    <Text style={styles.loadingText}>Loading...</Text>
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

export default PhotoEscapeLoadingScreen;
