import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera'; // Importing CameraView and useCameraPermissions
import { useNavigation, useRoute } from '@react-navigation/native';
import { firebase } from '../firebase/firebase';

const SelfieScreen = () => {
    const [permission, requestPermission] = useCameraPermissions();
    const [photo, setPhoto] = useState(null);
    const [cameraType, setCameraType] = useState('front'); // Set default camera to front
    const cameraRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const { params } = useRoute();
    const name = params?.name; // Get the user's name from route parameters

    // Request camera permissions on component mount
    useEffect(() => {
        if (!permission) {
            requestPermission();
        } else if (!permission.granted) {
            requestPermission();
        }
    }, [permission]);

    const takeSelfie = async () => {
        if (cameraRef.current) {
            const options = { quality: 0.5, base64: true };
            const data = await cameraRef.current.takePictureAsync(options);
            setPhoto(data.uri);
        }
    };

    const submitSelfie = async () => {
        if (!photo) return;
        setLoading(true);

        try {
            const response = await fetch(photo);
            const blob = await response.blob();
            const timestamp = new Date().getTime(); // Generate a timestamp
            const selfieRef = firebase.database().ref(`users/${name}/selfie_${timestamp}`);
            const storageRef = firebase.storage().ref().child(`selfies/${name}_${timestamp}.jpg`);

            // Upload the image to Firebase Storage
            const snapshot = await storageRef.put(blob);
            const downloadURL = await snapshot.ref.getDownloadURL();

            // Save the URL to Firebase Realtime Database
            await selfieRef.set(downloadURL);

            Alert.alert('Success', 'Selfie uploaded successfully!');

            // Navigate to HomeScreen with the user's name and selfie URL
            navigation.replace('Home', { name, imageUrl: downloadURL });

        } catch (error) {
            console.error('Error uploading selfie:', error);
            Alert.alert('Error', 'Failed to upload selfie. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetSelfie = () => {
        setPhoto(null);
    };

    // Check for camera permissions status
    if (!permission || permission.status === 'undetermined') {
        return <View><Text>Requesting camera permissions...</Text></View>;
    }
    if (!permission.granted) {
        return <View><Text>No access to camera</Text></View>;
    }

    return (
        <View style={styles.container}>
            {!photo ? (
                <CameraView
                    ref={cameraRef}
                    style={styles.camera}
                    facing={cameraType} // Set the camera to front-facing
                >
                    <View style={styles.cameraOverlay}>
                        <TouchableOpacity style={styles.captureButton} onPress={takeSelfie}>
                            <Text style={styles.captureButtonText}>Take Selfie</Text>
                        </TouchableOpacity>
                    </View>
                </CameraView>
            ) : (
                <View>
                    <Image source={{ uri: photo }} style={styles.capturedPhoto} />
                    {!loading && (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <TouchableOpacity style={styles.redButton} onPress={resetSelfie}>
                                <Text style={styles.buttonText}>Retake</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.redButton} onPress={submitSelfie}>
                                <Text style={styles.buttonText}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {loading && (
                        <View style={styles.loadingContainer}>
                            <Text style={styles.loadingText}>Uploading your selfie...</Text>
                        </View>
                    )}
                </View>
            )}
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
    camera: {
        width: '90%',
        height: '60%',
        borderRadius: 10,
        overflow: 'hidden',
        borderColor: '#FFFFFF',
        borderWidth: 2,
    },
    cameraOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 20,
    },
    captureButton: {
        width: 120,
        height: 50,
        backgroundColor: '#FF4B4B',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    capturedPhoto: {
        width: 300,
        height: 400,
        marginVertical: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#FFCC00',
    },
    redButton: {
        backgroundColor: '#FF4B4B',
        padding: 10,
        borderRadius: 10,
        marginRight: 10,
        marginLeft: 10,
        width: 120,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    loadingText: {
        color: '#FFFFFF',
        fontSize: 16,
        marginTop: 10,
    },
});

export default SelfieScreen;
