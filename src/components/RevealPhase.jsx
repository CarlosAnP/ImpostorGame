import React from 'react';
import { useGame } from '../context/GameContext';
import { Trophy, Frown, RotateCcw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RevealPhase = () => {
    const { gameState, playerId, restartGame, leaveGame } = useGame();
    const navigate = useNavigate();

    const winner = gameState.winner; // 'IMPOSTOR' or 'AMIGOS'
    const isImpostor = gameState.impostorId === playerId;
    const isHost = gameState.hostId === playerId;

    // Determine result message
    let resultTitle = "";
    let resultColor = "";
    let Icon = Trophy;

    if (winner === 'IMPOSTOR') {
        resultTitle = "¡EL IMPOSTOR GANÓ!";
        resultColor = "text-red-500";
        if (!isImpostor) Icon = Frown;
    } else {
        resultTitle = "¡LOS AMIGOS GANARON!";
        resultColor = "text-emerald-500";
        if (isImpostor) Icon = Frown;
    }

    const impostorName = gameState.players.find(p => p.id === gameState.impostorId)?.name || 'Desconocido';

    const handleExit = () => {
        leaveGame();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6 animate-in fade-in zoom-in duration-500">
            <div className="bg-slate-800 p-10 rounded-2xl shadow-2xl text-center max-w-lg w-full border border-slate-700">
                <Icon className={`mx-auto mb-6 ${resultColor} drop-shadow-lg`} size={80} />

                <h1 className={`text-4xl font-black mb-2 ${resultColor} tracking-tighter uppercase`}>
                    {resultTitle}
                </h1>

                <div className="my-8 space-y-4 bg-slate-900/50 p-6 rounded-xl">
                    <div>
                        <p className="text-slate-400 text-sm uppercase font-bold tracking-widest mb-1">El Impostor era</p>
                        <p className="text-2xl font-bold text-red-400">{impostorName}</p>
                    </div>

                    <div className="border-t border-slate-700 pt-4">
                        <p className="text-slate-400 text-sm uppercase font-bold tracking-widest mb-1">La Palabra Secreta era</p>
                        <p className="text-2xl font-bold text-emerald-400">{gameState.secretWord || '???'}</p>
                    </div>

                    <div className="border-t border-slate-700 pt-4">
                        <p className="text-slate-400 text-sm uppercase font-bold tracking-widest mb-1">La Pista era</p>
                        <p className="text-xl font-medium text-blue-300 italic">"{gameState.hint || '???'}"</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {isHost ? (
                        <button
                            onClick={restartGame}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 transform hover:scale-105"
                        >
                            <RotateCcw size={24} /> JUGAR OTRA VEZ
                        </button>
                    ) : (
                        <p className="text-slate-500 italic animate-pulse">Esperando al anfitrión...</p>
                    )}

                    <button
                        onClick={handleExit}
                        className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                    >
                        <Home size={20} /> Salir al Inicio
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RevealPhase;
