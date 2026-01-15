# Impostor Game

A real-time multiplayer "Impostor" game built with React, Vite, Firebase, and Tailwind CSS.

## Prerequisites

1.  **Node.js**: Ensure you have Node.js installed.
2.  **Firebase Project**: You need a Firebase project with **Firestore** enabled.

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Configure Firebase**:
    - Go to [Firebase Console](https://console.firebase.google.com/).
    - Create a new project (or use an existing one).
    - Enable **Firestore Database** (start in Test Mode for development).
    - Go to Project Settings -> General -> Your apps -> Web app.
    - Copy the configuration object (apiKey, authDomain, etc.).
    - Open `src/firebase.js` in this project.
    - Replace the placeholder configuration with your actual Firebase config.

## Running the App

Start the development server:

```bash
npm run dev
```

Open your browser at `http://localhost:5173`.

## How to Play

1.  **Host**:
    - Enter your name.
    - Click **Create Game**.
    - Share the **Room Code** with friends.
    - Wait for players to join (min 3).
    - Click **Start Game**.

2.  **Join**:
    - Enter your name.
    - Click **Join Game**.
    - Enter the Room Code provided by the host.

3.  **Gameplay**:
    - **Crewmates**: Complete tasks (simulate by clicking buttons).
    - **Impostors**: Kill crewmates without getting caught.
    - **Emergency Meeting**: Call a meeting to vote out the Impostor.

## Notes

- This is a local frontend project. Hosting requires building (`npm run build`) and deploying to a static host like Firebase Hosting or Vercel.
- Game logic is client-side and synchronized via Firestore.
