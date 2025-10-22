import sys
import chess
import os
import subprocess
import time
import pygame
# No need for pygame audio setup since we are using playsound
TILE_SIZE = 45
BOARD_SIZE = TILE_SIZE * 8
size = width, height = BOARD_SIZE + 50, BOARD_SIZE + 100  # Extra space for text and evaluation bar
screen = pygame.display.set_mode(size)
pygame.init()
pygame.display.set_caption("Chess Board")

WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
LIGHT_BROWN = (240, 217, 181)
DARK_BROWN = (181, 136, 99)
HIGHLIGHT_COLOR = (0, 255, 0)
TEXT_COLOR = (255, 255, 255)
EVAL_BAR_COLOR = (120, 148, 84)  # Color for the evaluation bar
CHECKMATE_COLOR = (255, 0, 0)  # Color for checkmate tile

def load_piece_images():
    pieces = {}
    piece_symbols = ['p', 'n', 'b', 'r', 'q', 'k', 'P', 'N', 'B', 'R', 'Q', 'K']
    for symbol in piece_symbols:
        piece_image = pygame.image.load(f"assets/{symbol}.png")
        piece_image = pygame.transform.scale(piece_image, (TILE_SIZE, TILE_SIZE))
        pieces[symbol] = piece_image
    return pieces

board = chess.Board()
piece_images = load_piece_images()

dragging_piece = None
dragging_start_square = None
dragging_mouse_pos = None
last_ai_move = None
move_start_time = None
ai_move_time = 0
current_evaluation = 0  # Track the current evaluation score

def draw_board():
    for row in range(8):
        for col in range(8):
            color = LIGHT_BROWN if (row + col) % 2 == 0 else DARK_BROWN
            pygame.draw.rect(screen, color, pygame.Rect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE))

