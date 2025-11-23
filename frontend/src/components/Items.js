import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Items({ token, cartCount, setCartCount, onCartUpdate, searchQuery, onLogout, formatPrice }) {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [notification, setNotification] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchItems();
    if (token) {
      fetchCartCount();
    }
  }, [token]);

  const fetchItems = async () => {
    try {
      const res = await axios.get('http://localhost:5000/items');
      const itemsData = res.data || [];

      // Fetch bra and panty products from free API with real photos
      let braProducts = [];
      try {
        // Create specific bra and panty products with real intimate wear photos
        braProducts = [
          {
            _id: 'bra001',
            name: 'Lace Push-Up Bra - Black',
            price: 35.99,
            image: '/images/Lace Push-Up Bra - Black.avif',
            category: 'ladies-garments',
            description: 'Elegant black lace push-up bra with enhanced support and comfort',
            rating: { rate: 4.8, count: 156 },
            ratingCount: 156
          },
          {
            _id: 'bra002',
            name: 'Sports Bra - Pink',
            price: 28.99,
            image: '/images/Sports Bra - Pink.avif',
            category: 'ladies-garments',
            description: 'High-performance sports bra in vibrant pink - Perfect for workouts',
            rating: { rate: 4.6, count: 234 },
            ratingCount: 234
          },
          {
            _id: 'bra003',
            name: 'Wireless Comfort Bra - Nude',
            price: 32.99,
            image: '/images/Wireless Comfort Bra - Nude.webp',
            category: 'ladies-garments',
            description: 'Ultra-comfortable nude wireless bra with seamless design',
            rating: { rate: 4.7, count: 189 },
            ratingCount: 189
          },
          {
            _id: 'bra004',
            name: 'Lace Bralette - White',
            price: 25.99,
            image: '/images/Lace Bralette - White.png',
            category: 'ladies-garments',
            description: 'Delicate white lace bralette with soft cups and comfortable fit',
            rating: { rate: 4.5, count: 112 },
            ratingCount: 112
          },
          {
            _id: 'panty001',
            name: 'Silk Panty Set - Red',
            price: 22.99,
            image: '/images/Silk Panty Set - Red.jpg',
            category: 'ladies-garments',
            description: 'Luxurious red silk panty set with lace trim - Premium comfort',
            rating: { rate: 4.9, count: 78 },
            ratingCount: 78
          },
          {
            _id: 'panty002',
            name: 'Cotton Bikini Panties - 3 Pack',
            price: 18.99,
            image: '/images/Cotton Bikini Panties.webp',
            category: 'ladies-garments',
            description: 'Soft cotton bikini panties in assorted colors - Everyday comfort',
            rating: { rate: 4.4, count: 267 },
            ratingCount: 267
          },
          {
            _id: 'panty003',
            name: 'Lace Thong - Black',
            price: 16.99,
            image: '/images/Lace Thong - Black.avif',
            category: 'ladies-garments',
            description: 'Elegant black lace thong with delicate design and comfortable fit',
            rating: { rate: 4.3, count: 145 },
            ratingCount: 145
          },
          {
            _id: 'set001',
            name: 'Matching Bra & Panty Set - Purple',
            price: 48.99,
            image: '/images/Matching Bra & Panty Set - Purple.webp',
            category: 'ladies-garments',
            description: 'Beautiful purple matching bra and panty set with lace details',
            rating: { rate: 4.8, count: 198 },
            ratingCount: 198
          },
          {
            _id: 'panty004',
            name: 'Premium Panty Collection',
            price: 21.99,
            image: '/images/panty.avif',
            category: 'ladies-garments',
            description: 'Premium quality panty with superior comfort and elegant design',
            rating: { rate: 4.6, count: 145 },
            ratingCount: 145
          }
        ];
      } catch (apiError) {
        console.error('Error creating bra products:', apiError);
        braProducts = [];
      }

      // Fetch additional bra/panty products from free API
      try {
        const response = await axios.get('https://fakestoreapi.com/products/category/women\'s%20clothing?limit=3');
        const apiProducts = response.data || [];

        const additionalIntimateWear = apiProducts.map((product, index) => {
          const braTypes = ['T-Shirt Bra', 'Balconette Bra', 'High-Waist Panty'];
          const colors = ['Beige', 'Navy', 'Rose Gold'];
          const imageMap = {
            'T-Shirt Bra': '/images/T-Shirt Bra - Beige.webp',
            'Balconette Bra': '/images/Balconette Bra - Navy.avif',
            'High-Waist Panty': '/images/High-Waist Panty - Rose Gold.avif'
          };
          return {
            _id: `ext-${product.id}`,
            name: `${braTypes[index]} - ${colors[index]}`,
            price: product.price * 1.3,
            image: imageMap[braTypes[index]] || `/images/panty.avif`,
            category: 'ladies-garments',
            description: `Premium ${braTypes[index].toLowerCase()} with superior comfort and support`,
            rating: { rate: product.rating?.rate || 4.6, count: product.rating?.count || 120 },
            ratingCount: product.rating?.count || 120
          };
        });

        braProducts = [...braProducts, ...additionalIntimateWear];
      } catch (externalApiError) {
        console.error('Error fetching from external API:', externalApiError);
      }

      // Combine regular items with bra/panty products
      const allItems = [...itemsData, ...braProducts];
      setItems(allItems);
      setFilteredItems(allItems);

      // Extract unique categories
      const uniqueCategories = [...new Set(allItems.map(item => item.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Error fetching items:', err);
      showNotification('❌ Failed to load items. Please refresh the page.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterItems = (category) => {
    setSelectedCategory(category);
    applyFiltersAndSort(category, sortBy, searchQuery);
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    applyFiltersAndSort(selectedCategory, newSortBy, searchQuery);
  };

  const applyFiltersAndSort = (category, sort, search) => {
    let filtered = items;

    // Filter by category
    if (category === 'ladies-garments') {
      filtered = filtered.filter(item =>
        item.category === 'ladies-garments' ||
        (item.name && (
          item.name.toLowerCase().includes('bra') ||
          item.name.toLowerCase().includes('panty') ||
          item.name.toLowerCase().includes('panties') ||
          item.name.toLowerCase().includes('lingerie')
        ))
      );
    } else if (category !== 'all') {
      filtered = filtered.filter(item => item.category === category);
    }

    // Filter by search query
    if (search.trim()) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category?.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort items
    switch (sort) {
      case 'price-low':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0));
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        filtered.sort((a, b) => (b.id || 0) - (a.id || 0));
        break;
      case 'popularity':
        filtered.sort((a, b) => (b.rating?.count || 0) - (a.rating?.count || 0));
        break;
      default:
        // Keep original order
        break;
    }

    setFilteredItems(filtered);
  };

  // Effect for search query changes
  React.useEffect(() => {
    if (items.length > 0) {
      applyFiltersAndSort(selectedCategory, sortBy, searchQuery);
    }
  }, [searchQuery, items]);

  const getCategories = () => {
    // Get all unique categories from items, excluding ladies-garments
    const itemCategories = [...new Set(items.map(item => item.category).filter(cat => cat && cat !== 'ladies-garments'))];
    // Always include 'all' first, then 'ladies-garments', then other categories
    const categories = ['all', 'ladies-garments', ...itemCategories];
    return categories;
  };

  const fetchCartCount = async () => {
    if (!token) {
      setCartCount(0);
      return;
    }

    try {
      const res = await axios.get('http://localhost:5000/carts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const carts = res.data || [];
      const active = carts.find(c => c.status === 'active');
      setCartCount(active ? active.items.length : 0);
    } catch (err) {
      console.error('Error fetching cart count:', err);
      // If unauthorized, reset cart count
      if (err.response?.status === 401) {
        setCartCount(0);
      }
    }
  };

  const addToCart = async (item) => {
    if (addingToCart === item._id) return; // Prevent double clicks

    if (!token) {
      showNotification('❌ Please login to add items to cart', 'error');
      return;
    }

    setAddingToCart(item._id);
    try {
      await axios.post('http://localhost:5000/carts', { item_id: item._id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const newCartCount = cartCount + 1;
      setCartCount(newCartCount);
      if (onCartUpdate) onCartUpdate(newCartCount);
      showNotification(`✅ ${item.name} added to cart!`, 'success');
    } catch (err) {
      console.error('Error adding to cart:', err);
      if (err.response?.status === 401) {
        showNotification('❌ Session expired. Please login again.', 'error');
      } else {
        showNotification('❌ Failed to add item to cart', 'error');
      }
    } finally {
      setAddingToCart(null);
    }
  };

  const showCart = async () => {
    if (!token) {
      showNotification('❌ Please login to view your cart', 'error');
      return;
    }

    try {
      const res = await axios.get('http://localhost:5000/carts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const carts = res.data || [];
      const active = carts.find(c => c.status === 'active');

      if (!active || active.items.length === 0) {
        return showNotification('Your cart is empty\n\nStart shopping by clicking on items!', 'info');
      }

      const itemNames = active.items.map(it => it.item_id?.name || 'Unknown Item');
      const message = `Shopping Cart (${itemNames.length} items):\n\n${itemNames.map((name, i) => `${i + 1}. ${name}`).join('\n')}`;
      window.alert(message);
    } catch (err) {
      if (err.response?.status === 401) {
        showNotification('❌ Session expired. Please login again.', 'error');
      } else {
        showNotification('❌ Failed to load cart', 'error');
      }
    }
  };

  const checkout = async () => {
    if (!token) {
      showNotification('❌ Please login to checkout', 'error');
      return;
    }

    if (cartCount === 0) {
      return showNotification('Your cart is empty\n\nAdd some items first!', 'info');
    }

    try {
      await axios.post('http://localhost:5000/orders', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCartCount(0);
      showNotification(`🎉 Order placed successfully!\n\nThank you for shopping with us!`, 'success');
    } catch (err) {
      console.error('Checkout error:', err);
      if (err.response?.status === 401) {
        showNotification('❌ Session expired. Please login again.', 'error');
      } else {
        showNotification('❌ Checkout failed\n\nPlease try again later.', 'error');
      }
    }
  };

  const showOrders = async () => {
    if (!token) {
      showNotification('❌ Please login to view order history', 'error');
      return;
    }

    try {
      const res = await axios.get('http://localhost:5000/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const orders = res.data || [];

      if (orders.length === 0) {
        return showNotification('📦 No orders yet\n\nStart shopping to see your order history!', 'info');
      }

      const orderInfo = orders.map((o, i) => {
        const date = new Date(o.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
        return `Order #${String(i + 1).padStart(3, '0')} - ${date}`;
      });

      const message = `📦 Order History (${orders.length} orders):\n\n${orderInfo.join('\n')}`;
      window.alert(message);
    } catch (err) {
      if (err.response?.status === 401) {
        showNotification('❌ Session expired. Please login again.', 'error');
      } else {
        showNotification('❌ Failed to load order history', 'error');
      }
    }
  };

  const showNotification = (message, type) => {
    // Enhanced alert with better formatting
    window.alert(message);
  };

  if (loading) {
    return (
      <div className="items-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div style={{ fontSize: '18px', color: '#666' }}>Loading awesome products...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="full-page-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Discover Amazing Products</h1>
            <p className="hero-subtitle">Shop from thousands of products with the best prices and fastest delivery</p>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Products</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">50K+</span>
                <span className="stat-label">Happy Customers</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Support</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-cards">
              <div className="floating-card card-1">📱</div>
              <div className="floating-card card-2">👗</div>
              <div className="floating-card card-3">💎</div>
              <div className="floating-card card-4">🏠</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar with Categories */}
      <div className="nav-bar">
        <div className="nav-container">
          <div className="category-filters">
            {getCategories().map(category => (
              <button
                key={category}
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => filterItems(category)}
              >
                {category === 'all' ? 'All' : category === 'ladies-garments' ? '👙 Ladies Garments' : `${getCategoryEmoji(category)} ${category}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="main-content">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <a href="#" onClick={(e) => { e.preventDefault(); }}>Home</a>
          <span>›</span>
          <span>{selectedCategory === 'all' ? 'All Products' : selectedCategory === 'ladies-garments' ? 'Ladies Garments' : selectedCategory}</span>
        </div>

        {/* Action Bar */}
        <div className="action-bar">
          <div className="result-info">
            {searchQuery ? (
              <span>Search results for "{searchQuery}" - </span>
            ) : null}
            {filteredItems.length} of {items.length} products
          </div>

          <div className="sort-options">
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="default">Sort by: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="name">Name: A to Z</option>
            </select>

            <button onClick={showCart} style={{
              background: '#007bff',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              View Cart ({cartCount})
            </button>

            <button onClick={checkout} style={{
              background: '#28a745',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              💳 Checkout
            </button>

            <button onClick={showOrders} style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              📦 Orders
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '80px', marginBottom: '20px' }}>🛍️</div>
            <h3>No items available</h3>
            <p>Check back later for amazing products!</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '80px', marginBottom: '20px' }}>🔍</div>
            <h3>No products found</h3>
            <p>Try selecting a different category or check back later!</p>
          </div>
        ) : (
          <div className="products-container">
            {filteredItems.map(item => (
              <div key={item._id} className="product-card">
                <div className="product-image-container">
                  <img
                    src={item.image || 'https://via.placeholder.com/300x250?text=' + encodeURIComponent(item.name)}
                    alt={item.name}
                    className="product-image"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x250/f8f9fa/666?text=' + encodeURIComponent(item.name);
                    }}
                  />
                  <button className="wishlist-btn" title="Add to Wishlist">
                    ♡
                  </button>
                  {item.price > 50 && (
                    <div className="discount-badge">15% OFF</div>
                  )}
                </div>

                <div className="product-info">
                  <div className="product-brand">
                    {item.category || 'General'}
                  </div>

                  <h3 className="product-title">{item.name}</h3>

                  <div className="product-rating">
                    <div className="rating-stars">
                      {'★'.repeat(Math.floor(item.rating || 0))}
                      {'☆'.repeat(5 - Math.floor(item.rating || 0))}
                    </div>
                    <span className="rating-count">({item.ratingCount || 0})</span>
                  </div>

                  <div className="product-price">
                    <span className="current-price">
                      {formatPrice ? formatPrice(item.price) : `₹${item.price ? (item.price * 83.12).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}`}
                    </span>
                    {item.price > 30 && (
                      <>
                        <span className="original-price">
                          ₹{item.price ? (item.price * 95).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0'}
                        </span>
                        <span className="price-off">12% off</span>
                      </>
                    )}
                  </div>

                  <div className="product-delivery">
                    Free delivery by tomorrow
                  </div>

                  <button
                    className="add-to-cart-btn"
                    onClick={() => addToCart(item)}
                    disabled={addingToCart === item._id}
                  >
                    {addingToCart === item._id ? 'Adding...' : 'Add to Cart'}
                  </button>

                  <button className="buy-now-btn">
                    ⚡ Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to get emoji for categories
function getCategoryEmoji(category) {
  if (!category) return '🛍️';
  const lowerCategory = category.toLowerCase();
  if (lowerCategory.includes("women's clothing")) return '👗';
  if (lowerCategory.includes("men's clothing")) return '👔';
  if (lowerCategory.includes('clothing')) return '👕';
  if (lowerCategory.includes('electronics')) return '📱';
  if (lowerCategory.includes('jewelry') || lowerCategory.includes('jewelery')) return '💎';
  if (lowerCategory.includes('home') || lowerCategory.includes('furniture')) return '🏠';
  if (lowerCategory.includes('sports') || lowerCategory.includes('fitness')) return '⚽';
  if (lowerCategory.includes('books')) return '📚';
  if (lowerCategory.includes('toys')) return '🧸';
  if (lowerCategory.includes('beauty') || lowerCategory.includes('health')) return '💄';
  return '🛍️';
}
