import Nav from './ui/nav.tsx'
import Categories from '@shared/ui/categories.tsx'
import Games from '@shared/ui/gamescatalog.tsx'


export default function Home(){
    return (
        <>
            <Nav/>
            <Categories/>
            <Games/>
        </>
    )
}