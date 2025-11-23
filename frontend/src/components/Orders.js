import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Orders({ token, onBack, formatPrice, onRemoveFromCart }) {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Handle different response structures
      const ordersData = res.data?.orders || res.data || [];
      const processedOrders = Array.isArray(ordersData) ? ordersData.map(order => ({
        ...order,
        created_at: order.created_at || order.createdAt || new Date().toISOString(),
        status: order.status || 'pending',
        total: order.total || 0
      })) : [];

      setOrders(processedOrders);
      setFilteredOrders(processedOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setOrders([]);
      setFilteredOrders([]);
      if (err.response?.status !== 401) {
        alert('Failed to load orders. Please check if the server is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort orders
  useEffect(() => {
    let filtered = orders;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(order =>
        (order.orderNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order._id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.items || []).some(item =>
          (item.item_id?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Sort orders
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'total-high':
          return (b.total || 0) - (a.total || 0);
        case 'total-low':
          return (a.total || 0) - (b.total || 0);
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        default:
          return 0;
      }
    });

    setFilteredOrders(filtered);
  }, [orders, statusFilter, searchQuery, sortBy]);

  const viewOrderDetails = async (orderId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const orderData = res.data || {};
      // Ensure all required fields have default values
      setSelectedOrder({
        ...orderData,
        items: orderData.items || [],
        total: orderData.total || 0,
        subtotal: orderData.subtotal || 0,
        tax: orderData.tax || 0,
        shipping: orderData.shipping || 0,
        shippingAddress: orderData.shippingAddress || {
          fullName: 'N/A',
          addressLine1: 'N/A',
          addressLine2: '',
          city: 'N/A',
          state: 'N/A',
          zipCode: 'N/A',
          country: 'N/A'
        }
      });
    } catch (err) {
      console.error('Error fetching order details:', err);
      alert('Failed to load order details');
    }
  };

  const trackOrder = async (orderId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/orders/${orderId}/track`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const trackingData = res.data || {};
      setTrackingInfo({
        ...trackingData,
        orderNumber: trackingData.orderNumber || 'N/A',
        status: trackingData.status || 'pending',
        statusHistory: trackingData.statusHistory || []
      });
    } catch (err) {
      console.error('Error tracking order:', err);
      alert('Failed to load tracking information');
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      await axios.patch(`${process.env.REACT_APP_API_BASE_URL}/api/orders/${orderId}/cancel`, {
        reason: 'Customer requested cancellation'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Order cancelled successfully');
      fetchOrders();
      setSelectedOrder(null);
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert(err.response?.data?.error || 'Failed to cancel order');
    }
  };

  const reorder = async (orderId) => {
    if (!window.confirm('Would you like to reorder these items?')) return;

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/orders/${orderId}/reorder`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`New order created: ${res.data.orderNumber}`);
      fetchOrders();
    } catch (err) {
      console.error('Error reordering:', err);
      alert(err.response?.data?.error || 'Failed to reorder');
    }
  };

  const getStatusText = (status) => {
    const statusTexts = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      refunded: 'Refunded'
    };
    return statusTexts[status] || 'Unknown';
  };

  const handleRepeatOrder = (order) => {
    alert(`Order ${order.orderNumber} will be added to cart!`);
  };

  const handleDownloadInvoice = (order) => {
    alert(`Invoice for order ${order.orderNumber} will be downloaded!`);
  };

  const removeItemFromOrder = async (orderId, itemId, itemName) => {
    if (!window.confirm(`Are you sure you want to remove "${itemName}" from this order?`)) {
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/orders/${orderId}/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchOrders();
        alert(`${itemName} removed from order successfully!`);
      } else {
        throw new Error('Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing item from order:', error);
      alert('Failed to remove item from order. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="orders-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (trackingInfo) {
    return (
      <div className="orders-container">
        <div className="order-tracking">
          <div className="tracking-header">
            <button onClick={() => setTrackingInfo(null)} className="back-btn">
              ← Back to Orders
            </button>
            <h2>Track Order #{trackingInfo?.orderNumber || 'N/A'}</h2>
          </div>

          <div className="tracking-status">
            <div className="current-status">
              <span className="status-icon">{getStatusIcon(trackingInfo?.status || 'pending')}</span>
              <span className="status-text" style={{ color: getStatusColor(trackingInfo?.status || 'pending') }}>
                {(trackingInfo?.status || 'pending').toUpperCase()}
              </span>
            </div>

            {trackingInfo?.trackingNumber && (
              <div className="tracking-number">
                <strong>Tracking Number:</strong> {trackingInfo.trackingNumber}
              </div>
            )}

            {trackingInfo?.estimatedDelivery && (
              <div className="delivery-date">
                <strong>Estimated Delivery:</strong> {new Date(trackingInfo.estimatedDelivery).toLocaleDateString()}
              </div>
            )}

            {trackingInfo?.actualDelivery && (
              <div className="actual-delivery">
                <strong>Delivered On:</strong> {new Date(trackingInfo.actualDelivery).toLocaleDateString()}
              </div>
            )}
          </div>

          <div className="status-history">
            <h3>Order History</h3>
            {(trackingInfo?.statusHistory || []).map((history, index) => (
              <div key={index} className="history-item">
                <div className="history-status">
                  <span className="history-text">{getStatusText(history?.status || 'pending')}</span>
                </div>
                <div className="history-time">
                  {history?.timestamp ? new Date(history.timestamp).toLocaleString() : 'N/A'}
                </div>
                {history?.note && <div className="history-note">{history.note}</div>}
              </div>
            ))}\n          </div>
        </div>
      </div>
    );
  }

  if (selectedOrder) {
    return (
      <div className="orders-container">
        <div className="order-details">
          <div className="order-header">
            <button onClick={() => setSelectedOrder(null)} className="back-btn">
              Back to Orders
            </button>
            <h2>Order #{selectedOrder.orderNumber}</h2>
            <div className="order-status">
              <span className="status-badge">
                {getStatusText(selectedOrder.status)}
              </span>
            </div>
          </div>

          <div className="order-info">
            <div className="order-summary">
              <h3>Order Summary</h3>
              <p><strong>Order Date:</strong> {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
              <p><strong>Total:</strong> ₹{((selectedOrder.total || 0) * 83.12).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              {selectedOrder.estimatedDelivery && (
                <p><strong>Estimated Delivery:</strong> {new Date(selectedOrder.estimatedDelivery).toLocaleDateString()}</p>
              )}
            </div>

            <div className="shipping-info">
              <h3>Shipping Address</h3>
              <div className="address">
                {selectedOrder.shippingAddress ? (
                  <>
                    <p>{selectedOrder.shippingAddress.fullName || 'N/A'}</p>
                    <p>{selectedOrder.shippingAddress.addressLine1 || 'N/A'}</p>
                    {selectedOrder.shippingAddress.addressLine2 && (
                      <p>{selectedOrder.shippingAddress.addressLine2}</p>
                    )}
                    <p>{selectedOrder.shippingAddress.city || 'N/A'}, {selectedOrder.shippingAddress.state || 'N/A'} {selectedOrder.shippingAddress.zipCode || 'N/A'}</p>
                    <p>{selectedOrder.shippingAddress.country || 'N/A'}</p>
                  </>
                ) : (
                  <p>No shipping address available</p>
                )}
              </div>
            </div>
          </div>

          <div className="order-items">
            <h3>Items Ordered</h3>
            {(selectedOrder.items || []).map((item, index) => (
              <div key={index} className="order-item">
                <img
                  src={(item?.item_id?.image) || 'https://via.placeholder.com/80x80'}
                  alt={(item?.item_id?.name) || 'Product'}
                  className="item-image"
                />
                <div className="item-details">
                  <h4>{(item?.item_id?.name) || 'Product'}</h4>
                  <p>Quantity: {item?.quantity || 0}</p>
                  <p>Price: {formatPrice ? formatPrice((item?.item_id?.price) || 0) : `₹${(((item?.item_id?.price) || 0) * 83.12).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} each</p>
                  <p><strong>Total: {formatPrice ? formatPrice(((item?.item_id?.price || 0) * (item?.quantity || 0))) : `₹${(((item?.item_id?.price || 0) * (item?.quantity || 0)) * 83.12).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</strong></p>
                </div>
                {selectedOrder.status === 'pending' && (
                  <button
                    className="remove-order-item-btn"
                    onClick={() => removeItemFromOrder(selectedOrder._id, item?.item_id?._id, item?.item_id?.name)}
                    title="Remove from order"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}\n          </div>

          <div className="order-totals">
            <div className="total-line">
              <span>Subtotal:</span>
              <span>₹{((selectedOrder.subtotal || 0) * 83.12).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="summary-line">
              <span>Tax:</span>
              <span>₹{((selectedOrder.tax || 0) * 83.12).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="summary-line">
              <span>Shipping:</span>
              <span>₹{((selectedOrder.shipping || 0) * 83.12).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="summary-line total">
              <span><strong>Total:</strong></span>
              <span><strong>₹{((selectedOrder.total || 0) * 83.12).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
            </div>
          </div>

          <div className="order-actions">
            <button
              onClick={() => trackOrder(selectedOrder._id)}
              className="action-btn track-btn"
            >
              Track Order
            </button>

            {['pending', 'confirmed'].includes(selectedOrder.status) && (
              <button
                onClick={() => cancelOrder(selectedOrder._id)}
                className="action-btn cancel-btn"
              >
                Cancel Order
              </button>
            )}

            <button
              onClick={() => reorder(selectedOrder._id)}
              className="action-btn reorder-btn"
            >
              Reorder
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <div className="orders-header">
        <div className="orders-header-top">
          <button onClick={onBack} className="back-btn">
            ← Back to Shopping
          </button>
          <h2>My Orders ({filteredOrders.length})</h2>
        </div>

        <div className="orders-controls">
          <div className="search-section">
            <input
              type="text"
              placeholder="Search by order number or product name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="orders-search"
            />
          </div>

          <div className="filter-section">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="total-high">Highest Amount</option>
              <option value="total-low">Lowest Amount</option>
              <option value="status">By Status</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-orders">
          <div className="loading-spinner"></div>
          <p>Loading your orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-orders">
          {orders.length === 0 ? (
            <>
              <div className="empty-icon">No orders</div>
              <h3>No Orders Yet</h3>
              <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
              <button onClick={onBack} className="shop-now-btn">
                Start Shopping
              </button>
            </>
          ) : (
            <>
              <div className="empty-icon">No results</div>
              <h3>No Orders Found</h3>
              <p>No orders match your current filters. Try adjusting your search or filters.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="clear-filters-btn"
              >
                Clear Filters
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map(order => (
            <div key={order?._id || Math.random()} className="order-card">
              <div className="order-card-header">
                <div className="order-number">
                  <strong>#{order?.orderNumber || 'N/A'}</strong>
                </div>
                <div className="order-date">
                  {order?.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                </div>
                <div className="order-status-badge">
                  {getStatusText(order?.status || 'pending')}
                </div>
              </div>

              <div className="order-card-body">
                <div className="order-items-preview">
                  {(order.items || []).slice(0, 3).map((item, index) => (
                    <img
                      key={index}
                      src={(item?.item_id?.image) || 'https://via.placeholder.com/50x50'}
                      alt={(item?.item_id?.name) || 'Product'}
                      className="item-preview-image"
                      title={(item?.item_id?.name) || 'Product'}
                    />
                  ))}
                  {(order.items || []).length > 3 && (
                    <div className="more-items">+{(order.items || []).length - 3} more</div>
                  )}
                </div>

                <div className="order-summary-text">
                  <p><strong>Total: ₹{((order.total || 0) * 83.12).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></p>
                  <p>{(order.items || []).length} item{(order.items || []).length > 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="order-card-actions">
                <button
                  onClick={() => viewOrderDetails(order._id)}
                  className="action-btn view-btn"
                >
                  View Details
                </button>
                <button
                  onClick={() => trackOrder(order._id)}
                  className="action-btn track-btn"
                >
                  Track
                </button>
                {['pending', 'confirmed'].includes(order.status) && (
                  <button
                    onClick={() => cancelOrder(order._id)}
                    className="action-btn cancel-btn"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}