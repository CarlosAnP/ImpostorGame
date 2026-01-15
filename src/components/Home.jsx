import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Users, Play, LogIn } from 'lucide-react';

const Home = () => {
    const [name, setName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const { createGame, joinGame, error, setError } = useGame();
    const navigate = useNavigate();
    const [isJoining, setIsJoining] = useState(false);

    const handleCreate = async () => {
        if (!name) return setError('Please enter your name');
        console.log('Creating game with name:', name);
        const roomId = await createGame(name);
        console.log('Room ID returned:', roomId);
        if (roomId) {
            console.log('Navigating to /lobby');
            navigate('/lobby');
        } else {
            console.error('Failed to create room - no roomId returned');
        }
    };

    const handleJoin = async () => {
        if (!name || !roomCode) return setError('Please enter name and room code');
        try {
            await joinGame(roomCode, name);
            navigate('/lobby');
        } catch {
            // Error handled in context
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
            <div className="max-w-md w-full bg-slate-800 p-8 rounded-lg shadow-xl border border-slate-700">
                <h1 className="text-4xl font-bold text-center mb-8 text-emerald-400 tracking-wider">IMPOSTOR</h1>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Nickname</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                            placeholder="Enter your name"
                        />
                    </div>

                    {!isJoining ? (
                        <div className="space-y-3">
                            <button
                                onClick={handleCreate}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded font-bold transition flex items-center justify-center gap-2"
                            >
                                <Play size={20} /> Create Game
                            </button>
                            <button
                                onClick={() => setIsJoining(true)}
                                className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded font-bold transition flex items-center justify-center gap-2"
                            >
                                <Users size={20} /> Join Game
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Room Code</label>
                                <input
                                    type="text"
                                    value={roomCode}
                                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                    className="w-full bg-slate-700 border border-slate-600 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-mono tracking-widest text-center text-lg"
                                    placeholder="XY12Z"
                                    maxLength={6}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsJoining(false)}
                                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded font-bold transition"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleJoin}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded font-bold transition flex items-center justify-center gap-2"
                                >
                                    <LogIn size={20} /> Join
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;
