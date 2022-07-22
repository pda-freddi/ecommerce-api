/*
Fictional categories and products to populate category and product tables.
*/

-- Categories
INSERT INTO category (name, display_name, description)
VALUES
  ('pants', 'Pants', 'Pants. You need them.'),
  ('shirts', 'Shirts', 'There is an option for every taste and style.'),
  ('jackets', 'Jackets', 'From leather to jeans, you will find the jacket you want.'),
  ('hats', 'Hats', 'Avoid sunburn and still be in fashion.'),
  ('shoes', 'Shoes', 'Confortable footwear for all tastes.');

-- SKU format for products: AB123CDE
-- Products for pants category
INSERT INTO product (name, display_name, SKU, price, description, image, thumbnail, in_stock, category_id)
VALUES
  ('dark-blue-pants', 'Dark Blue Pants', 'GH854HRT', 32.00, 'Confortable fabric that reminds jeans.', '/images/pants/dark-blue-pants.jpg', '/images/pants/dark-blue-pants-thumbnail.jpg', DEFAULT, 1),
  ('jeans-pants', 'Jeans Pants', 'JR602ETR', 38.00, 'Casual jeans for day-to-day wear.', '/images/pants/jeans-pants.jpg', '/images/pants/jeans-pants-thumbnail.jpg', DEFAULT, 1),
  ('red-pants', 'Red Pants', 'GT145UWR', 45.00, 'Beautiful vibrant color.', '/images/pants/red-pants.jpg', '/images/pants/red-pants-thumbnail.jpg', DEFAULT, 1);

-- Products for shirts category
INSERT INTO product (name, display_name, SKU, price, description, image, thumbnail, in_stock, category_id)
VALUES
  ('black-shirt', 'Black Shirt', 'FD967HQS', 18.00, 'Basic cotton black shirt.', '/images/shirts/black-shirt.jpg', '/images/shirts/black-shirt-thumbnail.jpg', DEFAULT, 2),
  ('light-blue-shirt', 'Light Blue Shirt', 'TQ498NKO', 24.00, 'A light color to match a light, confortable fabric.', '/images/shirts/light-blue-shirt.jpg', '/images/shirts/light-blue-shirt-thumbnail.jpg', DEFAULT, 2),
  ('cat-shirt', 'Cat Shirt', 'LY247AWQ', 20.00, 'Everybody loves a cute cat.', '/images/shirts/cat-shirt.jpg', '/images/shirts/cat-shirt-thumbnail.jpg', DEFAULT, 2),
  ('heart-shirt', 'Heart Shirt', 'RE588YTR', 28.00, 'Blue button shirt with white heart prints.', '/images/shirts/heart-shirt.jpg', '/images/shirts/heart-shirt-thumbnail.jpg', DEFAULT, 2),
  ('white-shirt', 'White Shirt', 'SW904LJY', 18.00, 'Basic cotton white shirt.', '/images/shirts/white-shirt.jpg', '/images/shirts/white-shirt-thumbnail.jpg', DEFAULT, 2);

-- Products for jackets category
INSERT INTO product (name, display_name, SKU, price, description, image, thumbnail, in_stock, category_id)
VALUES
  ('brown-jacket', 'Brown Jacket', 'QS185UCN', 45.00, 'Light brown jacket with extra pockets.', '/images/jackets/brown-jacket.jpg', '/images/jackets/brown-jacket-thumbnail.jpg', DEFAULT, 3),
  ('jeans-jacket', 'Jeans Jacket', 'KR834SUW', 50.00, 'Beautiful dark jeans jacket.', '/images/jackets/jeans-jacket.jpg', '/images/jackets/jeans-jacket-thumbnail.jpg', DEFAULT, 3),
  ('leather-jacket', 'Leather Jacket', 'XN057AOR', 60.00, 'The classic black leather jacket.', '/images/jackets/leather-jacket.jpg', '/images/jackets/leather-jacket-thumbnail.jpg', DEFAULT, 3);

-- Products for hats category
INSERT INTO product (name, display_name, SKU, price, description, image, thumbnail, in_stock, category_id)
VALUES
  ('beanie', 'Beanie', 'MJ599QSX', 15.00, 'Multiple colors, perfect for winter.', '/images/hats/beanie.jpg', '/images/hats/beanie-thumbnail.jpg', DEFAULT, 4),
  ('white-cap', 'White Cap', 'DV384QHS', 12.00, 'Simple white cap.', '/images/hats/white-cap.jpg', '/images/hats/white-cap-thumbnail.jpg', DEFAULT, 4);

-- Products for shoes category
INSERT INTO product (name, display_name, SKU, price, description, image, thumbnail, in_stock, category_id)
VALUES
  ('leather-sandals', 'Leather Sandals', 'YE147LGK', 20.00, 'Fresh, confortable footwear.', '/images/shoes/leather-sandals.jpg', '/images/shoes/leather-sandals-thumbnail.jpg', DEFAULT, 5),
  ('leather-boots', 'Leather Boots', 'BE472HCX', 40.00, 'Beautiful brown leather boots.', '/images/shoes/leather-boots.jpg', '/images/shoes/leather-boots-thumbnail.jpg', DEFAULT, 5),
  ('red-sneakers', 'Red Sneakers', 'RN800QXB', 30.00, 'Get noticed everywhere with these sneakers.', '/images/shoes/red-sneakers.jpg', '/images/shoes/red-sneakers-thumbnail.jpg', DEFAULT, 5);