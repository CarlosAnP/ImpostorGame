import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import {
    doc,
    setDoc,
    getDoc,
    onSnapshot,
    updateDoc,
    arrayUnion,
    deleteDoc
} from 'firebase/firestore';
import { generateWordPair } from '../services/aiService';

const GameContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useGame = () => useContext(GameContext);

const generateId = () => Math.random().toString(36).substr(2, 9);

export const GameProvider = ({ children }) => {
    const [gameState, setGameState] = useState({
        roomId: null,
        status: 'IDLE', // IDLE, LOBBY, PLAYING, VOTING, REVEAL, ENDED
        players: [],
        hostId: null,
        impostorId: null,
        votes: {},
        winner: null,
        secretWord: null,
        hint: null,
        loading: false
    });

    const [playerId] = useState(localStorage.getItem('playerId') || generateId());
    const [playerName, setPlayerName] = useState(localStorage.getItem('playerName') || '');
    const [error, setError] = useState(null);

    useEffect(() => {
        localStorage.setItem('playerId', playerId);
    }, [playerId]);

    useEffect(() => {
        if (playerName) localStorage.setItem('playerName', playerName);
    }, [playerName]);

    // Sync with Firestore
    useEffect(() => {
        if (!gameState.roomId) return;

        const roomRef = doc(db, 'rooms', gameState.roomId);

        const unsubscribe = onSnapshot(roomRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();

                // Security check: if I was removed, kick me out
                const amIInRoom = data.players?.some(p => p.id === playerId);
                if (!amIInRoom) {
                    setGameState({
                        roomId: null,
                        status: 'IDLE',
                        players: [],
                        hostId: null,
                        impostorId: null,
                        votes: {},
                        winner: null,
                        secretWord: null,
                        hint: null
                    });
                    setError("Has sido eliminado de la sala o esta se cerró.");
                    return;
                }

                setGameState(prev => ({
                    ...prev,
                    status: data.status,
                    players: data.players || [],
                    hostId: data.hostId,
                    impostorId: data.impostorId,
                    votes: data.votes || {},
                    winner: data.winner,
                    secretWord: data.secretWord,
                    hint: data.hint
                }));
            } else {
                setError('La sala ha sido eliminada.');
                setGameState(prev => ({ ...prev, roomId: null, status: 'IDLE' }));
            }
        }, (err) => {
            console.error("Firestore Error:", err);
            setError(err.message);
        });

        return () => unsubscribe();
    }, [gameState.roomId, playerId]);

    const createGame = async (name) => {
        try {
            console.log('GameContext: createGame called with:', name);
            setPlayerName(name);
            const roomId = generateId().toUpperCase().slice(0, 6);
            console.log('GameContext: Generated roomId:', roomId);
            const player = {
                id: playerId,
                name: name,
                isHost: true,
                isAlive: true,
            };

            await setDoc(doc(db, 'rooms', roomId), {
                hostId: playerId,
                status: 'LOBBY',
                players: [player],
                createdAt: new Date()
            });

            setGameState(prev => ({ ...prev, roomId }));
            return roomId;
        } catch (err) {
            console.error('GameContext: Error creating game:', err);
            setError('Error al crear el juego.');
            return null;
        }
    };

    const joinGame = async (roomId, name) => {
        try {
            setPlayerName(name);
            roomId = roomId.toUpperCase();

            const roomRef = doc(db, 'rooms', roomId);
            const roomSnap = await getDoc(roomRef);

            if (!roomSnap.exists()) {
                throw new Error('Sala no encontrada');
            }

            if (roomSnap.data().status !== 'LOBBY') {
                throw new Error('El juego ya ha comenzado');
            }

            const player = {
                id: playerId,
                name: name,
                isHost: false,
                isAlive: true
            };

            const currentPlayers = roomSnap.data().players || [];
            if (!currentPlayers.some(p => p.id === playerId)) {
                await updateDoc(roomRef, {
                    players: arrayUnion(player)
                });
            }

            setGameState(prev => ({ ...prev, roomId }));
        } catch (err) {
            console.error(err);
            setError(err.message);
            throw err;
        }
    };

    const startGame = async () => {
        if (!gameState.roomId) return;
        setGameState(prev => ({ ...prev, loading: true }));

        const roomRef = doc(db, 'rooms', gameState.roomId);
        const players = [...gameState.players];

        if (players.length < 3) {
            setError('Se necesitan mínimo 3 jugadores.');
            setGameState(prev => ({ ...prev, loading: false }));
            return;
        }

        try {
            // Assign Impostor
            const impostorIndex = Math.floor(Math.random() * players.length);
            const impostorId = players[impostorIndex].id;

            // Generate Word and Hint
            const { word, hint } = await generateWordPair();

            await updateDoc(roomRef, {
                status: 'PLAYING',
                impostorId: impostorId,
                secretWord: word,
                hint: hint,
                votes: {},
                winner: null,
                players: players.map(p => ({ ...p, isAlive: true })) // Reset alive status
            });
        } catch (e) {
            console.error("Error starting game", e);
            setError("Error al iniciar el juego");
        } finally {
            setGameState(prev => ({ ...prev, loading: false }));
        }
    };

    const castVote = async (targetId) => {
        if (!gameState.roomId) return;
        const roomRef = doc(db, 'rooms', gameState.roomId);
        const voteUpdate = {};
        voteUpdate[`votes.${playerId}`] = targetId;
        await updateDoc(roomRef, voteUpdate);
    };

    const triggerMeeting = async () => {
        if (!gameState.roomId) return;
        const roomRef = doc(db, 'rooms', gameState.roomId);
        await updateDoc(roomRef, { status: 'VOTING' });
    };

    const restartGame = async () => {
        if (!gameState.roomId) return;
        const roomRef = doc(db, 'rooms', gameState.roomId);
        await updateDoc(roomRef, {
            status: 'LOBBY',
            votes: {},
            winner: null,
            impostorId: null,
            secretWord: null,
            hint: null
        });
    }

    const leaveGame = async () => {
        if (!gameState.roomId) return;
        try {
            const roomRef = doc(db, 'rooms', gameState.roomId);
            const roomSnap = await getDoc(roomRef);

            if (roomSnap.exists()) {
                const players = roomSnap.data().players || [];
                const updatedPlayers = players.filter(p => p.id !== playerId);

                if (updatedPlayers.length === 0) {
                    await deleteDoc(roomRef);
                } else {
                    await updateDoc(roomRef, { players: updatedPlayers });
                }
            }
            resetGame();
        } catch (e) {
            console.error("Error leaving game", e);
        }
    };

    const resetGame = () => {
        setGameState({
            roomId: null,
            status: 'IDLE',
            players: [],
            hostId: null,
            impostorId: null,
            votes: {},
            winner: null,
            secretWord: null,
            hint: null
        });
        setError(null);
    };

    const value = {
        gameState,
        playerId,
        playerName,
        error,
        createGame,
        joinGame,
        startGame,
        castVote,
        triggerMeeting,
        restartGame,
        leaveGame,
        resetGame,
        setError
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};
