'use client';

import React from 'react';
import { Card } from '@/components/dashboard/Card';
import { ShoppingCart, DollarSign, MessageSquare, Users } from 'lucide-react';

export default function DashboardPage() {
  const summaryData = [
    {
      title: 'Total Orders',
      value: '1,245',
      icon: ShoppingCart,
      trend: '+12.5% from last month',
      trendUp: true,
    },
    {
      title: 'Total Revenue',
      value: '₹2,45,678',
      icon: DollarSign,
      trend: '+8.2% from last month',
      trendUp: true,
    },
    {
      title: 'Total Messages',
      value: '3,456',
      icon: MessageSquare,
      trend: '+18.7% from last month',
      trendUp: true,
    },
    {
      title: 'Active Customers',
      value: '892',
      icon: Users,
      trend: '+5.3% from last month',
      trendUp: true,
    },
  ];

  const revenueData = [
    { month: 'Jan', revenue: 15000 },
    { month: 'Feb', revenue: 18000 },
    { month: 'Mar', revenue: 22000 },
    { month: 'Apr', revenue: 19000 },
    { month: 'May', revenue: 24000 },
    { month: 'Jun', revenue: 28000 },
  ];

  const maxRevenue = Math.max(...revenueData.map((d) => d.revenue));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back! Here's what's happening with your business.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryData.map((item, index) => (
          <Card key={index} {...item} />
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Revenue Overview</h2>
          <p className="text-gray-600 text-sm mt-1">
            Monthly revenue for the last 6 months
          </p>
        </div>

        <div className="space-y-4">
          {revenueData.map((data, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-12 text-sm font-medium text-gray-600">
                {data.month}
              </div>
              <div className="flex-1">
                <div className="h-10 bg-gray-100 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-lg transition-all duration-500 ease-out flex items-center justify-end pr-3"
                    style={{
                      width: `${(data.revenue / maxRevenue) * 100}%`,
                    }}
                  >
                    <span className="text-white text-sm font-medium">
                      ₹{data.revenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {[
              {
                action: 'New order received',
                details: 'Order #12345 - ₹1,299',
                time: '5 minutes ago',
              },
              {
                action: 'Message received',
                details: 'Customer inquiry about product',
                time: '12 minutes ago',
              },
              {
                action: 'Payment received',
                details: 'Order #12344 - ₹2,499',
                time: '1 hour ago',
              },
              {
                action: 'Product added',
                details: 'New product: Premium Headphones',
                time: '2 hours ago',
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0"
              >
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.action}
                  </p>
                  <p className="text-sm text-gray-600">{activity.details}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Top Products
          </h2>
          <div className="space-y-4">
            {[
              { name: 'Wireless Headphones', sales: 234, revenue: '₹58,500' },
              { name: 'Smart Watch', sales: 189, revenue: '₹47,250' },
              { name: 'Phone Case', sales: 167, revenue: '₹16,700' },
              { name: 'Power Bank', sales: 145, revenue: '₹21,750' },
            ].map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-600">{product.sales} sales</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    {product.revenue}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
