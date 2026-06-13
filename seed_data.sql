-- Disable foreign key checks to safely clear existing data
SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing data
TRUNCATE TABLE credit_items;
TRUNCATE TABLE credit_vouchers;
TRUNCATE TABLE interest_records;
TRUNCATE TABLE settlements;
TRUNCATE TABLE farmers;
TRUNCATE TABLE stock_movements;
TRUNCATE TABLE stock;
TRUNCATE TABLE products;
TRUNCATE TABLE product_categories;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================
-- 1. Insert Categories
-- ==========================================
INSERT INTO product_categories (id, name) VALUES 
(1, 'Fertilizers'),
(2, 'Pesticides'),
(3, 'Seeds');

-- ==========================================
-- 2. Insert Real Products (10 per category)
-- ==========================================
-- Fertilizers (Category 1)
INSERT INTO products (id, category_id, name, unit, price_per_unit) VALUES
(1, 1, 'Urea 46% N (IFFCO)', '50kg Bag', 266.50),
(2, 1, 'DAP 18-46-0 (Coromandel)', '50kg Bag', 1350.00),
(3, 1, 'MOP - Muriate of Potash', '50kg Bag', 1700.00),
(4, 1, 'NPK 10:26:26 (Gromor)', '50kg Bag', 1470.00),
(5, 1, 'NPK 20:20:0:13 (Factamfos)', '50kg Bag', 1200.00),
(6, 1, 'SSP - Single Super Phosphate', '50kg Bag', 450.00),
(7, 1, 'Zinc Sulphate 33%', '5kg Pkt', 450.00),
(8, 1, 'Calcium Nitrate', '25kg Bag', 1400.00),
(9, 1, 'Sulphur 90% WDG', '3kg Pkt', 300.00),
(10, 1, 'Water Soluble NPK 19:19:19', '1kg Pkt', 150.00);

-- Pesticides/Insecticides (Category 2)
INSERT INTO products (id, category_id, name, unit, price_per_unit) VALUES
(11, 2, 'Coragen (Chlorantraniliprole)', '150ml Btl', 1850.00),
(12, 2, 'Monocrotophos 36% SL', '1L Btl', 650.00),
(13, 2, 'Imidacloprid 17.8% SL (Confidor)', '250ml Btl', 420.00),
(14, 2, 'Chlorpyrifos 20% EC', '1L Btl', 350.00),
(15, 2, 'Profennofos 50% EC', '1L Btl', 550.00),
(16, 2, 'Mancozeb 75% WP (Dithane M-45)', '500g Pkt', 240.00),
(17, 2, 'Carbendazim 50% WP (Bavistin)', '250g Pkt', 180.00),
(18, 2, 'Glyphosate 41% SL (Roundup)', '1L Btl', 450.00),
(19, 2, 'Pendimethalin 30% EC', '1L Btl', 520.00),
(20, 2, 'Thiamethoxam 25% WG (Actara)', '100g Pkt', 350.00);

-- Seeds (Category 3)
INSERT INTO products (id, category_id, name, unit, price_per_unit) VALUES
(21, 3, 'Cotton Seed (Bollgard II)', '450g Pkt', 850.00),
(22, 3, 'Paddy Seed (BPT 5204)', '25kg Bag', 1100.00),
(23, 3, 'Paddy Seed (MTU 1010)', '25kg Bag', 1050.00),
(24, 3, 'Maize Seed (Pioneer 3396)', '5kg Pkt', 1250.00),
(25, 3, 'Chilli Seed (Tejaswini)', '10g Pkt', 450.00),
(26, 3, 'Tomato Seed (US 440)', '10g Pkt', 550.00),
(27, 3, 'Groundnut Seed (K6)', '30kg Bag', 2400.00),
(28, 3, 'Black Gram Seed (PU 31)', '20kg Bag', 1800.00),
(29, 3, 'Green Gram Seed (SML 668)', '20kg Bag', 1900.00),
(30, 3, 'Red Gram Seed (Asha)', '5kg Pkt', 600.00);

-- Initialize stock for all products
INSERT INTO stock (product_id, quantity) 
SELECT id, 100 FROM products;

-- ==========================================
-- 3. Insert 30 Farmers
-- ==========================================
INSERT INTO farmers (id, name, phone, village, land_acres, current_balance) VALUES
(1, 'Ramesh Kumar', '9876543210', 'Nandigama', 5.5, 0.00),
(2, 'Suresh Reddy', '9876543211', 'Kanchikacherla', 12.0, 0.00),
(3, 'Venkateswara Rao', '9876543212', 'Gollapudi', 3.5, 0.00),
(4, 'Srinivasulu', '9876543213', 'Ibrahimpatnam', 8.0, 0.00),
(5, 'Ramana Reddy', '9876543214', 'Nandigama', 4.0, 0.00),
(6, 'Krishna Mohan', '9876543215', 'Kanchikacherla', 15.5, 0.00),
(7, 'Appa Rao', '9876543216', 'Kondapalli', 2.0, 0.00),
(8, 'Sambasiva Rao', '9876543217', 'Gollapudi', 6.5, 0.00),
(9, 'Narayana', '9876543218', 'Nandigama', 1.5, 0.00),
(10, 'Subba Rao', '9876543219', 'Ibrahimpatnam', 10.0, 0.00),
(11, 'Gopi Krishna', '9876543220', 'Kanchikacherla', 7.5, 0.00),
(12, 'Hari Babu', '9876543221', 'Nandigama', 4.5, 0.00),
(13, 'Siva Prasad', '9876543222', 'Gollapudi', 9.0, 0.00),
(14, 'Ramachandra Rao', '9876543223', 'Kondapalli', 14.0, 0.00),
(15, 'Prabhakar', '9876543224', 'Ibrahimpatnam', 5.0, 0.00),
(16, 'Bhaskar Reddy', '9876543225', 'Nandigama', 3.0, 0.00),
(17, 'Anjaneyulu', '9876543226', 'Kanchikacherla', 11.5, 0.00),
(18, 'Satyanarayana', '9876543227', 'Gollapudi', 6.0, 0.00),
(19, 'Brahmaiah', '9876543228', 'Kondapalli', 2.5, 0.00),
(20, 'Nageswara Rao', '9876543229', 'Nandigama', 8.5, 0.00),
(21, 'Ramu', '9876543230', 'Ibrahimpatnam', 4.0, 0.00),
(22, 'Sreeramulu', '9876543231', 'Kanchikacherla', 7.0, 0.00),
(23, 'Lakshmana Rao', '9876543232', 'Gollapudi', 13.0, 0.00),
(24, 'Koteswara Rao', '9876543233', 'Nandigama', 5.5, 0.00),
(25, 'Venu Gopal', '9876543234', 'Kondapalli', 3.5, 0.00),
(26, 'Murali Krishna', '9876543235', 'Ibrahimpatnam', 9.5, 0.00),
(27, 'Tirupathi Rao', '9876543236', 'Kanchikacherla', 1.0, 0.00),
(28, 'Govinda Rao', '9876543237', 'Gollapudi', 6.5, 0.00),
(29, 'Madhu Babu', '9876543238', 'Nandigama', 16.0, 0.00),
(30, 'Chenchu Ramaiah', '9876543239', 'Ibrahimpatnam', 4.5, 0.00);
