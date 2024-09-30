// /src/screens/PhotoEscapeCameraScreen.js

import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import { Camera, useCameraPermissions, CameraView } from 'expo-camera'; // Corrected import
import { useNavigation, useRoute } from '@react-navigation/native';
import { firebase } from '../../firebase/firebase';
import * as FileSystem from 'expo-file-system';
import CustomButton from "../../../assets/Sounds/CustomButton";


const { width, height } = Dimensions.get('window');

const PhotoEscapeCameraScreen = () => {
    const [permission, requestPermission] = useCameraPermissions();
    const [photo, setPhoto] = useState(null);
    const [cameraType, setCameraType] = useState('front');
    const [loading, setLoading] = useState(false);
    const cameraRef = useRef(null);
    const navigation = useNavigation();
    const route = useRoute();
    const { pin, name, item, selfieURL } = route.params || {}; // Changed from itemName to item
    const roomRef = firebase.database().ref(`room/${pin}`);

    useEffect(() => {
        if (!permission || !permission.granted) {
            requestPermission();
        }

        const winnerListener = roomRef.child('winner').on('value', (snapshot) => {
            if (snapshot.exists()) {
                const winnerData = snapshot.val();
                const winnerName = winnerData.name;
                const winnerImage = winnerData.image;

                if (winnerName === name) {
                    navigation.navigate('CongratulationsScreen', {
                        item, // Pass itemName if needed
                        winnerImage,
                        name,
                        selfieURL,
                        pin
                    });
                } else {
                    navigation.navigate('LoserScreen', {
                        item, // Pass itemName if needed
                        winnerImage,
                        name,
                        selfieURL,
                        pin
                    });
                }
            }
        });

        return () => {
            roomRef.child('winner').off('value', winnerListener);
        };
    }, [permission, roomRef, navigation, item, selfieURL, name, pin]);

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const options = { quality: 0.5, base64: true };
                const data = await cameraRef.current.takePictureAsync(options);
                setPhoto(data.uri);
            } catch (error) {
                console.error('Error taking picture:', error);
                Alert.alert('Error', 'Failed to take picture. Please try again.');
            }
        }
    };

    const submitPhoto = async () => {
        if (!photo) return;
        setLoading(true);

        try {
            // Convert photo URI to base64
            const base64Image = await FileSystem.readAsStringAsync(photo, { encoding: 'base64' });

            // Ensure item is defined
            if (!item) {
                throw new Error('currentItem is undefined.');
            }

            const isItemInImage = firebase.functions().httpsCallable('isItemInImage');
            const result = await isItemInImage({ currentItem: item, image: base64Image });
            const { isPresent } = result.data;

            if (isPresent) {
                const response = await fetch(photo);
                const blob = await response.blob();
                const timestamp = new Date().getTime();
                const storageRef = firebase.storage().ref().child(`photos/${name}_${timestamp}.jpg`);
                const snapshot = await storageRef.put(blob);
                const downloadURL = await snapshot.ref.getDownloadURL();

                await roomRef.child('winner').set({ image: downloadURL, name, selfieURL });
                await roomRef.child('winnerPhotos').push({ image: downloadURL});
                // The listener will handle navigation
            } else {
                setPhoto(null);
                Alert.alert('Incorrect Item', `The item was not found. Try again!`);
            }
        } catch (error) {
            console.error('Error validating or submitting photo:', error);
            Alert.alert('Error', 'Failed to submit photo. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetCapture = () => {
        setPhoto(null);
    };

    if (!permission || permission.status === 'undetermined') {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF4B4B" />
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
                    <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                        <Text style={styles.captureButtonText}>Capture</Text>
                    </TouchableOpacity>
                </>
            ) : (
                <View style={styles.previewContainer}>
                    <Image source={{ uri: photo }} style={styles.capturedPhoto} />
                    {!loading && (
                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={styles.redButton} onPress={resetCapture}>
                                <Text style={styles.buttonText}>Retake</Text>
                            </TouchableOpacity>
                            <CustomButton style={styles.redButton} onPress={submitPhoto}>
                                <Text style={styles.buttonText}>Submit</Text>
                            </CustomButton>
                        </View>
                    )}
                    {loading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#FF4B4B" />
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
        backgroundColor: '#FF4B4B',
        padding: 10,
        borderRadius: 10,
    },
    permissionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cameraContainer: {
        width: width * 0.7,
        height: height * 0.5,
        borderRadius: 10,
        overflow: 'hidden',
        borderColor: '#FF4B4B',
        borderWidth: 4,
        marginBottom: 20,
    },
    camera: {
        width: '100%',
        height: '100%',
    },
    captureButton: {
        backgroundColor: '#FF4B4B',
        padding: 15,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    previewContainer: {
        alignItems: 'center',
    },
    capturedPhoto: {
        width: 250,
        height: 250,
        borderRadius: 125,
        borderWidth: 4,
        borderColor: '#FF4B4B',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    redButton: {
        backgroundColor: '#FF4B4B',
        padding: 12,
        borderRadius: 10,
        marginHorizontal: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default PhotoEscapeCameraScreen;
