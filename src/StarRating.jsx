import React, { useState } from 'react'
import Star from './Star'

import PropTypes from 'prop-types'

const containerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
}

const starContainerStyle = {
  display: 'flex',
}

const StarRating = ({
  maxRating = 5,
  color = '#fcc419',
  size = 48,
  className = '',
  messages = [],
  defaultRating = 0,
  onSetStarRating,
}) => {
  const [rating, setRating] = useState(defaultRating)
  const [tempRating, setTempRating] = useState(0)

  const textStyle = {
    lineHeight: '1',
    margin: '0',
    color,
    fontSize: `${size / 1.5}px`,
  }

  function handleRating(rating) {
    setRating(rating)
    onSetStarRating(rating)
  }

  function handleHoverIn(rating) {
    setTempRating(rating)
  }

  function handleHoverOut(rating) {
    setTempRating(rating)
  }
  return (
    <div style={containerStyle} className={className}>
      <div style={starContainerStyle}>
        {Array.from({ length: maxRating }, (_, i) => (
          <Star
            key={i}
            onRate={() => {
              handleRating(i + 1)
            }}
            full={tempRating ? tempRating >= i + 1 : rating >= i + 1}
            onHoverIn={() => {
              handleHoverIn(i + 1)
            }}
            onHoverOut={() => {
              handleHoverOut(0)
            }}
            color={color}
            size={size}
          />
        ))}
      </div>
      <p style={textStyle}>
        {messages.length === maxRating
          ? messages[tempRating ? tempRating - 1 : rating - 1]
          : tempRating || rating || ''}
      </p>
    </div>
  )
}

StarRating.propTypes = {
  maxRating: PropTypes.number,
  defaultRating: PropTypes.number,
  color: PropTypes.string,
  size: PropTypes.number,
  messages: PropTypes.array,
  className: PropTypes.string,
  onSetStarRating: PropTypes.func,
}

export default StarRating
