import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

export default function FilterSidebar({ filters, onFilterChange, onReset }) {
  const categories = ['Nam', 'Nữ', 'Trẻ em'];
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const colors = ['Đen', 'Trắng', 'Xám', 'Xanh', 'Đỏ', 'Vàng'];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Bộ lọc</CardTitle>
          <Button variant="ghost" size="sm" onClick={onReset}>
            Xóa
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-base font-semibold mb-3 block">Danh mục</Label>
          <RadioGroup value={filters.category || ''} onValueChange={(value) => onFilterChange('category', value)}>
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="" id="all" />
              <Label htmlFor="all" className="cursor-pointer">Tất cả</Label>
            </div>
            {categories.map(cat => (
              <div key={cat} className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value={cat} id={cat} />
                <Label htmlFor={cat} className="cursor-pointer">{cat}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div>
          <Label className="text-base font-semibold mb-3 block">
            Giá: {(filters.minPrice || 0).toLocaleString('vi-VN')}₫ - {(filters.maxPrice || 5000000).toLocaleString('vi-VN')}₫
          </Label>
          <Slider
            min={0}
            max={5000000}
            step={100000}
            value={[filters.minPrice || 0, filters.maxPrice || 5000000]}
            onValueChange={([min, max]) => {
              onFilterChange('minPrice', min);
              onFilterChange('maxPrice', max);
            }}
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-base font-semibold mb-3 block">Kích cỡ</Label>
          <div className="space-y-2">
            {sizes.map(size => (
              <div key={size} className="flex items-center space-x-2">
                <Checkbox
                  id={`size-${size}`}
                  checked={filters.sizes?.includes(size)}
                  onCheckedChange={(checked) => {
                    const current = filters.sizes || [];
                    const updated = checked
                      ? [...current, size]
                      : current.filter(s => s !== size);
                    onFilterChange('sizes', updated);
                  }}
                />
                <Label htmlFor={`size-${size}`} className="cursor-pointer">{size}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-base font-semibold mb-3 block">Màu sắc</Label>
          <div className="space-y-2">
            {colors.map(color => (
              <div key={color} className="flex items-center space-x-2">
                <Checkbox
                  id={`color-${color}`}
                  checked={filters.colors?.includes(color)}
                  onCheckedChange={(checked) => {
                    const current = filters.colors || [];
                    const updated = checked
                      ? [...current, color]
                      : current.filter(c => c !== color);
                    onFilterChange('colors', updated);
                  }}
                />
                <Label htmlFor={`color-${color}`} className="cursor-pointer">{color}</Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}