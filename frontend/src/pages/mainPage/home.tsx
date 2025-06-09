
import Main_games from './components/main_games.tsx';
import Expected_games from './components/expected_games.tsx';
import Categories from '@shared/ui/categories.tsx'
import Popular from './ui/popular.tsx'
import Rec from './ui/rec.tsx'
import Journal from './ui/journalbento.tsx'
import Recomendedgames from '@shared/ui/recomendedgames.tsx'
import Randomgame from './ui/randomgame.tsx'



export default function Home(){
    return (
        <>
         
            <Main_games/>
            <Expected_games/>
            <Categories/>
            <Popular/>
            <Rec/>
            <Journal/>
            <Recomendedgames/>
            <Randomgame/>
        </>
    )
}