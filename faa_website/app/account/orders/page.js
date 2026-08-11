"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PackageOpen } from 'lucide-react';
import styles from './page.module.css';
import { toast } from 'react-hot-toast';

export default function MyOrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/orders/myorders`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        } else {
          toast.error('Failed to load orders');
        }
      } catch (error) {
        console.error(error);
        toast.error('An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, router]);

  if (loading) {
    return <div className={styles.loadingState}>Loading your orders...</div>;
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending': return styles.statusPending;
      case 'Processing': return styles.statusProcessing;
      case 'Shipped': return styles.statusShipped;
      case 'Delivered': return styles.statusDelivered;
      case 'Cancelled': return styles.statusCancelled;
      default: return styles.statusPending;
    }
  };

  return (
    <div className={styles.ordersContainer}>
      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIconWrap}>
            <PackageOpen size={80} className={styles.emptyStateIcon} strokeWidth={1.5} />
          </div>
          <h2 className={styles.emptyStateTitle}>No Orders Yet!</h2>
          <p className={styles.emptyStateDesc}>
            Looks like you haven't placed any orders yet.<br/>
            Explore our premium nuts, dates &amp; hampers and place your first order.
          </p>
          <Link href="/products" className={styles.shopBtn}>
            Start Shopping &rarr;
          </Link>
        </div>
      ) : (
        <div className={styles.ordersList}>
          {orders.map(order => (
            <div key={order._id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div>
                  <div className={styles.orderId}>Order #{order._id.substring(order._id.length - 8).toUpperCase()}</div>
                  <div className={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
                <div className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>
                  {order.status}
                </div>
              </div>

              <div className={styles.orderBody}>
                <div className={styles.orderItems}>
                  {order.items.map((item, idx) => (
                    <div key={idx} className={styles.orderItem}>
                      <div>
                        <div className={styles.itemName}>{item.name}</div>
                        <div className={styles.itemMeta}>Size: {item.size} &nbsp;|&nbsp; Qty: {item.quantity}</div>
                      </div>
                      <div className={styles.itemPrice}>₹{item.price * item.quantity}</div>
                    </div>
                  ))}
                </div>
                
                <div className={styles.orderFooter}>
                  <span className={styles.totalLabel}>Total Amount:</span>
                  <span className={styles.totalAmount}>₹{order.totalAmount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
