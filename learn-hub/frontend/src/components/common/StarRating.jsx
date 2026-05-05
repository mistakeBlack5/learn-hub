import { Star } from 'lucide-react';

export default function StarRating({ rating, count }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={clsx(
              'fill-current',
              star <= Math.floor(rating) 
                ? 'text-yellow-400' 
                : star - 0.5 <= rating 
                ? 'text-yellow-400 fill-yellow-400/50' 
                : 'text-gray-300 dark:text-gray-600'
            )}
          />
        ))}
      </div>
      {count && <span className="text-sm text-gray-500 dark:text-gray-400">({count})</span>}
    </div>
  );
}

import clsx from 'clsx';