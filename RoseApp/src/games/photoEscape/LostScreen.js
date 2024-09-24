import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const LostScreen = () => {
    const navigation = useNavigation();

    const handleBackToHome = () => {
        navigation.navigate('TestFaceSwap'); // Navigate to the Home screen or main screen
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>You Gave Up! 😢</Text>
            <Text style={styles.subtitle}>Don't worry, you can try again next time.</Text>

            <Pressable style={styles.button} onPress={handleBackToHome}>
                <Text style={styles.buttonText}>Back to Home</Text>
            </Pressable>
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
