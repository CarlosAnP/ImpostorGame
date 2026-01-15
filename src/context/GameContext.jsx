import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import {
    doc,
    setDoc,
    getDoc,
    onSnapshot,
    updateDoc,
    arrayUnion
} from 'firebase/firestore';

const GameContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useGame = () => useContext(GameContext);

const generateId = () => Math.random().toString(36).substr(2, 9);

export const GameProvider = ({ children }) => {
    const [gameState, setGameState] = useState({
        roomId: null,
        status: 'IDLE', // IDLE, LOBBY, PLAYING, VOTING, ENDED
        players: [],
        hostId: null,
        impostorId: null,
        votes: {},
        winner: null
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
                setGameState(prev => ({
                    ...prev,
                    status: data.status,
                    players: data.players || [],
                    hostId: data.hostId,
                    impostorId: data.impostorId,
                    votes: data.votes || {},
                    winner: data.winner
                }));
            } else {
                setError('Room does not exist or was deleted.');
                setGameState(prev => ({ ...prev, roomId: null, status: 'IDLE' }));
            }
        }, (err) => {
            console.error("Firestore Error:", err);
            setError(err.message);
        });

        return () => unsubscribe();
    }, [gameState.roomId]);

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
                // isImpostor will be assigned when game starts
            };

            console.log('GameContext: Writing to Firestore...');
            await setDoc(doc(db, 'rooms', roomId), {
                hostId: playerId,
                status: 'LOBBY',
                players: [player],
                createdAt: new Date()
            });
            console.log('GameContext: Firestore write successful');

            setGameState(prev => ({ ...prev, roomId }));
            console.log('GameContext: State updated, returning roomId:', roomId);
            return roomId;
        } catch (err) {
            console.error('GameContext: Error creating game:', err);
            setError('Failed to create game.');
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
                throw new Error('Room not found');
            }

            if (roomSnap.data().status !== 'LOBBY') {
                throw new Error('Game already in progress');
            }

            const player = {
                id: playerId,
                name: name,
                isHost: false,
                isAlive: true
            };

            // Check if player already joined
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

        const roomRef = doc(db, 'rooms', gameState.roomId);
        const players = [...gameState.players];

        if (players.length < 3) {
            setError('Need at least 3 players to start.');
            return;
        }

        // Assign Impostor
        const impostorIndex = Math.floor(Math.random() * players.length);
        const impostorId = players[impostorIndex].id;

        await updateDoc(roomRef, {
            status: 'PLAYING',
            impostorId: impostorId,
            votes: {}
        });
    };

    const castVote = async (targetId) => {
        if (!gameState.roomId) return;
        const roomRef = doc(db, 'rooms', gameState.roomId);

        // Simple object map update: "voterId": "targetId"
        const voteUpdate = {};
        voteUpdate[`votes.${playerId}`] = targetId;

        await updateDoc(roomRef, voteUpdate);
    };

    const triggerMeeting = async () => {
        if (!gameState.roomId) return;
        const roomRef = doc(db, 'rooms', gameState.roomId);
        await updateDoc(roomRef, { status: 'VOTING' });
    };

    const resetGame = () => {
        setGameState({
            roomId: null,
            status: 'IDLE',
            players: [],
            hostId: null,
            impostorId: null,
            votes: {},
            winner: null
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
        resetGame,
        setError
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};
