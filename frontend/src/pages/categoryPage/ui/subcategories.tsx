import { useEffect, useState } from "react";
import { getRelatedGenresByGenre, RelatedGenre } from "@api/categoryPage/getRelatedGenres";
import { useParams } from "react-router-dom";

export default function Main_games() {
  const [relatedGenres, setRelatedGenres] = useState<RelatedGenre[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const { genreId } = useParams<{ genreId: string }>();

  useEffect(() => {
    if (!genreId) return;
    const fetchRelated = async () => {
      try {
        const data = await getRelatedGenresByGenre(Number(genreId));
        setRelatedGenres(data);
        // Выбираем первый жанр по умолчанию
        if (data.length > 0) setSelected(0);
      } catch (error) {
        console.error("Ошибка загрузки жанров:", error);
      }
    };

    fetchRelated();
  }, [genreId]);

  return (
    <section className="bg-purple">
      <div className="container py-8 flex flex-col space-y-8">
        <div className="w-full h-0.5 bg-white" />
        
        {/* Навигация по жанрам */}
        <div className="flex space-x-16 uppercase justify-center items-center transition-all duration-300">
          {relatedGenres.map((genre, i) => (
            <p
              key={genre.genre_id}
              onClick={() => setSelected(i)}
              className={`cursor-pointer transition-all duration-50 ${
                selected === i
                  ? "text-3xl font-bold"
                  : "text-2xl font-normal text-white/70"
              }`}
            >
              {genre.name}
            </p>
          ))}
        </div>
        
        <div className="w-full h-0.5 bg-white" />


      </div>
    </section>
  );
}