import { useId, useState } from 'react';

interface StarsProps {
  size?: number;
  rating?: number;
  onChange?: (value: number) => void;
  type?: 'static' | 'editable';
}

export default function Stars({
  size = 32,
  rating = 0,
  onChange,
  type = 'static',
}: StarsProps) {
  const idPrefix = useId();
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const displayRating = hoverRating !== null ? hoverRating : rating;

  const handleMouseMove = (e: React.MouseEvent, index: number) => {
    if (type !== 'editable') return;
    const { left, width } = (e.target as HTMLElement).getBoundingClientRect();
    const x = e.clientX - left;
    const percent = x / width;
    const value = index + (percent < 0.5 ? 0.5 : 1);
    setHoverRating(value);
  };

  const handleMouseLeave = () => {
    if (type !== 'editable') return;
    setHoverRating(null);
  };

  const handleClick = (index: number, e: React.MouseEvent) => {
    if (type !== 'editable' || !onChange) return;
    const { left, width } = (e.target as HTMLElement).getBoundingClientRect();
    const x = e.clientX - left;
    const percent = x / width;
    const value = index + (percent < 0.5 ? 0.5 : 1);
    onChange(value);
  };

  return (
    <div className="flex space-x-1" onMouseLeave={handleMouseLeave}>
      {Array.from({ length: 5 }).map((_, index) => {
        const fillValue = Math.max(0, Math.min(displayRating - index, 1));
        const fillPercentage = fillValue * 100;
        const maskId = `${idPrefix}-star-mask-${index}`;

        return (
          <div
            key={index}
            className="relative cursor-pointer"
            style={{ width: size, height: size }}
            onMouseMove={(e) => handleMouseMove(e, index)}
            onClick={(e) => handleClick(index, e)}
          >
            {/* Белый фон звезды */}
            <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={STAR_PATH}
              />
            </svg>

            {/* Жёлтая заливка */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <svg className="w-full h-full text-yellow" viewBox="0 0 24 24" fill="currentColor">
                <mask id={maskId}>
                  <rect x="0" y="0" width="24" height="24" fill="white" />
                  <rect
                    x={(fillPercentage * 24) / 100}
                    y="0"
                    width={((100 - fillPercentage) * 24) / 100}
                    height="24"
                    fill="black"
                  />
                </mask>
                <path d={STAR_PATH} mask={`url(#${maskId})`} />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const STAR_PATH =
  'M8.15315 4.40838C9.41979 2.13613 10.0531 1 11 1C11.9469 1 12.5802 2.13612 13.8468 4.40837L14.1745 4.99624C14.5345 5.64194 14.7144 5.9648 14.9951 6.17782C15.2757 6.39084 15.6251 6.46991 16.3241 6.62806L16.9605 6.77204C19.4201 7.32857 20.65 7.60683 20.9426 8.54774C21.2352 9.48861 20.3968 10.4691 18.7199 12.4299L18.2861 12.9372C17.8096 13.4944 17.5713 13.773 17.4641 14.1177C17.357 14.4624 17.393 14.8341 17.465 15.5776L17.5306 16.2544C17.7841 18.8706 17.9109 20.1787 17.1449 20.7602C16.3788 21.3417 15.2273 20.8115 12.9243 19.7512L12.3285 19.4768C11.6741 19.1755 11.3469 19.0248 11 19.0248C10.6531 19.0248 10.3259 19.1755 9.67149 19.4768L9.07569 19.7512C6.77267 20.8115 5.62118 21.3417 4.85515 20.7602C4.08912 20.1787 4.21588 18.8706 4.4694 16.2544L4.53498 15.5776C4.60703 14.8341 4.64305 14.4624 4.53586 14.1177C4.42868 13.773 4.19043 13.4944 3.71392 12.9372L3.2801 12.4299C1.60325 10.4691 0.764822 9.48861 1.05742 8.54774C1.35002 7.60683 2.57986 7.32857 5.03954 6.77204L5.67589 6.62806C6.37485 6.46991 6.72432 6.39084 7.00493 6.17782C7.28554 5.9648 7.46552 5.64195 7.82546 4.99624L8.15315 4.40838Z';
