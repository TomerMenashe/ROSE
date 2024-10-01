// MemoryGameFaceSwapFunctions.js

import { firebase } from '../../firebase/firebase';
import { getStorage, ref, listAll } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';

/**
 * Fetches the selfie URLs of the two participants in a room.
 *
 * @param {string} pin - The room PIN.
 * @returns {Promise<string[]>} - A promise that resolves to an array containing the two selfie URLs.
 */
export async function fetchURLS(pin) {
    const database = firebase.database();
    const participantsRef = database.ref(`room/${pin}/participants`);

    const snapshot = await participantsRef.once('value');
    const participantsData = snapshot.val();

    if (!participantsData) {
        throw new Error('No participants found in the room.');
    }

    const participantsList = Object.values(participantsData);

    if (participantsList.length < 2) {
        throw new Error('Less than two participants in the room.');
    }

    // Assuming participants have a selfieURL field
    const selfieURLs = participantsList.map((participant) => participant.selfieURL);

    return selfieURLs;
}

/**
 * Generates a randomly shuffled array of integers based on the number of files in 'FaceSwapTargets/'.
 *
 * @returns {Promise<number[]>} - A promise that resolves to an array of random integers.
 */
export async function generateRandomIntegersArray() {
    const storage = getStorage(firebase.app());
    const faceSwapTargetsRef = ref(storage, 'FaceSwapTargets');

    const listResult = await listAll(faceSwapTargetsRef);

    const numFiles = listResult.items.length;

    if (numFiles === 0) {
        throw new Error('No target images found in FaceSwapTargets.');
    }

    // Generate array of indices
    const indicesArray = Array.from({ length: numFiles }, (_, i) => i);

    // Shuffle the array using Fisher-Yates algorithm
    for (let i = indicesArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indicesArray[i], indicesArray[j]] = [indicesArray[j], indicesArray[i]];
    }

    return indicesArray;
}

/**
 * Calls the swapFaces function with given parameters.
 *
 * @param {string} user1URL - The URL of the first user's selfie.
 * @param {string} user2URL - The URL of the second user's selfie.
 * @param {string} pin - The room PIN.
 * @param {number} index - The index of the target image.
 * @returns {Promise<void>}
 */
export async function generateFaceSwaps(user1URL, user2URL, pin, index) {
    const functions = getFunctions(firebase.app(), 'europe-west1');
    const swapFaces = httpsCallable(functions, 'swapFaces');

    try {
        await swapFaces({
            user1URL: user1URL,
            user2URL: user2URL,
            pin: pin,
            index: index,
        });
        console.log(`Face swap completed for index ${index}.`);
    } catch (error) {
        console.error(`Error in face swap for index ${index}:`, error);
    }
}
