import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import { firebase } from '../firebase/firebase';  // Import Firebase
import { useRoute } from '@react-navigation/native';  // Get the route params

const { height, width } = Dimensions.get('window');  // Get screen dimensions

const RoomScreen = () => {
    const [participants, setParticipants] = useState([]);
    const route = useRoute(); // Get the 'pin' from the route params
    const { pin } = route.params;

    useEffect(() => {
        // Fetch the room's participants from Firebase
        const roomRef = firebase.database().ref(`room/${pin}/participants`);
        roomRef.on('value', (snapshot) => {
            if (snapshot.exists()) {
                const participantsData = snapshot.val();
                setParticipants(Object.values(participantsData));
            }
        });

        // Clean up the listener
        return () => roomRef.off();
    }, [pin]);

    return (
        <ImageBackground
            source={require('../../assets/joinGame.jpeg')}  // Background image
            style={styles.background}
            resizeMode="cover"
        >
            <View style={styles.container}>
                <Text style={styles.title}>Room {pin}</Text>

                {/* Display the names of the participants */}
                {participants.length > 0 ? (
                    participants.map((participant, index) => (
                        <Text key={index} style={styles.participantText}>{participant.name}</Text>
                    ))
                ) : (
                    <Text style={styles.participantText}>No participants yet.</Text>
                )}
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
    },
    title: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 40,
    },
    participantText: {
        fontSize: 24,
        color: '#FFFFFF',
        marginBottom: 20,
    },
});

export default RoomScreen;
