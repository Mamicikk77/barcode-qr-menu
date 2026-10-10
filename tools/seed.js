// Barcode Beach menü verisini (data/menu.json) sıfırdan oluşturur.
// Kullanım: node tools/seed.js   (mevcut menu.json'un üzerine yazar!)
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = 'https://barcodebeachbogazkent.com/_assets/media/';

const allergens = [
  { id: 'gluten', icon: '🌾', name: { tr: 'Gluten', en: 'Gluten' } },
  { id: 'crustacean', icon: '🦐', name: { tr: 'Kabuklu Deniz Ürünleri', en: 'Crustaceans' } },
  { id: 'egg', icon: '🥚', name: { tr: 'Yumurta', en: 'Egg' } },
  { id: 'fish', icon: '🐟', name: { tr: 'Balık', en: 'Fish' } },
  { id: 'peanut', icon: '🥜', name: { tr: 'Yer Fıstığı', en: 'Peanuts' } },
  { id: 'soy', icon: '🫘', name: { tr: 'Soya', en: 'Soy' } },
  { id: 'milk', icon: '🥛', name: { tr: 'Süt / Laktoz', en: 'Milk / Lactose' } },
  { id: 'nuts', icon: '🌰', name: { tr: 'Sert Kabuklu Yemişler', en: 'Tree Nuts' } },
  { id: 'celery', icon: '🥬', name: { tr: 'Kereviz', en: 'Celery' } },
  { id: 'mustard', icon: '🫙', name: { tr: 'Hardal', en: 'Mustard' } },
  { id: 'sesame', icon: '🥯', name: { tr: 'Susam', en: 'Sesame' } },
  { id: 'sulphite', icon: '🍷', name: { tr: 'Sülfit', en: 'Sulphites' } },
  { id: 'lupin', icon: '🌼', name: { tr: 'Acı Bakla', en: 'Lupin' } },
  { id: 'mollusc', icon: '🦑', name: { tr: 'Yumuşakçalar', en: 'Molluscs' } },
];

const groups = [
  { id: 'food', name: { tr: 'Yemekler', en: 'Foods' }, img: '6029a6e46df5f5e245efd3c777b02c07.jpg' },
  { id: 'cold', name: { tr: 'Alkolsüz İçecekler', en: 'Non-Alcoholic' }, img: '04dbce99c36a5c20b5a74858dc69ae95.jpg' },
  { id: 'bar', name: { tr: 'Alkollü İçecekler', en: 'Alcoholic Beverages' }, img: '8dad1790f0e5926c5a13b8b90aad4c29.jpg' },
  { id: 'enjoy', name: { tr: 'Keyif Menüsü', en: 'Enjoy Menu' }, img: '297e93f8bbda3dec847e7fe3f2ed3c2a.jpg' },
];

const categories = [];
const products = [];
let curCat = null;

function C(id, group, tr, en, img) {
  categories.push({ id, group, name: { tr, en }, img: img || '', active: true });
  curCat = id;
}
// P(trAd, enAd, fiyat|varyantlar, foto, alerjenler, ekstra)
function P(tr, en, price, img, al = [], x = {}) {
  const p = {
    id: curCat + '-' + (products.filter(q => q.cat === curCat).length + 1),
    cat: curCat,
    name: { tr, en: en || tr },
    desc: { tr: x.dtr || '', en: x.den || '' },
    price: Array.isArray(price) ? null : price,
    variants: Array.isArray(price) ? price.map(([vtr, v, ven]) => ({ label: { tr: vtr, en: ven || vtr }, price: v })) : [],
    img: img || '',
    allergens: al,
    tags: x.tags || [],
    active: true,
    soldOut: false,
  };
  products.push(p);
  return p;
}
const shot = (tek, dbl) => [['Tek Kadeh', tek, 'Single'], ['Double Kadeh', dbl, 'Double']];
const bottle = (...pairs) => pairs.map(([cl, v]) => [cl + ' cl Şişe', v, cl + ' cl Bottle']);

/* ───────────── YEMEKLER ───────────── */
C('kahvalti', 'food', 'Kahvaltı', 'Breakfast', '318008dcffd637971c005237d7c90439.png');
P('Serpme Kahvaltı', 'Mixed Breakfast', 1300, '318008dcffd637971c005237d7c90439.png', ['gluten', 'egg', 'milk'], {
  dtr: '2 kişiliktir. Peynir, zeytin, domates, salatalık, yeşillik, salam, sosis, sucuk, yumurta (haşlanmış/sahanda), bal, reçel, sigara böreği, pişi, patates kızartması, ekmek, sınırsız çay. (3 kişi ve üzeri için kişi başı +650 TL)',
  den: 'For 2 people. Cheese, olives, tomato, cucumber, greens, salami, sausage, Turkish sausage, eggs (boiled/fried), honey, jam, cheese rolls, fried dough, fries, bread and unlimited tea. (+650 TL per person for 3+ people)',
  tags: ['chef'],
});
P('Kahvaltı Tabağı', 'Breakfast Plate', 400, '1830bf813b3b117db517fc458587ba3f.jpg', ['gluten', 'egg', 'milk'], {
  dtr: 'Tek kişiliktir. Peynir, zeytin, domates, salatalık, yumurta (haşlanmış/sahanda), bal, reçel, sigara böreği, ekmek, 2 bardak çay.',
  den: 'For 1 person. Cheese, olives, tomato, cucumber, egg (boiled/fried), honey, jam, cheese roll, bread and 2 glasses of tea.',
  tags: ['veg'],
});
P('Sahanda Yumurta', 'Fried Eggs', 160, 'a3a6791459efece102b28dbef718ab49.jpg', ['egg', 'milk'], { tags: ['veg'] });
P('Kavurmalı Yumurta', 'Eggs with Roasted Meat', 300, '4a7ca6dd397c80500f0c97112146f5e6.jpg', ['egg']);
P('Omlet', 'Omelette', 160, 'a3a6791459efece102b28dbef718ab49.jpg', ['egg', 'milk'], { tags: ['veg'] });
P('Mantarlı Omlet', 'Mushroom Omelette', 180, 'd59b4841ebec58d333d7cc910ee5651a.jpg', ['egg', 'milk'], { tags: ['veg'] });
P('Peynirli Omlet', 'Cheese Omelette', 180, 'ba2cc34f7b5c9fc56d0a84cd8443c6d3.jpg', ['egg', 'milk'], { tags: ['veg'] });
P('Sucuklu Omlet', 'Turkish Sausage Omelette', 200, '06478662dd12d0ce0c9406b197f450db.jpg', ['egg', 'milk']);
P('Menemen', 'Menemen', 200, '473a64f80e28b33f700ea7f2307b466f.jpg', ['egg'], {
  dtr: 'Domates, biber ve yumurta ile tavada pişirilir.', den: 'Scrambled eggs cooked with tomatoes and peppers.', tags: ['veg'],
});

