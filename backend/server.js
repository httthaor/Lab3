const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 5000;
const DATA_PATH = path.join(__dirname, 'data.json');

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Biến lưu giỏ hàng trong RAM (hoặc lưu file tuỳ ý)
let cart = [];

async function readData() {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

async function writeData(data) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
}

// --- PRODUCT ROUTES ---
app.get('/api/products', async (req, res) => {
  const products = await readData();
  res.json(products);
});

app.post('/api/products', async (req, res) => {
  const { name, price } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'Thiếu dữ liệu' });
  const products = await readData();
  const newProduct = { id: Date.now(), name, price: Number(price) };
  products.push(newProduct);
  await writeData(products);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', async (req, res) => {
  const id = Number(req.params.id);
  const products = await readData();
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return res.status(404).json({ error: 'Không tìm thấy' });
  products[index] = { ...products[index], ...req.body, price: Number(req.body.price || products[index].price) };
  await writeData(products);
  res.json(products[index]);
});

app.delete('/api/products/:id', async (req, res) => {
  const id = Number(req.params.id);
  const products = await readData();
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
  products.splice(index, 1);
  await writeData(products);
  res.json({ message: 'Đã xoá thành công' });
});

// --- CART ROUTES (NÂNG CAO 4) ---

// 1. GET /api/cart: Lấy danh sách item trong giỏ kèm thông tin sản phẩm
app.get('/api/cart', async (req, res) => {
  const products = await readData();
  const detailedCart = cart.map(item => {
    const product = products.find(p => p.id === item.productId);
    return {
      ...item,
      product: product || { name: 'Sản phẩm đã bị xóa', price: 0 }
    };
  });
  res.json(detailedCart);
});

// 2. POST /api/cart: Thêm sản phẩm vào giỏ { productId, quantity }
app.post('/api/cart', async (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId) return res.status(400).json({ error: 'Thiếu productId' });

  const numQty = Number(quantity) || 1;
  const existingItem = cart.find(item => item.productId === Number(productId));

  if (existingItem) {
    existingItem.quantity += numQty;
  } else {
    cart.push({ productId: Number(productId), quantity: numQty });
  }

  res.status(201).json({ message: 'Đã thêm vào giỏ', cart });
});

// 3. DELETE /api/cart/:productId: Xóa 1 sản phẩm khỏi giỏ
app.delete('/api/cart/:productId', (req, res) => {
  const productId = Number(req.params.productId);
  cart = cart.filter(item => item.productId !== productId);
  res.json({ message: 'Đã xóa khỏi giỏ', cart });
});

app.listen(PORT, () => {
  console.log(`Backend chạy tại port :${PORT}`);
});