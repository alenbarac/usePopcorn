import { useEffect, useState } from 'react'

const apiKey = 'a192b306'

export function useMovies(query) {
  const [movies, setMovies] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    //callback?.() // callback for handle close movies or something else

    const controller = new AbortController()
    async function fetchData() {
      try {
        setIsLoading(true)
        setErrorMsg('')
        const response = await fetch(`https://www.omdbapi.com/?apiKey=${apiKey}&s=${query}`, {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error('Something went wrong with fetching data')

        const data = await response.json()

        if (data.Response === 'False') throw new Error('Movie not found')

        setMovies(data.Search)
      } catch (error) {
        setErrorMsg(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    if (query.length < 3) {
      setMovies([])
      setErrorMsg('')
      return
    }

    fetchData()
    return () => {
      controller.abort()
    }
  }, [query])

  return { movies, isLoading, errorMsg }
}
