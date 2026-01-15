import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Users, Copy, Crown, Play, Loader2 } from 'lucide-react';

const Lobby = () => {
    const { gameState, playerId, startGame, leaveGame } = useGame();
    const navigate = useNavigate();

    useEffect(() => {
        if (gameState.status === 'PLAYING') {
            navigate('/game');
        }
    }, [gameState.status, navigate]);

    const copyCode = () => {
        navigator.clipboard.writeText(gameState.roomId);
    };

    const isHost = gameState.hostId === playerId;

    if (!gameState.roomId) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white bg-slate-900">
                <div className="text-center">
                    <h2 className="text-2xl mb-4">No estás en una sala</h2>
                    <button onClick={() => navigate('/')} className="bg-emerald-600 px-4 py-2 rounded">Ir al Inicio</button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-10 border-b border-slate-700 pb-6">
                    <h1 className="text-3xl font-bold text-emerald-400">Sala de Espera</h1>
                    <div className="flex items-center gap-4 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
                        <span className="text-slate-400 text-sm">CÓDIGO:</span>
                        <span className="font-mono text-xl tracking-wider font-bold">{gameState.roomId}</span>
                        <button onClick={copyCode} className="hover:text-emerald-400 transition" title="Copiar"><Copy size={18} /></button>
                    </div>
                </header>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2"><Users size={24} /> Jugadores ({gameState.players.length})</h2>
                            {gameState.players.length < 3 && <span className="text-yellow-500 text-sm">Faltan {3 - gameState.players.length} para iniciar</span>}
                        </div>

                        <ul className="space-y-3">
                            {gameState.players.map(player => (
                                <li key={player.id} className={`flex items-center justify-between p-3 rounded bg-slate-700/50 border border-slate-700 ${player.id === playerId ? 'ring-1 ring-emerald-500' : ''}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${player.id === playerId ? 'bg-emerald-600' : 'bg-slate-600'}`}>
                                            {player.name[0].toUpperCase()}
                                        </div>
                                        <span className={player.id === playerId ? 'font-bold text-emerald-400' : ''}>
                                            {player.name} {player.id === playerId && '(Tú)'}
                                        </span>
                                    </div>
                                    {player.isHost && <Crown size={16} className="text-yellow-500" />}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex flex-col justify-center space-y-6">
                        <div className="bg-slate-800/50 p-6 rounded-xl border border-dashed border-slate-700 text-center">
                            <h3 className="text-lg font-bold mb-2">Instrucciones</h3>
                            <p className="text-slate-400 text-sm">
                                🕵️ 1 Impostor recibe una PISTA.<br />
                                👥 Los demás reciben la PALABRA.<br />
                                🗣️ Digan una palabra relacionada por turnos.<br />
                                🗳️ ¡Voten para descubrir al impostor!
                            </p>
                        </div>

                        {isHost ? (
                            <button
                                onClick={startGame}
                                disabled={gameState.players.length < 3 || gameState.loading}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xl font-bold py-6 rounded-xl shadow-xl transition flex items-center justify-center gap-3"
                            >
                                {gameState.loading ? <Loader2 className="animate-spin" /> : <Play size={28} />}
                                {gameState.loading ? 'INICIANDO...' : 'INICIAR PARTIDA'}
                            </button>
                        ) : (
                            <div className="text-center p-6 bg-slate-800 rounded-xl animate-pulse">
                                <p className="text-xl font-bold text-slate-300">Esperando al anfitrión...</p>
                            </div>
                        )}

                        <button onClick={() => { leaveGame(); navigate('/'); }} className="text-slate-500 hover:text-red-400 underline pt-4">
                            Salir de la Sala
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Lobby;

