# Connections++

Connections++ is a themed word-grouping game inspired by the nyt games connections puzzle format. Each round gives you 16 words that hide four different groups of four, and your job is to sort them correctly before you run out of tries. The frontend is built in React and focuses on the game experience, while the FastAPI backend uses Gemini to generate a fresh puzzle from your chosen theme.

How it works:

1. You enter a theme, or leave it blank for a general puzzle.
2. The frontend sends that theme to the backend.
3. Gemini generates four categories with four unique words in each category.
4. The backend validates the puzzle, uppercases the words, and shuffles the 16-word board.
5. In the game, you select four words at a time, submit a guess, and get feedback if you were correct or if you were one word away.
6. When all four groups are solved, the game ends and shows the completed categories.

Live app: [connectionspp.vercel.app](https://connectionspp.vercel.app)

Running it:

Backend:

cd backend
source myenv/bin/activate
uvicorn main:app --reload --port 8000

Frontend:

npm run dev