CREATE DATABASE IF NOT EXISTS smart_recipes_db;
USE smart_recipes_db;

-- 1. Recipes Table
CREATE TABLE recipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    cook_time VARCHAR(30) NOT NULL,
    calories VARCHAR(30) NOT NULL,
    img VARCHAR(500) NOT NULL,
    video_url VARCHAR(500) NOT NULL,
    instructions TEXT NOT NULL
);

-- 2. Recipe Required Ingredients Table
CREATE TABLE recipe_ingredients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT NOT NULL,
    ingredient_name VARCHAR(100) NOT NULL,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

-- 3. User Pantry (Available Ingredients in Stock)
CREATE TABLE user_pantry (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL DEFAULT 1,
    ingredient_name VARCHAR(100) NOT NULL,
    UNIQUE KEY unique_user_ing (user_id, ingredient_name)
);

-- Insert Sample Recipes with YouTube Embed Links
INSERT INTO recipes (id, name, cook_time, calories, img, video_url, instructions) VALUES
(1, 'Palak Paneer', '30 mins', '340 kcal', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80', 'https://www.youtube.com/embed/5lVLxEr_qgM?si=SgrAHiPyWRNXI9wT',
'Blanch 500g fresh spinach in boiling water for 2 minutes, then transfer to ice water and blend into a smooth puree.\nHeat butter and oil in a pan, add cumin seeds, finely chopped garlic, ginger, and onions. Saute until golden.\nAdd chopped tomatoes, turmeric, red chilli powder, and salt. Cook until tomatoes soften.\nPour in the spinach puree and simmer for 5 minutes.\nAdd cubed fresh paneer, mix gently, and simmer for another 3 minutes before serving hot.'),

(2, 'Dal Tadka', '25 mins', '260 kcal', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80', 'https://www.youtube.com/embed/aBi4hylX5cs?si=6OwX7fAxmVB7si-C',
'Wash and pressure cook Toor Dal with water, turmeric, and salt for 3-4 whistles until soft.\nHeat butter in a pan for the tempering (tadka).\nAdd cumin seeds, finely chopped garlic, ginger, and green chillies. Saute for 30 seconds.\nAdd chopped onions and red tomatoes, cooking until soft and mushy.\nAdd red chilli powder, pour the tempering over the cooked dal, and simmer for 2 minutes.'),

(3, 'Paneer Bhurji', '15 mins', '310 kcal', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80', 'https://www.youtube.com/embed/KgW--wj5iBM?si=PwUK27pWfvgbfZrp',
'Crumble fresh paneer by hand and set aside.\nHeat butter in a pan and crackle cumin seeds.\nSaute finely chopped onions, ginger, and green chillies until translucent.\nAdd chopped tomatoes, capsicum, turmeric, red chilli, and salt. Cook for 3 minutes.\nAdd the crumbled paneer, toss gently for 2-3 minutes on medium heat, and serve hot.'),

(4, 'Masala Omelette', '10 mins', '210 kcal', 'https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=600&q=80', 'https://www.youtube.com/embed/aSmWYtOf6Os?si=bx5vCcArABsICj85',
'Crack 2 eggs into a bowl and whisk until frothy.\nAdd finely chopped red onion, tomato, green chillies, salt, turmeric, and black pepper.\nHeat a knob of butter in a non-stick pan over medium flame.\nPour the egg mixture in and swirl to spread evenly.\nCook for 2 minutes on each side until golden brown and serve with brown bread.'),

(5, 'Aloo Paratha', '20 mins', '290 kcal', 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=600&q=80', 'https://www.youtube.com/embed/j3pDXY9fqSo?si=5BgVQOfzSQreg9qO',
'Knead wheat flour with water and a pinch of salt into a soft dough.\nBoil and mash potatoes, then mix with finely chopped onion, green chillies, cumin seeds, red chilli, and salt.\nStuff a portion of the spiced potato mixture inside a dough ball and roll out gently.\nRoast on a hot tawa applying butter on both sides until crisp and golden brown.'),

