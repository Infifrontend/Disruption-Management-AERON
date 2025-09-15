
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { authService } from '../services/authService';
import { useAppContext } from '../context/AppContext';
import { Plane, Lock, Mail, Eye, EyeOff } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setCurrentUser } = useAppContext();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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
      super_admin: { email: 'admin@flydubai.com', password: '' },
      passenger_manager: { email: 'passenger@flydubai.com', password: '' },
      crew_manager: { email: 'crew@flydubai.com', password: '' }
    };

    const creds = demoCredentials[userType as keyof typeof demoCredentials];
    if (creds) {
      setEmail(creds.email);
      setPassword(creds.password);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-200 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl">
        {/* Logo and Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-flydubai-blue to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <Plane className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-flydubai-navy mb-2">
            AERON
          </h1>
          <p className="text-sm sm:text-base text-gray-600 font-medium">
            Aircraft Recovery Operations Network
          </p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Powered by INFINITI
          </p>
        </div>

        {/* Login Form */}
        <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/95">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-center text-lg sm:text-xl lg:text-2xl text-flydubai-navy font-semibold">
              Welcome Back
            </CardTitle>
            <p className="text-center text-xs sm:text-sm text-gray-500 mt-1">
              Sign in to access your dashboard
            </p>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
              {error && (
                <Alert className="border-red-200 bg-red-50/80 backdrop-blur-sm">
                  <AlertDescription className="text-red-800 text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 sm:h-12 border-gray-200 focus:border-flydubai-blue focus:ring-2 focus:ring-flydubai-blue/20 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 sm:h-12 border-gray-200 focus:border-flydubai-blue focus:ring-2 focus:ring-flydubai-blue/20 transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-flydubai-blue to-blue-600 hover:from-blue-700 hover:to-blue-800 h-11 sm:h-12 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing In...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Demo Accounts */}
            <div className="pt-4 sm:pt-6 border-t border-gray-200">
              <p className="text-xs sm:text-sm text-gray-600 text-center mb-3 font-medium">
                Quick Access Demo Accounts
              </p>
              <div className="grid grid-cols-1 gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs sm:text-sm h-9 sm:h-10 border-gray-200 hover:border-flydubai-blue hover:bg-flydubai-blue/5 transition-all duration-200"
                  onClick={() => handleDemoLogin('super_admin')}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>Super Admin</span>
                    <span className="text-xs text-gray-500">SA001</span>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs sm:text-sm h-9 sm:h-10 border-gray-200 hover:border-flydubai-blue hover:bg-flydubai-blue/5 transition-all duration-200"
                  onClick={() => handleDemoLogin('passenger_manager')}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>Passenger Manager</span>
                    <span className="text-xs text-gray-500">PM001</span>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs sm:text-sm h-9 sm:h-10 border-gray-200 hover:border-flydubai-blue hover:bg-flydubai-blue/5 transition-all duration-200"
                  onClick={() => handleDemoLogin('crew_manager')}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>Crew Manager</span>
                    <span className="text-xs text-gray-500">CM001</span>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 sm:mt-8">
          <p className="text-xs sm:text-sm text-gray-500">
            © 2025 INFINITI. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Secure • Reliable • Efficient
          </p>
        </div>
      </div>
    </div>
  );
}
