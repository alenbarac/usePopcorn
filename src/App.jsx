import { useRef } from 'react'
import { useEffect, useState } from 'react'
import StarRating from './StarRating'
import { useMovies } from './useMovies'

/* eslint-disable react/prop-types */

const average = (arr) => arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0)

export default function App() {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  const { movies, isLoading, errorMsg } = useMovies(query)

  /*  const [watched, setWatched] = useState([]) */
  const [watched, setWatched] = useState(function () {
    const storedValue = localStorage.getItem('watched')
    return JSON.parse(storedValue)
  })

  function handleSelectMovie(id) {
    setSelectedId((current) => (current === id ? null : id))
  }

  function handleCloseMovie() {
    setSelectedId(null)
  }

  function handleWatchedMovie(movie) {
    setWatched((watched) => [...watched, movie])

    /* localStorage.setItem('watched', JSON.stringify([...watched, movie])) */
  }

  function handleRemoveWatchedMovie(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id))
  }

  useEffect(() => {
    localStorage.setItem('watched', JSON.stringify(watched))
  }, [watched])

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>

      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !errorMsg && (
            <MoviesList handleSelectMovie={handleSelectMovie} movies={movies} />
          )}
          {errorMsg && <ErrorMesage errorMsg={errorMsg} />}
        </Box>

        <Box>
          {selectedId ? (
            <MovieDetails
              onCloseMovie={handleCloseMovie}
              selectedId={selectedId}
              onAddWatchedMovie={handleWatchedMovie}
              watched={watched}
            />
          ) : (
            <>
              <WatchedMoviesSummary watched={watched} />
              <WatchedMoviesList watched={watched} onRemoveWatched={handleRemoveWatchedMovie} />
            </>
          )}
        </Box>
      </Main>
    </>
  )
}

function Loader() {
  return <p className="loader">Loading ...</p>
}

function ErrorMesage({ errorMsg }) {
  return <p className="error">{errorMsg}</p>
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  )
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  )
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  )
}

function Search({ query, setQuery }) {
  const inputElement = useRef(null)

  useEffect(() => {
    if (document.activeElement === inputElement.current) return
    function callback(e) {
      if (e.code === 'Enter') {
        inputElement.current.focus()
        setQuery('')
      }
    }
    document.addEventListener('keydown', callback)
    return () => document.removeEventListener('keydown', callback)
  }, [setQuery])

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputElement}
    />
  )
}

function MovieDetails({ selectedId, onCloseMovie, onAddWatchedMovie, watched }) {
  const [movie, setMovie] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [userRating, setUserRating] = useState('')

  const countRef = useRef(0)

  useEffect(() => {
    if (userRating) {
      countRef.current = countRef.current + 1
    }
  }, [userRating])

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId)
  const watchedUserRating = watched.find((movie) => movie.imdbID === selectedId)?.userRating
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Released: released,
    Runtime: runtime,
    Genre: genre,
    imdbRating,
    Plot: plot,
    Actors: actors,
    Director: director,
  } = movie
  useEffect(() => {
    async function getMovieDetails() {
      try {
        setIsLoading(true)
        const response = await fetch(`https://www.omdbapi.com/?apiKey=${apiKey}&i=${selectedId}`)
        const data = await response.json()
        setMovie(data)
        setIsLoading(false)
      } catch (error) {
        console.log(error)
      }
    }
    getMovieDetails()
  }, [selectedId])

  useEffect(() => {
    if (!title) return
    document.title = `Movie | ${title}`

    return () => {
      document.title = 'usePopcorn'
    }
  }, [title])

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(' ').at(0)),
      userRating,
      countRatingDecisions: countRef.current,
    }
    onAddWatchedMovie(newWatchedMovie)
    onCloseMovie()
  }

  useEffect(() => {
    function callback(e) {
      if (e.code === 'Escape') {
        onCloseMovie()
      }
    }

    document.addEventListener('keydown', callback)
    return () => {
      document.removeEventListener('keydown', callback)
    }
  }, [onCloseMovie])

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of a ${movie} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>IMDB: {imdbRating}</p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating maxRating={10} size={24} onSetStarRating={setUserRating} />
                  {userRating > 0 && (
                    <button
                      className="btn-add"
                      onClick={() => {
                        handleAdd()
                      }}
                    >
                      Add To List
                    </button>
                  )}{' '}
                </>
              ) : (
                <p>You rated this movie - {watchedUserRating}</p>
              )}
            </div>

            <p>
              <em>{plot}</em>
            </p>
            <p>Starring: {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  )
}

function Main({ children }) {
  return <main className="main">{children}</main>
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true)
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? '–' : '+'}
      </button>
      {isOpen && children}
    </div>
  )
}

function MoviesList({ movies, handleSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie key={movie.imdbID} movie={movie} handleSelectMovie={handleSelectMovie} />
      ))}
    </ul>
  )
}

function Movie({ movie, handleSelectMovie }) {
  return (
    <li
      key={movie.imdbID}
      onClick={() => {
        handleSelectMovie(movie.imdbID)
      }}
    >
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  )
}

function WatchedMoviesList({ watched, onRemoveWatched }) {
  return (
    <ul className="list">
      {watched?.map((movie) => (
        <WatchedMovie movie={movie} key={movie.imdbID} onRemoveWatched={onRemoveWatched} />
      ))}
    </ul>
  )
}

function WatchedMovie({ movie, onRemoveWatched }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => {
            onRemoveWatched(movie.imdbID)
          }}
        >
          x
        </button>
      </div>
    </li>
  )
}

function WatchedMoviesSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating))
  const avgUserRating = average(watched.map((movie) => movie.userRating))
  const avgRuntime = average(watched.map((movie) => movie.runtime))
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length}</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  )
}
