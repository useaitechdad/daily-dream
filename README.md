# Daily Dream

A cozy chibi character simulator — a weekend build with my daughter.
Inspired by the spirit of life-sim games where tiny characters live tiny lives.

## Project Overview

Daily Dream is being developed in phases. Currently, the project consists of two main components:

### Phase 1: Mii Designer
A web-based chibi character designer where you can build and customize your own "Miis" using a fully procedural SVG rendering system.
- **Customization**: Name, personality traits, skin tone, body shape, outfit style, accessories, and detailed facial features.
- **Real-time Preview**: Live SVG rendering updates instantly as you tweak controls.
- **Storage**: Save characters locally, or import/export them as JSON files to share or back up.
- **Tech Stack**: Vanilla HTML, CSS, and ES2022 JavaScript (No framework, no bundler needed for local use).

### Phase 2: Real-time Dialogue Server
A backend orchestration server that brings the Miis to life, allowing them to have real-time, spoken conversations with each other based on their defined personalities.
- **AI-Powered**: Uses Google Gemini's Live API (`gemini-3.1-flash-live-preview`) to generate organic, turn-based dialogue.
- **Real-time Streaming**: Bi-directional audio streaming and interruption handling via WebSockets.
- **Personality Driven**: The AI dynamically adopts the personality traits, introversion/extroversion levels, and background notes defined in the Mii Designer.
- **Tech Stack**: Python, FastAPI, WebSockets, Google GenAI SDK.

## Getting Started

### Mii Designer
To open the Mii Designer, simply double-click the `apps/mii-designer/index.html` file in your browser. No development server is required! 

*(Note: If you make changes to the ES module source files in `apps/mii-designer/main.js` or `lib/*.js`, you must run `node apps/mii-designer/build.js` from the repository root to regenerate the `app.js` bundle.)*

### Dialogue Server
To run the real-time dialogue server:

1. Navigate to the server directory:
   ```bash
   cd apps/mii-dialogue-server
   ```
2. Set up your Python virtual environment and install dependencies:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
3. Create a `.env` file in `apps/mii-dialogue-server/` with your Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_key_here
   ```
4. Start the server:
   ```bash
   python3 server.py
   ```
5. Once the server is running, open the Mii Designer in your browser, click **Open Dialogue Mode**, select two different Miis, set a topic, and start the conversation!

## Future Phases
- **Phase 3**: Simulation loops, relationships, and apartment logic.
- **Phase 4**: Concert halls, dream sequences, and more advanced life-sim features.