C('tost', 'food', 'Sandviç & Tost', 'Sandwiches & Toasts', 'a93f2b159b9e4a4fd80382f6352a80c2.jpg');
P('Kaşarlı Tost', 'Cheese Toast', 200, 'a93f2b159b9e4a4fd80382f6352a80c2.jpg', ['gluten', 'milk'], { tags: ['veg'] });
P('Sucuklu Tost', 'Turkish Sausage Toast', 200, '5c80b05941d7ef786f6597e0c9a4fae0.jpg', ['gluten', 'milk']);
P('Karışık Tost', 'Mixed Toast', 250, '1698514ddbf2fdc06b0aa31baeaa1c61.jpg', ['gluten', 'milk']);
P('Kavurmalı Tost', 'Roasted Meat Toast', 300, '1698514ddbf2fdc06b0aa31baeaa1c61.jpg', ['gluten', 'milk']);
P('Soğuk Sandviç', 'Cold Sandwich', 250, 'feeb1889ae285820e4efedea566e777c.jpg', ['gluten', 'milk', 'mustard'], {
  dtr: 'İçindekileri seçiniz: beyaz peynir, kaşar peyniri, domates, salatalık, marul, hindi füme.',
  den: 'Choose your fillings: white cheese, kashar cheese, tomato, cucumber, lettuce, smoked turkey.',
});

C('ara-sicak', 'food', 'Ara Sıcaklar', 'Intermediate Meals', '772f94fdc211aee20c3ac1fbe9109054.jpg');
P('Patates Kızartması', 'French Fries', 300, '0f8690a933036d24b5d939a80f681798.jpg', [], { tags: ['vegan'] });
P('Sigara Böreği', 'Cheese Rolls', 300, '45b5d66d8880ebfcb8f969a417f81738.png', ['gluten', 'milk', 'egg'], { dtr: '6 adet.', den: '6 pieces.', tags: ['veg'] });
P('Bira Tabağı', 'Beer Snacks', 450, '7a0a52ac9288f27b886ecdaf4ec534d8.jpg', ['gluten', 'milk', 'nuts', 'peanut'], { dtr: '2 kişilik.', den: 'For 2 people.' });
P('Kemiksiz Çıtır Tavuk', 'Crispy Chicken', 300, '73b10d82048660db9c11803cf802953a.jpg', ['gluten', 'egg']);
P('Kalamar Tava', 'Fried Squid', 550, '772f94fdc211aee20c3ac1fbe9109054.jpg', ['gluten', 'mollusc', 'egg']);
P('Güveçte Tereyağlı Karides', 'Buttered Shrimp Casserole', 700, '8a803bc9b200f48d6d42ce73e68dd7d6.jpg', ['crustacean', 'milk'], { tags: ['chef'] });
P('Ahtapot Izgara', 'Grilled Octopus', 1200, 'e8daf704ca45903c9b054bb5b7309baf.jpg', ['mollusc'], { tags: ['chef'] });
P('Yaprak Ciğer', 'Pan-Fried Liver', 550, '63db383549e956cb818712296903ddf6.jpg', ['gluten']);

C('salata', 'food', 'Salatalar', 'Salads', '50b2a10dc0dbd8c5c08dbc32dc34af72.jpg');
P('Yeşil Salata', 'Green Salad', 250, '17f2ed5a07a7ac7a2ad999a9de0c3e54.jpg', [], { tags: ['vegan'] });
P('Mevsim Salata', 'Seasonal Salad', 300, '1e1e36167a9ee37935d63a615ee9638a.jpg', [], { tags: ['vegan'] });
P('Çoban Salata', "Shepherd's Salad", 300, '1e54bbf3d3c2f586155168c8072415a9.jpg', [], { tags: ['vegan'] });
P('Kaşık Salata', 'Spoon Salad', 300, 'aa0d3a56ae799bdb9832d5b9f75561fb.jpg', ['nuts'], { tags: ['vegan', 'spicy'] });
P('Peynirli Salata', 'Cheese Salad', 350, '61eaa006cdd01061f76fdae8372e9b02.jpg', ['milk'], { tags: ['veg'] });
P('Sezar Salata', 'Caesar Salad', 400, '50b2a10dc0dbd8c5c08dbc32dc34af72.jpg', ['gluten', 'milk', 'egg', 'fish', 'mustard']);
P('Ton Balıklı Salata', 'Tuna Salad', 350, '563be1970d94f0929ab57561a00e0354.jpg', ['fish']);
P('Avokado Salatası', 'Avocado Salad', 400, '7d144d8ef8638adf3bba49ba7a8252a2.jpg', [], { tags: ['vegan'] });
P('Gavurdağı Salata', 'Gavurdağ Salad', 300, '86deab66509d9d9fb293b21a102c42b5.jpg', ['nuts'], { tags: ['vegan'] });

