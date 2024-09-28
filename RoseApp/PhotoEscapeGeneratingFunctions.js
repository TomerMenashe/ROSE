// PhotoEscapeGeneratingFunctions.js

import React from 'react';
import { Alert } from 'react-native';
import { firebase } from './src/firebase/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Initialize Firebase functions
const functions = getFunctions(firebase.app(), 'us-central1');

/**
 * Generates a random item based on the provided pin.
 * @param {string} pin - The room PIN.
 * @returns {Promise<string>} - The generated item.
 */
export async function generateItem(pin) {
    console.log(`[generateItem] Called with pin: ${pin}`);
    try {
        const roomRef = firebase.database().ref(`room/${pin}`);
        const getRandomItem = httpsCallable(functions, 'getRandomItem');
        const resultItem = await getRandomItem();
        const generatedItem = resultItem.data;

        // Upload the generated item to Firebase
        await roomRef.update({
            item: generatedItem,
        });
        return generatedItem;
    } catch (error) {
        console.error('[generateItem] Error generating item:', error);
        Alert.alert('Error', 'Failed to generate item.');
        throw error;
    }
}

/**
 * Generates a limerick based on the provided item and pin.
 * @param {string} pin - The room PIN.
 * @param {string} item - The item for which to generate the limerick.
 * @returns {Promise<string>} - The generated limerick.
 */
export async function generateHamshir(pin, item) {
    try {
        const roomRef = firebase.database().ref(`room/${pin}`);
        const getHamshir = httpsCallable(functions, 'getHamshir');
        const resultLimerick = await getHamshir({ item });
        const generatedLimerick = resultLimerick.data.response;

        // Upload the generated limerick to Firebase
        await roomRef.update({
            limerick: generatedLimerick,
        });
        return generatedLimerick;
    } catch (error) {
        console.error('[generateHamshir] Error generating limerick:', error);
        Alert.alert('Error', 'Failed to generate limerick.');
        throw error;
    }
}

/**
 * Generates the data needed for the PhotoEscape game by generating an item and its corresponding limerick.
 * @param {string} pin - The room PIN.
 * @returns {Promise<void>}
 */
export async function generatePhotoEscapeData(pin) {
    try {
        const item = await generateItem(pin);
        const limerick = await generateHamshir(pin, item);
    } catch (error) {
        console.error('[generatePhotoEscapeData] Error generating PhotoEscape data:', error);
    }
}

/**
 * Fetches the item from Firebase based on the provided pin.
 * @param {string} pin - The room PIN.
 * @returns {Promise<string|null>} - The fetched item or null if not found.
 */
export async function fetchItem(pin) {
    const roomRef = firebase.database().ref(`room/${pin}`);

    try {
        const itemSnapshot = await roomRef.child('item').once('value');
        if (itemSnapshot.exists()) {
            return itemSnapshot.val();
        } else {
            Alert.alert('Error', 'Failed to retrieve item.');
            return null;
        }
    } catch (error) {
        console.error('[fetchItem] Error fetching item:', error);
        Alert.alert('Error', 'An error occurred while fetching the item.');
        return null;
    }
}

/**
 * Fetches the limerick from Firebase based on the provided pin.
 * @param {string} pin - The room PIN.
 * @returns {Promise<string|null>} - The fetched limerick or null if not found.
 */
export async function fetchLimerick(pin) {
    const roomRef = firebase.database().ref(`room/${pin}`);
    try {
        const limerickSnapshot = await roomRef.child('limerick').once('value');
        if (limerickSnapshot.exists()) {
            return limerickSnapshot.val();
        } else {
            console.warn('[fetchLimerick] Limerick does not exist.');
            Alert.alert('Error', 'Failed to retrieve limerick.');
            return null;
        }
    } catch (error) {
        console.error('[fetchLimerick] Error fetching limerick:', error);
        Alert.alert('Error', 'An error occurred while fetching the limerick.');
        return null;
    }
}