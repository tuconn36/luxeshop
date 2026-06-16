import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  const imageUrl = item.image 
    ? pb.files.getUrl(item.product, item.image, { thumb: '100x100' })
    : 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100&h=100&fit=crop';

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <img
            src={imageUrl}
            alt={item.name}
            className="w-24 h-24 object-cover rounded-lg"
          />
          
          <div className="flex-1">
            <h3 className="font-semibold mb-1">{item.name}</h3>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-2">
              {item.selectedSize && <span>Size: {item.selectedSize}</span>}
              {item.selectedColor && <span>Màu: {item.selectedColor}</span>}
            </div>
            <p className="text-primary font-bold">
              {item.price.toLocaleString('vi-VN')}₫
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1, item.selectedSize, item.selectedColor)}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="w-12 text-center font-medium">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1, item.selectedSize, item.selectedColor)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(item.id, item.selectedSize, item.selectedColor)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}