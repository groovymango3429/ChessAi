# ♔ Chess AI ♚

A web-based chess game with an intelligent AI opponent. Play directly in your browser - no installation required!

🎮 **[Play Now on GitHub Pages](https://groovymango3429.github.io/ChessAi/)**

## Features

### Improved AI Engine
- **Advanced Minimax Algorithm** with alpha-beta pruning for efficient move calculation
- **Piece-Square Tables** for positional evaluation
- **Move Ordering** to optimize alpha-beta pruning performance
- **Material and Positional Evaluation** for stronger gameplay
- **Adjustable Difficulty Levels** from Easy (Depth 1) to Master (Depth 5)

### Enhanced User Experience
- **Modern, Responsive Design** works on desktop and mobile devices
- **Interactive Chess Board** with drag-and-click piece movement
- **Visual Feedback** with highlighted squares for selected pieces and valid moves
- **Last Move Highlighting** to track game progress
- **Real-time Position Evaluation** display
- **Undo Move** functionality to take back mistakes
- **Clean UI** with beautiful gradient background and smooth animations

## How to Play

1. **Make Your Move**: Click on one of your pieces (white) to select it
2. **Choose Destination**: Click on a highlighted square to move the piece
3. **AI Responds**: The AI will automatically make its move (black pieces)
4. **Adjust Difficulty**: Use the dropdown menu to change AI difficulty level
5. **Undo Moves**: Click "Undo Move" to take back your last move
6. **New Game**: Start fresh anytime with the "New Game" button

## AI Improvements

This version features significant improvements over the original Python implementation:

### Performance Enhancements
- **Minimax with Alpha-Beta Pruning**: Reduces the number of positions evaluated by up to 90%
- **Move Ordering**: Evaluates captures first to maximize pruning efficiency
- **Piece-Square Tables**: Adds positional understanding beyond simple material counting
- **Iterative Deepening**: Allows for adjustable difficulty levels

### Strategic Improvements
- Better opening play with piece-square table bonuses
- Improved king safety evaluation
- Enhanced pawn structure awareness
- More aggressive piece positioning

## Technical Details

### Technologies Used
- **HTML5** for structure
- **CSS3** for styling with modern animations and responsive design
- **Vanilla JavaScript** for game logic and AI (no external dependencies)

### AI Algorithm
The AI uses a minimax algorithm with alpha-beta pruning:
- **Search Depth**: Configurable from 1-5 moves ahead
- **Evaluation Function**: Combines material count with positional bonuses
- **Pruning**: Alpha-beta cutoffs reduce search space significantly
- **Move Generation**: Legal move validation for all piece types

## Local Development

To run locally:

```bash
# Clone the repository
git clone https://github.com/groovymango3429/ChessAi.git
cd ChessAi

# Serve with any HTTP server, for example:
python -m http.server 8000

# Open http://localhost:8000 in your browser
```

## GitHub Pages Deployment

This project is configured for GitHub Pages. Any updates to the main branch will automatically be deployed.

To deploy to your own GitHub Pages:
1. Fork this repository
2. Go to Settings > Pages
3. Set Source to "Deploy from a branch"
4. Select "main" branch and "/ (root)" folder
5. Save and wait a few minutes for deployment

## License

MIT License - feel free to use and modify!

## Original Python Version

The original Python/Pygame version is still available in the repository (main.py, patfish.py) for reference. However, the web version offers better accessibility and improved AI performance.
