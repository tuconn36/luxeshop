-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    avatar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    category VARCHAR(50) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    images JSONB,
    materials JSONB,
    sizes JSONB,
    colors JSONB,
    tags JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    items JSONB NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    shipping_address JSONB NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    notes TEXT,
    tracking_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

-- Insert sample data for products
INSERT INTO products (name, description, price, original_price, category, stock, featured, images, materials, sizes, colors, tags) VALUES
('Diamond Solitaire Ring', 'Classic diamond solitaire engagement ring in 18k white gold', 2499.00, 2999.00, 'Rings', 15, true, 
    '["ring1.jpg", "ring1-2.jpg"]', 
    '["18k White Gold", "0.5ct Diamond"]', 
    '["5", "6", "7", "8", "9"]', 
    '["White Gold"]', 
    '["engagement", "diamond", "luxury"]'
),
('Pearl Necklace', 'Elegant freshwater pearl necklace with 14k gold clasp', 899.00, 1099.00, 'Necklaces', 25, true, 
    '["necklace1.jpg"]', 
    '["Freshwater Pearls", "14k Gold"]', 
    '["16 inch", "18 inch", "20 inch"]', 
    '["White", "Pink"]', 
    '["pearl", "classic", "elegant"]'
),
('Gold Chain Bracelet', 'Delicate 14k gold chain bracelet', 599.00, NULL, 'Bracelets', 30, false, 
    '["bracelet1.jpg"]', 
    '["14k Yellow Gold"]', 
    '["7 inch", "8 inch"]', 
    '["Yellow Gold"]', 
    '["gold", "chain", "minimalist"]'
),
('Diamond Stud Earrings', 'Classic diamond stud earrings in 18k gold', 1299.00, 1499.00, 'Earrings', 20, true, 
    '["earring1.jpg"]', 
    '["18k Gold", "0.25ct Diamonds"]', 
    '["One Size"]', 
    '["White Gold", "Yellow Gold"]', 
    '["diamond", "stud", "everyday"]'
),
('Luxury Swiss Watch', 'Automatic mechanical watch with leather strap', 3999.00, 4999.00, 'Watches', 10, true, 
    '["watch1.jpg"]', 
    '["Stainless Steel", "Sapphire Crystal", "Leather"]', 
    '["One Size"]', 
    '["Black", "Brown"]', 
    '["luxury", "automatic", "swiss"]'
);
