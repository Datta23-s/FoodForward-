import React from 'react';
import { useAppContext } from '../src/context/AppContext';
import Onboarding from '../src/pages/Onboarding';
import DonorDashboard from '../src/pages/DonorDashboard';
import ReceiverDashboard from '../src/pages/ReceiverDashboard';
import NGODashboard from '../src/pages/NGODashboard';
import Login from '../src/pages/Login';
import Register from '../src/pages/Register';
import RoleSelection from '../src/pages/RoleSelection';

export default function Index() {
  const { role } = useAppContext();
  const [currentScreen, setCurrentScreen] = React.useState('onboarding'); // 'onboarding', 'roleSelection', 'login', 'register'
  const [selectedRole, setSelectedRole] = React.useState(null);

  if (!role) {
    if (currentScreen === 'roleSelection') {
      return (
        <RoleSelection 
          authMode={selectedRole?.mode} 
          onBack={() => setCurrentScreen('onboarding')}
          onSelectRole={(chosenRole) => {
            const nextMode = selectedRole?.mode || 'login';
            setSelectedRole({ mode: nextMode, role: chosenRole });
            setCurrentScreen(nextMode);
          }}
        />
      );
    }
    if (currentScreen === 'login') {
      return (
        <Login 
          selectedRole={selectedRole?.role}
          onBack={() => setCurrentScreen('roleSelection')} 
          onRegister={() => {
            setSelectedRole({ mode: 'register', role: selectedRole?.role });
            setCurrentScreen('register');
          }} 
        />
      );
    }
    if (currentScreen === 'register') {
      return (
        <Register 
          selectedRole={selectedRole?.role}
          onBack={() => setCurrentScreen('roleSelection')} 
          onLogin={() => {
            setSelectedRole({ mode: 'login', role: selectedRole?.role });
            setCurrentScreen('login');
          }} 
        />
      );
    }
    return (
      <Onboarding 
        onLogin={() => {
          setSelectedRole({ mode: 'login' });
          setCurrentScreen('roleSelection');
        }} 
        onGetStarted={() => {
          setSelectedRole({ mode: 'register' });
          setCurrentScreen('roleSelection');
        }} 
      />
    );
  }

  if (role === 'donor') {
    return <DonorDashboard />;
  }
  if (role === 'ngo') {
    return <NGODashboard />;
  }

  return <ReceiverDashboard />;
}
