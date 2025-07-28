// app/components/BookingForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface BookingFormProps {
  mateId: string;
  hourlyRate: number;
  mateName: string;
  rating:	 number;
}

export default function BookingForm({ mateId, hourlyRate, mateName, rating }: BookingFormProps) {
  const [formData, setFormData] = useState({
    activity: '',
    date: '',
    startTime: '',
    endTime: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const calculateTotal = () => {
    if (!formData.startTime || !formData.endTime) return 0;
    
    const start = new Date(`1970-01-01T${formData.startTime}:00`);
    const end = new Date(`1970-01-01T${formData.endTime}:00`);
    
    if (end <= start) return 0;
    
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return hours * hourlyRate;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation
    if (!formData.activity || !formData.date || !formData.startTime || !formData.endTime) {
      setError('Please fill in all fields');
      return;
    }

    const start = new Date(`1970-01-01T${formData.startTime}:00`);
    const end = new Date(`1970-01-01T${formData.endTime}:00`);
    
    if (end <= start) {
      setError('End time must be after start time');
      return;
    }

    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      setError('Cannot book for past dates');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mateId,
          ...formData
        }),
		credentials : "include"
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Booking created successfully! Redirecting to your bookings...');
        setTimeout(() => {
          router.push('/bookings');
        }, 2000);
      } else {
        setError(data.error || 'Failed to create booking');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const totalAmount = calculateTotal();

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Book {mateName}</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="activity" className="block text-sm font-medium text-gray-700 mb-1">
            Activity
          </label>
          <textarea
            id="activity"
            name="activity"
            value={formData.activity}
            onChange={handleChange}
            placeholder="Describe what you'd like to do..."
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            required
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <input
              type="time"
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <input
              type="time"
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Hourly Rate:</span>
            <span className="font-medium">฿{hourlyRate}</span>
          </div>
          {totalAmount > 0 && (
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-600">Total Amount:</span>
              <span className="font-bold text-lg">฿{totalAmount.toFixed(2)}</span>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || totalAmount <= 0}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Creating Booking...' : 'Book Now'}
        </button>
      </form>
    </div>
  );
}