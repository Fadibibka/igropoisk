import { BrowserRouter} from 'react-router-dom'
import RouterApp from './routes/RouterApp'
import './App.css'
import Header from './layouts/header/header'
import HellperWrapper from '@shared/components/HellperWrapper';


function App() {

  return (
    
    <BrowserRouter>
    <HellperWrapper/>
      <Header/>
        <RouterApp/>
    </BrowserRouter>
  );
}

export default App
