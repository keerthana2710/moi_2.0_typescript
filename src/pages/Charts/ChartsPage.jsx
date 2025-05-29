import React, { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import CustomDropdown from '@/components/ui/CustomDropdown';
import { useQuery } from '@tanstack/react-query';
import useAuth from '@/context/useAuth';
import axiosInstance from '@/utils/AxiosInstance';
import useDebounce from '@/hooks/useDebounce';
import { MdPayments } from 'react-icons/md';
import { TbCirclesRelation } from 'react-icons/tb';
import { IoMdGlobe } from 'react-icons/io';
import { FaGift, FaMoneyBill, FaTrophy } from 'react-icons/fa';

const COLORS = {
  primary: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'],
  secondary: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3'],
  tertiary: ['#667EEA', '#764BA2', '#F093FB', '#F5576C', '#4FACFE', '#43E97B'],
};

function FunctionChartsPage() {
  const { token } = useAuth();
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [functionSearch, setFunctionSearch] = useState('');
  const [activeChart, setActiveChart] = useState('payment-methods');

  const debouncedFunctionSearch = useDebounce(functionSearch, 300);

  // Fetch functions for dropdown
  const { data: functions, isLoading: functionsLoading } = useQuery({
    queryKey: ['functions', debouncedFunctionSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedFunctionSearch.trim()) {
        params.append('search', debouncedFunctionSearch);
      }
      const res = await axiosInstance.get(`/functions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    staleTime: Infinity,
    onSuccess: (data) => {
      console.log(data.data[0]);
      setSelectedFunction(data.data[0]);
    },
  });

  useEffect(() => {
    if (functions?.data?.length > 0 && !selectedFunction) {
      setSelectedFunction(functions.data[0]);
    }
  }, [functions, selectedFunction]);

  // Payment Methods Data
  const { data: paymentMethodsData, isLoading: paymentLoading } = useQuery({
    queryKey: ['payment-methods', selectedFunction?.function_id],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/functions/${selectedFunction.function_id}/payment-methods`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data;
    },
    enabled: !!selectedFunction?.function_id,
    staleTime: 30,
  });

  // Relation Distribution Data
  const { data: relationData, isLoading: relationLoading } = useQuery({
    queryKey: ['relation-distribution', selectedFunction?.function_id],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/functions/${selectedFunction.function_id}/relation-distribution`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data;
    },
    enabled: !!selectedFunction?.function_id,
    staleTime: 30,
  });

  // City Distribution Data
  const { data: cityData, isLoading: cityLoading } = useQuery({
    queryKey: ['city-distribution', selectedFunction?.function_id],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/functions/${selectedFunction.function_id}/city-distribution`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data;
    },
    enabled: !!selectedFunction?.function_id,
    staleTime: 30,
  });

  // Amount Distribution Data
  const { data: amountData, isLoading: amountLoading } = useQuery({
    queryKey: ['amount-distribution', selectedFunction?.function_id],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/functions/${selectedFunction.function_id}/amount-distribution`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data;
    },
    enabled: !!selectedFunction?.function_id,
    staleTime: 30,
  });

  // Cash vs Gifts Data
  const { data: cashGiftsData, isLoading: cashGiftsLoading } = useQuery({
    queryKey: ['cash-vs-gifts', selectedFunction?.function_id],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/functions/${selectedFunction.function_id}/cash-vs-gifts`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data;
    },
    enabled: !!selectedFunction?.function_id,
    staleTime: 30,
  });

  // Top Contributors Data
  const { data: topContributorsData, isLoading: contributorsLoading } =
    useQuery({
      queryKey: ['top-contributors', selectedFunction?.function_id],
      queryFn: async () => {
        const res = await axiosInstance.get(
          `/functions/${selectedFunction.function_id}/top-contributors`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return res.data;
      },
      enabled: !!selectedFunction?.function_id,
      staleTime: 30,
    });

  // Handle function selection
  const handleFunctionSelect = (value) => {
    const functionData = functions?.data?.find(
      (func) => func.function_id === value
    );
    if (functionData) {
      setSelectedFunction(functionData);
    }
  };

  // Prepare dropdown options
  const functionOptions =
    functions?.data?.map((func) => ({
      label: `${func.function_id}`,
      value: func.function_id,
    })) || [];

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Custom tooltip for charts
  // Custom tooltip for charts - Robust version
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-white p-3 border border-gray-300 rounded shadow'>
          <p className='font-semibold'>{label}</p>
          {payload.map((entry, index) => {
            // Safely check if entry.name exists and is a string
            const entryName = entry.name || '';
            const isAmountField =
              typeof entryName === 'string' &&
              (entryName.toLowerCase().includes('amount') ||
                entryName.toLowerCase().includes('total_amount') ||
                entryName.toLowerCase().includes('payer_amount'));

            return (
              <p key={index} style={{ color: entry.color }}>
                {entryName}:{' '}
                {isAmountField ? formatCurrency(entry.value || 0) : entry.value}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  // Chart selection buttons
  const chartButtons = [
    { id: 'payment-methods', label: 'Payment Methods', icon: MdPayments },
    { id: 'relations', label: 'Relations', icon: TbCirclesRelation },
    { id: 'cities', label: 'Cities', icon: IoMdGlobe },
    { id: 'amounts', label: 'Amount Ranges', icon: FaMoneyBill },
    { id: 'cash-gifts', label: 'Cash vs Gifts', icon: FaGift },
    { id: 'top-contributors', label: 'Top Contributors', icon: FaTrophy },
  ];

  // Render Payment Methods Chart
  const renderPaymentMethodsChart = () => {
    if (paymentLoading)
      return <div className='text-center p-8'>Loading payment methods...</div>;
    if (!paymentMethodsData?.data)
      return (
        <div className='text-center p-8'>No payment method data available</div>
      );

    return (
      <div className='bg-white p-6 rounded-lg shadow'>
        <h3 className='text-xl font-semibold mb-4 text-center'>
          Payment Methods Distribution
        </h3>
        <ResponsiveContainer width='100%' height={400}>
          <PieChart>
            <Pie
              data={paymentMethodsData.data}
              cx='50%'
              cy='50%'
              labelLine={false}
              label={({ payment_method, count }) =>
                `${payment_method} (${count})`
              }
              outerRadius={120}
              fill='#8884d8'
              dataKey='total_amount'
            >
              {paymentMethodsData.data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS.primary[index % COLORS.primary.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Render Relations Chart
  const renderRelationsChart = () => {
    if (relationLoading)
      return <div className='text-center p-8'>Loading relations data...</div>;
    if (!relationData?.data)
      return <div className='text-center p-8'>No relations data available</div>;

    return (
      <div className='bg-white p-6 rounded-lg shadow'>
        <h3 className='text-xl font-semibold mb-4 text-center'>
          Contributions by Relation
        </h3>
        <ResponsiveContainer width='100%' height={400}>
          <BarChart
            data={relationData.data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='relation' />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey='total_amount'
              fill={COLORS.primary[0]}
              name='Total Amount'
            />
            <Bar dataKey='count' fill={COLORS.primary[1]} name='Count' />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Render Cities Chart
  const renderCitiesChart = () => {
    if (cityLoading)
      return <div className='text-center p-8'>Loading cities data...</div>;
    if (!cityData?.data)
      return <div className='text-center p-8'>No cities data available</div>;

    return (
      <div className='bg-white p-6 rounded-lg shadow'>
        <h3 className='text-xl font-semibold mb-4 text-center'>
          Contributions by City
        </h3>
        <ResponsiveContainer width='100%' height={400}>
          <BarChart
            data={cityData.data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='city' />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey='total_amount'
              fill={COLORS.secondary[0]}
              name='Total Amount'
            />
            <Bar dataKey='count' fill={COLORS.secondary[1]} name='Count' />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Render Amount Distribution Chart
  const renderAmountChart = () => {
    if (amountLoading)
      return (
        <div className='text-center p-8'>Loading amount distribution...</div>
      );
    if (!amountData?.data)
      return (
        <div className='text-center p-8'>
          No amount distribution data available
        </div>
      );

    return (
      <div className='bg-white p-6 rounded-lg shadow'>
        <h3 className='text-xl font-semibold mb-4 text-center'>
          Amount Range Distribution
        </h3>
        <ResponsiveContainer width='100%' height={400}>
          <BarChart
            data={amountData.data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='range' />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey='count'
              fill={COLORS.tertiary[0]}
              name='Number of Contributors'
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Render Cash vs Gifts Chart
  const renderCashGiftsChart = () => {
    if (cashGiftsLoading)
      return (
        <div className='text-center p-8'>Loading cash vs gifts data...</div>
      );
    if (!cashGiftsData?.data)
      return (
        <div className='text-center p-8'>No cash vs gifts data available</div>
      );

    const chartData = [
      {
        name: 'Cash',
        count: cashGiftsData.data.cash.count,
        total_amount: cashGiftsData.data.cash.total_amount,
      },
      {
        name: 'Gifts',
        count: cashGiftsData.data.gifts.count,
        total_amount: 0, // Gifts don't have monetary value in this context
      },
    ];

    return (
      <div className='bg-white p-6 rounded-lg shadow'>
        <h3 className='text-xl font-semibold mb-4 text-center'>
          Cash vs Gifts Distribution
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <ResponsiveContainer width='100%' height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx='50%'
                cy='50%'
                labelLine={false}
                label={({ name, count }) => `${name}: ${count}`}
                outerRadius={80}
                fill='#8884d8'
                dataKey='count'
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS.primary[index % COLORS.primary.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>

          <div className='space-y-4'>
            <h4 className='font-semibold text-lg'>Gift Types Breakdown</h4>
            {cashGiftsData.data.gifts.gift_types?.map((gift, index) => (
              <div
                key={index}
                className='flex justify-between items-center p-2 bg-gray-50 rounded'
              >
                <span>{gift.gift_name}</span>
                <span className='font-semibold'>{gift.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render Top Contributors Chart
  const renderTopContributorsChart = () => {
    if (contributorsLoading)
      return <div className='text-center p-8'>Loading top contributors...</div>;

    if (!topContributorsData?.data?.length)
      return (
        <div className='text-center p-8'>No contributors data available</div>
      );

    return (
      <div className='bg-white p-6 rounded-lg shadow-md'>
        <h3 className='text-xl font-semibold mb-4 text-center text-gray-800'>
          🏆 Top Contributors
        </h3>
        <ResponsiveContainer width='100%' height={400}>
          <BarChart
            data={topContributorsData.data}
            layout='horizontal'
            margin={{ top: 20, right: 40, left: 120, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis
              type='number'
              label={{
                value: 'Amount (₹)',
                position: 'insideBottom',
                offset: -5,
              }}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              dataKey='payer_name'
              type='category'
              width={100}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']}
              cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
            />
            <Bar
              dataKey='payer_amount'
              fill={COLORS.secondary[2]}
              name='Amount (₹)'
              barSize={25}
              label={{
                position: 'right',
                formatter: (val) => `₹${val.toLocaleString()}`,
                fontSize: 12,
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Render current chart based on selection
  const renderCurrentChart = () => {
    switch (activeChart) {
      case 'payment-methods':
        return renderPaymentMethodsChart();
      case 'relations':
        return renderRelationsChart();
      case 'cities':
        return renderCitiesChart();
      case 'amounts':
        return renderAmountChart();
      case 'cash-gifts':
        return renderCashGiftsChart();
      case 'top-contributors':
        return renderTopContributorsChart();
      default:
        return renderPaymentMethodsChart();
    }
  };

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      {/* Page Header */}
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-gray-800 mb-2'>
          விழா அறிக்கைகள் மற்றும் பகுப்பாய்வு
        </h1>
        <p className='text-gray-600'>
          Function Analytics and Reports Dashboard
        </p>
      </div>

      {/* Function Selection */}
      <div className='bg-white p-6 rounded-lg shadow mb-6'>
        <h2 className='text-xl font-semibold mb-4 text-blue-700'>
          விழா தேர்வு
        </h2>
        <div className='max-w-md'>
          <CustomDropdown
            label='விழா தேர்வு செய்க'
            placeholder='விழா தேர்வு செய்க அல்லது தேடுக'
            options={functionOptions}
            value={selectedFunction?.function_id || ''}
            onChange={handleFunctionSelect}
            onSearch={setFunctionSearch}
            searchable={true}
            loading={functionsLoading}
            required={true}
          />
        </div>

        {selectedFunction && (
          <div className='mt-4 p-4 bg-blue-50 rounded border'>
            <p className='text-sm text-blue-700'>
              <strong>தேர்ந்தெடுக்கப்பட்ட விழா:</strong>{' '}
              {selectedFunction.function_name}
            </p>
            <p className='text-sm text-blue-700'>
              <strong>நடத்துபவர்:</strong>{' '}
              {selectedFunction.function_owner_name}
            </p>
            <p className='text-sm text-blue-700'>
              <strong>விழா இடம்:</strong> {selectedFunction.function_held_place}
              , {selectedFunction.function_held_city}
            </p>
          </div>
        )}
      </div>

      {selectedFunction && (
        <>
          {/* Chart Selection Buttons */}
          <div className='bg-white p-4 rounded-lg shadow mb-6'>
            <h3 className='text-lg font-semibold mb-3'>Chart Type Selection</h3>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3'>
              {chartButtons.map((button) => (
                <button
                  key={button.id}
                  onClick={() => setActiveChart(button.id)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all hover:scale-105 ${
                    activeChart === button.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className='text-lg mb-1'>{button.icon}</div>
                  {button.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Display */}
          <div className='mb-6'>{renderCurrentChart()}</div>
        </>
      )}

      {!selectedFunction && (
        <div className='bg-white p-12 rounded-lg shadow text-center'>
          <div className='text-6xl mb-4'>📊</div>
          <h3 className='text-xl font-semibold text-gray-600 mb-2'>
            விழா தேர்வு செய்யவும்
          </h3>
          <p className='text-gray-500'>
            Select a function above to view detailed analytics and charts
          </p>
        </div>
      )}
    </div>
  );
}

export default FunctionChartsPage;
