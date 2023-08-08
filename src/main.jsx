import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
/* import App from './App.jsx'
import './index.css' */

import StarRating from './StarRating'

function Test() {
  const [movieRating, setMovieRating] = useState(0)

  return (
    <div>
      <StarRating size={24} className="test" defaultRating={3} onSetStarRating={setMovieRating} />
      <p>This movie was rated {movieRating}</p>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/*  <App /> */}
    <StarRating maxRating={5} messages={['Terrible', 'Bad', 'Good', 'Okay', 'Amazing']} />
    <StarRating size={24} className="test" defaultRating={3} />
    <Test />
  </React.StrictMode>
)
