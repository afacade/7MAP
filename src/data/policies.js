/**
 * Policy documents, localised.
 *
 * These are editorial content rather than UI strings, so they live in `data/`
 * with the rest of the CMS-shaped records instead of the i18n catalogues. Each
 * document carries its own `updatedAt` so the article footer stops being a
 * hard-coded date the day the client edits one of them.
 *
 * `slug` is the URL segment: /chinh-sach/:slug
 */
const UPDATED = '01/08/2026';

export const policies = {
  vi: [
    {
      id: 'return',
      slug: 'doi-tra',
      title: 'Đổi trả & hoàn tiền',
      updatedAt: UPDATED,
      blocks: [
        { h: 'Thời hạn đổi trả', p: 'Khách hàng được đổi hoặc trả hàng trong 7 ngày kể từ ngày mua, tính theo hoá đơn bán lẻ hoặc phiếu giao hàng. Với thiết bị điện, thời hạn đổi lỗi kỹ thuật là 30 ngày.' },
        { h: 'Điều kiện áp dụng', p: 'Sản phẩm còn nguyên tem, nhãn, bao bì và phụ kiện kèm theo; chưa qua sử dụng hoặc chỉ dùng thử để kiểm tra. Vui lòng mang theo hoá đơn hoặc tin nhắn xác nhận đơn hàng.' },
        { h: 'Không áp dụng', p: 'Thực phẩm đã mở bao bì, đồ lót, sản phẩm chăm sóc cá nhân đã bóc niêm phong, hàng thanh lý ghi rõ "không đổi trả", và sản phẩm hư hỏng do sử dụng sai hướng dẫn.' },
        { h: 'Hình thức hoàn tiền', p: 'Hoàn tiền mặt tại quầy dịch vụ khách hàng, hoặc chuyển khoản trong 1–3 ngày làm việc nếu đơn hàng đã thanh toán chuyển khoản.' },
      ],
    },
    {
      id: 'ship',
      slug: 'giao-hang',
      title: 'Giao hàng & vận chuyển',
      updatedAt: UPDATED,
      blocks: [
        { h: 'Khu vực giao hàng', p: 'Giao hàng nội thành TP.HCM. Đơn đặt trước 15:00 được giao trong ngày; sau 15:00 giao vào sáng hôm sau.' },
        { h: 'Phí giao hàng', p: 'Miễn phí cho đơn từ 300.000₫ trong bán kính 7km. Đơn nhỏ hơn hoặc xa hơn tính phí 25.000₫ – 45.000₫ tuỳ khoảng cách, nhân viên báo trước khi chốt đơn.' },
        { h: 'Cách đặt hàng', p: 'Gọi hotline hoặc nhắn Zalo +84 707 796 663 kèm danh sách hàng. Nhân viên soạn đơn, xác nhận tổng tiền rồi mới giao.' },
        { h: 'Kiểm tra khi nhận', p: 'Vui lòng kiểm tra hàng trước khi thanh toán COD. Nếu thiếu hoặc hư hỏng, từ chối nhận phần hàng đó và thông báo ngay cho nhân viên giao hàng.' },
      ],
    },
    {
      id: 'warranty',
      slug: 'bao-hanh',
      title: 'Bảo hành thiết bị điện',
      updatedAt: UPDATED,
      blocks: [
        { h: 'Thời hạn bảo hành', p: 'Thiết bị điện gia dụng được bảo hành 12 tháng theo tiêu chuẩn nhà sản xuất, tính từ ngày ghi trên hoá đơn.' },
        { h: 'Phạm vi bảo hành', p: 'Bảo hành các lỗi kỹ thuật do sản xuất: động cơ, bảng điều khiển, mạch điện, rò điện. Không bao gồm dây điện bị cắt, vỏ nứt do rơi, hoặc thiết bị bị ngấm nước.' },
        { h: 'Cách yêu cầu bảo hành', p: 'Mang sản phẩm và hoá đơn tới quầy dịch vụ khách hàng, hoặc gọi hotline để được hướng dẫn. Thời gian xử lý thông thường 3–10 ngày làm việc.' },
      ],
    },
    {
      id: 'privacy',
      slug: 'bao-mat',
      title: 'Bảo mật thông tin',
      updatedAt: UPDATED,
      blocks: [
        { h: 'Thông tin chúng tôi thu thập', p: 'Họ tên, số điện thoại và địa chỉ giao hàng — chỉ những thông tin cần thiết để xử lý và giao đơn hàng của bạn.' },
        { h: 'Cách sử dụng thông tin', p: 'Dùng để xác nhận đơn, giao hàng, xử lý đổi trả và bảo hành. Chúng tôi không bán hoặc chia sẻ dữ liệu khách hàng cho bên thứ ba vì mục đích quảng cáo.' },
        { h: 'Lưu trữ và quyền của bạn', p: 'Thông tin đơn hàng được lưu tối đa 24 tháng cho mục đích bảo hành và kế toán. Bạn có thể yêu cầu xem, sửa hoặc xoá thông tin bằng cách gọi hotline.' },
      ],
    },
    {
      id: 'complaint',
      slug: 'khieu-nai',
      title: 'Tiếp nhận khiếu nại',
      updatedAt: UPDATED,
      blocks: [
        { h: 'Kênh tiếp nhận', p: 'Gọi hotline +84 707 796 663, nhắn Zalo cùng số, hoặc gặp trực tiếp quầy dịch vụ khách hàng trong giờ mở cửa.' },
        { h: 'Thời gian phản hồi', p: 'Phản hồi đầu tiên trong vòng 24 giờ làm việc. Các trường hợp cần kiểm tra với nhà cung cấp được xử lý trong tối đa 7 ngày làm việc.' },
        { h: 'Cam kết của chúng tôi', p: 'Mọi khiếu nại đều được ghi nhận bằng văn bản, có mã theo dõi và phản hồi cụ thể về hướng xử lý — đổi hàng, hoàn tiền hoặc bảo hành.' },
      ],
    },
  ],
  en: [
    {
      id: 'return',
      slug: 'doi-tra',
      title: 'Returns & refunds',
      updatedAt: UPDATED,
      blocks: [
        { h: 'Return window', p: 'Items can be exchanged or returned within 7 days of purchase, based on the receipt or delivery note. Electric appliances have a 30-day window for manufacturing faults.' },
        { h: 'Conditions', p: 'Products must keep their seals, labels, packaging and accessories, and be unused or only test-fitted. Please bring the receipt or your order confirmation message.' },
        { h: 'Not eligible', p: 'Opened food, underwear, unsealed personal-care items, clearance goods marked "no return", and products damaged by misuse.' },
        { h: 'Refund method', p: 'Cash refund at the customer service counter, or bank transfer within 1–3 business days if the order was paid by transfer.' },
      ],
    },
    {
      id: 'ship',
      slug: 'giao-hang',
      title: 'Delivery & shipping',
      updatedAt: UPDATED,
      blocks: [
        { h: 'Delivery area', p: 'We deliver within Ho Chi Minh City. Orders placed before 3:00 PM arrive the same day; later orders arrive the next morning.' },
        { h: 'Delivery fees', p: 'Free for orders over 300,000₫ within a 7km radius. Smaller or more distant orders cost 25,000₫ – 45,000₫ depending on distance, always confirmed before we pack.' },
        { h: 'How to order', p: 'Call the hotline or message Zalo +84 707 796 663 with your list. Staff pack the order and confirm the total before dispatch.' },
        { h: 'Check on arrival', p: 'Please inspect the goods before paying cash on delivery. If anything is missing or damaged, refuse that item and tell the driver immediately.' },
      ],
    },
    {
      id: 'warranty',
      slug: 'bao-hanh',
      title: 'Appliance warranty',
      updatedAt: UPDATED,
      blocks: [
        { h: 'Warranty period', p: 'Household electric appliances carry a 12-month manufacturer warranty from the invoice date.' },
        { h: 'What is covered', p: 'Manufacturing faults: motors, control panels, circuitry, electrical leakage. Not covered: cut cords, cracked housings from drops, or water-damaged units.' },
        { h: 'How to claim', p: 'Bring the product and receipt to the customer service counter, or call the hotline for guidance. Typical turnaround is 3–10 business days.' },
      ],
    },
    {
      id: 'privacy',
      slug: 'bao-mat',
      title: 'Privacy policy',
      updatedAt: UPDATED,
      blocks: [
        { h: 'What we collect', p: 'Name, phone number and delivery address — only what we need to process and deliver your order.' },
        { h: 'How we use it', p: 'To confirm orders, deliver goods, and handle returns and warranty claims. We do not sell or share customer data with third parties for advertising.' },
        { h: 'Retention and your rights', p: 'Order records are kept for up to 24 months for warranty and accounting purposes. You may request access, correction or deletion by calling the hotline.' },
      ],
    },
    {
      id: 'complaint',
      slug: 'khieu-nai',
      title: 'Complaint handling',
      updatedAt: UPDATED,
      blocks: [
        { h: 'How to reach us', p: 'Call +84 707 796 663, message the same number on Zalo, or visit the customer service counter during opening hours.' },
        { h: 'Response time', p: 'First response within 24 business hours. Cases needing supplier checks are resolved within 7 business days.' },
        { h: 'Our commitment', p: 'Every complaint is logged with a tracking code and answered with a concrete resolution — exchange, refund or warranty repair.' },
      ],
    },
  ],
};

export const DEFAULT_POLICY_SLUG = 'doi-tra';

/** Look a policy up by URL slug, falling back to the first document. */
export function getPolicy(lang, slug) {
  const list = policies[lang] || policies.vi;
  return list.find((p) => p.slug === slug) || list[0];
}

export function policyList(lang) {
  return policies[lang] || policies.vi;
}
