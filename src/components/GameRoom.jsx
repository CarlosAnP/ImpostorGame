import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import GamePhase from './GamePhase';
import VotingPhase from './VotingPhase';
import { useNavigate } from 'react-router-dom';

const GameRoom = () => {
    const { gameState, resetGame } = useGame();
    const navigate = useNavigate();

    // Redirect if game ends or not in room
    useEffect(() => {
        if (!gameState.roomId) {
            navigate('/');
        }
    }, [gameState.roomId, navigate]);

    if (gameState.status === 'ENDED') {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
                <h1 className="text-5xl font-black mb-6 text-emerald-500">GAME OVER</h1>
                <div className="bg-slate-800 p-8 rounded-xl text-center border border-slate-700 shadow-2xl">
                    <p className="text-2xl mb-4">Winner:</p>
                    <p className="text-4xl font-bold text-yellow-500 mb-8">{gameState.winner || 'Crewmates'} wins!</p>
                    <button
                        onClick={() => { resetGame(); navigate('/'); }}
                        className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-bold transition"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {gameState.status === 'VOTING' ? <VotingPhase /> : <GamePhase />}
        </div>
    );
};

export default GameRoom;
