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
} from 'react-native';
import { firebase } from '../../firebase/firebase';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const FaceSwap = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { pin, name, selfieURL } = route.params || {};

    // Game state variables
    const [cards, setCards] = useState([]);
    const [selectedCards, setSelectedCards] = useState([]);
    const [currentPlayer, setCurrentPlayer] = useState('');
    const [playerScores, setPlayerScores] = useState({});
    const [gameOver, setGameOver] = useState(false);

    // Firebase references
    const roomRef = useRef(null);
    const gameRef = useRef(null);

    // Load images
    const cardCover = require('./assets/1.jpeg'); // Update the path as needed
    const villainImages = {
        villain1: require('./assets/1.jpeg'),
        villain2: require('./assets/2.jpeg'),
        villain3: require('./assets/3.jpeg'),
        villain4: require('./assets/4.jpeg'),
        villain5: require('./assets/5.jpeg'),
        villain6: require('./assets/6.jpeg'),
        villain7: require('./assets/7.jpeg'),
        villain8: require('./assets/8.jpeg'),
    };

    useEffect(() => {
        if (!pin || !name) {
            Alert.alert('Error', 'Missing game information.');
            navigation.goBack();
            return;
        }

        roomRef.current = firebase.database().ref(`room/${pin}`);
        gameRef.current = roomRef.current.child('memoryGame');

        // Initialize game state if not already set
        gameRef.current.once('value').then((snapshot) => {
            if (!snapshot.exists()) {
                initGame();
            }
        });

        // Listen for game state changes
        const gameListener = gameRef.current.on('value', (snapshot) => {
            const gameState = snapshot.val();
            if (gameState) {
                setCards(gameState.cards);
                setCurrentPlayer(gameState.currentPlayer);
                setPlayerScores(gameState.playerScores || {});
                setGameOver(gameState.gameOver || false);

                // Check if game over
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

    const initGame = () => {
        // Prepare cards
        const villains = Object.keys(villainImages);
        const cardValues = [...villains, ...villains];
        shuffleArray(cardValues);

        const newCards = cardValues.map((value, index) => ({
            id: index,
            value,
            isFlipped: false,
            isMatched: false,
        }));

        const initialGameState = {
            cards: newCards,
            currentPlayer: name, // Start with the player who created the game
            playerScores: { [name]: 0 },
            gameOver: false,
        };

        gameRef.current.set(initialGameState);
    };

    const shuffleArray = (array) => {
        // Fisher-Yates shuffle algorithm
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

        if (firstCard.value === secondCard.value) {
            // Match found
            const matchedCards = updatedCards.map((c) =>
                c.value === firstCard.value ? { ...c, isMatched: true } : c
            );

            const newPlayerScores = {
                ...playerScores,
                [name]: (playerScores[name] || 0) + 1,
            };

            // Check for game over
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
            // No match
            setTimeout(() => {
                const resetCards = updatedCards.map((c) =>
                    c.id === firstCard.id || c.id === secondCard.id
                        ? { ...c, isFlipped: false }
                        : c
                );

                // Switch to next player
                roomRef.current
                    .child('participants')
                    .once('value')
                    .then((snapshot) => {
                        const participants = snapshot.val();
                        const participantNames = Object.keys(participants);
                        const nextPlayer = participantNames.find((p) => p !== currentPlayer);

                        gameRef.current.update({
                            cards: resetCards,
                            currentPlayer: nextPlayer,
                        });

                        setSelectedCards([]);
                    });
            }, 1000);
        }
    };

    const determineWinner = (scores) => {
        const players = Object.keys(scores);
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
                            ? villainImages[card.value]
                            : cardCover
                    }
                    style={styles.cardImage}
                />
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
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

const CARD_WIDTH = (width - 80) / 4; // Adjusted for 4x4 grid
const CARD_HEIGHT = CARD_WIDTH * 1.4;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#D3D3D3',
        paddingTop: 50,
        alignItems: 'center',
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
});

export default FaceSwap;
