import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const CongratulationsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { itemName } = route.params;  // Receive the item name from the previous screen

    const moveToNextGame = () => {
        navigation.navigate('TestFaceSwap');  // Navigate to the next game screen, adjust as per your App.js
    };

    return (
        <View style={styles.container}>
            <Text style={styles.congratsText}>🎉 Congratulations!</Text>
            <Text style={styles.text}>You successfully found the {itemName}!</Text>

            <TouchableOpacity style={styles.button} onPress={moveToNextGame}>
                <Text style={styles.buttonText}>Next Game</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#101010',
    },
    congratsText: {
        fontSize: 36,
        color: '#FFCC00',
        fontWeight: 'bold',
    },
    text: {
        fontSize: 24,
        color: '#FFFFFF',
        marginVertical: 20,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#FF4B4B',
        padding: 10,
        borderRadius: 10,
        width: 200,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default CongratulationsScreen;
