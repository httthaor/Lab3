'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface CartItem {
  productId: number;
  quantity: number;
  product: {
    name: string;
    price: number;
  };
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  const fetchCart = async () => {
    try {
      const res = await api.get<CartItem[]>('/api/cart');
      setCart(res.data);
    } catch {
      toast.error('Không thể lấy dữ liệu giỏ hàng!');
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemove = async (productId: number) => {
    try {
      await api.delete(`/api/cart/${productId}`);
      setCart(prev => prev.filter(item => item.productId !== productId));
      toast.success('Đã xóa khỏi giỏ');
    } catch {
      toast.error('Xóa thất bại!');
    }
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.quantity * item.product.price, 0);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Giỏ Hàng Của Bạn</h1>
        <Link href="/products" className="text-blue-600 text-sm hover:underline">
          ← Quay lại danh sách sản phẩm
        </Link>
      </div>

      <div className="space-y-3 mb-6">
        {cart.map((item) => (
          <div key={item.productId} className="flex justify-between items-center p-3 border rounded shadow-sm bg-white">
            <div>
              <p className="font-semibold text-gray-800">{item.product.name}</p>
              <p className="text-sm text-gray-500">
                {item.product.price.toLocaleString()} đ x {item.quantity} ={' '}
                <span className="text-blue-600 font-medium">
                  {(item.product.price * item.quantity).toLocaleString()} đ
                </span>
              </p>
            </div>
            <button
              onClick={() => handleRemove(item.productId)}
              className="text-red-500 hover:text-red-700 text-sm font-medium border border-red-200 px-3 py-1 rounded"
            >
              Xóa
            </button>
          </div>
        ))}

        {cart.length === 0 && (
          <p className="text-gray-500 italic">Giỏ hàng đang trống.</p>
        )}
      </div>

      {cart.length > 0 && (
        <div className="p-4 bg-gray-50 border rounded-lg flex justify-between items-center">
          <span className="font-semibold text-gray-700">Tổng thanh toán:</span>
          <span className="text-xl font-bold text-red-600">{totalPrice.toLocaleString()} đ</span>
        </div>
      )}
    </div>
  );
}