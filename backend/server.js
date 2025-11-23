require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

const usersRoutes = require('./routes/users');
const itemsRoutes = require('./routes/items');
const cartsRoutes = require('./routes/carts');
const ordersRoutes = require('./routes/orders');
const Item = require('./models/Item');

app.use(cors());
app.use(express.json());

app.use('/api/users', usersRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/carts', cartsRoutes);
app.use('/api/orders', ordersRoutes);

const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGO || 'mongodb://127.0.0.1:27017/ecommerce';

mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');
    // Seed items from Fake Store API if none
    const count = await Item.countDocuments();
    if (count === 0) {
      try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch('https://fakestoreapi.com/products');
        const products = await response.json();
        
        const items = products.map(product => ({
          name: product.title,
          price: product.price,
          description: product.description,
          image: product.image,
          category: product.category,
          rating: {
            rate: product.rating.rate,
            count: product.rating.count
          },
          status: 'available',
          originalPrice: product.price * 1.2, // Add original price for discount display
          inStock: Math.floor(Math.random() * 100) + 10, // Random stock
          features: product.description ? product.description.split('.').slice(0, 3) : []
        }));
        
        // Add additional ladies garments and undergarments
        const ladiesGarments = [
          {
            name: 'Comfortable Cotton Bra - Nude',
            price: 24.99,
            originalPrice: 32.99,
            description: 'Comfortable cotton bra with underwire support and adjustable straps. Perfect for everyday wear.',
            image: 'https://via.placeholder.com/300x300?text=Cotton+Bra',
            category: "women's clothing",
            rating: { rate: 4.3, count: 156 },
            status: 'available',
            inStock: 45,
            features: ['Cotton blend fabric', 'Underwire support', 'Adjustable straps', 'Machine washable']
          },
          {
            name: 'Lace Push-Up Bra - Black',
            price: 34.99,
            originalPrice: 44.99,
            description: 'Elegant lace push-up bra with padded cups for enhanced shape and comfort.',
            image: 'https://via.placeholder.com/300x300?text=Lace+Bra',
            category: "women's clothing",
            rating: { rate: 4.5, count: 234 },
            status: 'available',
            inStock: 38,
            features: ['Lace design', 'Push-up padding', 'Underwire support', 'Hook closure']
          },
          {
            name: 'Sports Bra - High Support',
            price: 29.99,
            originalPrice: 39.99,
            description: 'High-support sports bra perfect for workouts and active lifestyle.',
            image: 'https://via.placeholder.com/300x300?text=Sports+Bra',
            category: "women's clothing",
            rating: { rate: 4.7, count: 189 },
            status: 'available',
            inStock: 52,
            features: ['High support', 'Moisture-wicking', 'Seamless design', 'Removable pads']
          },
          {
            name: 'Cotton Brief Underwear Set (3-Pack)',
            price: 18.99,
            originalPrice: 24.99,
            description: 'Comfortable cotton brief underwear set. Pack of 3 in assorted colors.',
            image: 'https://via.placeholder.com/300x300?text=Brief+Set',
            category: "women's clothing",
            rating: { rate: 4.2, count: 98 },
            status: 'available',
            inStock: 67,
            features: ['100% cotton', 'Comfortable fit', 'Pack of 3', 'Assorted colors']
          },
          {
            name: 'Seamless Thong Underwear (5-Pack)',
            price: 22.99,
            originalPrice: 29.99,
            description: 'Seamless thong underwear set for invisible lines under clothing. Pack of 5.',
            image: 'https://via.placeholder.com/300x300?text=Thong+Set',
            category: "women's clothing",
            rating: { rate: 4.1, count: 76 },
            status: 'available',
            inStock: 43,
            features: ['Seamless design', 'No visible lines', 'Pack of 5', 'Stretch fabric']
          },
          {
            name: 'Silk Chemise Lingerie',
            price: 45.99,
            originalPrice: 59.99,
            description: 'Elegant silk chemise lingerie with delicate lace trim. Perfect for special occasions.',
            image: 'https://via.placeholder.com/300x300?text=Silk+Chemise',
            category: "women's clothing",
            rating: { rate: 4.6, count: 134 },
            status: 'available',
            inStock: 29,
            features: ['100% silk', 'Lace trim', 'Adjustable straps', 'Hand wash only']
          },
          {
            name: 'Maternity Bra - Nursing Support',
            price: 32.99,
            originalPrice: 42.99,
            description: 'Comfortable maternity bra with nursing support and easy-open cups.',
            image: 'https://via.placeholder.com/300x300?text=Maternity+Bra',
            category: "women's clothing",
            rating: { rate: 4.4, count: 167 },
            status: 'available',
            inStock: 35,
            features: ['Nursing support', 'Easy-open cups', 'Extra comfort', 'Wire-free']
          },
          {
            name: 'Shapewear Bodysuit - Full Coverage',
            price: 39.99,
            originalPrice: 54.99,
            description: 'Full coverage shapewear bodysuit for smooth silhouette and confidence.',
            image: 'https://via.placeholder.com/300x300?text=Shapewear',
            category: "women's clothing",
            rating: { rate: 4.3, count: 145 },
            status: 'available',
            inStock: 41,
            features: ['Full coverage', 'Smooth silhouette', 'Compression fabric', 'Hook closure']
          },
          {
            name: 'Elegant Evening Dress - Black',
            price: 79.99,
            originalPrice: 99.99,
            description: 'Elegant black evening dress perfect for formal events and special occasions.',
            image: 'https://via.placeholder.com/300x300?text=Evening+Dress',
            category: "women's clothing",
            rating: { rate: 4.8, count: 203 },
            status: 'available',
            inStock: 22,
            features: ['Elegant design', 'Premium fabric', 'Perfect fit', 'Dry clean only']
          },
          {
            name: 'Casual Summer Dress - Floral',
            price: 35.99,
            originalPrice: 45.99,
            description: 'Light and breezy summer dress with beautiful floral pattern.',
            image: 'https://via.placeholder.com/300x300?text=Summer+Dress',
            category: "women's clothing",
            rating: { rate: 4.5, count: 178 },
            status: 'available',
            inStock: 56,
            features: ['Floral pattern', 'Lightweight fabric', 'Comfortable fit', 'Machine washable']
          },
          {
            name: 'Teen Girl Training Bra - Pink',
            price: 15.99,
            originalPrice: 19.99,
            description: 'Soft and comfortable training bra perfect for young girls. Features breathable cotton fabric.',
            image: 'https://via.placeholder.com/300x300?text=Training+Bra+Pink',
            category: "women's clothing",
            rating: { rate: 4.6, count: 89 },
            status: 'available',
            inStock: 72,
            features: ['Cotton blend', 'Wire-free', 'Adjustable straps', 'Comfortable fit']
          },
          {
            name: 'Girl Sports Bra - White',
            price: 18.99,
            originalPrice: 24.99,
            description: 'Comfortable sports bra for active girls. Provides good support for sports and activities.',
            image: 'https://via.placeholder.com/300x300?text=Girl+Sports+Bra',
            category: "women's clothing",
            rating: { rate: 4.4, count: 67 },
            status: 'available',
            inStock: 45,
            features: ['Medium support', 'Moisture-wicking', 'Stretchy fabric', 'Easy to wear']
          },
          {
            name: 'Cotton Girl Bra Set - Multicolor (3-Pack)',
            price: 28.99,
            originalPrice: 36.99,
            description: 'Set of 3 colorful cotton bras for girls. Includes pink, purple, and white colors.',
            image: 'https://via.placeholder.com/300x300?text=Girl+Bra+Set',
            category: "women's clothing",
            rating: { rate: 4.5, count: 134 },
            status: 'available',
            inStock: 58,
            features: ['Pack of 3', 'Cotton fabric', 'Assorted colors', 'Age-appropriate design']
          },
          {
            name: 'Seamless Girl Bralette - Lilac',
            price: 16.99,
            originalPrice: 21.99,
            description: 'Seamless bralette with no underwire. Perfect for comfort and everyday wear.',
            image: 'https://via.placeholder.com/300x300?text=Girl+Bralette',
            category: "women's clothing",
            rating: { rate: 4.3, count: 76 },
            status: 'available',
            inStock: 41,
            features: ['Seamless design', 'Wire-free', 'Soft fabric', 'Pullover style']
          },
          {
            name: 'Girl Padded Bra - Beige',
            price: 22.99,
            originalPrice: 28.99,
            description: 'Lightly padded bra for natural shape and comfort. Perfect for teens and young women.',
            image: 'https://via.placeholder.com/300x300?text=Girl+Padded+Bra',
            category: "women's clothing",
            rating: { rate: 4.4, count: 112 },
            status: 'available',
            inStock: 37,
            features: ['Light padding', 'Underwire support', 'Adjustable straps', 'Smooth finish']
          },
          {
            name: 'Girl Racerback Bra - Mint Green',
            price: 19.99,
            originalPrice: 25.99,
            description: 'Stylish racerback bra perfect for wearing under tank tops and sleeveless shirts.',
            image: 'https://via.placeholder.com/300x300?text=Racerback+Bra',
            category: "women's clothing",
            rating: { rate: 4.5, count: 93 },
            status: 'available',
            inStock: 49,
            features: ['Racerback design', 'No show under clothes', 'Comfortable fit', 'Breathable fabric']
          },
          {
            name: 'First Bra Starter Set - Coral (2-Pack)',
            price: 24.99,
            originalPrice: 32.99,
            description: 'Perfect first bra set for young girls starting their journey. Soft and comfortable.',
            image: 'https://via.placeholder.com/300x300?text=First+Bra+Set',
            category: "women's clothing",
            rating: { rate: 4.7, count: 156 },
            status: 'available',
            inStock: 63,
            features: ['Beginner friendly', 'Pack of 2', 'Extra soft', 'Age-appropriate']
          },
          {
            name: 'Girl Convertible Bra - Navy Blue',
            price: 26.99,
            originalPrice: 34.99,
            description: 'Versatile convertible bra with removable and adjustable straps for different outfit styles.',
            image: 'https://via.placeholder.com/300x300?text=Convertible+Bra',
            category: "women's clothing",
            rating: { rate: 4.6, count: 87 },
            status: 'available',
            inStock: 33,
            features: ['Convertible straps', 'Multiple wearing options', 'Comfortable padding', 'Versatile design']
          },
          {
            name: 'Girl Wireless Bra - Lavender',
            price: 17.99,
            originalPrice: 23.99,
            description: 'Comfortable wireless bra with soft cups. Perfect for all-day comfort and support.',
            image: 'https://via.placeholder.com/300x300?text=Wireless+Bra',
            category: "women's clothing",
            rating: { rate: 4.4, count: 98 },
            status: 'available',
            inStock: 52,
            features: ['Wire-free comfort', 'Soft cups', 'All-day comfort', 'Easy care fabric']
          }
        ];

        await Item.insertMany([...items, ...ladiesGarments]);
        console.log(`Seeded ${items.length + ladiesGarments.length} items from Fake Store API and additional ladies garments`);
      } catch (error) {
        console.error('Error seeding from API, using fallback data:', error);
        const samples = [
          { 
            name: 'Premium Cotton T-Shirt', 
            price: 19.99, 
            originalPrice: 24.99,
            description: 'Comfortable 100% cotton t-shirt with premium quality fabric', 
            category: "men's clothing", 
            rating: { rate: 4.5, count: 120 },
            image: 'https://via.placeholder.com/300x300?text=T-Shirt',
            inStock: 25,
            features: ['100% Cotton', 'Machine Washable', 'Comfortable Fit']
          },
          { 
            name: 'Classic Blue Jeans', 
            price: 39.99, 
            originalPrice: 49.99,
            description: 'Classic denim jeans with perfect fit and durability', 
            category: "men's clothing", 
            rating: { rate: 4.2, count: 89 },
            image: 'https://via.placeholder.com/300x300?text=Jeans',
            inStock: 15,
            features: ['Durable Denim', 'Classic Fit', 'Five Pockets']
          },
          { 
            name: 'Running Sneakers', 
            price: 79.99, 
            originalPrice: 99.99,
            description: 'Comfortable running shoes with excellent support', 
            category: "men's clothing", 
            rating: { rate: 4.7, count: 156 },
            image: 'https://via.placeholder.com/300x300?text=Sneakers',
            inStock: 30,
            features: ['Breathable Material', 'Cushioned Sole', 'Lightweight']
          },
          { 
            name: 'Ceramic Coffee Mug', 
            price: 12.99, 
            originalPrice: 16.99,
            description: 'Premium ceramic coffee mug perfect for your morning coffee', 
            category: 'home & garden', 
            rating: { rate: 4.3, count: 45 },
            image: 'https://via.placeholder.com/300x300?text=Coffee+Mug',
            inStock: 50,
            features: ['Ceramic Material', 'Microwave Safe', 'Dishwasher Safe']
          },
          {
            name: 'Comfortable Cotton Bra',
            price: 24.99,
            originalPrice: 32.99,
            description: 'Comfortable cotton bra with excellent support for daily wear',
            category: "women's clothing",
            rating: { rate: 4.4, count: 156 },
            image: 'https://via.placeholder.com/300x300?text=Cotton+Bra',
            inStock: 45,
            features: ['Cotton blend', 'Underwire support', 'Adjustable straps']
          },
          {
            name: 'Ladies Underwear Set (3-Pack)',
            price: 18.99,
            originalPrice: 24.99,
            description: 'Comfortable cotton underwear set in assorted colors',
            category: "women's clothing",
            rating: { rate: 4.2, count: 98 },
            image: 'https://via.placeholder.com/300x300?text=Underwear+Set',
            inStock: 67,
            features: ['100% cotton', 'Pack of 3', 'Comfortable fit']
          },
          {
            name: 'Elegant Summer Dress',
            price: 45.99,
            originalPrice: 59.99,
            description: 'Beautiful summer dress perfect for casual and formal occasions',
            category: "women's clothing",
            rating: { rate: 4.6, count: 134 },
            image: 'https://via.placeholder.com/300x300?text=Summer+Dress',
            inStock: 29,
            features: ['Elegant design', 'Comfortable fabric', 'Perfect fit']
          },
          {
            name: 'Girl Training Bra - Pink',
            price: 15.99,
            originalPrice: 19.99,
            description: 'Soft and comfortable training bra perfect for young girls',
            category: "women's clothing",
            rating: { rate: 4.6, count: 89 },
            image: 'https://via.placeholder.com/300x300?text=Girl+Training+Bra',
            inStock: 72,
            features: ['Cotton blend', 'Wire-free', 'Comfortable fit']
          },
          {
            name: 'Girl Sports Bra Set (2-Pack)',
            price: 26.99,
            originalPrice: 34.99,
            description: 'Set of 2 comfortable sports bras for active girls',
            category: "women's clothing",
            rating: { rate: 4.5, count: 67 },
            image: 'https://via.placeholder.com/300x300?text=Girl+Sports+Bra+Set',
            inStock: 45,
            features: ['Pack of 2', 'Medium support', 'Stretchy fabric']
          }
        ];
        await Item.insertMany(samples);
        console.log('Seeded fallback items');
      }
    }
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Mongo error', err);
    process.exit(1);
  });