def highlight_square(square, color=HIGHLIGHT_COLOR):
    x = (square % 8) * TILE_SIZE
    y = (7 - (square // 8)) * TILE_SIZE
    pygame.draw.rect(screen, color, pygame.Rect(x, y, TILE_SIZE, TILE_SIZE), 4)

def draw_pieces():
    for square in chess.SQUARES:
        piece = board.piece_at(square)
        if piece and square != dragging_start_square:
            x = (square % 8) * TILE_SIZE
            y = (7 - (square // 8)) * TILE_SIZE
            symbol = piece.symbol()
            screen.blit(piece_images[symbol], (x, y))

    if dragging_piece and dragging_mouse_pos:
        screen.blit(dragging_piece, (dragging_mouse_pos[0] - TILE_SIZE // 2, dragging_mouse_pos[1] - TILE_SIZE // 2))

def pixel_to_square(x, y):
    col = x // TILE_SIZE
    row = 7 - (y // TILE_SIZE)
    return chess.square(col, row)

def handle_pawn_promotion(move):
    piece = board.piece_at(move.from_square)
    to_rank = chess.square_rank(move.to_square)
    if piece and piece.piece_type == chess.PAWN and (to_rank == 0 or to_rank == 7):
        return chess.Move(move.from_square, move.to_square, promotion=chess.QUEEN)
    return move

def ai_move(board):
    global move_start_time, ai_move_time, current_evaluation
    move_start_time = time.time()

    try:
        process = subprocess.Popen(
            ["python", "patfish.py"],  # Ensure this path is correct
            stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
            text=True
        )

        process.stdin.write("uci\n")
        process.stdin.flush()
        process.stdin.write("isready\n")
        process.stdin.flush()

        response = process.stdout.readline().strip()
        if response == "readyok":
            print("Bot is ready!")

        fen = board.fen()
        process.stdin.write(f"position fen {fen}\n")
        process.stdin.flush()
        process.stdin.write("go depth 5\n")
        process.stdin.flush()

        move = ""
        evaluation = 0
        while not move.startswith("bestmove"):
            line = process.stdout.readline().strip()
            if line.startswith("info") and "score cp" in line:
                # Extract evaluation score from the engine output
                parts = line.split()
                cp_index = parts.index("cp")
                evaluation = int(parts[cp_index + 1])  # Centipawns
            if line.startswith("bestmove"):
                move = line

        move_str = move.split()[1]
        print("AI Chose: ", move_str)
        process.stdin.write("quit\n")
        process.stdin.flush()
        process.terminate()

        ai_move_time = time.time() - move_start_time
        move_start_time = None
        current_evaluation = evaluation  # Update the current evaluation

        return move_str

    except BrokenPipeError:
        print("Engine crashed or closed the pipe. Restarting the engine...")
        return None  # Handle the error gracefully

def draw_turn_indicator():
    turn_text = "White's Turn" if board.turn == chess.WHITE else "Black's Turn"
    font = pygame.font.SysFont("Arial", 20)
    text_surface = font.render(turn_text, True, TEXT_COLOR)
    screen.blit(text_surface, (10, BOARD_SIZE + 10))

def draw_move_time():
    if ai_move_time > 0:
        time_text = f"AI Move Time: {ai_move_time:.2f} seconds"
        font = pygame.font.SysFont("Arial", 20)
        text_surface = font.render(time_text, True, TEXT_COLOR)
        screen.blit(text_surface, (10, BOARD_SIZE + 30))

def draw_evaluation_bar():
    bar_width = 10
    bar_height = BOARD_SIZE
    max_eval = 1000  # Maximum evaluation value for scaling
    eval_scaled = min(max_eval, abs(current_evaluation))  # Scale evaluation to fit bar
    eval_height = int((eval_scaled / max_eval) * (bar_height / 2))

    # Draw the evaluation bar
    pygame.draw.rect(screen, EVAL_BAR_COLOR, (BOARD_SIZE + 10, 0, bar_width, bar_height))
    if current_evaluation > 0:
        # White is better
        pygame.draw.rect(screen, BLACK, (BOARD_SIZE + 10, (bar_height // 2) - eval_height, bar_width, eval_height))
    elif current_evaluation < 0:
        # Black is better
        pygame.draw.rect(screen, WHITE, (BOARD_SIZE + 10, (bar_height // 2), bar_width, eval_height))

    # Draw the evaluation score text
    font = pygame.font.SysFont("Arial", 16)
    eval_text = f"{current_evaluation / 100:.2f}"  # Convert centipawns to pawns
    text_surface = font.render(eval_text, True, TEXT_COLOR)
    screen.blit(text_surface, (BOARD_SIZE + 35, bar_height // 2 - 10))

def highlight_checkmate():
    if board.is_checkmate():
        king_square = board.king(board.turn)
        if king_square is not None:
            highlight_square(king_square, CHECKMATE_COLOR)
        
while True:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            sys.exit()
        elif event.type == pygame.MOUSEBUTTONDOWN:
            x, y = pygame.mouse.get_pos()
            clicked_square = pixel_to_square(x, y)
            piece = board.piece_at(clicked_square)
            if piece and board.turn == (piece.color == chess.WHITE):
                dragging_piece = piece_images[piece.symbol()]
                dragging_start_square = clicked_square
                dragging_mouse_pos = (x, y)
        elif event.type == pygame.MOUSEMOTION:
            if dragging_piece:
                dragging_mouse_pos = pygame.mouse.get_pos()
        elif event.type == pygame.MOUSEBUTTONUP:
            if dragging_piece:
                x, y = pygame.mouse.get_pos()
                target_square = pixel_to_square(x, y)
                move = chess.Move(dragging_start_square, target_square)
                move = handle_pawn_promotion(move)

                if move in board.legal_moves:
                    board.push(move)
                else:
                    print("Illegal move attempted:", move)

                dragging_piece = None
                dragging_start_square = None
                dragging_mouse_pos = None

    screen.fill(BLACK)
    draw_board()
    draw_pieces()

    if last_ai_move:
        highlight_square(last_ai_move.from_square)
        highlight_square(last_ai_move.to_square)

    draw_turn_indicator()
    draw_move_time()
    draw_evaluation_bar()  # Draw the evaluation bar
    highlight_checkmate()  # Highlight checkmate tile and play sound

    pygame.display.flip()

    if board.turn == chess.BLACK and not board.is_checkmate():
        move_str = ai_move(board)
        if move_str:
            move = chess.Move.from_uci(move_str)
            if move in board.legal_moves:
                board.push(move)
                last_ai_move = move
            else:
                print("AI attempted an illegal move")

    pygame.time.wait(1)