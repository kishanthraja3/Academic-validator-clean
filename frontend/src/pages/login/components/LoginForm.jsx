import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const LoginForm = ({ onLogin, loading = false, error = null }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const errors = {};
    
    if (!formData?.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData?.password) {
      errors.password = 'Password is required';
    } else if (formData?.password?.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors)?.length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors?.[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validateForm()) {
      onLogin(formData);
    }
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password flow
    console.log('Forgot password clicked');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Input */}
        <Input
          label="Email Address"
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData?.email}
          onChange={handleInputChange}
          error={validationErrors?.email}
          required
          disabled={loading}
          className="w-full"
        />

        {/* Password Input */}
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Enter your password"
            value={formData?.password}
            onChange={handleInputChange}
            error={validationErrors?.password}
            required
            disabled={loading}
            className="w-full pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors duration-150"
            disabled={loading}
          >
            <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} />
          </button>
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center justify-between">
          <Checkbox
            label="Remember me"
            name="rememberMe"
            checked={formData?.rememberMe}
            onChange={handleInputChange}
            disabled={loading}
          />
          
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-sm text-primary hover:text-primary/80 transition-colors duration-150"
            disabled={loading}
          >
            Forgot password?
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-error/10 border border-error/20 rounded-md">
            <div className="flex items-center space-x-2">
              <Icon name="AlertCircle" size={16} className="text-error flex-shrink-0" />
              <p className="text-sm text-error">{error}</p>
            </div>
          </div>
        )}

        {/* Login Button */}
        <Button
          type="submit"
          variant="default"
          size="lg"
          fullWidth
          loading={loading}
          iconName="LogIn"
          iconPosition="right"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;