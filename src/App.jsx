import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Lobby from './components/Lobby';
import GameRoom from './components/GameRoom';
import { useGame } from './context/GameContext';

import PropTypes from 'prop-types';

const ProtectedRoute = ({ children }) => {
  const { gameState } = useGame();
  if (!gameState.roomId) {
    return <Navigate to="/" />;
  }
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900 text-white font-sans">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lobby" element={
            <ProtectedRoute>
              <Lobby />
            </ProtectedRoute>
          } />
          <Route path="/game" element={
            <ProtectedRoute>
              <GameRoom />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