C('meze', 'food', 'Mezeler', 'Appetizers', '');
const mz = (tr, en, al, dtr, den, tags = ['veg']) => P(tr, en, 300, '', al, { dtr, den, tags });
mz('Girit Ezme', 'Cretan Spread', ['milk', 'nuts'], 'Beyaz peynir, zeytinyağı ve otlarla hazırlanır; ferah ve kremamsı sunulur.', 'Prepared with white cheese, olive oil and herbs, served fresh and creamy.');
mz('Atom', 'Spicy Yoghurt', ['milk'], 'Süzme yoğurt ve acı biber ile hazırlanır, yoğun aromasıyla servis edilir.', 'Strained yoghurt with chili peppers, rich and flavourful.', ['veg', 'spicy']);
mz('Humus', 'Hummus', ['sesame'], 'Nohut, tahin ve zeytinyağı ile hazırlanır, pürüzsüz dokusuyla servis edilir.', 'Chickpeas, tahini and olive oil, served smooth and creamy.', ['vegan']);
mz('Fava', 'Fava Bean Purée', [], 'Bakla ezmesi, zeytinyağı ve dereotu ile hafif ve zarif bir sunum.', 'Broad beans, olive oil and dill, served light and elegant.', ['vegan']);
mz('Deniz Börülcesi', 'Sea Beans (Samphire)', [], 'Zeytinyağı ve limon ile ferah ve doğal haliyle servis edilir.', 'With olive oil and lemon, served fresh and natural.', ['vegan']);
mz('Semizotlu Yoğurt', 'Yoghurt with Purslane', ['milk'], 'Semizotu ve yoğurt ile serinletici bir sunum.', 'Purslane and yoghurt, refreshing and light.');
mz('Şakşuka', 'Shakshuka', [], 'Kızartılmış sebzeler ve domates sos ile hazırlanır, sıcak servis edilir.', 'Fried vegetables with tomato sauce, served warm.', ['vegan']);
mz('Peynir - Kavun', 'Cheese & Melon', ['milk'], 'Rakı sofralarının klasiği: beyaz peynir ve soğuk kavun.', 'The rakı table classic: white cheese with chilled melon.');
mz('Zeytinyağlı Enginar', 'Artichokes in Olive Oil', [], 'Zeytinyağı ve sebzelerle hafif ve ferah bir sunum.', 'With olive oil and vegetables, light and refreshing.', ['vegan']);
mz('Avokado', 'Avocado', [], 'Taze avokado dilimleri, zeytinyağı ve limon ile.', 'Fresh avocado slices with olive oil and lemon.', ['vegan']);
mz('Mantar Tarator', 'Mushroom Tarator', ['milk', 'nuts'], 'Mantar, yoğurt ve ceviz ile yoğun aromalı.', 'Mushrooms, yoghurt and walnuts, rich and flavourful.');
mz('Köz Patlıcan Salatası', 'Roasted Eggplant Salad', [], 'Közlenmiş patlıcan, zeytinyağı ve baharatlarla; dumanlı aroma.', 'Roasted eggplant, olive oil and spices with a smoky flavour.', ['vegan']);
mz('Levrek Marin', 'Marinated Sea Bass', ['fish'], 'Marine edilmiş levrek, limon ve zeytinyağı ile.', 'Marinated sea bass with lemon and olive oil.', ['chef']);
mz('Kalamata Zeytin', 'Kalamata Olives', [], 'Özenle seçilmiş Kalamata zeytinleri, doğal haliyle.', 'Selected Kalamata olives, served naturally.', ['vegan']);
mz('Pancar', 'Beetroot', [], 'Haşlanmış pancar, zeytinyağı ile.', 'Boiled beetroot with olive oil.', ['vegan']);
mz('Haydari', 'Haydari', ['milk'], 'Süzme yoğurt, sarımsak ve otlarla yoğun kıvamlı.', 'Strained yoghurt with garlic and herbs, thick and rich.');
mz('Manço', 'Manço', ['milk', 'nuts'], 'Özel karışım meze, zengin içerikle hazırlanır.', 'A special mixed meze prepared with rich ingredients.');
mz('Brokoli', 'Broccoli', [], 'Haşlanmış brokoli, zeytinyağı ile hafifçe.', 'Lightly boiled broccoli with olive oil.', ['vegan']);
mz('Köy Kızartması', 'Village-Style Fries', [], 'Doğal patateslerden, çıtır ve rustik sunum.', 'Fresh potatoes, served crispy in a rustic style.', ['vegan']);

C('burger', 'food', 'Hamburger', 'Burgers', '2a63e74f39b7b68f4b5f8101ff88da70.jpg');
P('Hamburger', 'Hamburger', 500, 'c58b6d9713e821b8c444fab1da13a37f.jpg', ['gluten', 'sesame', 'mustard', 'egg']);
P('Cheeseburger', 'Cheeseburger', 550, 'cf1bfbf05fbcc565d5922f70bf2f22e9.jpg', ['gluten', 'sesame', 'mustard', 'egg', 'milk']);
P('Barcode Special Double Burger', 'Barcode Special Double Burger', 650, '2a63e74f39b7b68f4b5f8101ff88da70.jpg', ['gluten', 'sesame', 'mustard', 'egg', 'milk'], { tags: ['chef'] });
P('Tavuk Burger', 'Chicken Burger', 450, 'a9afdc87b5b66ea8bd1c4550e231f480.jpg', ['gluten', 'sesame', 'mustard', 'egg']);

