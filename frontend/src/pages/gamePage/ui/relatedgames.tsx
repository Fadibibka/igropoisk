import Gamecard from '@shared/ui/gamecard'

export default function Main_games() {

    return <section className='container'>
            <div className='mt-32 w-2/3 relative'>
                <h2 className='text-3xl font-display'>Похожие игры</h2>
                <div className='flex'>
                    <div className='grid grid-cols-4 gap-6 mt-6 h-116'>
                        {[0, 1, 2, 3].map(() => (
                            <Gamecard/>
                        ))}
                    </div>
                </div>
            </div>
    </section>
    
   };


