import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Eye, EyeOff, AlertTriangle, MessageSquare } from 'lucide-react';

const GamePhase = () => {
    const { gameState, playerId, triggerMeeting } = useGame();
    const [showRole, setShowRole] = useState(false);

    const me = gameState.players.find(p => p.id === playerId);
    const isImpostor = me?.id === gameState.impostorId;
    const secretWord = gameState.secretWord;
    const hint = gameState.hint;

    const myWord = isImpostor ? hint : secretWord;
    const roleTitle = isImpostor ? "IMPOSTOR" : "AMIGO";
    const roleColor = isImpostor ? "text-red-500" : "text-emerald-500";

    return (
        <div className="min-h-screen bg-slate-900 text-white p-4 flex flex-col items-center">
            <div className="max-w-2xl w-full space-y-8">

                {/* Role Card */}
                <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 shadow-2xl text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

                    <h2 className="text-2xl font-bold mb-6 text-slate-300">Tu Rol:</h2>

                    <div className="mb-8">
                        <h1 className={`text-5xl font-black tracking-widest ${roleColor} drop-shadow-lg mb-2`}>
                            {showRole ? roleTitle : "?"}
                        </h1>
                        <p className="text-slate-400 text-sm">
                            {showRole
                                ? (isImpostor ? "Engaña a los demás. No sabes la palabra secreta." : "Descubre al impostor. Todos tienen la misma palabra.")
                                : "Toca el ojo para revelar"}
                        </p>
                    </div>

                    <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700 mb-8">
                        <p className="text-sm text-slate-400 mb-2 uppercase tracking-wide font-bold">
                            {isImpostor ? "TU PISTA:" : "TU PALABRA:"}
                        </p>
                        <p className="text-3xl font-bold text-white">
                            {showRole ? myWord : "••••••••"}
                        </p>
                    </div>

                    <button
                        onClick={() => setShowRole(!showRole)}
                        className="flex items-center justify-center gap-2 mx-auto text-slate-400 hover:text-white transition"
                    >
                        {showRole ? <EyeOff size={20} /> : <Eye size={20} />}
                        {showRole ? "Ocultar Información" : "Mostrar Información"}
                    </button>
                </div>

                {/* Instructions / Action Area */}
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <div className="flex items-center gap-3 mb-4 text-emerald-400">
                        <MessageSquare size={24} />
                        <h3 className="text-xl font-bold">Fase de Discusión</h3>
                    </div>
                    <ul className="list-disc list-inside space-y-2 text-slate-300 text-lg">
                        <li>Observa tu palabra o pista arriba.</li>
                        <li>Por turnos, digan una palabra relacionada.</li>
                        <li>¡Cuidado! No seas muy obvio.</li>
                        <li>El Impostor intentará encajar.</li>
                    </ul>
                </div>

                {/* Voting Trigger */}
                {me?.isHost && (
                    <button
                        onClick={triggerMeeting}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 text-xl shadow-lg hover:shadow-red-900/20 transition transform hover:scale-105"
                    >
                        <AlertTriangle size={28} /> INICIAR VOTACIÓN
                    </button>
                )}

                {!me?.isHost && (
                    <p className="text-center text-slate-500 animate-pulse">
                        Esperando a que el anfitrión inicie la votación...
                    </p>
                )}
            </div>
        </div>
    );
};

export default GamePhase;

