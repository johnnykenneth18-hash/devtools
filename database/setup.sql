-- supabase.sql - Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
CREATE TABLE products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    category VARCHAR(100) DEFAULT 'web-tools',
    featured BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Orders table
CREATE TABLE orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    product_id UUID REFERENCES products(id),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),
    bank_name VARCHAR(100),
    account_name VARCHAR(255),
    account_number VARCHAR(50),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    payment_status VARCHAR(50) DEFAULT 'pending',
    delivery_status VARCHAR(50) DEFAULT 'pending',
    whatsapp_contacted BOOLEAN DEFAULT false,
    whatsapp_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Customers table
CREATE TABLE customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(10, 2) DEFAULT 0,
    last_order_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Admin users table
CREATE TABLE admin_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Settings table
CREATE TABLE settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'string',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Bank details table
CREATE TABLE bank_details (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    bank_name VARCHAR(255) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    bank_code VARCHAR(50),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Activity log table
CREATE TABLE activity_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    admin_id UUID REFERENCES admin_users(id),
    action VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes for better performance
CREATE INDEX idx_products_active ON products(active) WHERE active = true;
CREATE INDEX idx_products_featured ON products(featured) WHERE featured = true;
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_admin_users_email ON admin_users(email);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123)
INSERT INTO admin_users (email, password_hash, role) VALUES
('admin@devtoolspro.com', '$2a$10$YourHashedPasswordHere', 'super_admin');

-- Insert default settings
INSERT INTO settings (setting_key, setting_value, setting_type) VALUES
('store_name', 'DevTools Pro', 'string'),
('store_email', 'support@devtoolspro.com', 'string'),
('whatsapp_number', '+12345678901', 'string'),
('currency', 'USD', 'string'),
('email_notifications', 'true', 'boolean'),
('whatsapp_notifications', 'true', 'boolean'),
('new_order_alerts', 'true', 'boolean');

-- Insert sample bank details
INSERT INTO bank_details (bank_name, account_name, account_number, bank_code) VALUES
('Guaranty Trust Bank', 'DevTools Pro Enterprises', '0123456789', '058'),
('Zenith Bank', 'DevTools Pro Enterprises', '9876543210', '057');

-- Insert sample products
INSERT INTO products (name, description, price, image_url, category, featured) VALUES
('SEO Analyzer Pro', 'Advanced SEO analysis tool with competitor tracking', 49.99, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 'web-tools', true),
('Code Optimizer', 'Automatically optimize your JavaScript and CSS code', 79.99, 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 'web-tools', false),
('Security Scanner', 'Comprehensive web application security scanner', 129.99, 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 'apps', true),
('Performance Monitor', 'Real-time website performance monitoring', 89.99, 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 'web-tools', false);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for products (public read, admin write)
CREATE POLICY "Public can view active products" ON products
    FOR SELECT USING (active = true);

CREATE POLICY "Admins can manage products" ON products
    FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for orders (admin only)
CREATE POLICY "Admins can manage orders" ON orders
    FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for customers (admin only)
CREATE POLICY "Admins can manage customers" ON customers
    FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for settings (admin only)
CREATE POLICY "Admins can manage settings" ON settings
    FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for bank details (admin only)
CREATE POLICY "Admins can manage bank details" ON bank_details
    FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for activity logs (admin only)
CREATE POLICY "Admins can view activity logs" ON activity_logs
    FOR ALL USING (auth.role() = 'authenticated');