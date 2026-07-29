import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { authAPI } from '../lib/api';
import AnimatedBackground from '../components/AnimatedBackground';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Prevent router navigation conflicts
    if (router.isReady) {
      const token = localStorage.getItem('token');
      if (token) {
        router.replace('/notes').catch(() => {});
      }
    }
  }, [router.isReady]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if(!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (formData.password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }
    setLoading(true);

    try {
      const response = await authAPI.register(formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      router.push('/notes');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 1, label: 'Weak', color: 'bg-red-500' };
    if (password.length < 8) return { strength: 2, label: 'Fair', color: 'bg-yellow-500' };
    if (password.length < 12) return { strength: 3, label: 'Good', color: 'bg-blue-500' };
    return { strength: 4, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  const features = [
    { icon: '📝', title: 'Organize Notes', desc: 'Create and manage your notes with tags' },
    { icon: '🔖', title: 'Save Bookmarks', desc: 'Keep track of your favorite links' },
    { icon: '⭐', title: 'Favorites', desc: 'Mark important items as favorites' },
    { icon: '🔍', title: 'Smart Search', desc: 'Find what you need quickly' },
  ];

  // Prevent hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 py-12 px-4">
      <AnimatedBackground />
      
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            x: [0, 150, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            x: [0, -150, 0],
            y: [0, -100, 0],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 left-1/2 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            x: [0, 100, 0],
            y: [0, -150, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <motion.div
        className="max-w-7xl w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left Side - Info Card (Desktop) / Top (Mobile) */}
        <motion.div
          className="order-2 lg:order-1"
          variants={itemVariants}
        >
          <motion.div
            className="card backdrop-blur-sm bg-white/90 shadow-2xl border border-white/20 p-8 lg:p-10"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {/* Logo/Brand Section */}
            <div className="text-center lg:text-left mb-8">
              <motion.div
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 rounded-3xl shadow-2xl mb-6"
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: [
                    "0 20px 25px -5px rgba(147, 51, 234, 0.3)",
                    "0 25px 50px -12px rgba(236, 72, 153, 0.4)",
                    "0 20px 25px -5px rgba(147, 51, 234, 0.3)",
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <motion.span
                  className="text-5xl"
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  📚
                </motion.span>
              </motion.div>
              <motion.h1
                className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-3"
                variants={itemVariants}
              >
                Create Account
              </motion.h1>
              <motion.p
                className="text-gray-600 text-lg"
                variants={itemVariants}
              >
                Start organizing your notes and bookmarks
              </motion.p>
            </div>

            {/* Features List */}
            <div className="space-y-4 mt-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all"
                  variants={itemVariants}
                  whileHover={{ x: 5, scale: 1.02 }}
                >
                  <span className="text-3xl">{feature.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Additional Info */}
            <motion.div
              className="mt-8 pt-6 border-t border-gray-200"
              variants={itemVariants}
            >
              <p className="text-xs text-gray-500 text-center lg:text-left">
                By creating an account, you agree to our terms of service
              </p>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Right Side - Registration Form (Desktop) / Bottom (Mobile) */}
        <motion.div
          className="order-1 lg:order-2"
          variants={itemVariants}
        >
          <motion.div
            className="card backdrop-blur-sm bg-white/90 shadow-2xl border border-white/20"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {error && (
              <motion.div
                className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="flex items-center">
                  <span className="text-red-500 mr-2 text-xl">⚠️</span>
                  <p className="text-sm font-semibold text-red-700">{error}</p>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    minLength={3}
                    className="input-field pl-11 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    disabled={loading}
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
                    👤
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimum 3 characters</p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    className="input-field pl-11 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={loading}
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
                    ✉️
                  </span>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    className="input-field pl-11 pr-11 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={loading}
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
                    🔒
                  </span>
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={loading}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </motion.button>
                </div>
                {formData.password && (
                  <motion.div
                    className="mt-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${passwordStrength.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                          transition={{ duration: 0.3 }}
                        ></motion.div>
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        {passwordStrength.label}
                      </span>
                    </div>
                  </motion.div>
                )}
                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    className="input-field pl-11 pr-11 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
                    🔒
                  </span>
                  <motion.button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={loading}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </motion.button>
                </div>
                {confirmPassword && formData.password && (
                  <motion.p
                    className={`text-xs mt-1 font-medium ${
                      formData.password === confirmPassword 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {formData.password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </motion.p>
                )}
              </motion.div>

              <motion.button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-lg font-semibold shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 mt-6"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <>
                    <div className="loading-spinner w-5 h-5 border-2 border-white border-t-transparent"></div>
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>Create Account</span>
                  </>
                )}
              </motion.button>
            </form>

            <motion.div
              className="mt-6 pt-6 border-t border-gray-200"
              variants={itemVariants}
            >
              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login">
                  <motion.span
                    className="text-purple-600 hover:text-purple-700 font-semibold cursor-pointer inline-block"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign in here
                  </motion.span>
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
