import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Skull, AlertTriangle, CheckCircle, Crosshair } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const GamePhase = () => {
    const { gameState, playerId, triggerMeeting } = useGame();
    const [tasksDone, setTasksDone] = useState(0);

    const me = gameState.players.find(p => p.id === playerId);
    const isImpostor = me?.id === gameState.impostorId;
    const isAlive = me?.isAlive;

    const handleKill = async (targetId) => {
        if (!isImpostor || !isAlive) return;
        try {
            // In a real app, verify cooldowns etc.
            const roomRef = doc(db, 'rooms', gameState.roomId);
            // We need to update the player list. Ideally GameContext should handle this.
            // For quick implementation:
            const updatedPlayers = gameState.players.map(p =>
                p.id === targetId ? { ...p, isAlive: false } : p
            );

            // Check win condition (Impostors >= Crewmates)
            const aliveImpostors = updatedPlayers.filter(p => p.id === gameState.impostorId && p.isAlive).length;
            const aliveCrew = updatedPlayers.filter(p => p.id !== gameState.impostorId && p.isAlive).length;

            let updates = { players: updatedPlayers };
            if (aliveImpostors >= aliveCrew) {
                updates.status = 'ENDED';
                updates.winner = 'Impostor';
            }

            await updateDoc(roomRef, updates);

        } catch (e) {
            console.error("Kill failed", e);
        }
    };

    const doTask = () => {
        setTasksDone(prev => prev + 1);
        // Could send task progress to server to check Crewmate win condition
    };

    if (!isAlive) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-red-900/20 text-red-500">
                <Skull size={64} className="mb-4" />
                <h1 className="text-4xl font-bold">YOU ARE DEAD</h1>
                <p>Wait for the game to end.</p>
            </div>
        )
    }

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <header className="flex justify-between items-center mb-8 bg-slate-800 p-4 rounded-lg">
                <div>
                    <h2 className="text-xl font-bold">Role:
                        <span className={isImpostor ? "text-red-500 ml-2" : "text-emerald-500 ml-2"}>
                            {isImpostor ? 'IMPOSTOR' : 'CREWMATE'}
                        </span>
                    </h2>
                    <p className="text-sm text-slate-400">{isImpostor ? 'Kill everyone.' : 'Do tasks and survive.'}</p>
                </div>
                <button
                    onClick={triggerMeeting}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2 animate-pulse"
                >
                    <AlertTriangle size={20} /> EMERGENCY MEETING
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Task Area */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <h3 className="tex-lg font-bold mb-4 flex items-center gap-2"><CheckCircle size={20} className="text-blue-400" /> Tasks</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-slate-700 p-3 rounded">
                            <span>Fix Wiring</span>
                            <button onClick={doTask} className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-sm">Do Task</button>
                        </div>
                        <div className="flex justify-between items-center bg-slate-700 p-3 rounded">
                            <span>Clean O2 Filter</span>
                            <button onClick={doTask} className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-sm">Do Task</button>
                        </div>
                        <p className="text-center text-slate-400 mt-4">Tasks Completed: {tasksDone}</p>
                    </div>
                </div>

                {/* Players / Kill Area */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <h3 className="tex-lg font-bold mb-4 flex items-center gap-2">Nearby Players</h3>
                    <ul className="space-y-3">
                        {gameState.players.map(player => {
                            if (player.id === playerId || !player.isAlive) return null;
                            return (
                                <li key={player.id} className="flex justify-between items-center bg-slate-700 p-3 rounded">
                                    <span className="font-bold">{player.name}</span>
                                    {isImpostor && (
                                        <button
                                            onClick={() => handleKill(player.id)}
                                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full"
                                            title="Kill"
                                        >
                                            <Crosshair size={20} />
                                        </button>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default GamePhase;
