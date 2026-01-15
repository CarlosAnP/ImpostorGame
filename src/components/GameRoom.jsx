import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import GamePhase from './GamePhase';
import VotingPhase from './VotingPhase';
import RevealPhase from './RevealPhase';
import { useNavigate } from 'react-router-dom';

const GameRoom = () => {
    const { gameState } = useGame();
    const navigate = useNavigate();

    // Redirect if game ends or not in room
    useEffect(() => {
        if (!gameState.roomId) {
            navigate('/');
        }
    }, [gameState.roomId, navigate]);

    if (gameState.status === 'VOTING') {
        return <VotingPhase />;
    }

    if (gameState.status === 'REVEAL' || gameState.status === 'ENDED') {
        return <RevealPhase />;
    }

    return <GamePhase />;
};

export default GameRoom;
