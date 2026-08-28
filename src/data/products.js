/**
 * Catalogue — the store's real products.
 *
 * Every record here is backed by a real photograph supplied by the shop
 * (public/images/…). Names, pack sizes and units were read off the packaging in
 * those photos.
 *
 * ⚠ PRICES ARE ESTIMATES. The shop has not supplied a price list yet, so each
 * `price` is a plausible Vietnamese retail figure standing in until the real
 * one arrives. Check every line before this goes live.
 *
 *   id        stable product id, also the /san-pham/:id URL segment
 *   cat       category id, see data/categories.js
 *   shelf     which homepage shelf the shop assigned this photo to:
 *               'best'      → Sản phẩm bán chạy (top 5, shown with descriptions)
 *               'for-you'   → Gợi ý riêng cho bạn
 *               'suggested' → Gợi ý cho bạn
 *   rank      position within the best-seller shelf (1–5)
 *   descVi/En longer copy for the product page and the best-seller cards
 *   image     path under public/
 */
const RAW = [
  // ---------------------------------------------------- Sản phẩm bán chạy ---
  {
    id: 'gao-st25-5kg', cat: 'food', shelf: 'best', rank: 1,
    nameVi: 'Gạo ST25 túi 5kg — đặc sản Sóc Trăng',
    nameEn: 'ST25 fragrant rice 5kg — Sóc Trăng speciality',
    price: 185000, unitVi: 'Túi 5kg', unitEn: '5kg bag', pop: 99,
    image: '/images/best-sellers/bs-01.jpg',
    descVi: 'Gạo ST25 đặc sản Sóc Trăng — giống gạo đạt giải Gạo ngon nhất thế giới năm 2019 tại Manila. Hạt dài, trắng trong, cơm dẻo thơm lâu và giàu dinh dưỡng. Túi 5kg tiện trữ cho cả gia đình dùng dần.',
    descEn: 'ST25 from Sóc Trăng — the variety that won World’s Best Rice in Manila, 2019. Long, clear grains that cook up fragrant and stay soft. A 5kg bag keeps a family going for about a month.',
  },
  {
    id: 'bot-5-thu-dau', cat: 'food', shelf: 'best', rank: 2,
    nameVi: 'Bột 5 thứ đậu Rồng Vàng — hộp 10 gói',
    nameEn: 'Rồng Vàng five-bean cereal — box of 10',
    price: 42000, unitVi: '10 gói × 40g', unitEn: '10 sachets × 40g', pop: 94,
    image: '/images/best-sellers/bs-02.jpg',
    descVi: 'Bột ngũ cốc từ 5 loại đậu, đặc biệt có nhân sen. Pha nhanh với nước nóng, vị bùi thơm tự nhiên, hợp cho bữa sáng hoặc bữa phụ của cả nhà.',
    descEn: 'Five-bean cereal powder with lotus seed. Stir into hot water for a nutty, filling breakfast or afternoon snack the whole family can share.',
  },
  {
    id: 'luong-kho-bay', cat: 'food', shelf: 'best', rank: 3,
    nameVi: 'Lương khô Bảy — Công ty Cổ phần 22',
    nameEn: 'Lương khô Bảy energy bar — Company 22',
    price: 18000, unitVi: 'Thanh 200g', unitEn: '200g bar', pop: 93,
    image: '/images/best-sellers/bs-03.jpg',
    descVi: 'Lương khô của Công ty Cổ phần 22 — khẩu phần gọn, giàu năng lượng, dùng cho dã ngoại, đi rừng, tập luyện hoặc dự trữ trong nhà. Đóng gói kín, để được lâu.',
    descEn: 'A compact, high-energy ration bar from Company 22. Made for hiking, training and emergency stores, sealed for a long shelf life.',
  },
  {
    id: 'oishi-haku-ca-hoi', cat: 'food', shelf: 'best', rank: 4,
    nameVi: 'Bánh gạo Oishi HAKU cá hồi rong biển',
    nameEn: 'Oishi HAKU rice crackers — salmon & seaweed',
    price: 32000, unitVi: 'Gói lớn 10 gói nhỏ', unitEn: 'Bag of 10 small packs', pop: 91,
    image: '/images/best-sellers/bs-04.jpg',
    descVi: 'Bánh gạo mini Oishi HAKU vị cá hồi rong biển, làm từ 100% gạo Japonica. Giòn nhẹ, mặn dịu, chia sẵn 10 gói nhỏ tiện mang theo và giữ được độ giòn.',
    descEn: 'Oishi HAKU mini rice crackers in salmon-seaweed flavour, made from 100% Japonica rice. Light and crisp, split into 10 small packs that stay fresh.',
  },
  {
    id: 'banh-phong-thanh-long', cat: 'food', shelf: 'best', rank: 5,
    nameVi: 'Bánh phồng Thanh Long nước cốt dừa',
    nameEn: 'Thanh Long coconut-milk crackers',
    price: 28000, unitVi: 'Gói 10 bánh', unitEn: 'Pack of 10', pop: 89,
    image: '/images/best-sellers/bs-05.jpg',
    descVi: 'Bánh phồng Thanh Long — đặc sản Bến Tre làm từ nước cốt dừa béo. Nướng hoặc chiên là phồng giòn, thơm mùi dừa, ăn liền hoặc cuốn kèm đều hợp.',
    descEn: 'Thanh Long coconut crackers, a Bến Tre speciality made with rich coconut milk. Grill or fry until they puff and crisp, then eat as they are or use as a wrap.',
  },

  // ------------------------------------------------ Gợi ý riêng cho bạn ---
  { id: 'combo-luong-kho-22', cat: 'food', shelf: 'for-you', nameVi: 'Combo lương khô Công ty 22 — Cacao 22, BB702, Bảy', nameEn: 'Company 22 ration bundle — Cacao 22, BB702, Bảy', price: 120000, unitVi: 'Combo 6 thanh', unitEn: 'Bundle of 6 bars', pop: 82, image: '/images/for-you/fy-01.jpg' },
  { id: 'luong-kho-bay-tui-180g', cat: 'food', shelf: 'for-you', nameVi: 'Lương khô Bảy túi zip 180g', nameEn: 'Lương khô Bảy zip pouch 180g', price: 35000, unitVi: 'Túi zip 180g', unitEn: '180g zip pouch', pop: 76, image: '/images/for-you/fy-02.jpg' },
  { id: 'non-chong-nang-che-co', cat: 'cloth', shelf: 'for-you', nameVi: 'Nón chống nắng vành rộng che cổ', nameEn: 'Wide-brim sun hat with neck flap', price: 89000, unitVi: 'Vải dù, lưới thoáng', unitEn: 'Ripstop with mesh vents', pop: 78, image: '/images/for-you/fy-03.jpg' },
  { id: 'ong-tay-chong-nang', cat: 'cloth', shelf: 'for-you', nameVi: 'Bộ ống tay chống nắng kèm nón lưỡi trai', nameEn: 'UV arm sleeves with visor cap', price: 75000, unitVi: 'Ống tay + nón', unitEn: 'Sleeves + visor', pop: 74, image: '/images/for-you/fy-04.jpg' },
  { id: 'gang-tay-chong-nang', cat: 'cloth', shelf: 'for-you', nameVi: 'Găng tay chống nắng hở ngón hạt chống trượt', nameEn: 'Fingerless sun gloves with grip dots', price: 39000, unitVi: 'Đôi, freesize', unitEn: 'Pair, one size', pop: 70, image: '/images/for-you/fy-05.jpg' },
  { id: 'gang-tay-cach-dien', cat: 'elec', shelf: 'for-you', nameVi: 'Găng tay bảo hộ phủ cao su cách điện', nameEn: 'Latex-coated insulating work gloves', price: 55000, unitVi: 'Đôi, phủ cao su nhám', unitEn: 'Pair, textured latex palm', pop: 68, image: '/images/for-you/fy-06.jpg' },
  { id: 'khan-giay-pulppy', cat: 'care', shelf: 'for-you', nameVi: 'Khăn giấy bỏ túi Pulppy — lốc 10 gói', nameEn: 'Pulppy pocket tissues — 10 packs', price: 28000, unitVi: 'Lốc 10 gói', unitEn: 'Pack of 10', pop: 80, image: '/images/for-you/fy-07.jpg' },
  { id: 'vien-tay-bon-cau', cat: 'clean', shelf: 'for-you', nameVi: 'Chai tẩy bồn cầu Chung Blue', nameEn: 'Chung Blue toilet cleaner', price: 45000, unitVi: 'Chai treo bồn cầu', unitEn: 'In-cistern bottle', pop: 72, image: '/images/for-you/fy-08.jpg' },
  { id: 'giay-ve-sinh-anan', cat: 'clean', shelf: 'for-you', nameVi: 'Giấy vệ sinh AnAn 2 lớp — lốc 10 cuộn', nameEn: 'AnAn 2-ply toilet roll — 10 rolls', price: 62000, unitVi: 'Lốc 10 cuộn', unitEn: 'Pack of 10 rolls', pop: 86, image: '/images/for-you/fy-09.jpg' },
  { id: 'sap-thom-oasis', cat: 'clean', shelf: 'for-you', nameVi: 'Sáp thơm Oasis hương oải hương & xạ hương 200g', nameEn: 'Oasis gel air freshener, lavender & musk 200g', price: 38000, unitVi: 'Hộp 200g', unitEn: '200g tub', pop: 71, image: '/images/for-you/fy-10.jpg' },
  { id: 'sap-thom-ambi-pur', cat: 'clean', shelf: 'for-you', nameVi: 'Sáp thơm Ambi Pur Room Fresh hương sả 180g', nameEn: 'Ambi Pur Room Fresh lemongrass gel 180g', price: 52000, unitVi: 'Hộp 180g', unitEn: '180g tub', pop: 73, image: '/images/for-you/fy-11.jpg' },
  { id: 'omo-nuoc-giat-do-lot', cat: 'clean', shelf: 'for-you', nameVi: 'Nước giặt đồ lót OMO hương hoa anh đào', nameEn: 'OMO delicates wash, cherry blossom', price: 68000, unitVi: 'Chai vòi nhấn', unitEn: 'Pump bottle', pop: 75, image: '/images/for-you/fy-12.jpg' },
  { id: 'am-dun-thuy-tinh', cat: 'elec', shelf: 'for-you', nameVi: 'Ấm đun nước siêu tốc thủy tinh 1.7L', nameEn: 'Glass electric kettle 1.7L', price: 265000, unitVi: '1.7L · tự ngắt', unitEn: '1.7L · auto shut-off', pop: 85, image: '/images/for-you/fy-13.jpg' },
  { id: 'bo-do-be-ke-soc', cat: 'baby', shelf: 'for-you', nameVi: 'Bộ áo thun kẻ sọc & quần short cho bé', nameEn: 'Kids striped tee & shorts set', price: 135000, unitVi: 'Bộ 2 món', unitEn: '2-piece set', pop: 69, image: '/images/for-you/fy-14.jpg' },
  { id: 'milo-hop-110ml', cat: 'drink', shelf: 'for-you', nameVi: 'Sữa lúa mạch Milo 110ml — thùng 48 hộp', nameEn: 'Milo malt drink 110ml — case of 48', price: 215000, unitVi: 'Thùng 48 hộp', unitEn: 'Case of 48', pop: 88, image: '/images/for-you/fy-15.jpg' },
  { id: 'chan-ga-cung-dinh', cat: 'food', shelf: 'for-you', nameVi: 'Chân gà cung đình Hey Yo 26g', nameEn: 'Hey Yo braised chicken feet snack 26g', price: 12000, unitVi: 'Gói 26g', unitEn: '26g pack', pop: 77, image: '/images/for-you/fy-16.jpg' },
  { id: 'tra-cozy-ice-tea', cat: 'drink', shelf: 'for-you', nameVi: 'Trà Cozy Ice Tea hoà tan — nhiều vị', nameEn: 'Cozy instant ice tea — assorted flavours', price: 32000, unitVi: 'Hộp 16 gói', unitEn: 'Box of 16 sachets', pop: 79, image: '/images/for-you/fy-17.jpg' },
  { id: 'ao-polo-be-trai', cat: 'baby', shelf: 'for-you', nameVi: 'Áo polo cộc tay bé trai phối vai', nameEn: 'Boys colour-block polo shirt', price: 115000, unitVi: '3 màu, size 90–140', unitEn: '3 colours, sizes 90–140', pop: 66, image: '/images/for-you/fy-18.jpg' },
  { id: 'khay-dung-hat', cat: 'home', shelf: 'for-you', nameVi: 'Khay đựng hạt 2 ngăn có hộc đựng vỏ', nameEn: 'Snack tray with shell compartment', price: 45000, unitVi: 'Nhựa, 2 ngăn', unitEn: 'Plastic, 2 compartments', pop: 64, image: '/images/for-you/fy-19.jpg' },
  { id: 'bo-do-choi-dung-cu', cat: 'toys', shelf: 'for-you', nameVi: 'Bộ đồ chơi dụng cụ sửa chữa kèm vali', nameEn: 'Toy tool workbench set with case', price: 265000, unitVi: '3 tuổi trở lên', unitEn: 'Ages 3+', pop: 74, image: '/images/for-you/fy-20.jpg' },
  { id: 'ghe-vong-treo', cat: 'home', shelf: 'for-you', nameVi: 'Ghế võng treo vải kèm gối và móc', nameEn: 'Hanging hammock chair with cushions', price: 320000, unitVi: 'Kèm 2 gối + móc treo', unitEn: 'With 2 cushions + hooks', pop: 72, image: '/images/for-you/fy-21.jpg' },
  { id: 'ao-polo-nam-tay-dai', cat: 'cloth', shelf: 'for-you', nameVi: 'Áo polo nam tay dài — 8 màu', nameEn: "Men's long-sleeve polo — 8 colours", price: 189000, unitVi: 'Size M–3XL', unitEn: 'Sizes M–3XL', pop: 76, image: '/images/for-you/fy-22.jpg' },
  { id: 'dep-suc-de-day', cat: 'cloth', shelf: 'for-you', nameVi: 'Dép sục nữ đế dày chống trượt', nameEn: "Women's platform clogs", price: 145000, unitVi: '4 màu, size 36–40', unitEn: '4 colours, sizes 36–40', pop: 70, image: '/images/for-you/fy-23.jpg' },
  { id: 'bo-do-mac-nha-miliket', cat: 'cloth', shelf: 'for-you', nameVi: 'Bộ đồ mặc nhà in hoạ tiết mì Miliket', nameEn: 'Miliket-print loungewear set', price: 135000, unitVi: 'Bộ 2 món, freesize', unitEn: '2-piece set, one size', pop: 68, image: '/images/for-you/fy-24.jpg' },
  { id: 'ban-ui-mini', cat: 'home', shelf: 'for-you', nameVi: 'Bàn để ủi mini gấp gọn có giá tay áo', nameEn: 'Folding tabletop ironing board with sleeve rest', price: 210000, unitVi: 'Gấp gọn, chân chống trượt', unitEn: 'Folds flat, non-slip feet', pop: 65, image: '/images/for-you/fy-25.jpg' },
  { id: 'tui-dung-phu-kien', cat: 'bag', shelf: 'for-you', nameVi: 'Túi đựng phụ kiện điện tử 2 tầng', nameEn: 'Two-layer electronics organiser pouch', price: 79000, unitVi: '4 màu', unitEn: '4 colours', pop: 73, image: '/images/for-you/fy-26.jpg' },
  { id: 'den-led-usb', cat: 'elec', shelf: 'for-you', nameVi: 'Đèn LED USB 8 bóng cắm trực tiếp', nameEn: 'USB plug-in LED light bar, 8 LEDs', price: 25000, unitVi: 'Cắm laptop, PC, củ sạc', unitEn: 'Fits laptop, PC, charger', pop: 71, image: '/images/for-you/fy-27.jpg' },
  { id: 'tai-nghe-nhet-tai', cat: 'elec', shelf: 'for-you', nameVi: 'Tai nghe nhét tai 4 driver jack 3.5mm', nameEn: 'Dual-driver wired earphones, 3.5mm', price: 95000, unitVi: 'Jack 3.5mm, có mic', unitEn: '3.5mm jack, with mic', pop: 74, image: '/images/for-you/fy-28.jpg' },
  { id: 'bao-da-deo-that-lung', cat: 'bag', shelf: 'for-you', nameVi: 'Bao da điện thoại đeo thắt lưng có ngăn thẻ', nameEn: 'Belt-clip phone holster with card slot', price: 89000, unitVi: 'Vải dù chống nước', unitEn: 'Water-resistant nylon', pop: 63, image: '/images/for-you/fy-29.jpg' },
  { id: 'quan-ong-rong-3-soc', cat: 'cloth', shelf: 'for-you', nameVi: 'Quần ống rộng nỉ 3 sọc unisex', nameEn: 'Unisex three-stripe wide-leg joggers', price: 165000, unitVi: '3 màu, size S–XL', unitEn: '3 colours, sizes S–XL', pop: 78, image: '/images/for-you/fy-30.jpg' },
  { id: 'o-cam-da-nang', cat: 'elec', shelf: 'for-you', nameVi: 'Ổ cắm điện đa năng có công tắc', nameEn: 'Universal wall socket adapter with switch', price: 65000, unitVi: 'Đa chuẩn chân cắm', unitEn: 'Multi-standard sockets', pop: 69, image: '/images/for-you/fy-31.jpg' },
  { id: 'balo-laptop-chong-nuoc', cat: 'bag', shelf: 'for-you', nameVi: 'Balo laptop chống nước phản quang', nameEn: 'Water-resistant laptop backpack', price: 265000, unitVi: 'Ngăn laptop 15.6"', unitEn: 'Fits 15.6" laptop', pop: 84, image: '/images/for-you/fy-32.jpg' },
  { id: 'giay-da-nam-de-cao', cat: 'cloth', shelf: 'for-you', nameVi: 'Giày da nam buộc dây đế cao', nameEn: "Men's chunky-sole leather derby", price: 520000, unitVi: 'Size 39–44', unitEn: 'Sizes 39–44', pop: 62, image: '/images/for-you/fy-33.jpg' },
  { id: 'dep-quai-ngang-the-thao', cat: 'cloth', shelf: 'for-you', nameVi: 'Dép quai ngang thể thao chống trượt', nameEn: 'Sport slide sandals', price: 79000, unitVi: '3 màu, size 39–44', unitEn: '3 colours, sizes 39–44', pop: 75, image: '/images/for-you/fy-34.jpg' },
  { id: 'ao-polo-phoi-khoi', cat: 'cloth', shelf: 'for-you', nameVi: 'Áo polo nam phối khối màu', nameEn: "Men's colour-block polo shirt", price: 175000, unitVi: 'Cotton cá sấu, size M–2XL', unitEn: 'Piqué cotton, sizes M–2XL', pop: 72, image: '/images/for-you/fy-35.jpg' },
  { id: 'quan-short-kaki', cat: 'cloth', shelf: 'for-you', nameVi: 'Quần short kaki nam lưng thun', nameEn: "Men's elastic-waist chino shorts", price: 145000, unitVi: '4 màu, size 28–36', unitEn: '4 colours, sizes 28–36', pop: 73, image: '/images/for-you/fy-36.jpg' },

  // ------------------------------------------------------ Gợi ý cho bạn ---
  { id: 'tui-du-lich-gap-banh-xe', cat: 'bag', shelf: 'suggested', nameVi: 'Túi du lịch gấp gọn có bánh xe', nameEn: 'Foldable wheeled travel duffel', price: 185000, unitVi: '40 × 32cm, nở 19cm', unitEn: '40 × 32cm, expands 19cm', pop: 81, image: '/images/travel/tv-01.jpg' },
  { id: 'bo-tui-sap-xep-hanh-ly', cat: 'bag', shelf: 'suggested', nameVi: 'Bộ 6 túi sắp xếp hành lý', nameEn: '6-piece packing cube set', price: 125000, unitVi: 'Bộ 6 túi', unitEn: 'Set of 6', pop: 79, image: '/images/travel/tv-02.jpg' },
  { id: 'thung-nuoc-gap-gon', cat: 'home', shelf: 'suggested', nameVi: 'Thùng đựng nước gấp gọn có vòi 10L', nameEn: 'Collapsible water carrier with tap, 10L', price: 89000, unitVi: '10L, nhựa an toàn thực phẩm', unitEn: '10L, food-grade', pop: 77, image: '/images/travel/tv-03.jpg' },
  { id: 'balo-du-lich-ngan-giay', cat: 'bag', shelf: 'suggested', nameVi: 'Balo du lịch có ngăn đựng giày riêng', nameEn: 'Travel backpack with separate shoe compartment', price: 295000, unitVi: 'Ngăn giày tách khô–ướt', unitEn: 'Vented shoe compartment', pop: 80, image: '/images/travel/tv-04.jpg' },
  { id: 'phao-luoi-tu-bom', cat: 'home', shelf: 'suggested', nameVi: 'Ghế hơi phao lười tự bơm', nameEn: 'Self-inflating air lounger', price: 185000, unitVi: 'Gấp gọn, kèm túi đựng', unitEn: 'Packs into carry bag', pop: 71, image: '/images/travel/tv-05.jpg' },
  { id: 'ghe-rut-gon-du-lich', cat: 'home', shelf: 'suggested', nameVi: 'Ghế rút gọn du lịch chịu lực 200kg', nameEn: 'Telescopic folding stool, 200kg rated', price: 165000, unitVi: 'Cao 45cm, nặng 0.89kg', unitEn: '45cm tall, 0.89kg', pop: 76, image: '/images/travel/tv-06.jpg' },
  { id: 'gio-gap-da-nang', cat: 'home', shelf: 'suggested', nameVi: 'Giỏ gấp gọn đa năng kiêm bàn dã ngoại', nameEn: 'Collapsible picnic basket with table lid', price: 265000, unitVi: '47 × 25.8 × 24cm', unitEn: '47 × 25.8 × 24cm', pop: 74, image: '/images/travel/tv-07.jpg' },
  { id: 'bom-lop-khong-day', cat: 'elec', shelf: 'suggested', nameVi: 'Bơm lốp không dây cầm tay 17 lít/phút', nameEn: 'Cordless tyre inflator, 17 L/min', price: 490000, unitVi: 'Ô tô, xe máy, xe đạp, bóng', unitEn: 'Car, motorbike, bike, balls', pop: 78, image: '/images/travel/tv-08.jpg' },
  { id: 'may-lam-sach-rang', cat: 'care', shelf: 'suggested', nameVi: 'Máy làm sạch cao răng kèm 3 đầu bàn chải', nameEn: 'Ultrasonic tooth cleaner with 3 brush heads', price: 350000, unitVi: 'Sạc USB, chống nước', unitEn: 'USB rechargeable, waterproof', pop: 72, image: '/images/travel/tv-09.jpg' },
  { id: 'ao-mua-mang-to', cat: 'cloth', shelf: 'suggested', nameVi: 'Áo mưa măng tô EVA có nón', nameEn: 'EVA hooded rain poncho', price: 95000, unitVi: 'Freesize, 5 màu', unitEn: 'One size, 5 colours', pop: 82, image: '/images/travel/tv-10.jpg' },
  { id: 'ghe-xep-gac-chan', cat: 'home', shelf: 'suggested', nameVi: 'Ghế xếp dã ngoại có gác chân và gối', nameEn: 'Reclining camp chair with footrest', price: 480000, unitVi: 'Kèm gối tựa, giá để ly', unitEn: 'Headrest and cup holder', pop: 75, image: '/images/travel/tv-11.jpg' },
  { id: 'ghe-xep-nhua-mong', cat: 'home', shelf: 'suggested', nameVi: 'Ghế xếp nhựa gấp phẳng bỏ balo', nameEn: 'Flat-folding plastic camp stool', price: 95000, unitVi: '3 màu, gấp phẳng', unitEn: '3 colours, folds flat', pop: 70, image: '/images/travel/tv-12.jpg' },
  { id: 'do-boi-giu-nhiet', cat: 'cloth', shelf: 'suggested', nameVi: 'Bộ đồ lặn giữ nhiệt tay ngắn nữ', nameEn: "Women's short-sleeve shorty wetsuit", price: 690000, unitVi: 'Neoprene, size S–XL', unitEn: 'Neoprene, sizes S–XL', pop: 64, image: '/images/travel/tv-13.jpg' },
  { id: 'den-pin-moc-khoa-cob', cat: 'elec', shelf: 'suggested', nameVi: 'Đèn pin móc khoá COB sạc USB', nameEn: 'COB keychain work light, USB rechargeable', price: 69000, unitVi: 'Có nam châm, móc treo', unitEn: 'Magnetic base, carabiner', pop: 83, image: '/images/travel/tv-14.jpg' },
];

export const products = RAW.map((p) => ({
  was: 0,
  ...p,
  sku: `7M-${p.cat.toUpperCase()}-${p.id.slice(0, 8).toUpperCase()}`,
  // One photograph per product today. When the shop sends alternate angles,
  // push them onto this array and the product page grows a thumbnail strip.
  images: [p.image],
}));

const byId = new Map(products.map((p) => [p.id, p]));

export function getProduct(id) {
  return byId.get(id) || null;
}

export function countByCategory(catId) {
  return products.reduce((n, p) => (p.cat === catId ? n + 1 : n), 0);
}
