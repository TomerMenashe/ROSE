import { firebase } from '../../firebase/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Initialize Firebase functions
const functions = getFunctions(firebase.app(), 'us-central1');

export async function generateFaceSwaps( participantsList, pin) {
// Call the swapFaces function when the second player joins
    const swapFaces = httpsCallable(functions, 'swapFaces');
    const selfieURLs = participantsList.map(participant => participant.selfieURL);

    swapFaces({
        faceImageUrl1: selfieURLs[0],
        faceImageUrl2: selfieURLs[1],
        pin: pin // Pass the pin as an argument
    }).then((result) => {
        console.log('Faces swapped successfully.');
    }).catch(error => {
    });
}