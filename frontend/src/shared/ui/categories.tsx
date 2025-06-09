import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import CategoryCard from '@shared/ui/categorycard';
import Slide from '@shared/ui/slide';
import { getCategoriesWithLogos, GenreWithLogos } from '@api/shared/getCategorieslist';

export default function MainGames() {
  const [categories, setCategories] = useState<GenreWithLogos[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 4;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategoriesWithLogos();
        setCategories(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCategories();
  }, []);

  const totalPages = Math.ceil(categories.length / itemsPerPage);

  const visibleItems = categories.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );


  return (
    <section className="container mt-32">
      <h1 className="text-6xl font-display">Категории игр</h1>
      <div className="mt-10 pb-4 overflow-x-auto lg:overflow-x-visible">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex gap-6 lg:grid lg:grid-cols-4 snap-x snap-mandatory px-2"
          >
            {visibleItems.map((category, i) => (
              <CategoryCard
                key={i}
                title={category.genre_name}
                images={category.logos}
                genreId={category.genre_id}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="pt-12 max-lg:hidden">
        <Slide
          totalPages={totalPages}
          currentPage={currentPage}
          handlePrev={() => currentPage > 0 && setCurrentPage(currentPage - 1)}
          handleNext={() => currentPage < totalPages - 1 && setCurrentPage(currentPage + 1)}
        />
      </div>
    </section>
  );
}
