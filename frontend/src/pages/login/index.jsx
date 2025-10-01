import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RoleIndicators from './components/RoleIndicators';
import TrustSignals from './components/TrustSignals';
import Icon from '../../components/AppIcon';
import ThemeToggle from '../../components/ui/ThemeToggle';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  

  // Mock credentials for different user types
  const mockCredentials = {
    verifier: { email: 'verifier@jhed.gov.in', password: 'verify123' },
    institution: { email: 'admin@ranchiuniversity.ac.in', password: 'admin123' }
  };

  useEffect(() => {
    // Check if user is already logged in and 'remember_me' is set
    const token = localStorage.getItem('auth_token');
    const rememberMe = localStorage.getItem('remember_me');
    if (token && rememberMe === 'true') {
      // Redirect to appropriate dashboard based on stored role
      const userRole = localStorage.getItem('user_role');
      redirectToDashboard(userRole || 'verifier');
    } else {
      // If not remembered, clear any lingering auth data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_data');
    }
  }, []);

  const redirectToDashboard = (role) => {
    switch (role) {
      case 'verifier':
        navigate('/verifier-dashboard');
        break;
      case 'institution':
        navigate('/institution-dashboard');
        break;
      default:
        navigate('/verifier-dashboard');
    }
  };

  const determineUserRole = (email) => {
    if (email?.includes('admin') || email?.includes('university') || email?.includes('.ac.in')) {
      return 'institution';
    } else {
      return 'verifier';
    }
  };

  const handleLogin = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const userRole = determineUserRole(formData?.email);
      const expectedCredentials = mockCredentials?.[userRole];

      // Validate credentials
      if (formData?.email === expectedCredentials?.email && formData?.password === expectedCredentials?.password) {
        // Successful login
        const mockToken = `token_${Date.now()}_${userRole}`;
        const userData = {
          id: `user_${userRole}_001`,
          name: userRole === 'verifier' ? 'Rajesh Kumar' : 'Dr. Priya Sharma',
          email: formData?.email,
          role: userRole === 'verifier' ? 'Certificate Verifier' : 'Institution Administrator',
          institution: userRole === 'verifier' ? 'Jharkhand Education Department' : 'Ranchi University',
          permissions: userRole === 'verifier' ? ['verify', 'view'] : ['manage', 'upload', 'view', 'audit'],
          lastLogin: new Date()?.toISOString()
        };

        // Store authentication data
        localStorage.setItem('auth_token', mockToken);
        localStorage.setItem('user_role', userRole);
        localStorage.setItem('user_data', JSON.stringify(userData));
        
        if (formData?.rememberMe) {
          localStorage.setItem('remember_me', 'true');
        }

        // Redirect to appropriate dashboard
        redirectToDashboard(userRole);
      } else {
        // Invalid credentials
        setError(`Invalid credentials. Please use the correct ${userRole} credentials.`);
      }
    } catch (err) {
      setError('Login failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Logout handler to clear localStorage
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_data');
    localStorage.removeItem('remember_me');
    // Optionally redirect to login page
    navigate('/login');
  };

  

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        {/* Top-left theme toggle */}
        <div className="absolute left-4 top-4 z-10">
          <ThemeToggle />
        </div>
        {/* Left Panel - Login Form (fixed and centered) */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-12 sticky top-0 h-screen">
          <div className="w-full max-w-md m-auto flex flex-col justify-center h-full">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-xl">
                  <Icon name="Shield" size={32} color="white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-2">
                TrustED
              </h1>
              <p className="text-muted-foreground">
                Secure access to certificate verification platform
              </p>
            </div>

            {/* Login Form */}
            <LoginForm 
              onLogin={handleLogin}
              loading={loading}
              error={error}
            />

            {/* Additional Links */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                New to the platform?{' '}
                <button className="text-primary hover:text-primary/80 transition-colors duration-150">
                  Request Access
                </button>
              </p>
              <p className="text-xs text-muted-foreground">
                Need help?{' '}
                <button className="text-primary hover:text-primary/80 transition-colors duration-150">
                  Contact Support
                </button>
              </p>
            </div>

            {/* Demo Credentials Info */}
      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
              <h4 className="text-sm font-medium text-foreground mb-2 flex items-center">
                <Icon name="Info" size={16} className="mr-2" />
                Demo Credentials
              </h4>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div>
                  <strong>Verifier:</strong> verifier@jhed.gov.in / verify123
                </div>
                <div>
                  <strong>Institution:</strong> admin@ranchiuniversity.ac.in / admin123
                </div>
                
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Role Indicators & Trust Signals (scrollable) */}
        <div className="hidden lg:flex lg:w-96 bg-muted/30 border-l border-border overflow-y-auto max-h-screen custom-scrollbar">
          <div className="flex flex-col w-full p-8">
            {/* Role Indicators */}
            <div className="mb-8">
              <RoleIndicators />
            </div>

            {/* Trust Signals */}
            <div className="flex-1">
              <TrustSignals />
            </div>

            {/* Footer Info */}
            <div className="mt-8 pt-6 border-t border-border">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-2">
                  © {new Date()?.getFullYear()} Jharkhand Education Department
                </p>
                <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
                  <button className="hover:text-foreground transition-colors duration-150">
                    Privacy Policy
                  </button>
                  <span>•</span>
                  <button className="hover:text-foreground transition-colors duration-150">
                    Terms of Service
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Role Indicators */}
      <div className="lg:hidden p-6 bg-muted/30 border-t border-border">
        <RoleIndicators />
      </div>
    </div>
  );
};

export default Login;