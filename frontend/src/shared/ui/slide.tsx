import arrow from '@shared/assets/svg/arrow.svg';

type SlideProps = {
  totalPages: number;
  currentPage: number;
  handlePrev: () => void;
  handleNext: () => void;
};

export default function Slide({ totalPages, currentPage, handlePrev, handleNext }: SlideProps) {
  return (
    <div className="flex space-x-6 justify-center items-center">
      <button onClick={handlePrev}>
        <img className="rotate-180 cursor-pointer" src={arrow} alt="Prev" />
      </button>
      {Array.from({ length: totalPages }).map((_, index) => (
        <div
          key={index}
          className={`rounded w-9 h-[22px] transition-colors ${
            index === currentPage ? 'bg-white' : 'bg-gray'
          }`}
        ></div>
      ))}
      <button onClick={handleNext}>
        <img className="cursor-pointer" src={arrow} alt="Next" />
      </button>
    </div>
  );
}
