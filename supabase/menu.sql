-- Complete Menu for Fromentine Restaurant
-- Run this after schema.sql to populate all menu items

-- COMBO POULET
INSERT INTO products (name, category, price_cents) VALUES
('1 morceau', 'Combo Poulet', 1049),
('2 morceaux', 'Combo Poulet', 1249),
('3 morceaux', 'Combo Poulet', 1499),
('4 morceaux', 'Combo Poulet', 1749),
('Ajout 1 morceau', 'Combo Poulet', 299),
('1/4 Poulet Yassa', 'Combo Poulet', 1699);

-- POULET ENTIER
INSERT INTO products (name, category, price_cents) VALUES
('Poulet Entier', 'Poulet Entier', 2299),
('Poulet En Cuisse', 'Poulet Entier', 2099),
('Poulet Mayo', 'Poulet Entier', 2699),
('Poulet Yassa', 'Poulet Entier', 2799);

-- COMBO VIANDE
INSERT INTO products (name, category, price_cents) VALUES
('Agneau 300g', 'Combo Viande', 1899),
('Chèvre 300g', 'Combo Viande', 1899),
('Choukouya 300g', 'Combo Viande', 2099),
('Ajout 75g de viande', 'Combo Viande', 399);

-- VIANDE (formats)
INSERT INTO products (name, category, price_cents) VALUES
('Agneau Petit 200g', 'Viande', 1099),
('Agneau Moyen 500g', 'Viande', 2699),
('Agneau Grand 1kg', 'Viande', 4899),
('Chèvre Petit 200g', 'Viande', 1099),
('Chèvre Moyen 500g', 'Viande', 2699),
('Chèvre Grand 1kg', 'Viande', 4899);

-- POISSON
INSERT INTO products (name, category, price_cents) VALUES
('Combo Tilapia', 'Poisson', 2399),
('Tilapia', 'Poisson', 1899),
('Garba au Thon', 'Poisson', 1699);

-- SAUCES
INSERT INTO products (name, category, price_cents) VALUES
('Sauces oignons', 'Sauces', 75),
('Sauce Moyo', 'Sauces', 99),
('Sauce tomate', 'Sauces', 99),
('Piment', 'Sauces', 79),
('Mayonnaise maison', 'Sauces', 75),
('Sauce verte', 'Sauces', 75);

-- ACCOMPAGNEMENTS
INSERT INTO products (name, category, price_cents) VALUES
('Riz Jollof', 'Accompagnements', 549),
('Riz Pilaf', 'Accompagnements', 549),
('Riz Blanc', 'Accompagnements', 549),
('Attiéké', 'Accompagnements', 599),
('Salade', 'Accompagnements', 549),
('Banane Plantain', 'Accompagnements', 649),
('Chikwangue', 'Accompagnements', 759),
('Frites croustillantes', 'Accompagnements', 549);

-- FORMATS (Petit / Moyen / Grand)
INSERT INTO products (name, category, price_cents) VALUES
('Riz Jollof Petit', 'Formats', 549),
('Riz Jollof Moyen', 'Formats', 749),
('Riz Jollof Grand', 'Formats', 949),
('Riz Pilaf Petit', 'Formats', 549),
('Riz Pilaf Moyen', 'Formats', 749),
('Riz Pilaf Grand', 'Formats', 949),
('Riz Blanc Petit', 'Formats', 549),
('Riz Blanc Moyen', 'Formats', 749),
('Riz Blanc Grand', 'Formats', 949),
('Attiéké Petit', 'Formats', 599),
('Attiéké Moyen', 'Formats', 799),
('Attiéké Grand', 'Formats', 999),
('Salade Petit', 'Formats', 549),
('Salade Moyen', 'Formats', 749),
('Salade Grand', 'Formats', 949),
('Banane Plantain Petit', 'Formats', 649),
('Banane Plantain Moyen', 'Formats', 999),
('Banane Plantain Grand', 'Formats', 1299),
('Chikwangue Petit', 'Formats', 759),
('Chikwangue Moyen', 'Formats', 1149),
('Chikwangue Grand', 'Formats', 1349),
('Frites croustillantes Petit', 'Formats', 549),
('Frites croustillantes Moyen', 'Formats', 749),
('Frites croustillantes Grand', 'Formats', 949);

-- PLATS FAMILIAUX
INSERT INTO products (name, category, price_cents) VALUES
('Le Traditionnel', 'Plats Familiaux', 5399),
('Le Carnivore', 'Plats Familiaux', 7499),
('Le Festin', 'Plats Familiaux', 9499),
('Le Délice De La Mer', 'Plats Familiaux', 8399);

-- REPAS ÉCONOMIQUE
INSERT INTO products (name, category, price_cents) VALUES
('Loaded rice au poulet', 'Repas Économique', 1299),
('Loaded fries au poulet', 'Repas Économique', 1299),
('Loaded fries/rice au poulet', 'Repas Économique', 1399),
('Sandwich au poulet', 'Repas Économique', 1199),
('Sandwich à l''agneau', 'Repas Économique', 1299);

-- BREUVAGES
INSERT INTO products (name, category, price_cents) VALUES
('Petit Jus de Bissap', 'Breuvages', 499),
('Grand Jus de Bissap', 'Breuvages', 899),
('Petit Jus de Gingembre', 'Breuvages', 599),
('Grand Jus de Gingembre', 'Breuvages', 1099),
('Pepsi', 'Breuvages', 249),
('Coca', 'Breuvages', 249),
('7Up', 'Breuvages', 249),
('Sprite', 'Breuvages', 249),
('Fuze', 'Breuvages', 249),
('Crush Orange', 'Breuvages', 249),
('Jus exotiques', 'Breuvages', 349);

-- DESSERTS
INSERT INTO products (name, category, price_cents) VALUES
('Beignet Mandazi (9)', 'Desserts', 1199),
('Beignet petit', 'Desserts', 699),
('Croquette', 'Desserts', 699),
('Dégués / Thiakry', 'Desserts', 699),
('Tiramisu', 'Desserts', 650);






