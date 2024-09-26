// /src/screens/FaceSwap.js

import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    TouchableOpacity,
    Image,
    StyleSheet,
    Dimensions,
    Alert,
    Text,
    ActivityIndicator,
} from 'react-native';
import { firebase } from '../../firebase/firebase';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const FaceSwap = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { pin, name } = route.params || {};

    // Game state variables
    const [cards, setCards] = useState([]);
    const [selectedCards, setSelectedCards] = useState([]);
    const [currentPlayer, setCurrentPlayer] = useState('');
    const [playerScores, setPlayerScores] = useState({});
    const [gameOver, setGameOver] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Firebase references
    const roomRef = useRef(null);
    const gameRef = useRef(null);

    // Card back cover URL
    const cardCover = { uri: 'https://firebasestorage.googleapis.com/v0/b/rose-date.appspot.com/o/Screenshot%202024-09-24%20022934.png?alt=media&token=26bafaaf-cbac-4a74-b977-e8db8004e9e5' };

    useEffect(() => {
        if (!pin || !name) {
            Alert.alert('Error', 'Missing game information.');
            navigation.goBack();
            return;
        }

        roomRef.current = firebase.database().ref(`room/${pin}`);
        gameRef.current = roomRef.current.child('memoryGame');

        const initializeGame = async () => {
            try {
                const snapshot = await gameRef.current.once('value');
                if (!snapshot.exists()) {
                    await initGame();
                }
                setLoading(false);
            } catch (initError) {
                console.error('Error initializing game:', initError);
                setError('Failed to initialize game.');
                setLoading(false);
            }
        };

        initializeGame();

        const gameListener = gameRef.current.on('value', (snapshot) => {
            const gameState = snapshot.val();
            if (gameState) {
                setCards(gameState.cards || []);
                setCurrentPlayer(gameState.currentPlayer || '');
                setPlayerScores(gameState.playerScores || {});
                setGameOver(gameState.gameOver || false);

                if (gameState.gameOver && !gameOver) {
                    const winner = determineWinner(gameState.playerScores);
                    Alert.alert('Game Over', `${winner} wins!`, [
                        { text: 'OK', onPress: () => navigation.navigate('Home') },
                    ]);
                }
            }
        });

        return () => {
            gameRef.current.off('value', gameListener);
        };
    }, [pin, name, navigation, gameOver]);

    const initGame = async () => {
        try {
            // Fetch the faceSwaps data from Firebase
            const faceSwapsSnapshot = await roomRef.current.child('faceSwaps').once('value');

            if (!faceSwapsSnapshot.exists()) {
                Alert.alert('Error', 'No face swaps available.');
                return;
            }

            const faceSwapsData = faceSwapsSnapshot.val();
            const faceSwapsKeys = Object.keys(faceSwapsData).slice(0, 3); // Get the first three keys

            let cardValues = [];

            // Correctly access the URLs as arrays
            faceSwapsKeys.forEach((key) => {
                const swapEntry = faceSwapsData[key];

                if (
                    swapEntry &&
                    swapEntry.url1 &&
                    Array.isArray(swapEntry.url1) &&
                    swapEntry.url1[0] &&
                    swapEntry.url2 &&
                    Array.isArray(swapEntry.url2) &&
                    swapEntry.url2[0]
                ) {
                    cardValues.push({ imageUrl: swapEntry.url1[0], pairId: key });
                    cardValues.push({ imageUrl: swapEntry.url2[0], pairId: key });
                } else {
                    console.warn(`Invalid URLs for faceSwap key: ${key}`);
                }
            });

            if (cardValues.length < 6) {
                Alert.alert('Error', 'Not enough valid face swaps to start the game.');
                return;
            }

            shuffleArray(cardValues);

            const newCards = cardValues.map((value, index) => ({
                id: index,
                imageUrl: value.imageUrl,
                pairId: value.pairId,
                isFlipped: false,
                isMatched: false,
            }));

            const initialGameState = {
                cards: newCards,
                currentPlayer: name,
                playerScores: { [name]: 0 },
                gameOver: false,
            };

            await gameRef.current.set(initialGameState);
        } catch (error) {
            console.error('Error initializing game:', error);
            Alert.alert('Error', 'Failed to initialize game.');
        }
    };

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    };

    const handleCardPress = (card) => {
        if (currentPlayer !== name || card.isFlipped || card.isMatched) {
            return;
        }

        const updatedCards = cards.map((c) =>
            c.id === card.id ? { ...c, isFlipped: true } : c
        );

        const newSelectedCards = [...selectedCards, card];
        setSelectedCards(newSelectedCards);
        updateCardsInFirebase(updatedCards);

        if (newSelectedCards.length === 2) {
            checkForMatch(newSelectedCards, updatedCards);
        }
    };

    const updateCardsInFirebase = (updatedCards) => {
        gameRef.current.update({
            cards: updatedCards,
        });
    };

    const checkForMatch = (selectedCardsPair, updatedCards) => {
        const [firstCard, secondCard] = selectedCardsPair;

        if (firstCard.pairId === secondCard.pairId) {
            const matchedCards = updatedCards.map((c) =>
                c.pairId === firstCard.pairId ? { ...c, isMatched: true } : c
            );

            const newPlayerScores = {
                ...playerScores,
                [name]: (playerScores[name] || 0) + 1,
            };

            const isGameOver = matchedCards.every((card) => card.isMatched);

            gameRef.current.update({
                cards: matchedCards,
                playerScores: newPlayerScores,
                gameOver: isGameOver,
            });

            setSelectedCards([]);

            if (isGameOver) {
                setGameOver(true);
            }
        } else {
            setTimeout(() => {
                const resetCards = updatedCards.map((c) =>
                    c.id === firstCard.id || c.id === secondCard.id
                        ? { ...c, isFlipped: false }
                        : c
                );

                roomRef.current
                    .child('participants')
                    .once('value')
                    .then((snapshot) => {
                        const participants = snapshot.val();
                        const participantNames = participants ? Object.keys(participants) : [];
                        const nextPlayer = participantNames.find((p) => p !== currentPlayer) || name;

                        gameRef.current.update({
                            cards: resetCards,
                            currentPlayer: nextPlayer,
                        });

                        setSelectedCards([]);
                    })
                    .catch((error) => {
                        console.error('Error fetching participants:', error);
                        Alert.alert('Error', 'Failed to switch players.');
                        setSelectedCards([]);
                    });
            }, 1000);
        }
    };

    const determineWinner = (scores) => {
        const players = Object.keys(scores);
        if (players.length === 0) return 'No one';
        if (players.length === 1) return players[0];
        if (scores[players[0]] > scores[players[1]]) {
            return players[0];
        } else if (scores[players[0]] < scores[players[1]]) {
            return players[1];
        } else {
            return 'No one, it\'s a tie!';
        }
    };

    const renderCard = (card) => {
        return (
            <TouchableOpacity
                key={card.id}
                onPress={() => handleCardPress(card)}
                disabled={card.isFlipped || card.isMatched || currentPlayer !== name}
                style={styles.cardContainer}
            >
                <Image
                    source={
                        card.isFlipped || card.isMatched
                            ? { uri: card.imageUrl }
                            : cardCover
                    }
                    style={styles.cardImage}
                    resizeMode="cover"
                />
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF4B4B" />
                <Text style={styles.loadingText}>Loading game...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Error: {error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.gameTitle}>Face Swap Memory Game</Text>
            <Text style={styles.turnText}>
                {gameOver ? 'Game Over' : `Current Turn: ${currentPlayer}`}
            </Text>
            <View style={styles.scoresContainer}>
                {Object.entries(playerScores).map(([playerName, score]) => (
                    <Text key={playerName} style={styles.scoreText}>
                        {playerName}: {score}
                    </Text>
                ))}
            </View>
            <View style={styles.board}>{cards.map(renderCard)}</View>
        </View>
    );
};

const CARD_WIDTH = (width - 80) / 4;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#D3D3D3',
        paddingTop: 50,
        alignItems: 'center',
    },
    gameTitle: {
        fontSize: 24,
        marginBottom: 20,
    },
    turnText: {
        fontSize: 18,
        marginBottom: 10,
    },
    scoresContainer: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    scoreText: {
        marginHorizontal: 20,
        fontSize: 16,
    },
    board: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        margin: 10,
    },
    cardContainer: {
        margin: 5,
    },
    cardImage: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 10,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#D3D3D3',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#555555',
    },
    errorContainer: {
        flex: 1,
        backgroundColor: '#D3D3D3',
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        fontSize: 18,
    },
});

export default FaceSwap;
