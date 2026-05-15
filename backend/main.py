import os
import json
import random
import logging
from typing import List

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

import google.generativeai as genai

logging.basicConfig(level=logging.INFO)

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY not found in .env")

genai.configure(api_key=api_key)

app = FastAPI()

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://connectionspp.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PuzzleRequest(BaseModel):
    theme: str = Field(default="General", max_length=100)

class Group(BaseModel):
    category: str
    words: List[str]
    difficulty: int

class ConnectionsPuzzle(BaseModel):
    groups: List[Group]

SYSTEM_PROMPT = """
You are an expert puzzle constructor creating a high-quality semantic grouping puzzle inspired by modern newspaper word games.

Generate a puzzle STRICTLY based on the provided theme.

The puzzle should feel:
- clever
- human-written
- deceptive but fair
- elegant and concise

REQUIREMENTS:
- Generate EXACTLY 4 groups
- Each group contains EXACTLY 4 unique words
- Total = 16 unique words
- No duplicate words
- No repeated concepts
- Only ONE valid final solution
- Include red herrings and misleading overlaps
- Avoid overly obscure vocabulary
- Avoid offensive or political content

PUZZLE STRUCTURE:
- One relatively straightforward category
- Two moderately deceptive categories
- One strong "aha" category involving ambiguity, wordplay, or subtle connections

GOOD PUZZLE DESIGN:
- Words may appear like they belong in multiple groups
- Categories should not be immediately obvious
- Solving should require careful elimination and reasoning
- Red herrings should feel intentional

AVOID:
- overly broad categories
- trivial taxonomies
- categories solved instantly
- random unrelated words
- poetic or dramatic category names
- multiple forms of the same root word

CATEGORY NAMING RULES:
- Keep category names concise and natural
- Prefer human newspaper-style labels
- Categories should feel satisfying in hindsight
- Avoid theatrical AI-generated titles

Return ONLY raw valid JSON with no markdown, no backticks, no explanation.

FORMAT:
{
  "groups": [
    {
      "category": "Category Name",
      "words": ["word1", "word2", "word3", "word4"],
      "difficulty": 1
    },
    {
      "category": "Category Name",
      "words": ["word1", "word2", "word3", "word4"],
      "difficulty": 2
    },
    {
      "category": "Category Name",
      "words": ["word1", "word2", "word3", "word4"],
      "difficulty": 3
    },
    {
      "category": "Category Name",
      "words": ["word1", "word2", "word3", "word4"],
      "difficulty": 4
    }
  ]
}
"""

def validate_puzzle(puzzle: ConnectionsPuzzle):

    seen_words = set()

    for group in puzzle.groups:

        if len(group.words) != 4:
            raise ValueError("Each group must contain 4 words")

        for word in group.words:

            cleaned = word.strip().upper()

            if cleaned in seen_words:
                raise ValueError(f"Duplicate word detected: {cleaned}")

            seen_words.add(cleaned)

    if len(seen_words) != 16:
        raise ValueError("Puzzle must contain exactly 16 unique words")

@app.post("/generate-puzzle")
async def generate_puzzle(data: PuzzleRequest):

    theme = data.theme

    model = genai.GenerativeModel(
        model_name="gemini-3.1-flash-lite",
        system_instruction=SYSTEM_PROMPT,
    )

    try:

        response = model.generate_content(
            f"THEME: {theme}",
            generation_config={
                "temperature": 0.65,
                "response_mime_type": "application/json",
            }
        )

        raw_text = response.text.strip()

        raw_text = raw_text.replace("```json", "").replace("```", "").strip()

        raw_data = json.loads(raw_text)

        if "groups" not in raw_data and "puzzle" in raw_data:
            raw_data = raw_data["puzzle"]

        puzzle = ConnectionsPuzzle(**raw_data)

        validate_puzzle(puzzle)

        formatted_groups = []
        flattened_words = []

        for group in puzzle.groups:

            upper_words = [word.strip().upper() for word in group.words]

            formatted_groups.append({
                "category": group.category.upper(),
                "words": upper_words,
                "difficulty": group.difficulty,
            })

            flattened_words.extend(upper_words)

        random.shuffle(flattened_words)

        return {
            "groups": sorted(formatted_groups, key=lambda x: x["difficulty"]),
            "shuffled_words": flattened_words,
        }

    except json.JSONDecodeError:
        logging.error("Failed to parse JSON from Gemini response")

        raise HTTPException(
            status_code=500,
            detail="Puzzle generation failed: Invalid response format",
        )

    except ValueError as e:
        logging.error(f"Validation error: {str(e)}")

        raise HTTPException(
            status_code=400,
            detail="Puzzle validation failed",
        )

    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")

        raise HTTPException(
            status_code=500,
            detail="Puzzle generation failed",
        )

@app.get("/")
async def root():
    return {"message": "Connections AI Backend Running"}

if __name__ == "__main__":

    import uvicorn

    host = "0.0.0.0"
    port = int(os.getenv("PORT", 8000))

    uvicorn.run(
        "main:app",
        host=host,
        port=port,
    )