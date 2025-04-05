
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SignIn from '../components/SignIn';
import SignUp from '../components/SignUp';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return <Navigate to="/dashboard" />;
  } else {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md flex space-x-8">
          <SignIn />
          <SignUp />
        </div>
      </div>
    );
  }
};

export default Index;
