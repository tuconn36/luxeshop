import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function OrderCard({ order }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Chờ xác nhận':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'Đang giao':
        return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'Đã giao':
        return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'Đã hủy':
        return 'bg-red-500/10 text-red-700 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">Đơn hàng #{order.id.slice(-8)}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {format(new Date(order.created), 'dd/MM/yyyy HH:mm', { locale: vi })}
            </p>
          </div>
          <Badge className={getStatusColor(order.status)}>
            {order.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Người nhận:</span>
            <span className="font-medium">{order.shippingName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Số điện thoại:</span>
            <span className="font-medium">{order.shippingPhone}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Địa chỉ:</span>
            <span className="font-medium text-right max-w-xs">{order.shippingAddress}</span>
          </div>
        </div>
        
        <div className="border-t border-border pt-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Tổng tiền</p>
            <p className="text-xl font-bold text-primary">
              {order.totalPrice.toLocaleString('vi-VN')}₫
            </p>
          </div>
          <Link to={`/order/${order.id}`}>
            <Button variant="outline" size="sm">
              Chi tiết
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}