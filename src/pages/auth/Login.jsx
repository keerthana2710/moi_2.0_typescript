import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { setItem } from '../../utils/LocalStorage';
import { toast } from 'react-toastify';
import useAuth from '@/context/useAuth';
import axiosInstance from '@/utils/AxiosInstance';

const saveAuth = (user) => {
  setItem('access-token', JSON.stringify(user.token));
  setItem('user', JSON.stringify(user));
  setItem('isAdmin', JSON.stringify(user.isAdmin));
};

const loginRequest = async (form) => {
  const { data } = await axiosInstance.post('/auth/login', form, {
    headers: { 'Content-Type': 'application/json' },
  });
  return data.data;
};

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { setToken, setIsAdmin } = useAuth();
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: ({ ...user }) => {
      saveAuth(user);
      setToken(user.token);
      setIsAdmin(user.isAdmin);
      toast.success('Logged in Successfully');
      navigate('/');
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || 'Invalid email or password';
      setError(msg);
    },
  });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Please fill all fields');
      return;
    }
    loginMutation.mutate(form);
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100 px-4'>
      <div className='max-w-md w-full bg-white p-8 rounded-lg shadow-lg'>
        <h2 className='text-2xl font-semibold text-center mb-6 text-gray-800'>
          Login to Your Account
        </h2>

        <form onSubmit={handleSubmit} className='space-y-5'>
          <div>
            <label htmlFor='email' className='block font-medium mb-1'>
              Email Address
            </label>
            <input
              type='email'
              name='email'
              id='email'
              value={form.email}
              onChange={handleChange}
              required
              className='w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400'
              placeholder='you@example.com'
            />
          </div>

          <div className='relative'>
            <label htmlFor='password' className='block font-medium mb-1'>
              Password
            </label>
            <input
              type={showPwd ? 'text' : 'password'}
              name='password'
              id='password'
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              className='w-full px-4 py-2 pr-11 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400'
              placeholder='Enter your password'
            />
            <button
              type='button'
              onClick={() => setShowPwd((p) => !p)}
              className='absolute top-10 right-3 text-xl text-gray-600 focus:outline-none'
              aria-label={showPwd ? 'Hide password' : 'Show password'}
            >
              {showPwd ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          {error && <p className='text-red-600 text-sm font-medium'>{error}</p>}

          <button
            type='submit'
            disabled={loginMutation.isLoading}
            className={`w-full py-3 bg-darkBlue text-white font-semibold rounded-md transition-all ${
              loginMutation.isLoading
                ? 'opacity-60 cursor-not-allowed'
                : 'hover:scale-105'
            }`}
          >
            {loginMutation.isLoading ? 'Logging in…' : 'Login'}
          </button>
        </form>

        <p className='mt-6 text-center text-gray-600'>
          Don't have an account?{' '}
          <Link
            to='/register'
            className='text-darkBlue hover:underline font-medium'
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
