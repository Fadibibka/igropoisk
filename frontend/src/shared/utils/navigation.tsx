import { useNavigate } from 'react-router-dom';

export const navigateToLogin = () => {
  const navigate = useNavigate();
  navigate('/login', { state: { from: window.location.pathname } });
};