C('makarna', 'food', 'Makarnalar', 'Pastas', 'bcdbb184ee5bb7cc5ba41de2887b8c71.jpg');
P('Spagetti', 'Spaghetti', 350, '3a6e328c7b1091d4d8c9d264080a2866.jpg', ['gluten', 'egg'], { tags: ['veg'] });
P('Spagetti Napoliten', 'Spaghetti Napolitana', 400, 'cbdd1673011996afaca812b1934defa6.jpg', ['gluten', 'egg'], { tags: ['veg'] });
P('Spagetti Bolonez', 'Spaghetti Bolognese', 450, 'bcdbb184ee5bb7cc5ba41de2887b8c71.jpg', ['gluten', 'egg', 'celery']);
P('Deniz Ürünlü Spagetti', 'Seafood Spaghetti', 1000, '88a356870e729358fee47dbbe46584d7.jpg', ['gluten', 'egg', 'crustacean', 'mollusc'], { dtr: '2 kişilik.', den: 'For 2 people.', tags: ['chef'] });
P('Penne Arabiata', 'Penne Arrabbiata', 450, 'a28005878c9aec1e7d8897611842220c.jpg', ['gluten'], { dtr: 'Sebzeli ve domates soslu.', den: 'With vegetables and tomato sauce.', tags: ['vegan', 'spicy'] });
P('Penne Alfredo', 'Penne Alfredo', 450, 'de5164b05752910150c8f704ac3ab334.jpg', ['gluten', 'milk'], { dtr: 'Kremalı, mantarlı, tavuklu.', den: 'Creamy with mushrooms and chicken.' });
P('Fettuccine Pesto', 'Fettuccine Pesto', 450, '10cc99a3b8c274afe2195f53ee3089b1.jpg', ['gluten', 'milk', 'egg', 'nuts'], { dtr: 'Pesto soslu, kremalı, tavuklu.', den: 'Pesto sauce, cream and chicken.' });

C('pizza', 'food', 'Pizza', 'Pizza', 'fde05040f67e0f8fbd574056ec12c758.jpg');
P('Pizza Margarita', 'Pizza Margherita', 400, 'fde05040f67e0f8fbd574056ec12c758.jpg', ['gluten', 'milk'], { tags: ['veg'] });
P('Karışık Pizza', 'Mixed Pizza', 500, 'ff0a370ff2f7e3b410204cc67ee0dd16.jpg', ['gluten', 'milk']);
P('3 Peynirli Pizza', '3 Cheese Pizza', 500, '62804580d5c7fa525082fdcb8e85bb61.jpg', ['gluten', 'milk'], { tags: ['veg'] });

C('izgara', 'food', 'Izgaralar', 'Grilled Dishes', '6029a6e46df5f5e245efd3c777b02c07.jpg');
P('Dana Lokum', 'Tender Beef Medallions', 900, '5c6057683e0bc931081349317814ae85.jpg', [], { tags: ['chef'] });
P('Tavuk Şiş', 'Chicken Shish', 450, 'c6b32a9011843b557d1a486f40ef64a4.jpg', ['milk']);
P('Köfte', 'Meatballs', 550, '27f6466ca1a254165aa7b48664dd83ef.jpg', ['gluten', 'egg']);
P('Tavuk Kanat', 'Chicken Wings', 450, '7c16216276ea2e3ca0da8c2bf649e7aa.jpg', []);
P('Kavurma Güveç', 'Meat Stew', 750, 'c5afb4815b8013f5ce5441b9a884c611.jpg', []);
P('Dana Antrikot', 'Beef Ribeye', 900, '6029a6e46df5f5e245efd3c777b02c07.jpg', []);
P('Dana Bonfile', 'Beef Tenderloin', 950, '568e0013bf2ff3881ff1b419e0d029e4.jpg', [], { tags: ['chef'] });

C('tavuk', 'food', 'Tavuk Special Menüler', 'Chicken Specials', '3b4f587ab1cef17f30e01c7c59068bf6.jpg');
const tv = '3b4f587ab1cef17f30e01c7c59068bf6.jpg';
P('Kremalı Mantarlı Tavuk', 'Creamy Mushroom Chicken', 500, tv, ['milk']);
P('Kekikli Tavuk', 'Chicken with Thyme', 500, tv, []);
P('Sebzeli Tavuk', 'Chicken with Vegetables', 500, tv, []);
P('Köri Soslu Tavuk', 'Chicken with Curry Sauce', 500, tv, ['milk', 'celery', 'mustard']);
P('Acı Soslu Tavuk', 'Spicy Sauce Chicken', 500, tv, [], { tags: ['spicy'] });
P('Barbekü Soslu Tavuk', 'Barbecue Sauce Chicken', 500, tv, ['mustard', 'soy']);

