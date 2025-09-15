
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Checkbox } from '../components/ui/checkbox';
import { authService } from '../services/authService';
import { useAppContext } from '../context/AppContext';
import { Plane, Lock, Mail, Eye, EyeOff } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: ''
  });
  const navigate = useNavigate();
  const { setCurrentUser } = useAppContext();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return 'Email is required';
    }
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return '';
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setFieldErrors(prev => ({
      ...prev,
      email: validateEmail(value)
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setFieldErrors(prev => ({
      ...prev,
      password: validatePassword(value)
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    setFieldErrors({
      email: emailError,
      password: passwordError
    });

    if (emailError || passwordError) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await authService.login(email, password);
      
      if (result.success && result.user) {
        setCurrentUser(result.user);
        navigate('/dashboard');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (userType: string) => {
    const demoCredentials = {
      super_admin: { email: 'admin@flydubai.com', password: 'password123' },
      passenger_manager: { email: 'passenger@flydubai.com', password: 'password123' },
      crew_manager: { email: 'crew@flydubai.com', password: 'password123' }
    };

    const creds = demoCredentials[userType as keyof typeof demoCredentials];
    if (creds) {
      setEmail(creds.email);
      setPassword(creds.password);
      setFieldErrors({ email: '', password: '' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Plane className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">Emirates NBD</h1>
        </div>

        {/* Login Form */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-lg font-medium text-gray-700">
              Log in to Emirates NBD
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800 text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email or username"
                    value={email}
                    onChange={handleEmailChange}
                    className={`h-12 px-4 bg-gray-50 border-gray-200 text-gray-700 placeholder:text-gray-500 focus:bg-red-50 focus:border-red-300 ${
                      fieldErrors.email ? 'bg-red-50 border-red-300' : ''
                    }`}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-red-600 text-xs mt-1">{fieldErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={handlePasswordChange}
                    className={`h-12 px-4 pr-10 bg-gray-50 border-gray-200 text-gray-700 placeholder:text-gray-500 focus:bg-red-50 focus:border-red-300 ${
                      fieldErrors.password ? 'bg-red-50 border-red-300' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-red-600 text-xs mt-1">{fieldErrors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <label htmlFor="remember" className="text-gray-600 cursor-pointer">
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-700 hover:underline"
                  onClick={() => {
                    // Handle forgot credentials
                    alert('Forgot credentials functionality would be implemented here');
                  }}
                >
                  Forgot credentials
                </button>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md"
                disabled={isLoading || !!fieldErrors.email || !!fieldErrors.password}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Logging in...
                  </div>
                ) : (
                  'Log in'
                )}
              </Button>
            </form>

            {/* Demo Accounts */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center mb-3">Demo Accounts:</p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs h-8 border-gray-200 text-gray-600 hover:bg-gray-50"
                  onClick={() => handleDemoLogin('super_admin')}
                >
                  Super Admin (SA001)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs h-8 border-gray-200 text-gray-600 hover:bg-gray-50"
                  onClick={() => handleDemoLogin('passenger_manager')}
                >
                  Passenger Manager (PM001)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs h-8 border-gray-200 text-gray-600 hover:bg-gray-50"
                  onClick={() => handleDemoLogin('crew_manager')}
                >
                  Crew Manager (CM001)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>© 2025 Emirates NBD. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
