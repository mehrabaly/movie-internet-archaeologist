import { useState } from 'react'
import './App.css'

type Movie = {
  id: number
  title: string
  release_date: string
  poster_path: string | null
}

type MovieDetails = {
  id: number
  title: string
  release_date: string
  overview: string
  poster_path: string | null
  rating: number
  runtime: number | null
  genres: {
    id: number
    name: string
  }[]
  directors: string[]
  cast: {
    id: number
    name: string
    character: string
    profile_path: string | null
  }[]
}

function App() {
  const [query, setQuery] = useState('')
  const [movies, setMovies] = useState<Movie[]>([])
  const [selectedMovie, setSelectedMovie] = useState<MovieDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState(false)

  async function searchMovies() {
    if (!query.trim()) {
      return
    }

    setSelectedMovie(null)
    setLoading(true)

    try {
      const response = await fetch(
        `https://movie-internet-archaeologist.fastapicloud.dev/movies/search?query=${encodeURIComponent(query)}`
      )

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()

      setMovies(data.results)

      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({
          behavior: 'smooth'
        })
      }, 100)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function openMovie(movieId: number) {
    setDetailsLoading(true)

    try {
      const response = await fetch(
        `https://movie-internet-archaeologist.fastapicloud.dev/movies/${movieId}`
      )

      if (!response.ok) {
        throw new Error('Could not load movie')
      }

      const data = await response.json()

      setSelectedMovie(data)

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    } catch (error) {
      console.error(error)
    } finally {
      setDetailsLoading(false)
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      searchMovies()
    }
  }

  return (
    <main className="app">

      <header className="header">

        <div className="brand">
          THE MOVIE INTERNET ARCHAEOLOGIST
        </div>

        <div className="search-box">

          <input
            type="text"
            placeholder="Search for a movie..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
          />

          <button type="button" onClick={searchMovies}>
            Search
          </button>

        </div>

      </header>

      {selectedMovie ? (

        <section className="movie-detail">

          <div className="movie-detail-main">

            <div className="movie-detail-poster">

              {selectedMovie.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`}
                  alt={selectedMovie.title}
                />
              ) : (
                <div className="no-poster">
                  NO POSTER
                </div>
              )}

              <p className="poster-title">
                {selectedMovie.title}
              </p>

            </div>

            <div className="movie-detail-info">

              <h1>{selectedMovie.title}</h1>

              <p className="movie-year">
                {selectedMovie.release_date
                  ? selectedMovie.release_date.slice(0, 4)
                  : 'Unknown year'}
              </p>

              <p className="movie-genres">
                {selectedMovie.genres.length > 0
                  ? selectedMovie.genres.map((genre) => genre.name).join(' / ')
                  : 'Genre unknown'}
              </p>

              <section className="overview-section">

                <h2>OVERVIEW</h2>

                <p className="movie-overview">
                  {selectedMovie.overview || 'No overview available.'}
                </p>

              </section>

              <section className="movie-meta">

                <p>
                  <strong>RATING</strong>
                  <br />
                  {selectedMovie.rating
                    ? selectedMovie.rating.toFixed(1)
                    : 'N/A'}
                </p>

                <p>
                  <strong>RUNTIME</strong>
                  <br />
                  {selectedMovie.runtime
                    ? `${selectedMovie.runtime} minutes`
                    : 'N/A'}
                </p>

                <p>
                  <strong>DIRECTOR</strong>
                  <br />
                  {selectedMovie.directors.length > 0
                    ? selectedMovie.directors.join(', ')
                    : 'N/A'}
                </p>

              </section>

            </div>

          </div>

          <section className="cast-section">

            <h2>CAST</h2>

            <div className="cast-list">

              {selectedMovie.cast.map((person) => (
                <div
                  className="cast-person"
                  key={person.id}
                  onClick={() => console.log(person.id)}
                >

                  {person.profile_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                      alt={person.name}
                    />
                  ) : (
                    <div className="cast-no-image">
                      NO IMAGE
                    </div>
                  )}

                  <div className="cast-person-info">

                    <strong>{person.name}</strong>

                    <span>
                      {person.character}
                    </span>

                  </div>

                </div>
              ))}

            </div>

          </section>

        </section>

      ) : (

        <>

          {movies.length === 0 && !loading && (
            <section className="intro">

              <h1>
                Dig through
                <br />
                <span>cinema history.</span>
              </h1>

              <p>
                Search films, discover the people behind them, and uncover the
                connections hiding between movies.
              </p>

            </section>
          )}

          {loading && (
            <p className="status">
              Searching the archives...
            </p>
          )}

          {detailsLoading && (
            <p className="status">
              Excavating movie records...
            </p>
          )}

          {movies.length > 0 && !detailsLoading && (
            <section className="results" id="results">

              {movies.map((movie) => (

                <div
                  className="movie-card"
                  key={movie.id}
                  onClick={() => openMovie(movie.id)}
                >

                  {movie.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                      alt={movie.title}
                    />
                  ) : (
                    <div className="no-poster">
                      NO POSTER
                    </div>
                  )}

                  <div className="movie-info">

                    <h2>{movie.title}</h2>

                    <p>
                      {movie.release_date
                        ? movie.release_date.slice(0, 4)
                        : 'Unknown year'}
                    </p>

                  </div>

                </div>

              ))}

            </section>
          )}

        </>

      )}

    </main>
  )
}

export default App