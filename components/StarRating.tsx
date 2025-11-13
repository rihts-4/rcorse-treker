"use client";

import { useState } from "react";
import { Input } from "./ui/input";
import { Star } from "lucide-react";

/**
 * Render a 5-star rating control with accessible radio-group semantics.
 *
 * The component displays five interactive stars that update internal selected and hover state,
 * and includes a hidden input carrying the current rating for form submission.
 *
 * @param name - The name attribute for the hidden input used in form submission (default: "rating").
 * @param value - The initial selected rating value between 1 and 5 (default: 5).
 * @returns A React element that renders the 5-star rating widget.
 */
export default function StarRating({ name = "rating", value = 5 }: { name?: string; value?: number }) {
  const [rating, setRating] = useState<number>(value);
  const [hover, setHover] = useState<number>(0);

  return (
    <div className="flex items-center gap-2">
      <Input type="hidden" name={name} value={rating} />
      <div className="flex gap-1" role="radiogroup" aria-label="Select rating">
        {Array.from({ length: 5 }).map((_, i) => {
          const idx = i + 1;
          const active = (hover || rating) >= idx;
          return (
            <button
              key={idx}
              type="button"
              role="radio"
              aria-checked={rating === idx}
              className={active ? "text-[#1172d4]" : "text-[#adc2d7]"}
              onMouseEnter={() => setHover(idx)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(idx)}
              title={`${idx} star${idx === 1 ? "" : "s"}`}
            >
              <Star size={24} fill="currentColor" />
            </button>
          );
        })}
      </div>
    </div>
  );
}