(6, 'Cold Coffee', '5 mins', '180 kcal', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80', 'https://www.youtube.com/embed/J_YVRNVwhiU?si=JQb0I75JVXu35dhw',
'Add 2 tbsp coffee powder and sugar to a blender jar with 2 tbsp warm water.\nBlend for 30 seconds until frothy.\nPour in chilled Amul Taaza Milk and ice cubes.\nBlend on high speed for 1 minute until creamy and frothy, then pour into a tall glass.'),

(7, 'Masala Chai', '10 mins', '120 kcal', 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?auto=format&fit=crop&w=600&q=80', 'https://www.youtube.com/embed/zIuQBFFR9ow?si=91lWUT_HuFWMVDoF',
'Crush fresh ginger and add it to 1 cup of boiling water.\nAdd 2 tsp tea leaves and sugar, simmering for 2 minutes.\nPour in 1 cup of Amul Taaza Milk and bring to a rolling boil.\nSimmer for 2 minutes until rich in color, then strain into cups.'),

(8, 'Garlic Bread', '12 mins', '240 kcal', 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=600&q=80', 'https://www.youtube.com/embed/9dezux3qocM?si=_4RpqZk3YTtBauEw',
'Finely mince fresh garlic cloves and mix into softened butter with a pinch of salt and black pepper.\nSpread the garlic butter generously over slices of brown bread.\nToast on a pan over low heat until the underside is crisp and golden.');

-- Insert Required Ingredients for Each Recipe
INSERT INTO recipe_ingredients (recipe_id, ingredient_name) VALUES
(1, 'Spinach (Palak)'), (1, 'Fresh Paneer'), (1, 'Red Onion'), (1, 'Red Tomato'), (1, 'Garlic'), (1, 'Ginger'), (1, 'Butter Block'), (1, 'Cumin Seeds'), (1, 'Turmeric'), (1, 'Salt'),
(2, 'Toor Dal'), (2, 'Red Onion'), (2, 'Red Tomato'), (2, 'Garlic'), (2, 'Ginger'), (2, 'Green Chillies'), (2, 'Butter Block'), (2, 'Cumin Seeds'), (2, 'Turmeric'), (2, 'Red Chilli'), (2, 'Salt'),
(3, 'Fresh Paneer'), (3, 'Red Onion'), (3, 'Red Tomato'), (3, 'Capsicum'), (3, 'Green Chillies'), (3, 'Butter Block'), (3, 'Cumin Seeds'), (3, 'Turmeric'), (3, 'Red Chilli'), (3, 'Salt'),
(4, 'Eggs'), (4, 'Red Onion'), (4, 'Red Tomato'), (4, 'Green Chillies'), (4, 'Butter Block'), (4, 'Black Pepper'), (4, 'Salt'),
(5, 'Wheat Flour'), (5, 'Potatoes'), (5, 'Red Onion'), (5, 'Green Chillies'), (5, 'Butter Block'), (5, 'Cumin Seeds'), (5, 'Red Chilli'), (5, 'Salt'),
(6, 'Amul Taaza Milk'), (6, 'Coffee Powder'), (6, 'Sugar'),
(7, 'Amul Taaza Milk'), (7, 'Tea Leaves'), (7, 'Ginger'), (7, 'Sugar'),
(8, 'Brown Bread'), (8, 'Garlic'), (8, 'Butter Block'), (8, 'Black Pepper'), (8, 'Salt');

-- Insert Default Pantry Items for User 1 (Parv Attrey)
INSERT INTO user_pantry (user_id, ingredient_name) VALUES
(1, 'Amul Taaza Milk'), (1, 'Coffee Powder'), (1, 'Sugar'), (1, 'Tea Leaves'), (1, 'Ginger'),
(1, 'Brown Bread'), (1, 'Garlic'), (1, 'Butter Block'), (1, 'Black Pepper'), (1, 'Salt'),
(1, 'Red Onion'), (1, 'Red Tomato'), (1, 'Green Chillies'), (1, 'Turmeric'), (1, 'Cumin Seeds');