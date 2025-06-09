import { JSX, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '@api/login/getCurrentUser';

interface Props {
  children: JSX.Element;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: Props) {
  const navigate = useNavigate();
  const [isAllowed, setIsAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (requireAdmin && !user.is_admin) {
          navigate('/'); // или 403 страница
        } else {
          setIsAllowed(true);
        }
      } catch (err) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [requireAdmin]);

  if (loading) return <div>Loading...</div>;
  return isAllowed ? children : null;
}
