
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { authService } from '../services/authService';
import { useAppContext } from '../context/AppContext';
import { useAirlineTheme } from '../hooks/useAirlineTheme';
import { AirlineLogo } from '../components/AirlineLogo';
import { Plane, Lock, Mail, Eye, EyeOff } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setCurrentUser } = useAppContext();
  const { airlineConfig } = useAirlineTheme();

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
      super_admin: { email: 'admin@flydubai.com', password: 'password123' },
      passenger_manager: { email: 'passenger@flydubai.com', password: 'password123' },
      crew_manager: { email: 'crew@flydubai.com', password: 'password123' }
    };

    const creds = demoCredentials[userType as keyof typeof demoCredentials];
    if (creds) {
      setEmail(creds.email);
      setPassword(creds.password);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Enhanced Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
                style={{ backgroundColor: 'var(--airline-primary)' }}
              >
                <AirlineLogo 
                  className="w-12 h-12 object-contain filter brightness-0 invert" 
                  alt={`${airlineConfig.displayName} Logo`}
                />
                <Plane className="w-8 h-8 text-white absolute" style={{ display: 'none' }} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                <Plane className="w-3 h-3" style={{ color: 'var(--airline-primary)' }} />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--airline-navy)' }}>
            AERON
          </h1>
          <p className="text-gray-600 text-lg font-medium">
            {airlineConfig.displayName}
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Airline Recovery Operations Network
          </p>
        </div>

        {/* Enhanced Login Form */}
        <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/95">
          <CardHeader className="pb-6 text-center">
            <CardTitle className="text-2xl font-semibold" style={{ color: 'var(--airline-navy)' }}>
              Welcome Back
            </CardTitle>
            <p className="text-gray-600 text-sm mt-2">
              Sign in to access your operations dashboard
            </p>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <Alert className="border-red-200 bg-red-50 border">
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
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-[#e5e7eb] border focus:border-airline-primary focus:ring-1 focus:ring-airline-primary transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 border-[#e5e7eb] border focus:border-airline-primary focus:ring-1 focus:ring-airline-primary transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-white font-medium transition-all duration-200 hover:shadow-lg"
                style={{ 
                  backgroundColor: 'var(--airline-primary)',
                  borderColor: 'var(--airline-primary)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--airline-navy)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--airline-primary)';
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing In...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Enhanced Demo Accounts Section */}
            <div className="mt-8 pt-6 border-t border-[#e5e7eb]">
              <p className="text-sm font-medium text-gray-700 text-center mb-4">
                Demo Accounts Available:
              </p>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-sm border-[#e5e7eb] hover:border-airline-primary hover:text-airline-primary transition-all duration-200"
                  onClick={() => handleDemoLogin('super_admin')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <span className="text-red-600 font-bold text-xs">SA</span>
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Super Administrator</div>
                      <div className="text-xs text-gray-500">Full system access</div>
                    </div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-sm border-[#e5e7eb] hover:border-airline-primary hover:text-airline-primary transition-all duration-200"
                  onClick={() => handleDemoLogin('passenger_manager')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-xs">PM</span>
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Passenger Manager</div>
                      <div className="text-xs text-gray-500">Passenger services</div>
                    </div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-sm border-[#e5e7eb] hover:border-airline-primary hover:text-airline-primary transition-all duration-200"
                  onClick={() => handleDemoLogin('crew_manager')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-600 font-bold text-xs">CM</span>
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Crew Manager</div>
                      <div className="text-xs text-gray-500">Crew operations</div>
                    </div>
                  </div>
                </Button>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-[#e5e7eb]">
                <p className="text-xs text-gray-600 text-center">
                  <span className="font-medium">Default Password:</span> password123
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Footer */}
        <div className="text-center mt-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--airline-primary)' }}></div>
            <p className="text-sm font-medium" style={{ color: 'var(--airline-navy)' }}>
              Powered by {airlineConfig.displayName}
            </p>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--airline-secondary)' }}></div>
          </div>
          <p className="text-xs text-gray-500">
            © 2025 {airlineConfig.displayName}. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
