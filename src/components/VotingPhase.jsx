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
                    if (targetId === 'skip') return;
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

                // Process Ejection
                let updatedPlayers = [...gameState.players];
                let winner = null;

                if (ejectedId) {
                    updatedPlayers = updatedPlayers.map(p =>
                        p.id === ejectedId ? { ...p, isAlive: false } : p
                    );
                }

                // Check Win Conditions
                const impostor = updatedPlayers.find(p => p.id === gameState.impostorId);
                const aliveImpostors = impostor.isAlive ? 1 : 0;
                const aliveCrew = updatedPlayers.filter(p => p.id !== gameState.impostorId && p.isAlive).length;

                if (aliveImpostors === 0) {
                    winner = 'Crewmates';
                } else if (aliveImpostors >= aliveCrew) {
                    winner = 'Impostor';
                }

                const roomRef = doc(db, 'rooms', gameState.roomId);
                await updateDoc(roomRef, {
                    players: updatedPlayers,
                    votes: {},
                    status: winner ? 'ENDED' : 'PLAYING',
                    winner: winner || null
                });
            };

            // Small delay to show results then proceed
            const timer = setTimeout(() => {
                calculateResults();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [gameState.votes, isHost, gameState.players, gameState.impostorId, gameState.roomId]);

    const handleVote = (targetId) => {
        if (hasVoted || !me.isAlive) return;
        castVote(targetId);
        setHasVoted(true);
    };

    return (
        <div className="min-h-screen bg-slate-900 p-8 text-white flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <Vote className="text-emerald-500" size={32} /> WHO IS THE IMPOSTOR?
            </h1>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl">
                {gameState.players.map(player => (
                    <div
                        key={player.id}
                        className={`relative bg-slate-800 border-2 ${gameState.votes[playerId] === player.id ? 'border-emerald-500' : 'border-slate-700'} rounded-xl p-4 flex flex-col items-center gap-2 transition hover:bg-slate-700`}
                    >
                        {!player.isAlive && <div className="absolute inset-0 bg-red-900/50 flex items-center justify-center rounded-xl z-10 font-bold text-red-300">DEAD</div>}

                        <div className="w-16 h-16 bg-slate-600 rounded-full flex items-center justify-center text-2xl font-bold">
                            {player.name[0]}
                        </div>
                        <span className="font-bold text-lg">{player.name}</span>

                        {/* Show votes received (publicly visible for fun/simplicity) */}
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

                        {player.isAlive && me.isAlive && !hasVoted && (
                            <button
                                onClick={() => handleVote(player.id)}
                                className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded text-sm font-bold uppercase"
                            >
                                Vote
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {hasVoted && <p className="mt-8 text-slate-400 animate-pulse">Waiting for other players...</p>}
            {!me.isAlive && <p className="mt-8 text-red-400">You are dead and cannot vote effectively (logic simplified).</p>}
        </div>
    );
};

export default VotingPhase;
