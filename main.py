from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import httpx

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TMDB_ACCESS_TOKEN = os.getenv("TMDB_ACCESS_TOKEN")


@app.get("/")
def home():
    return {"message": "Movie Internet Archaeologist is alive!"}


@app.get("/movies/search")
async def search_movies(query: str):
    url = "https://api.themoviedb.org/3/search/movie"

    headers = {
        "Authorization": f"Bearer {TMDB_ACCESS_TOKEN}"
    }

    params = {
        "query": query
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(
            url,
            headers=headers,
            params=params
        )

    response.raise_for_status()
    data = response.json()

    movies = []

    for movie in data["results"]:
        movies.append({
            "id": movie["id"],
            "title": movie["title"],
            "release_date": movie["release_date"],
            "overview": movie["overview"],
            "poster_path": movie["poster_path"],
            "rating": movie["vote_average"]
        })

    return {
        "results": movies
    }


@app.get("/movies/{movie_id}")
async def get_movie(movie_id: int):
    movie_url = f"https://api.themoviedb.org/3/movie/{movie_id}"
    credits_url = f"https://api.themoviedb.org/3/movie/{movie_id}/credits"

    headers = {
        "Authorization": f"Bearer {TMDB_ACCESS_TOKEN}"
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        movie_response = await client.get(
            movie_url,
            headers=headers
        )

        credits_response = await client.get(
            credits_url,
            headers=headers
        )

    movie_response.raise_for_status()
    credits_response.raise_for_status()

    movie_data = movie_response.json()
    credits_data = credits_response.json()

    directors = []

    for person in credits_data["crew"]:
        if person["job"] == "Director":
            directors.append(person["name"])

    cast = []

    for person in credits_data["cast"][:10]:
        cast.append({
            "id": person["id"],
            "name": person["name"],
            "character": person["character"],
            "profile_path": person["profile_path"]
        })

    return {
        "id": movie_data["id"],
        "title": movie_data["title"],
        "release_date": movie_data["release_date"],
        "overview": movie_data["overview"],
        "poster_path": movie_data["poster_path"],
        "rating": movie_data["vote_average"],
        "runtime": movie_data["runtime"],
        "genres": movie_data["genres"],
        "directors": directors,
        "cast": cast
    }


@app.get("/people/{person_id}")
async def get_person(person_id: int):
    person_url = f"https://api.themoviedb.org/3/person/{person_id}"
    credits_url = f"https://api.themoviedb.org/3/person/{person_id}/movie_credits"

    headers = {
        "Authorization": f"Bearer {TMDB_ACCESS_TOKEN}"
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        person_response = await client.get(
            person_url,
            headers=headers
        )

        credits_response = await client.get(
            credits_url,
            headers=headers
        )

    person_response.raise_for_status()
    credits_response.raise_for_status()

    person_data = person_response.json()
    credits_data = credits_response.json()

    movies = []

    for movie in credits_data["cast"]:
        if movie["title"]:
            movies.append({
                "id": movie["id"],
                "title": movie["title"],
                "release_date": movie["release_date"],
                "character": movie["character"],
                "poster_path": movie["poster_path"]
            })

    return {
        "id": person_data["id"],
        "name": person_data["name"],
        "birthday": person_data["birthday"],
        "place_of_birth": person_data["place_of_birth"],
        "biography": person_data["biography"],
        "known_for_department": person_data["known_for_department"],
        "profile_path": person_data["profile_path"],
        "movies": movies
    }