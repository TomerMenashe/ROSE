// GameController.js
import React, { useEffect, useState } from 'react';
import { Alert, ActivityIndicator, View, Text } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { GAME_FLOW } from '../gameFlow';
import { firebase } from '../firebase/firebase';
import usePreventBack from "../components/usePreventBack";

const GameController = () => {
    usePreventBack(); // **Added Hook Call**
    const navigation = useNavigation();
    const route = useRoute();
    const { pin, name, selfieURL } = route.params || {};
    const roomRef = firebase.database().ref(`room/${pin}`);
    const [currentGameIndex, setCurrentGameIndex] = useState(null);
    const [isWaiting, setIsWaiting] = useState(true);
    const [hasNavigated, setHasNavigated] = useState(false);

    // Initialize alreadyIncreased/${name} = false
    useEffect(() => {
        roomRef.child('alreadyIncreased').child(name).set(false);
    }, [name, roomRef]);

    // Check if currentGameIndex exists; if not, create it and set to 0
    useEffect(() => {
        roomRef.child('currentGameIndex').once('value', (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                setCurrentGameIndex(data.value);
            } else {
                roomRef.child('currentGameIndex').set({ value: 0, alreadyIncreased: {} });
                setCurrentGameIndex(0);
            }
        });
    }, [roomRef]);

    // Update playersInGameControl every time the screen is focused
    useFocusEffect(
        React.useCallback(() => {
            const userRef = roomRef.child('playersInGameControl').child(name);
            userRef.set(true);

            // Clean up when the screen is unfocused
            return () => {
                userRef.remove();
            };
        }, [name, roomRef])
    );

    // Listener for playersInGameControl to determine when there are two players
    useEffect(() => {
        const playersRef = roomRef.child('playersInGameControl');
        const onValueChange = (snapshot) => {
            const players = snapshot.val();
            const numPlayers = players ? Object.keys(players).length : 0;
            if (numPlayers >= 2 && currentGameIndex !== null && !hasNavigated) {
                setIsWaiting(false);
            } else {
                setIsWaiting(true);
            }
        };

        playersRef.on('value', onValueChange);

        // Clean up the listener when component unmounts
        return () => {
            playersRef.off('value', onValueChange);
        };
    }, [currentGameIndex, hasNavigated, roomRef]);

    // Listener for currentGameIndex to reset hasNavigated
    useEffect(() => {
        const currentGameIndexRef = roomRef.child('currentGameIndex');
        const onValueChange = (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setCurrentGameIndex(data.value);
                setHasNavigated(false);
            }
        };
        currentGameIndexRef.on('value', onValueChange);
        return () => {
            currentGameIndexRef.off('value', onValueChange);
        };
    }, [roomRef]);

    // Navigate to next game when ready
    useEffect(() => {
        if (!isWaiting && !hasNavigated && currentGameIndex !== null) {
            console.log('[GameController] Ready for navigation.');
            const nextGame = GAME_FLOW[currentGameIndex];
            if (nextGame) {
                navigateToNextScreen(nextGame);
                setHasNavigated(true);

                // Step 4: Atomic operation to prevent same player from executing twice
                roomRef.child('currentGameIndex').transaction((currentData) => {
                    if (!currentData) {
                        currentData = {
                            value: 0,
                            alreadyIncreased: {}
                        };
                    }

                    if (!currentData.alreadyIncreased) {
                        currentData.alreadyIncreased = {};
                    }

                    // Step 4.1: Check if alreadyIncreased/${name} == false
                    if (!currentData.alreadyIncreased[name]) {
                        // Step 3: Set alreadyIncreased/${name} = true
                        currentData.alreadyIncreased[name] = true;

                        // Step 4.2: Increase currentGameIndex by 0.5
                        currentData.value = (currentData.value || 0) + 0.5;
                    } else {
                        // Player has already increased; do nothing
                        return;
                    }

                    return currentData;
                }, (error, committed, snapshot) => {
                    if (error) {
                        console.error('[GameController] Transaction failed:', error);
                    } else if (!committed) {
                        console.log('[GameController] Transaction not committed');
                    } else {
                        console.log('[GameController] Transaction committed:', snapshot.val());

                        // Step 4.3: Set alreadyIncreased/${name} = false
                        roomRef.child('currentGameIndex').child('alreadyIncreased').child(name).set(false);
                    }
                });

                // Clean playersInGameControl
                roomRef.child('playersInGameControl').remove();
            } else {
                // No more games in GAME_FLOW; navigate to EndVideo
                navigateToEndVideo();
                setHasNavigated(true);

                // Optionally reset currentGameIndex or handle game completion
                roomRef.child('currentGameIndex').remove();
                roomRef.child('playersInGameControl').remove();
            }
        }
    }, [isWaiting, hasNavigated, currentGameIndex, roomRef, navigation]);

    const navigateToNextScreen = (nextGame) => {
        switch (nextGame) {
            case 'PhotoEscape':
                navigation.navigate('PhotoEscape', {
                    screen: 'PhotoEscapeLoadingScreen',
                    params: { pin, name, selfieURL },
                });
                break;
            case 'QuestionsAndTasks':
                navigation.navigate('QuestionsAndTasks', { pin, name, selfieURL });
                break;
            case 'MemoryGame':
                navigation.navigate('MemoryGame', {
                    screen: 'MemoryGameLoading',
                    params: { pin, name, selfieURL },
                });
                break;
            default:
                console.error(`[GameController] Unknown game in GAME_FLOW: ${nextGame}`);
                Alert.alert('Error', `Unknown game: ${nextGame}`);
        }
    };

    const navigateToEndVideo = () => {
        navigation.navigate('EndVideo', { pin, name, selfieURL });
    };

    if (isWaiting) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.loaderText}>Waiting for the second player to join...</Text>
            </View>
        );
    }

    return (
        <View style={styles.debugContainer}>
            <Text style={styles.debugText}>Not waiting. Ready for navigation.</Text>
        </View>
    );
};

const styles = {
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000',
    },
    loaderText: {
        color: '#FFFFFF',
        marginTop: 20,
        fontSize: 18,
    },
    debugContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#101010',
    },
    debugText: {
        color: '#FFCC00',
        fontSize: 18,
        textAlign: 'center',
    },
};

export default GameController;
