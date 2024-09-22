// /src/screens/PhotoEscapeCameraScreen.js

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation, useRoute } from '@react-navigation/native';
import { firebase } from '../../firebase/firebase';

const PhotoEscapeCameraScreen = () => {
    const [permission, requestPermission] = useCameraPermissions();
    const [photo, setPhoto] = useState(null);
    const [cameraType, setCameraType] = useState('front');
    const [loading, setLoading] = useState(false);
    const [wrongObject, setWrongObject] = useState(false);
    const cameraRef = useRef(null);
    const storage = firebase.storage();
    const navigation = useNavigation();
    const { params } = useRoute();
    const { pin, gameNumber, itemName } = params;
    const roomRef = firebase.database().ref(`room/${pin}`);

    useEffect(() => {
        if (!permission) {
            requestPermission();
        } else if (!permission.granted) {
            requestPermission();
        }

        // Add listener to check for a winner
        const winnerListener = roomRef.child('winner').on('value', (snapshot) => {
            if (snapshot.exists()) {
                const winnerData = snapshot.val();
                navigation.navigate('CongratulationsScreen', { itemName, winnerImage: winnerData.image });
            }
        });

        return () => roomRef.child('winner').off('value', winnerListener);
    }, [permission, roomRef, navigation, itemName]);

    const takePicture = async () => {
        if (cameraRef.current) {
            const options = { quality: 0.5, base64: true };
            const data = await cameraRef.current.takePictureAsync(options);
            setPhoto(data.uri);
            setWrongObject(false);
        }
    };

    const blobToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const submitPhoto = async () => {
        if (!photo) return;
        setLoading(true);
        const response = await fetch(photo);
        const blob = await response.blob();
        const fileName = 'photo_' + new Date().getTime() + '.png';
        const storageRef = storage.ref().child('photos/' + fileName);

        try {
            const snapshot = await storageRef.put(blob);
            const url = await snapshot.ref.getDownloadURL();

            // Check if the item is correct
            checkItemInPhoto(blob, url);
        } catch (error) {
            console.error('Error uploading file:', error);
            setLoading(false);
        }
    };

    const checkItemInPhoto = async (photoBlob, photoUrl) => {
        try {
            const base64Image = await blobToBase64(photoBlob);
            const isItemInImage = firebase.functions().httpsCallable('isItemInImage');
            const result = await isItemInImage({ currentItem: itemName, image: base64Image });
            const { isPresent } = result.data;

            if (isPresent) {
                // Store the winning image in the database
                await roomRef.child('winner').set({ image: photoUrl });
                navigation.navigate('CongratulationsScreen', { itemName, winnerImage: photoUrl });
            } else {
                // If the item is not present, reset to take another photo
                setWrongObject(true);
                setPhoto(null); // Clear the photo to go back to the camera view
                setLoading(false); // Stop loading
            }
        } catch (error) {
            console.error('Error checking item in image:', error);
            setLoading(false);
        }
    };

    const resetCapture = () => {
        setPhoto(null);
        setWrongObject(false);
    };

    const handleGiveUp = () => {
        navigation.navigate('LostScreen');
    };

    return (
        <View style={styles.container}>
            {/* Camera View */}
            {!photo ? (
                <CameraView
                    ref={cameraRef}
                    style={styles.camera}
                    facing={cameraType}
                >
                    <View style={styles.cameraOverlay}>
                        <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                            <Text style={styles.captureButtonText}>Capture</Text>
                        </TouchableOpacity>
                    </View>
                </CameraView>
            ) : (
                <View>
                    <Image source={{ uri: photo }} style={styles.capturedPhoto} />
                    {!loading && !wrongObject && (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <TouchableOpacity style={styles.redButton} onPress={resetCapture}>
                                <Text style={styles.buttonText}>🔄 Retake</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.redButton} onPress={submitPhoto}>
                                <Text style={styles.buttonText}>✅ Submit</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {loading && (
                        <View style={styles.loadingContainer}>
                            <Text style={styles.loadingText}>Processing your image...</Text>
                        </View>
                    )}

                    {wrongObject && !loading && (
                        <View style={styles.wrongObjectContainer}>
                            <Text style={styles.resultText}>❌ Wrong Object! Please try again.</Text>
                            <TouchableOpacity style={styles.redButton} onPress={resetCapture}>
                                <Text style={styles.buttonText}>Try Again</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}

            {/* Give Up Button */}
            <TouchableOpacity style={styles.giveUpButton} onPress={handleGiveUp}>
                <Text style={styles.giveUpButtonText}>Give Up</Text>
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 5,
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
    giveUpButton: {
        backgroundColor: '#FF4B4B',
        padding: 15,
        borderRadius: 10,
        marginTop: 30,
        width: '80%',
        alignItems: 'center',
    },
    giveUpButtonText: {
        color: '#fff',
        fontSize: 18,
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
    wrongObjectContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    resultText: {
        fontSize: 20,
        color: '#FFCC00',
        fontWeight: 'bold',
        marginTop: 10,
        textAlign: 'center',
    },
});

export default PhotoEscapeCameraScreen;
