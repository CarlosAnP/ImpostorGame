import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Vote } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const VotingPhase = () => {
    const { gameState, playerId, castVote } = useGame();
    const [hasVoted, setHasVoted] = useState(false);

    const me = gameState.players.find(p => p.id === playerId);
    const isHost = me?.isHost;

    // Host calculates results
    useEffect(() => {
        if (!isHost) return;

        // Check if everyone voted (alive players)
        const alivePlayers = gameState.players.filter(p => p.isAlive);
        const votesCast = Object.keys(gameState.votes).length;

        if (votesCast >= alivePlayers.length && alivePlayers.length > 0) {
            const calculateResults = async () => {
                // Tally votes
                const voteCounts = {};
                Object.values(gameState.votes).forEach(targetId => {
                    voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
                });

                // Find max
                let maxVotes = 0;
                let ejectedId = null;
                for (const [id, count] of Object.entries(voteCounts)) {
                    if (count > maxVotes) {
                        maxVotes = count;
                        ejectedId = id;
                    } else if (count === maxVotes) {
                        ejectedId = null; // Tie = no eject
                    }
                }

                // Determine winner logic:
                // If ejectedId IS impostor -> Crew wins
                // If ejectedId NOT impostor -> Impostor wins (Spyfall style sudden death)
                // Or if Tie -> Impostor wins? Or continue? Let's say Impostor wins on tie/miss for simplicity for now

                let winner = null;
                if (ejectedId === gameState.impostorId) {
                    winner = 'AMIGOS';
                } else {
                    winner = 'IMPOSTOR'; // Wrong guess or tie -> Impostor wins
                }

                const roomRef = doc(db, 'rooms', gameState.roomId);
                await updateDoc(roomRef, {
                    status: 'REVEAL', // Change to REVEAL instead of ENDED directly
                    winner: winner,
                    // We don't kill players in this mode, game ends after vote
                });
            };

            // Small delay to show results then proceed
            const timer = setTimeout(() => {
                calculateResults();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [gameState.votes, isHost, gameState.players, gameState.impostorId, gameState.roomId]);

    const handleVote = (targetId) => {
        if (hasVoted) return;
        castVote(targetId);
        setHasVoted(true);
    };

    return (
        <div className="min-h-screen bg-slate-900 p-8 text-white flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <Vote className="text-emerald-500" size={32} /> ¿QUIÉN ES EL IMPOSTOR?
            </h1>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl">
                {gameState.players.map(player => (
                    <div
                        key={player.id}
                        className={`relative bg-slate-800 border-2 ${gameState.votes[playerId] === player.id ? 'border-emerald-500' : 'border-slate-700'} rounded-xl p-4 flex flex-col items-center gap-2 transition hover:bg-slate-700`}
                    >
                        <div className="w-16 h-16 bg-slate-600 rounded-full flex items-center justify-center text-2xl font-bold">
                            {player.name[0]}
                        </div>
                        <span className="font-bold text-lg">{player.name}</span>

                        {/* Show votes received */}
                        <div className="flex gap-1 mt-2">
                            {Object.entries(gameState.votes).map(([voterId, targetId]) => {
                                if (targetId === player.id) {
                                    const voter = gameState.players.find(p => p.id === voterId);
                                    return (
                                        <div key={voterId} className="w-6 h-6 rounded-full bg-blue-500 text-xs flex items-center justify-center" title={voter?.name}>
                                            {voter?.name[0]}
                                        </div>
                                    )
                                }
                                return null;
                            })}
                        </div>

                        {player.id !== playerId && !hasVoted && (
                            <button
                                onClick={() => handleVote(player.id)}
                                className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded text-sm font-bold uppercase"
                            >
                                VOTAR
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {hasVoted && <p className="mt-8 text-slate-400 animate-pulse">Esperando votos...</p>}
        </div>
    );
};

export default VotingPhase;

