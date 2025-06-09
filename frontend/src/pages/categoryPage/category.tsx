import Categorymain from './ui/categorymain.tsx'
import Subcategories from './ui/subcategories.tsx'
import Categorybento from './ui/categorybento.tsx'
import Recomended from '@shared/ui/recomendedgames.tsx'
import Gamescatalog from '@shared/ui/gamescatalog.tsx'


export default function Home(){
    return (
        <>
            <Categorymain/>
            <Subcategories/>
            <Categorybento/>
            <Recomended />
            <Gamescatalog />
        </>
    )
}