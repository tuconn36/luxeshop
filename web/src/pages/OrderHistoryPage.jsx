import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import OrderCard from '@/components/OrderCard.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Package } from 'lucide-react';

export default function OrderHistoryPage() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const records = await pb.collection('orders').getFullList({
          filter: `userId = "${currentUser.id}"`,
          sort: '-created',
          $autoCancel: false
        });
        setOrders(records);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchOrders();
    }
  }, [currentUser]);

  return (
    <>
      <Helmet>
        <title>Đơn hàng của tôi - LUXE</title>
        <meta name="description" content="Xem lịch sử đơn hàng của bạn" />
      </Helmet>
      
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-8" style={{ letterSpacing: '-0.02em' }}>
          Đơn hàng của tôi
        </h1>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-24 h-24 mx-auto mb-6 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-4">Chưa có đơn hàng nào</h2>
            <p className="text-muted-foreground">Bạn chưa đặt hàng. Hãy khám phá sản phẩm của chúng tôi!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}