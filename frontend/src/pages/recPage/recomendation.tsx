import { useState } from 'react';
import RecFilter from './ui/recFilter';
import RecMain from './ui/recMain';

export default function Home() {
  const [excludedGenres, setExcludedGenres] = useState<number[]>([]);
  const [excludedPlatforms, setExcludedPlatforms] = useState<number[]>([]);

  return (
    <>
      <RecFilter 
        excludedGenres={excludedGenres}
        excludedPlatforms={excludedPlatforms}
        setExcludedGenres={setExcludedGenres}
        setExcludedPlatforms={setExcludedPlatforms}
      />
      <RecMain 
        excludedGenres={excludedGenres}
        excludedPlatforms={excludedPlatforms}
      />
    </>
  );
}