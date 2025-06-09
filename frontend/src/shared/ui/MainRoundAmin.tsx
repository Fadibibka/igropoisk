import { useEffect, useRef } from "react"



export default function MainRoundAnim(){


    const loaderRef = useRef<SVGSVGElement>(null);
    const circlesRef = useRef<NodeListOf<SVGElement> | null>(null);
  
    useEffect(() => {
      
      if (!loaderRef.current) {
        
        return;
      }
      // Получаем все элементы .circle
      circlesRef.current = document.querySelectorAll('.circle');
  
      // Функция для обновления вращения
      const update = (time: number) => {
        circlesRef.current?.forEach((circle, index) => {
          const angle = time * (2 - index / 2) / 5;
          circle.setAttribute('transform', `rotate(${angle} 0 0)`);
        });
        
        requestAnimationFrame(update); // Переход к следующему кадру
      };
  
      // Запуск анимации
      requestAnimationFrame(update);
  
      // Очистка при размонтировании компонента (если нужно)
      return () => {
        circlesRef.current = null; // Можно очистить ссылки
      };
    }, []);


    return  <svg className='loader-example' viewBox='0 0 100 100' ref={loaderRef}>
    <defs>
        <filter id='goo'>
            <feGaussianBlur in='SourceGraphic' stdDeviation='8' result='blur' />
            <feColorMatrix in='blur' mode='matrix' values='1 0 0 0 0
                                                           0 1 0 0 0
                                                           0 0 1 0 0
                                                           0 0 0 25 -8' result='goo' />
            <feBlend in='SourceGraphic' in2='goo' />
        </filter>
    </defs>
    <g filter='url(#goo)' fill='#0D1115' stroke='#ff214f'>
        <g transform='translate(50, 50)'>
            <g className='circle -a'>
                <g transform='translate(-50, -50)'>
                    <circle cx='25' cy='50' r='9' />
                </g>
            </g>
        </g>
        <g transform='translate(50, 50)'>
            <g className='circle -b'>
                <g transform='translate(-50, -50)'>
                    <circle cx='50' cy='25' r='8'  />
                </g>
            </g>
        </g>
        <g transform='translate(50, 50)'>
            <g className='circle -c'>
                <g transform='translate(-50, -50)'>
                    <circle cx='75' cy='50' r='7' />
                </g>
            </g>
        </g>
        <g transform='translate(50, 50)'>
            <g className='circle -d'>
                <g transform='translate(-50, -50)'>
                    <circle cx='50' cy='75' r='6' />
                </g>
            </g>
        </g>
        <g transform='translate(50, 50)'>
            <g className='circle -e'>
                <g transform='translate(-50, -50)'>
                    <circle cx='25' cy='50' r='5' />
                </g>
            </g>
        </g>
        <g transform='translate(50, 50)'>
            <g className='circle -f'>
                <g transform='translate(-50, -50)'>
                    <circle cx='50' cy='25' r='4' />
                </g>
            </g>
        </g>
        <g transform='translate(50, 50)'>
            <g className='circle -g'>
                <g transform='translate(-50, -50)'>
                    <circle cx='75' cy='50' r='3' />
                </g>
            </g>
        </g>
        <g transform='translate(50, 50)'>
            <g className='circle -h'>
                <g transform='translate(-50, -50)'>
                    <circle cx='50' cy='75' r='2' />
                </g>
            </g>
        </g>
    </g>
</svg>
}