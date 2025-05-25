import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

import { toast } from 'react-toastify';
import axiosInstance from '@/utils/AxiosInstance';

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const registerMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await axiosInstance.post('/auth/register', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      return data;
    },
    onSuccess: () => {
      navigate('/login');
      toast.success('Registered successfully');
    },
    onError: (err) => {
      // const msg = err?.response?.data?.message || 'Something went wrong';
      toast.error(err?.data?.message);
      // setError(msg);
    },
  });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!/^[\w-]{3,}$/i.test(form.username))
      return 'Username must be at least 3 characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return 'Invalid email address';
    if (form.password.length < 6)
      return 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) return "Passwords don't match";
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) return setError(validationError);
    setError('');

    registerMutation.mutate({
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
    });
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100 px-4'>
      <div className='max-w-md w-full bg-white p-8 rounded-lg shadow-lg'>
        <h2 className='text-2xl font-semibold text-center mb-6 text-gray-800'>
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className='space-y-5'>
          {/* Username */}
          <Field
            type='text'
            name='username'
            label='Username'
            value={form.username}
            onChange={handleChange}
            placeholder='Enter your username'
            required
            minLength={3}
          />

          {/* Email */}
          <Field
            type='email'
            name='email'
            label='Email Address'
            value={form.email}
            onChange={handleChange}
            placeholder='you@example.com'
            required
          />

          {/* Password */}
          <Field
            type='password'
            name='password'
            label='Password'
            value={form.password}
            onChange={handleChange}
            placeholder='Enter your password'
            required
            minLength={6}
          />

          {/* Confirm Password */}
          <Field
            type='password'
            name='confirmPassword'
            label='Confirm Password'
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder='Confirm your password'
            required
            minLength={6}
          />

          {error && <p className='text-red-600 text-sm font-medium'>{error}</p>}

          <button
            type='submit'
            disabled={registerMutation.isLoading}
            className='w-full py-3 bg-darkBlue text-white font-semibold rounded-md hover:scale-105 duration-200 transition-all disabled:opacity-50'
          >
            {registerMutation.isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className='mt-6 text-center text-gray-600'>
          Already have an account?{' '}
          <Link
            to='/login'
            className='text-darkBlue hover:underline font-medium'
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, ...inputProps }) {
  return (
    <div>
      <label
        className='block text-gray-700 font-medium mb-1'
        htmlFor={inputProps.name}
      >
        {label}
      </label>
      <input
        {...inputProps}
        id={inputProps.name}
        className='w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400'
      />
    </div>
  );
}
