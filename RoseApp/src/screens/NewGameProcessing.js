// /src/screens/NewGameProcessing.js

import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { firebase } from '../firebase/firebase';

const NewGameProcessing = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { pin } = route.params || {};

    useEffect(() => {
        const processExit = async () => {

            try {
                //  Turn off the listener of room/${pin}/currentGameIndex
                const currentGameIndexRef = firebase.database().ref(`room/${pin}/currentGameIndex`);
                currentGameIndexRef.off();
                console.log(`Listener for room/${pin}/currentGameIndex turned off.`);


                // Check if exitedPlayers >= 2, then remove room/${pin}
                const exitedPlayersRef = firebase.database().ref(`room/${pin}/exitedPlayers`);
                const roomRef = firebase.database().ref(`room/${pin}`);

                const snapshot = await exitedPlayersRef.once('value');
                const exitedPlayers = snapshot.val() || 0;
                console.log(`Exited players: ${exitedPlayers}`);

                if (exitedPlayers >= 2) {
                    await roomRef.remove();
                    console.log(`Room ${pin} removed because exitedPlayers >= 2`);
                } else {
                    console.log(`Room ${pin} not removed. exitedPlayers is ${exitedPlayers}`);
                }
            } catch (error) {
                console.error(`Error processing room ${pin}:`, error);
                Alert.alert('Error', 'An error occurred while processing your request.');
            }

            // Direct the user to 'Splash' with no params
            navigation.reset({
                index: 0,
                routes: [{ name: 'Splash' }],
            });
        };

        processExit();
    }, [navigation, pin]);

    // Since this screen is purely for processing, we don't need to render anything
    return null;
};

export default NewGameProcessing;