C('deniz', 'food', 'Deniz Ürünleri', 'Sea Foods', '6782d03ba325da7e1936cee088660b66.png');
P('Çupra', 'Sea Bream', 650, 'a0f68de728a8f1b525014628b39e5dd0.png', ['fish'], { dtr: 'Izgara veya tava.', den: 'Grilled or pan-fried.' });
P('Levrek', 'Sea Bass', 750, '6782d03ba325da7e1936cee088660b66.png', ['fish'], { dtr: 'Izgara veya tava.', den: 'Grilled or pan-fried.', tags: ['chef'] });
P('Kalamar Tava', 'Fried Squid', 550, '772f94fdc211aee20c3ac1fbe9109054.jpg', ['gluten', 'mollusc', 'egg']);
P('Güveçte Tereyağlı Karides', 'Buttered Shrimp Casserole', 700, '8a803bc9b200f48d6d42ce73e68dd7d6.jpg', ['crustacean', 'milk'], { dtr: '6 adet.', den: '6 pieces.' });
P('Ahtapot Izgara', 'Grilled Octopus', 1200, 'e8daf704ca45903c9b054bb5b7309baf.jpg', ['mollusc']);
P('Günün Taze Balığı', 'Catch of the Day', null, '', ['fish'], {
  dtr: 'Menü dışındaki günlük taze balık seçeneklerimiz ve fiyatları için lütfen garsonumuza danışınız.',
  den: 'Please ask your waiter about today’s fresh fish selection and prices.',
});

/* ───────────── ALKOLSÜZ ───────────── */
C('moktail', 'cold', 'Alkolsüz Kokteyller', 'Mocktails', 'a867a8a04ff633b6daaa494e2b4345c2.jpg');
P('Alkolsüz Mojito', 'Virgin Mojito', 250, '04dbce99c36a5c20b5a74858dc69ae95.jpg');
P('Belek', 'Belek', 250, 'a867a8a04ff633b6daaa494e2b4345c2.jpg', [], { tags: ['chef'], dtr: 'Bölgemizin adını taşıyan imza moktailimiz.', den: 'Our signature mocktail named after our home, Belek.' });
P('Berrys', 'Berrys', 250, '9310eae65a9c3e174eb15aefad406576.jpg');
P('Rainbow', 'Rainbow', 250, '9dddc36a65e5db18e114814b7ebe35c0.jpg');
P('Smurfs', 'Smurfs', 250, '3eac563f85cd8ebaad138b147e452a09.jpg');

C('frozen', 'cold', 'Frozen · Frappe · Milkshake', 'Frozen · Frappe · Milkshake', '989d588d309467a54d4f4b136958b8b8.jpg');
const fz = (tr, en, img) => P(tr, en, [['Frozen', 250], ['Frappe', 250], ['Milkshake', 250]], img, ['milk'], {
  dtr: 'Frozen, frappe veya milkshake olarak seçebilirsiniz.', den: 'Choose frozen, frappe or milkshake.',
});
fz('Çilek', 'Strawberry', 'fca8ad59881098aea094e1b1a9fc6fd7.jpg');
fz('Mango', 'Mango', '989d588d309467a54d4f4b136958b8b8.jpg');
fz('Muz', 'Banana', '9ca8adb090e4c66f4f2f7ba08d264ba5.jpg');
fz('Yaban Mersini', 'Blueberry', 'c8a500d57e912683c71c994ce9abda55.jpg');
fz('Karpuz', 'Watermelon', '88f60dfc5d6fbf906ae27b67acfcecf8.jpg');
fz('Kavun', 'Melon', '0dee8e87dc650329ebbc7bfc9a951a8d.jpg');
fz('Çikolata', 'Chocolate', '2497d62cf2275cae1ae1d8230d88fd2d.jpg');

C('mesrubat', 'cold', 'Meşrubatlar', 'Soft Drinks', '8fd1042da6386a5b963aac1f25638e27.jpg');
P('Su', 'Water', [['Küçük', 40, 'Small'], ['Büyük', 100, 'Large']], 'ef690062c3f6c927e1d613d216c8e713.jpg');
P('Sade Soda', 'Mineral Water', 90, 'eac470853380f66c6239134a3fdc4bc5.jpg');
P('Meyveli Soda', 'Flavoured Mineral Water', 120, 'e7f882fa12619d37986f562a8a5d2a63.jpg');
P('Kola', 'Cola', 150, '8fd1042da6386a5b963aac1f25638e27.jpg');
P('Fanta', 'Fanta', 150, 'a7f0f4ee875a10d7f02c433b6ad790b0.jpg');
P('Sprite', 'Sprite', 150, '13b5a7822a301623ee07783aa7be1df7.jpg');
P('Ice Tea', 'Ice Tea', 150, 'f88d8b28b2d4069c5ac9e5f5dace96e1.jpg');
P('Limonata', 'Lemonade', 150, 'ee7c13883831823ed00b4fa2e5341d22.jpg');
P('Meyve Suyu', 'Fruit Juice', 150, '2af84e8a61d0598250f917fec677d161.jpg');
P('Taze Sıkılmış Portakal Suyu', 'Fresh Orange Juice', 200, 'b5d4fca78322567124d423271eec4231.jpg');
P('Taze Sıkılmış Nar Suyu', 'Fresh Pomegranate Juice', 200, 'c535c278ad647eaf6778aa4a4772c258.jpg');
P('Red Bull', 'Red Bull', 200, 'cea5f6e6cd7b1d384ef5c4b45d17dc34.jpg');
P('Şalgam', 'Turnip Juice', [['Küçük', 100, 'Small'], ['Büyük', 200, 'Large']], '0e1d24df7e39a2fb58eb73dfe70ce352.jpg', [], { tags: ['spicy'] });
P('Churchill', 'Churchill', 150, '3073f1366d4fe03d19e1c13d5eaa35a7.jpg', [], { dtr: 'Soda, limon ve tuz.', den: 'Soda, lemon and salt.' });

