'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  price: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [cartCount, setCartCount] = useState<number>(0);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editPrice, setEditPrice] = useState<string>('');

  const fetchProducts = async () => {
    try {
      const res = await api.get<Product[]>('/api/products');
      setProducts(res.data);
    } catch {
      toast.error('Không thể kết nối server!');
    }
  };

  const fetchCartCount = async () => {
    try {
      const res = await api.get<any[]>('/api/cart');
      const totalItems = res.data.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalItems);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCartCount();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !price) {
      toast.error('Vui lòng nhập đầy đủ tên và giá!');
      return;
    }
    try {
      await api.post('/api/products', { name, price: Number(price) });
      setName('');
      setPrice('');
      toast.success('Thêm sản phẩm thành công!');
      fetchProducts();
    } catch {
      toast.error('Thêm sản phẩm thất bại!');
    }
  };

  const handleAddToCart = async (productId: number) => {
    try {
      await api.post('/api/cart', { productId, quantity: 1 });
      toast.success('Đã thêm vào giỏ hàng!');
      fetchCartCount();
    } catch {
      toast.error('Thêm vào giỏ thất bại!');
    }
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditPrice(p.price.toString());
  };

  const handleUpdate = async (id: number) => {
    try {
      await api.put(`/api/products/${id}`, { name: editName, price: Number(editPrice) });
      toast.success('Cập nhật thành công!');
      setEditingId(null);
      fetchProducts();
    } catch {
      toast.error('Cập nhật thất bại!');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn chắc chắn muốn xoá?')) return;
    try {
      setProducts(prev => prev.filter(p => p.id !== id));
      await api.delete(`/api/products/${id}`);
      toast.success('Đã xoá sản phẩm');
    } catch {
      toast.error('Xoá thất bại!');
      fetchProducts();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản Lý Sản Phẩm</h1>
        <Link href="/cart" className="relative p-2 bg-gray-100 hover:bg-gray-200 rounded-full border">
          🛒
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>
      </div>

      {/* Form thêm sản phẩm */}
      <form onSubmit={handleSubmit} className="mb-8 p-4 bg-gray-50 border rounded-lg flex flex-col gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tên SP..."
          className="border px-3 py-2 rounded"
        />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Giá..."
          className="border px-3 py-2 rounded"
        />
        <button type="submit" className="bg-blue-600 text-white py-2 rounded font-medium">
          Thêm sản phẩm
        </button>
      </form>

      {/* Danh sách */}
      <div className="space-y-3">
        {products.map((p) => (
          <div key={p.id} className="p-3 border rounded shadow-sm bg-white">
            {editingId === p.id ? (
              <div className="flex gap-2">
                <input value={editName} onChange={e => setEditName(e.target.value)} className="border px-2 py-1 rounded" />
                <input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} className="border px-2 py-1 rounded" />
                <button onClick={() => handleUpdate(p.id)} className="bg-green-600 text-white text-xs px-3 py-1 rounded">Lưu</button>
                <button onClick={() => setEditingId(null)} className="bg-gray-400 text-white text-xs px-3 py-1 rounded">Hủy</button>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <span>{p.name} - <b className="text-blue-600">{p.price.toLocaleString()} đ</b></span>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleAddToCart(p.id)} className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-3 py-1.5 rounded">
                    + Giỏ hàng
                  </button>
                  <button onClick={() => startEdit(p)} className="text-blue-600 border border-blue-200 text-xs px-2.5 py-1.5 rounded">
                    Sửa
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-500 border border-red-200 text-xs px-2.5 py-1.5 rounded">
                    Xoá
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}