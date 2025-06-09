import { useState, useEffect  } from 'react'
// import {ClipLoader} from 'react-spinners'
import MainRoundAnim from './MainRoundAmin';

type LoaderProps = {
    isLoading?: boolean;
    delay?: number; 
  };
  
  const Loader: React.FC<LoaderProps> = ({ isLoading = false, delay = 300 }) => {
    const [showLoader, setShowLoader] = useState(false);
  
    useEffect(() => {
      let timer: number;
  
      if (isLoading) {
        timer = setTimeout(() => setShowLoader(true), delay);
      } else {
        setShowLoader(false);
      }
  
      return () => clearTimeout(timer);
    }, [isLoading, delay]);
  
    if (!showLoader) return null;
  
    return (
      <div className="loader-container">
        <MainRoundAnim />
      </div>
    );
  };
  
  export default Loader;