C('sicak', 'cold', 'Sıcak İçecekler', 'Hot Beverages', '2cf26206fd794ed3ba3478f1d0a368db.jpg');
P('Çay', 'Turkish Tea', [['Bardak', 50, 'Glass'], ['Fincan', 100, 'Cup']], '33c4df7ebf83b8fe0831318552ae3354.jpg');
P('Bitki Çayları', 'Herbal Teas', 130, 'ce2f4ba309c2144f0a38db96f165ee57.jpg');
P('Türk Kahvesi', 'Turkish Coffee', 150, '2cf26206fd794ed3ba3478f1d0a368db.jpg');
P('Espresso', 'Espresso', 150, '0694c5a71f980a5fd162a65465753554.jpg');
P('Double Espresso', 'Double Espresso', 200, '04be0660b43ddf82da002bc829306ab4.jpg');
P('Americano', 'Americano', 200, '7373dfc0497263759a1dcdcb6aa0c96d.jpg');
P('Latte', 'Latte', 220, '899b7d182c99941a41514c7f504090cc.jpg', ['milk']);
P('Cappuccino', 'Cappuccino', 220, '71df354ade31c9542467092f2bf10c74.jpg', ['milk']);
P('Sıcak Çikolata', 'Hot Chocolate', 200, '053bfedda3a1c8fa4743b760090760e7.jpg', ['milk', 'soy']);

/* ───────────── ALKOLLÜ ───────────── */
C('kokteyl', 'bar', 'Kokteyller', 'Cocktails', '8dad1790f0e5926c5a13b8b90aad4c29.jpg');
P('Aperol Spritz', 'Aperol Spritz', 600, '8dad1790f0e5926c5a13b8b90aad4c29.jpg', ['sulphite'], { tags: ['chef'] });
P('Long Island', 'Long Island Iced Tea', 650, '3ba38e996605138c858fbe294e9aabf4.jpg');
P('Sex On The Beach', 'Sex On The Beach', 600, '3fb0e39e840b7c8ddd55e6cc99d47b26.jpg');
P('Dry Martini', 'Dry Martini', 600, '564c0caef8bb0292fad7272aa348ebee.jpg', ['sulphite']);
P('Mojito', 'Mojito', 600, 'ee7770693037c47e874a0e61fe62afb7.jpg');
P('Piña Colada', 'Piña Colada', 600, '7f5c93c6b7680d433a16c11d3ec5ec1e.jpg', ['milk']);
P('Cosmopolitan', 'Cosmopolitan', 600, 'e0ed068d440af7641f997fc89943a3af.jpg');
P('Cuba Libre', 'Cuba Libre', 600, 'c128465e5c9d8c1c18605e42630bf781.jpg');
P('Pornstar Martini', 'Pornstar Martini', 700, 'c83ab5c508a3ed95a425fe86263f2fa8.jpg', ['sulphite']);
P('Margarita', 'Margarita', 600, '309eadcb9426bfcf8cb3a5c39b8924b1.jpg');
P('Tequila Sunrise', 'Tequila Sunrise', 600, 'e6347ccb17938cd3c3003813cb8eac28.jpg');
P('Lynchburg Lemonade', 'Lynchburg Lemonade', 600, '4228c92d5cf6b136b3b120aee7762099.jpg');
P('Whiskey Sour', 'Whiskey Sour', 600, '3f331a3b82f71d34758386038cfbf7d5.jpg', ['egg', 'gluten']);

C('raki', 'bar', 'Rakı', 'Rakı', '472a915769a110ee0f2cbcdc33610eb7.jpg');
P('Rakı Kadeh', 'Rakı by the Glass', shot(300, 400), '472a915769a110ee0f2cbcdc33610eb7.jpg');
P('Yeni Rakı', 'Yeni Rakı', bottle([35, 2250], [50, 3000], [70, 3750], [100, 4500]), 'df023d104f90fab6bd36e2c5497b98db.jpg');
P('Tekirdağ Rakı', 'Tekirdağ Rakı', bottle([35, 2750], [50, 3500], [70, 4250], [100, 5000]), '54162e0ffc836149b0711352e8798229.jpg');
P('Tekirdağ Altın Seri', 'Tekirdağ Gold Series', bottle([35, 2750], [50, 3500], [70, 4250], [100, 5000]), '8c53e44d5186eb2d84292ace83d5fa5e.jpg');
P('Beylerbeyi Göbek', 'Beylerbeyi Göbek', bottle([35, 2750], [50, 3500], [70, 4250], [100, 5000]), 'e629b9689bcde731aac4c90212abdb7c.jpg');
P('Efe Gold', 'Efe Gold', bottle([35, 2750], [50, 3500], [70, 4250], [100, 5000]), 'bc66ae44130c488cfe72a222dccd1d22.jpg');

C('bira', 'bar', 'Biralar', 'Beers', '0bde348ebca793e104eed5a4861621fa.jpg');
P('Efes', 'Efes Pilsen', 280, '07ef3004fb39e55e41b259fe4138de1d.jpg', ['gluten']);
P('Efes Malt', 'Efes Malt', 280, 'b333ccfab8c5a0ddfd448d6f95f65cfe.jpg', ['gluten']);
P('Bomonti Filtresiz', 'Bomonti Unfiltered', 300, '08c8ec3b5d34c2c3c8d6a5aab061ae20.jpg', ['gluten']);
P('Miller', 'Miller', 300, '0cc2750c3b278651d537341fd07eafe0.jpg', ['gluten']);
P("Beck's", "Beck's", 300, 'ee8674debabed33e46e1bbd4b0226438.jpg', ['gluten']);
P('Corona', 'Corona', 320, '0bde348ebca793e104eed5a4861621fa.jpg', ['gluten']);
P('Tuborg', 'Tuborg', 280, 'f224a8db92d62e01b7da02d1a345572d.jpg', ['gluten']);
P('Tuborg Ice', 'Tuborg Ice', 250, '61f9e69cdea413735aa4076097cde4b1.jpg', ['gluten']);
P('Carlsberg', 'Carlsberg', 300, 'ac11f4ba4c65a52d6cc9548e5a37e7b1.jpg', ['gluten']);
P('Blanc', 'Blanc', 300, 'ea7a742257b5e0ca3e717347d0b2b991.jpg', ['gluten']);
P('Guinness', 'Guinness', 350, '7225384381e5d5b2125e77b8b2cdff6b.jpg', ['gluten']);

