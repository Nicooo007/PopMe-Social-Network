import { useState } from 'react';

interface StarRatingProps {
  initialRating: number;
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean;
}

export default function StarRating({ 
  initialRating, 
  onRatingChange, 
  readOnly = false 
}: StarRatingProps) {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);

  const handleClick = (value: number) => {
    if (readOnly) return;
    setRating(value);
    onRatingChange?.(value);
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          disabled={readOnly}
          className={`transition-all ${
            readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          }`}
        >
          <i
            className={`bx ${
              star <= (hover || rating) ? 'bxs-star' : 'bx-star'
            } text-[#FFC267] text-xl`}
          ></i>
        </button>
      ))}
    </div>
  );
}