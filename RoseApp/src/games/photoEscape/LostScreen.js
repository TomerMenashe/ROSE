// /src/screens/LostScreen.js

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import usePreventBack from "../../components/usePreventBack";

const LostScreen = () => {
    usePreventBack(); // **Added Hook Call**
    const navigation = useNavigation();
    const route = useRoute();
    const { name, selfieURL } = route.params;

    const handleBackToHome = () => {
        navigation.navigate('GameController', { pin, name, selfieURL });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>You Gave Up! 😢</Text>
            <Text style={styles.subtitle}>Don't worry, you can try again next time.</Text>

            <TouchableOpacity style={styles.button} onPress={handleBackToHome}>
                <Text style={styles.buttonText}>Back to Home</Text>
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
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FF4B4B',
        marginBottom: 20,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: '#FFFFFF',
        marginBottom: 40,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#FF4B4B',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default LostScreen;