C('sarap', 'bar', 'Şaraplar', 'Wines', '4af5b721459514cabdbed04e90c766a4.jpg');
const wine = [['Kadeh', 400, 'Glass'], ['Şişe · Klasik', 2500, 'Bottle · Classic'], ['Şişe · Premium', 4500, 'Bottle · Premium'], ['Şişe · Prestige', 7000, 'Bottle · Prestige']];
P('Kırmızı Şarap', 'Red Wine', wine, '64a3e527d2ed677be239ee62cef0ba32.jpg', ['sulphite']);
P('Beyaz Şarap', 'White Wine', wine, '452b7e9870554dd5b33af5686636d537.jpg', ['sulphite']);
P('Roze Şarap', 'Rosé Wine', [['Kadeh', 400, 'Glass'], ['Şişe', 2500, 'Bottle']], '4af5b721459514cabdbed04e90c766a4.jpg', ['sulphite']);
P('Meyveli Şarap', 'Fruit Wine', [['Şişe', 2500, 'Bottle']], '09907f96b54c8656cef79dea851a132e.jpg', ['sulphite']);
P('Sangria', 'Sangria', [['Kadeh', 400, 'Glass'], ['Sürahi', 1500, 'Jug']], 'c1578824f4953bbaed4ee06535f58ee6.jpg', ['sulphite'], { tags: ['chef'] });
P('Şampanya', 'Champagne', [['Kadeh', 400, 'Glass'], ['Şişe · Klasik', 2000, 'Bottle · Classic'], ['Şişe · Premium', 5000, 'Bottle · Premium'], ['Şişe · Prestige', 10000, 'Bottle · Prestige']], 'fa0687d0d8f5ccc5011a0e238e2a49f6.jpg', ['sulphite']);

C('cin', 'bar', 'Cin', 'Gin', '262626f92bdc94103c6458d53aac70ba.jpg');
P("Gordon's", "Gordon's", [...shot(400, 600), ...bottle([35, 2800], [70, 5000])], '262626f92bdc94103c6458d53aac70ba.jpg');
P("Gordon's Pink", "Gordon's Pink", [...shot(500, 650), ...bottle([70, 5500])], '6c6a52622124f74cef330196c3b0e5ca.jpg');
P('Beefeater', 'Beefeater', [...shot(400, 600), ...bottle([35, 2800], [70, 5000])], '41f8bd0d40a60739f3e0f65018a56a8f.jpg');
P("Hendrick's", "Hendrick's", bottle([70, 8000]), '1ca81869ed642acbe0b07d5fa2346b58.jpg');

C('votka', 'bar', 'Votka', 'Vodka', 'fefe326c3f78b4417fa7e8ac4e614b62.jpg');
P('Absolut', 'Absolut', [...shot(400, 600), ...bottle([35, 3000], [70, 5500])], 'fefe326c3f78b4417fa7e8ac4e614b62.jpg');
P('Smirnoff', 'Smirnoff', [...shot(400, 600), ...bottle([35, 3000], [70, 5500])], 'c5c4881e2c12e6670e52c6073e4bef46.jpg');
P('İstanblue', 'İstanblue', [...shot(350, 500), ...bottle([35, 2500], [70, 4500])], '14f38bdd27491bb6fe39368044ddafe5.jpg');
P('Belvedere', 'Belvedere', bottle([70, 7000]), 'ff1739b2053ace4a5cdf6e0e182e72bf.jpg');

C('viski', 'bar', 'Viski', 'Whiskey', 'fed8eb5e7a21d96748fc58dce74833c5.jpg');
P('Red Label', 'Red Label', [...shot(400, 600), ...bottle([35, 2700], [70, 4500])], '4321a3c9dc7181dce96c6d1322393d64.jpg', ['gluten']);
P('Black Label', 'Black Label', [...shot(500, 700), ...bottle([35, 3000], [70, 5500])], 'fed8eb5e7a21d96748fc58dce74833c5.jpg', ['gluten']);
P('Chivas Regal', 'Chivas Regal', [...shot(500, 700), ...bottle([35, 3000], [70, 5500])], 'd2a072379281495e1673b15eff2a82a6.jpg', ['gluten']);
P('Jack Daniel’s', 'Jack Daniel’s', [...shot(500, 700), ...bottle([35, 3000], [70, 5500])], '2fe585beec7caff9b5361dc6ebdd9e1f.jpg', ['gluten']);
P('Jack Daniel’s Honey', 'Jack Daniel’s Honey', [...shot(500, 700), ...bottle([70, 6500])], '770c0ebf7ba44009b5f43d3c555ed851.jpg', ['gluten']);
P('Gentleman Jack', 'Gentleman Jack', [...shot(500, 700), ...bottle([70, 6500])], '1de4dee07cd2acfa81d70ee2e194183c.jpg', ['gluten']);

