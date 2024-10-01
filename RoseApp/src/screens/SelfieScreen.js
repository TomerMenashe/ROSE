import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    Dimensions,
    ActivityIndicator,
    Pressable
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation, useRoute } from '@react-navigation/native';
import { firebase } from '../firebase/firebase';
import * as FileSystem from 'expo-file-system';
import CustomButton from "../components/CustomButton"; // Import FileSystem for base64 conversion

// **Import getFunctions and httpsCallable from Firebase Functions SDK**
import { getFunctions, httpsCallable } from 'firebase/functions';

const { width, height } = Dimensions.get('window');

const SelfieScreen = () => {
    const [permission, requestPermission] = useCameraPermissions();
    const [photo, setPhoto] = useState(null);
    const [cameraType, setCameraType] = useState('front');
    const cameraRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const { params } = useRoute();
    const name = params?.name;

    useEffect(() => {
        if (!permission) {
            requestPermission();
        } else if (!permission.granted) {
            requestPermission();
        }
    }, [permission]);

    const takeSelfie = async () => {
        if (cameraRef.current) {
            try {
                const options = { quality: 0.5, base64: true };
                const data = await cameraRef.current.takePictureAsync(options);
                setPhoto(data.uri);
            } catch (error) {
                console.error('Error taking selfie:', error);
                Alert.alert('Error', 'Failed to take selfie. Please try again.');
            }
        }
    };

    const submitSelfie = async () => {
        if (!photo) return;
        setLoading(true);

        try {
            // Convert photo URI to base64
            const base64Image = await FileSystem.readAsStringAsync(photo, { encoding: 'base64' });

            // **Initialize Functions with europe-west1 region**
            const functions = getFunctions(firebase.app(), 'europe-west1');
            const isValidSelfie = httpsCallable(functions, 'isValidSelfie');

            const result = await isValidSelfie({ image: base64Image });
            const { response } = result.data;

            if (response.toLowerCase().trim() === 'yes') {
                // Selfie is valid, proceed to upload without an initial alert
                await uploadSelfie();
            } else {
                // Selfie is invalid, show the sarcastic comment from ChatGPT
                Alert.alert(
                    'Invalid Selfie',
                    response, // Sarcastic comment from ChatGPT
                    [
                        {
                            text: 'OK',
                            onPress: () => resetSelfie(),
                        },
                    ],
                    { cancelable: false }
                );
            }
        } catch (error) {
            console.error('Error validating selfie:', error);
            Alert.alert('Error', 'Failed to validate selfie. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const uploadSelfie = async () => {
        setLoading(true);
        try {
            const response = await fetch(photo);
            const blob = await response.blob();
            const timestamp = new Date().getTime();
            const selfieRef = firebase.database().ref(`users/${name}/selfie_${timestamp}`);
            const storageRef = firebase.storage().ref().child(`selfies/${name}_${timestamp}.jpg`);

            // Upload the selfie to Firebase Storage
            const snapshot = await storageRef.put(blob);
            const downloadURL = await snapshot.ref.getDownloadURL();

            // Save the download URL to Firebase Database
            await selfieRef.set(downloadURL);

            // Show a single success alert after uploading
            Alert.alert(
                'Success',
                'Selfie is valid! You look pretty.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.replace('Home', { name, selfieURL: downloadURL }),
                    },
                ],
                { cancelable: false }
            );
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

    if (!permission || permission.status === 'undetermined') {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF0000" />
                <Text style={styles.loadingText}>Requesting camera permissions...</Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>No access to camera</Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                    <Text style={styles.permissionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {!photo ? (
                <>
                    <View style={styles.cameraContainer}>
                        <CameraView
                            ref={cameraRef}
                            style={styles.camera}
                            facing={cameraType}
                        />
                    </View>
                    <TouchableOpacity style={styles.captureButton} onPress={takeSelfie}>
                        <Text style={styles.captureButtonText}>Take Selfie</Text>
                    </TouchableOpacity>
                </>
            ) : (
                <View style={styles.photoContainer}>
                    <Image source={{ uri: photo }} style={styles.capturedPhoto} />
                    {!loading && (
                        <View style={styles.buttonRow}>
                            <Pressable style={styles.redButton} onPress={resetSelfie}>
                                <Text style={styles.buttonText}>Retake</Text>
                            </Pressable>
                            <CustomButton style={styles.redButton} onPress={submitSelfie}>
                                <Text style={styles.buttonText}>Submit</Text>
                            </CustomButton>
                        </View>
                    )}
                    {loading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#FF0000" />
                            <Text style={styles.loadingText}>Processing...</Text>
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
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#101010',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#FFFFFF',
        fontSize: 16,
        marginTop: 10,
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#101010',
    },
    permissionText: {
        color: '#FFFFFF',
        fontSize: 18,
        marginBottom: 20,
    },
    permissionButton: {
        backgroundColor: '#FF0000',
        padding: 10,
        borderRadius: 10,
    },
    permissionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cameraContainer: {
        width: width * 0.7, // Increased size from 0.6 to 0.7
        height: width * 0.7, // Ensuring the camera preview is square
        borderRadius: (width * 0.7) / 2, // Making it circular
        overflow: 'hidden',
        borderColor: '#FF0000', // Red border color
        borderWidth: 4, // Thicker border for glow effect
        shadowColor: '#FF0000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
        elevation: 10, // For Android shadow
        marginBottom: 30, // Space between camera and button
    },
    camera: {
        width: '100%',
        height: '100%',
    },
    captureButton: {
        width: 150, // Increased width for better tap area
        height: 50,
        backgroundColor: '#FF0000', // Changed to bright red
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FF0000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 10,
        elevation: 5, // For Android shadow
    },
    captureButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    photoContainer: {
        alignItems: 'center',
    },
    capturedPhoto: {
        width: 250, // Increased size from 200 to 250
        height: 250, // Making the captured photo circular
        borderRadius: 125, // Half of width and height
        borderColor: '#FF0000', // Red border color
        borderWidth: 4,
        shadowColor: '#FF0000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
        elevation: 10, // For Android shadow
        marginVertical: 20,
    },
    redButton: {
        backgroundColor: '#FF0000', // Red button background
        padding: 12,
        borderRadius: 10,
        marginRight: 10,
        marginLeft: 10,
        width: 130,
        alignItems: 'center',
        shadowColor: '#FF0000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 10,
        elevation: 5, // For Android shadow
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});

export default SelfieScreen;