C('tekila', 'bar', 'Tekila & Shotlar', 'Tequila & Shots', 'da75f7ac2ee32e736c262b9d66b4e438.jpg');
P('Olmeca', 'Olmeca', [['Shot', 300], ...bottle([35, 2500], [70, 4500])], 'af8eb43f845ebb3f2ce5a54eb07f3be6.jpg');
P('Votka Shot', 'Vodka Shot', 300, 'd530eda5856a827f40d279987b81d588.jpg');
P('Viski Shot', 'Whiskey Shot', 350, 'f1884da86503e356eb846b27c602b96c.jpg', ['gluten']);
P('Jägermeister Shot', 'Jägermeister Shot', 300, 'da75f7ac2ee32e736c262b9d66b4e438.jpg');
P('B-52 Shot', 'B-52 Shot', 350, '375ae9d980f4587ace3674adcce7c120.jpg', ['milk']);

C('rom', 'bar', 'Rom', 'Rum', '08f1404ffe3b0f646b1723d05a1726d3.jpg');
P('Captain Morgan', 'Captain Morgan', 650, 'e8decf80585b9b4db6cf6b8c8c163f23.jpg');
P('Havana Club', 'Havana Club', 650, '08f1404ffe3b0f646b1723d05a1726d3.jpg');
P('Bacardi', 'Bacardi', 650, '11d99edd24faec7bd510d562c7e10362.jpg');

/* ───────────── KEYİF ───────────── */
C('tatli', 'enjoy', 'Tatlılar', 'Desserts', '2d977b293ecba8ec4c64b35f3b75528a.jpg');
P('Fırın Helva', 'Baked Halva', 300, 'd7a2f864abedadcbaea5f59528173c0a.jpg', ['gluten', 'milk', 'nuts', 'sesame']);
P('Künefe', 'Künefe', 350, '2d977b293ecba8ec4c64b35f3b75528a.jpg', ['gluten', 'milk', 'nuts'], { tags: ['chef'] });
P('Cheesecake', 'Cheesecake', 300, '3c8a717ddfffe5fc4587b514dc9edd9b.jpg', ['gluten', 'milk', 'egg']);

C('meyve', 'enjoy', 'Meyveler', 'Fruits', 'feff6507629b0d7b03bc2c6fe0ce5778.jpg');
P('Meyve Tabağı', 'Mixed Fruit Plate', 400, 'feff6507629b0d7b03bc2c6fe0ce5778.jpg', [], { tags: ['vegan'] });
P('Karpuz Tabağı', 'Watermelon Plate', 350, 'ed14515dfb52033ca8f58c2b28cf0799.jpg', [], { tags: ['vegan'] });
P('Kavun Tabağı', 'Melon Plate', 350, '2551ecd62acc31631d361fa0cd981cf9.jpg', [], { tags: ['vegan'] });

C('cerez', 'enjoy', 'Kuruyemişler', 'Nuts', 'bc7e42bb6a5d2b93468c682cb5ba846e.jpg');
P('Karışık Çerez', 'Mixed Nuts', 150, 'a1400257689b45922302bb613c3308df.jpg', ['nuts', 'peanut'], { tags: ['vegan'] });
P('Lüks Çerez', 'Deluxe Nuts', 200, 'bc7e42bb6a5d2b93468c682cb5ba846e.jpg', ['nuts', 'peanut'], { tags: ['vegan'] });

C('nargile', 'enjoy', 'Nargileler', 'Shishas', '297e93f8bbda3dec847e7fe3f2ed3c2a.jpg');
P('Nargile', 'Shisha', 600, '297e93f8bbda3dec847e7fe3f2ed3c2a.jpg');
P('Special Nargile', 'Special Shisha', 800, '297e93f8bbda3dec847e7fe3f2ed3c2a.jpg', [], { tags: ['chef'] });
P('Lüle Değişimi', 'Bowl Change', 300, '297e93f8bbda3dec847e7fe3f2ed3c2a.jpg');

/* ───────────── yaz ───────────── */
const all = new Set();
const local = f => (f ? (all.add(f), 'uploads/' + f.replace(/\.(png|jpe?g)$/, '.webp')) : '');
groups.forEach(g => (g.img = local(g.img)));
categories.forEach(c => (c.img = local(c.img)));
products.forEach(p => (p.img = local(p.img)));
const hero = '';

const menu = {
  settings: {
    name: 'Barcode',
    subtitle: { tr: 'Beach & Restaurant', en: 'Beach & Restaurant' },
    location: { tr: 'Boğazkent · Belek / Antalya', en: 'Boğazkent · Belek / Antalya' },
    welcome: { tr: 'Akdeniz’in mavisine karşı, ayaklarınız kumda.', en: 'Toes in the sand, eyes on the Mediterranean blue.' },
    hero,
    currency: '₺',
    phone: '',
    wifiName: '',
    wifiPass: '',
    instagram: '',
    address: 'Boğazkent, Serik / Antalya',
    note: {
      tr: 'Alerjen bilgileri bilgilendirme amaçlıdır; mutfağımızda tüm alerjenler işlenmektedir. Lütfen siparişten önce garsonunuza alerjinizi bildiriniz. Fiyatlarımıza KDV dahildir.',
      en: 'Allergen information is for guidance only; all allergens are handled in our kitchen. Please inform your waiter about any allergy before ordering. Prices include VAT.',
    },
  },
  groups,
  categories,
  products,
  allergens,
  updatedAt: new Date().toISOString(),
};

fs.mkdirSync(path.join(ROOT, 'public', 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'public', 'data', 'menu.json'), JSON.stringify(menu, null, 2));
fs.writeFileSync(path.join(__dirname, 'images.txt'), [...all].map(f => SRC + f).join('\n') + '\n');
console.log(`${categories.length} kategori, ${products.length} ürün, ${all.size} fotoğraf`);
