/**
 * data.js - Cơ sở dữ liệu 63 tỉnh thành Việt Nam, bức xạ mặt trời, biểu giá điện và thiết bị
 */

// Đầy đủ 63 tỉnh thành Việt Nam với số liệu bức xạ trung bình năm (kWh/m²/ngày) và xã/phường tiêu biểu
export const PROVINCES_DATA = [
  // 1. Thành phố trực thuộc Trung ương & Miền Trung
  {
    id: "danang",
    name: "Đà Nẵng",
    defaultRadiation: 4.12,
    region: "central",
    wards: [
      { name: "Phường Ngũ Hành Sơn", radiation: 4.12 },
      { name: "Xã Nam Phước", radiation: 4.12 },
      { name: "Phường Hải Châu 1", radiation: 4.15 },
      { name: "Phường Thạch Thang", radiation: 4.14 },
      { name: "Phường Hòa Cường Bắc", radiation: 4.13 },
      { name: "Phường An Hải Bắc", radiation: 4.16 },
      { name: "Phường Mỹ An", radiation: 4.17 },
      { name: "Phường Khuê Trung", radiation: 4.13 },
      { name: "Xã Hòa Tiến", radiation: 4.11 },
      { name: "Xã Hòa Vang", radiation: 4.10 },
      { name: "Phường Hòa Khánh Bắc", radiation: 4.12 }
    ],
    monthlyFactors: [0.658, 0.825, 1.072, 1.224, 1.375, 1.309, 1.287, 1.208, 1.042, 0.829, 0.638, 0.535]
  },
  {
    id: "hanoi",
    name: "Hà Nội",
    defaultRadiation: 3.85,
    region: "north",
    wards: [
      { name: "Phường Thạch Bàn (Long Biên)", radiation: 3.86 },
      { name: "Phường Bồ Đề (Long Biên)", radiation: 3.85 },
      { name: "Phường Hàng Trống (Hoàn Kiếm)", radiation: 3.84 },
      { name: "Phường Dịch Vọng (Cầu Giấy)", radiation: 3.85 },
      { name: "Xã An Khánh (Hoài Đức)", radiation: 3.87 },
      { name: "Phường Mộ Lao (Hà Đông)", radiation: 3.86 }
    ],
    monthlyFactors: [0.62, 0.58, 0.72, 0.96, 1.32, 1.41, 1.36, 1.26, 1.14, 1.03, 0.88, 0.72]
  },
  {
    id: "hcm",
    name: "TP. Hồ Chí Minh",
    defaultRadiation: 4.80,
    region: "south",
    wards: [
      { name: "Phường Bến Nghé (Quận 1)", radiation: 4.82 },
      { name: "Phường Thảo Điền (TP Thủ Đức)", radiation: 4.85 },
      { name: "Phường Hiệp Phú (TP Thủ Đức)", radiation: 4.83 },
      { name: "Xã Tân Nhựt (Bình Chánh)", radiation: 4.80 },
      { name: "Phường Tân Phong (Quận 7)", radiation: 4.81 }
    ],
    monthlyFactors: [1.02, 1.11, 1.19, 1.14, 0.98, 0.89, 0.87, 0.86, 0.85, 0.92, 1.01, 1.02]
  },
  {
    id: "haiphong",
    name: "Hải Phòng",
    defaultRadiation: 3.88,
    region: "north",
    wards: [
      { name: "Phường Hoàng Văn Thụ (Hồng Bàng)", radiation: 3.88 },
      { name: "Quận Ngô Quyền", radiation: 3.87 },
      { name: "Huyện Thủy Nguyên", radiation: 3.89 }
    ],
    monthlyFactors: [0.62, 0.58, 0.72, 0.96, 1.32, 1.41, 1.36, 1.26, 1.14, 1.03, 0.88, 0.72]
  },
  {
    id: "cantho",
    name: "Cần Thơ",
    defaultRadiation: 4.65,
    region: "south",
    wards: [
      { name: "Quận Ninh Kiều", radiation: 4.68 },
      { name: "Quận Cái Răng", radiation: 4.65 },
      { name: "Quận Bình Thủy", radiation: 4.66 }
    ],
    monthlyFactors: [1.00, 1.10, 1.18, 1.12, 0.96, 0.88, 0.88, 0.87, 0.86, 0.94, 1.04, 1.01]
  },
  // Các tỉnh Miền Bắc
  {
    id: "quangninh",
    name: "Quảng Ninh",
    defaultRadiation: 3.86,
    region: "north",
    wards: [{ name: "TP. Hạ Long", radiation: 3.88 }, { name: "TP. Cẩm Phả", radiation: 3.85 }, { name: "TP. Uông Bí", radiation: 3.86 }]
  },
  {
    id: "bacninh",
    name: "Bắc Ninh",
    defaultRadiation: 3.85,
    region: "north",
    wards: [{ name: "TP. Bắc Ninh", radiation: 3.86 }, { name: "Thị xã Từ Sơn", radiation: 3.85 }, { name: "Huyện Yên Phong", radiation: 3.86 }]
  },
  {
    id: "bacgiang",
    name: "Bắc Giang",
    defaultRadiation: 3.87,
    region: "north",
    wards: [{ name: "TP. Bắc Giang", radiation: 3.87 }, { name: "Huyện Việt Yên", radiation: 3.88 }]
  },
  {
    id: "haiduong",
    name: "Hải Dương",
    defaultRadiation: 3.86,
    region: "north",
    wards: [{ name: "TP. Hải Dương", radiation: 3.86 }, { name: "Thị xã Chí Linh", radiation: 3.87 }]
  },
  {
    id: "hungyen",
    name: "Hưng Yên",
    defaultRadiation: 3.85,
    region: "north",
    wards: [{ name: "TP. Hưng Yên", radiation: 3.85 }, { name: "Huyện Văn Giang", radiation: 3.86 }]
  },
  {
    id: "hanam",
    name: "Hà Nam",
    defaultRadiation: 3.82,
    region: "north",
    wards: [{ name: "TP. Phủ Lý", radiation: 3.82 }, { name: "Thị xã Duy Tiên", radiation: 3.83 }]
  },
  {
    id: "namdinh",
    name: "Nam Định",
    defaultRadiation: 3.80,
    region: "north",
    wards: [{ name: "TP. Nam Định", radiation: 3.80 }, { name: "Huyện Hải Hậu", radiation: 3.82 }]
  },
  {
    id: "thaibinh",
    name: "Thái Bình",
    defaultRadiation: 3.82,
    region: "north",
    wards: [{ name: "TP. Thái Bình", radiation: 3.82 }, { name: "Huyện Tiền Hải", radiation: 3.84 }]
  },
  {
    id: "ninhbinh",
    name: "Ninh Bình",
    defaultRadiation: 3.84,
    region: "north",
    wards: [{ name: "TP. Ninh Bình", radiation: 3.84 }, { name: "TP. Tam Điệp", radiation: 3.85 }]
  },
  {
    id: "vinhphuc",
    name: "Vĩnh Phúc",
    defaultRadiation: 3.86,
    region: "north",
    wards: [{ name: "TP. Vĩnh Yên", radiation: 3.86 }, { name: "TP. Phúc Yên", radiation: 3.87 }]
  },
  {
    id: "phutho",
    name: "Phú Thọ",
    defaultRadiation: 3.85,
    region: "north",
    wards: [{ name: "TP. Việt Trì", radiation: 3.85 }, { name: "Thị xã Phú Thọ", radiation: 3.86 }]
  },
  {
    id: "thainguyen",
    name: "Thái Nguyên",
    defaultRadiation: 3.88,
    region: "north",
    wards: [{ name: "TP. Thái Nguyên", radiation: 3.88 }, { name: "TP. Sông Công", radiation: 3.89 }]
  },
  {
    id: "tuyenquang",
    name: "Tuyên Quang",
    defaultRadiation: 3.86,
    region: "north",
    wards: [{ name: "TP. Tuyên Quang", radiation: 3.86 }]
  },
  {
    id: "hagiang",
    name: "Hà Giang",
    defaultRadiation: 3.75,
    region: "north",
    wards: [{ name: "TP. Hà Giang", radiation: 3.75 }]
  },
  {
    id: "caobang",
    name: "Cao Bằng",
    defaultRadiation: 3.78,
    region: "north",
    wards: [{ name: "TP. Cao Bằng", radiation: 3.78 }]
  },
  {
    id: "backan",
    name: "Bắc Kạn",
    defaultRadiation: 3.80,
    region: "north",
    wards: [{ name: "TP. Bắc Kạn", radiation: 3.80 }]
  },
  {
    id: "langson",
    name: "Lạng Sơn",
    defaultRadiation: 3.82,
    region: "north",
    wards: [{ name: "TP. Lạng Sơn", radiation: 3.82 }]
  },
  {
    id: "laocai",
    name: "Lào Cai",
    defaultRadiation: 3.85,
    region: "north",
    wards: [{ name: "TP. Lào Cai", radiation: 3.85 }, { name: "Thị xã Sa Pa", radiation: 3.82 }]
  },
  {
    id: "yenbai",
    name: "Yên Bái",
    defaultRadiation: 3.82,
    region: "north",
    wards: [{ name: "TP. Yên Bái", radiation: 3.82 }]
  },
  {
    id: "dienbien",
    name: "Điện Biên",
    defaultRadiation: 4.10,
    region: "northwest",
    wards: [{ name: "TP. Điện Biên Phủ", radiation: 4.10 }]
  },
  {
    id: "laichau",
    name: "Lai Châu",
    defaultRadiation: 3.90,
    region: "northwest",
    wards: [{ name: "TP. Lai Châu", radiation: 3.90 }]
  },
  {
    id: "sonla",
    name: "Sơn La",
    defaultRadiation: 4.15,
    region: "northwest",
    wards: [{ name: "TP. Sơn La", radiation: 4.15 }, { name: "Huyện Mộc Châu", radiation: 4.12 }]
  },
  {
    id: "hoabinh",
    name: "Hòa Bình",
    defaultRadiation: 3.90,
    region: "north",
    wards: [{ name: "TP. Hòa Bình", radiation: 3.90 }]
  },
  // Các tỉnh Bắc Trung Bộ & Duyên hải Miền Trung
  {
    id: "thanhhoa",
    name: "Thanh Hóa",
    defaultRadiation: 3.95,
    region: "central",
    wards: [{ name: "TP. Thanh Hóa", radiation: 3.95 }, { name: "TP. Sầm Sơn", radiation: 3.98 }]
  },
  {
    id: "nghean",
    name: "Nghệ An",
    defaultRadiation: 4.05,
    region: "central",
    wards: [{ name: "TP. Vinh", radiation: 4.05 }, { name: "Thị xã Cửa Lò", radiation: 4.08 }]
  },
  {
    id: "hatinh",
    name: "Hà Tĩnh",
    defaultRadiation: 4.10,
    region: "central",
    wards: [{ name: "TP. Hà Tĩnh", radiation: 4.10 }, { name: "Thị xã Kỳ Anh", radiation: 4.15 }]
  },
  {
    id: "quangbinh",
    name: "Quảng Bình",
    defaultRadiation: 4.15,
    region: "central",
    wards: [{ name: "TP. Đồng Hới", radiation: 4.15 }]
  },
  {
    id: "quangtri",
    name: "Quảng Trị",
    defaultRadiation: 4.18,
    region: "central",
    wards: [{ name: "TP. Đông Hà", radiation: 4.18 }]
  },
  {
    id: "hue",
    name: "Thừa Thiên Huế",
    defaultRadiation: 4.15,
    region: "central",
    wards: [{ name: "TP. Huế", radiation: 4.15 }, { name: "Thị xã Hương Thủy", radiation: 4.16 }]
  },
  {
    id: "quangnam",
    name: "Quảng Nam",
    defaultRadiation: 4.20,
    region: "central",
    wards: [
      { name: "Phường Minh An (Hội An)", radiation: 4.25 },
      { name: "Phường An Mỹ (Tam Kỳ)", radiation: 4.20 },
      { name: "Xã Duy Sơn (Duy Xuyên)", radiation: 4.18 }
    ],
    monthlyFactors: [0.66, 0.83, 1.07, 1.22, 1.38, 1.31, 1.29, 1.21, 1.04, 0.83, 0.64, 0.54]
  },
  {
    id: "quangngai",
    name: "Quảng Ngãi",
    defaultRadiation: 4.35,
    region: "central",
    wards: [{ name: "TP. Quảng Ngãi", radiation: 4.35 }]
  },
  {
    id: "binhdinh",
    name: "Bình Định",
    defaultRadiation: 4.65,
    region: "central",
    wards: [
      { name: "Phường Quy Nhơn", radiation: 4.68 },
      { name: "Thị xã An Nhơn", radiation: 4.62 }
    ],
    monthlyFactors: [0.80, 0.95, 1.12, 1.25, 1.30, 1.22, 1.18, 1.15, 1.00, 0.78, 0.65, 0.60]
  },
  {
    id: "phuyen",
    name: "Phú Yên",
    defaultRadiation: 4.80,
    region: "south_central",
    wards: [{ name: "TP. Tuy Hòa", radiation: 4.80 }, { name: "Thị xã Sông Cầu", radiation: 4.82 }]
  },
  {
    id: "khanhhoa",
    name: "Khánh Hòa",
    defaultRadiation: 4.90,
    region: "south_central",
    wards: [
      { name: "Phường Lộc Thọ (Nha Trang)", radiation: 4.95 },
      { name: "Thị xã Cam Ranh", radiation: 4.92 }
    ],
    monthlyFactors: [0.88, 1.05, 1.20, 1.25, 1.22, 1.15, 1.12, 1.10, 0.95, 0.75, 0.65, 0.68]
  },
  {
    id: "ninhthuan",
    name: "Ninh Thuận",
    defaultRadiation: 5.20,
    region: "south_central",
    wards: [{ name: "TP. Phan Rang - Tháp Chàm", radiation: 5.25 }, { name: "Huyện Ninh Hải", radiation: 5.20 }]
  },
  {
    id: "binhthuan",
    name: "Bình Thuận",
    defaultRadiation: 5.10,
    region: "south_central",
    wards: [{ name: "TP. Phan Thiết", radiation: 5.10 }, { name: "Thị xã La Gi", radiation: 5.12 }]
  },
  // Các tỉnh Tây Nguyên
  {
    id: "kontum",
    name: "Kon Tum",
    defaultRadiation: 4.70,
    region: "highlands",
    wards: [{ name: "TP. Kon Tum", radiation: 4.70 }]
  },
  {
    id: "gialai",
    name: "Gia Lai",
    defaultRadiation: 4.85,
    region: "highlands",
    wards: [{ name: "TP. Pleiku", radiation: 4.85 }, { name: "Thị xã An Khê", radiation: 4.82 }]
  },
  {
    id: "daklak",
    name: "Đắk Lắk",
    defaultRadiation: 4.90,
    region: "highlands",
    wards: [{ name: "TP. Buôn Ma Thuột", radiation: 4.90 }, { name: "Thị xã Buôn Hồ", radiation: 4.88 }]
  },
  {
    id: "daknong",
    name: "Đắk Nông",
    defaultRadiation: 4.80,
    region: "highlands",
    wards: [{ name: "TP. Gia Nghĩa", radiation: 4.80 }]
  },
  {
    id: "lamdong",
    name: "Lâm Đồng",
    defaultRadiation: 4.65,
    region: "highlands",
    wards: [{ name: "TP. Đà Lạt", radiation: 4.60 }, { name: "TP. Bảo Lộc", radiation: 4.68 }]
  },
  // Các tỉnh Đông Nam Bộ
  {
    id: "binhduong",
    name: "Bình Dương",
    defaultRadiation: 4.75,
    region: "south",
    wards: [
      { name: "Phường Thủ Dầu Một", radiation: 4.78 },
      { name: "Phường Dĩ An", radiation: 4.76 },
      { name: "Phường Thuận An", radiation: 4.75 }
    ],
    monthlyFactors: [1.02, 1.11, 1.19, 1.14, 0.98, 0.89, 0.87, 0.86, 0.85, 0.92, 1.01, 1.02]
  },
  {
    id: "dongnai",
    name: "Đồng Nai",
    defaultRadiation: 4.70,
    region: "south",
    wards: [
      { name: "Phường Biên Hòa", radiation: 4.72 },
      { name: "Huyện Long Thành", radiation: 4.70 }
    ],
    monthlyFactors: [1.02, 1.11, 1.19, 1.14, 0.98, 0.89, 0.87, 0.86, 0.85, 0.92, 1.01, 1.02]
  },
  {
    id: "bariavungtau",
    name: "Bà Rịa - Vũng Tàu",
    defaultRadiation: 4.85,
    region: "south",
    wards: [{ name: "TP. Vũng Tàu", radiation: 4.88 }, { name: "TP. Bà Rịa", radiation: 4.85 }, { name: "Thị xã Phú Mỹ", radiation: 4.86 }]
  },
  {
    id: "tayninh",
    name: "Tây Ninh",
    defaultRadiation: 4.85,
    region: "south",
    wards: [{ name: "TP. Tây Ninh", radiation: 4.85 }, { name: "Thị xã Trảng Bàng", radiation: 4.86 }]
  },
  {
    id: "binhphuoc",
    name: "Bình Phước",
    defaultRadiation: 4.80,
    region: "south",
    wards: [{ name: "TP. Đồng Xoài", radiation: 4.80 }, { name: "Thị xã Chơn Thành", radiation: 4.82 }]
  },
  // Các tỉnh Đồng bằng Sông Cửu Long (Tây Nam Bộ)
  {
    id: "longan",
    name: "Long An",
    defaultRadiation: 4.75,
    region: "south",
    wards: [{ name: "TP. Tân An", radiation: 4.75 }, { name: "Huyện Bến Lức", radiation: 4.76 }]
  },
  {
    id: "tiengiang",
    name: "Tiền Giang",
    defaultRadiation: 4.70,
    region: "south",
    wards: [{ name: "TP. Mỹ Tho", radiation: 4.70 }, { name: "Thị xã Gò Công", radiation: 4.72 }]
  },
  {
    id: "bentre",
    name: "Bến Tre",
    defaultRadiation: 4.68,
    region: "south",
    wards: [{ name: "TP. Bến Tre", radiation: 4.68 }]
  },
  {
    id: "travinh",
    name: "Trà Vinh",
    defaultRadiation: 4.65,
    region: "south",
    wards: [{ name: "TP. Trà Vinh", radiation: 4.65 }]
  },
  {
    id: "vinhlong",
    name: "Vĩnh Long",
    defaultRadiation: 4.68,
    region: "south",
    wards: [{ name: "TP. Vĩnh Long", radiation: 4.68 }]
  },
  {
    id: "dongthap",
    name: "Đồng Tháp",
    defaultRadiation: 4.72,
    region: "south",
    wards: [{ name: "TP. Cao Lãnh", radiation: 4.72 }, { name: "TP. Sa Đéc", radiation: 4.70 }]
  },
  {
    id: "angiang",
    name: "An Giang",
    defaultRadiation: 4.80,
    region: "south",
    wards: [{ name: "TP. Long Xuyên", radiation: 4.80 }, { name: "TP. Châu Đốc", radiation: 4.82 }]
  },
  {
    id: "kiengiang",
    name: "Kiên Giang",
    defaultRadiation: 4.78,
    region: "south",
    wards: [{ name: "TP. Rạch Giá", radiation: 4.78 }, { name: "TP. Phú Quốc", radiation: 4.85 }]
  },
  {
    id: "haugiang",
    name: "Hậu Giang",
    defaultRadiation: 4.62,
    region: "south",
    wards: [{ name: "TP. Vị Thanh", radiation: 4.62 }]
  },
  {
    id: "soctrang",
    name: "Sóc Trăng",
    defaultRadiation: 4.65,
    region: "south",
    wards: [{ name: "TP. Sóc Trăng", radiation: 4.65 }]
  },
  {
    id: "baclieu",
    name: "Bạc Liêu",
    defaultRadiation: 4.70,
    region: "south",
    wards: [{ name: "TP. Bạc Liêu", radiation: 4.70 }]
  },
  {
    id: "camau",
    name: "Cà Mau",
    defaultRadiation: 4.65,
    region: "south",
    wards: [{ name: "TP. Cà Mau", radiation: 4.65 }, { name: "Huyện Năm Căn", radiation: 4.68 }]
  }
];

// Biểu giá điện EVN 2024 - 2026 (chưa VAT và kèm VAT 8%)
export const TARIFF_RATES = {
  residential: {
    name: "Sinh hoạt (bậc thang)",
    tiers: [
      { max: 50, price: 1893 },
      { max: 100, price: 1956 },
      { max: 200, price: 2271 },
      { max: 300, price: 2860 },
      { max: 400, price: 3197 },
      { max: Infinity, price: 3302 }
    ],
    vat: 0.08
  },
  commercial: {
    name: "Kinh doanh (theo giờ)",
    normal: 2998,
    peak: 4937,
    offPeak: 1799,
    vat: 0.08,
    effectiveDayRate: 3650
  },
  industrial: {
    name: "Sản xuất (theo giờ)",
    normal: 1754,
    peak: 3314,
    offPeak: 1144,
    vat: 0.08,
    effectiveDayRate: 2150
  },
  flat: {
    name: "Điện một giá",
    price: 2450,
    vat: 0.08,
    effectiveDayRate: 2450
  }
};

// Hệ số góc hướng (Azimuth) tại Việt Nam
export const ORIENTATION_FACTORS = {
  "Nam": 1.00,
  "Đông Nam": 0.97,
  "Tây Nam": 0.97,
  "Đông": 0.91,
  "Tây": 0.91,
  "Đông Bắc": 0.87,
  "Tây Bắc": 0.87,
  "Bắc": 0.84
};

// Loại mái & độ dốc chuẩn xác theo ảnh cung cấp (Ảnh 4)
export const ROOF_TYPES = [
  {
    id: "metal",
    name: "Mái tôn (rail nhôm)",
    defaultTilt: 10,
    mountingType: "Chân L thường + Rail nhôm 28×50",
    costPerKwp: 18600000
  },
  {
    id: "mini_rail",
    name: "Mái tôn (mini rail)",
    defaultTilt: 10,
    mountingType: "Mini Rail nhôm bắn trực tiếp sóng tôn",
    costPerKwp: 17800000
  },
  {
    id: "seam_clip",
    name: "Mái tôn seam/clip (khoá đứng)",
    defaultTilt: 10,
    mountingType: "Kẹp Klip-lok / Seam-lock không khoan thủng mái",
    costPerKwp: 19500000
  },
  {
    id: "tile",
    name: "Mái ngói",
    defaultTilt: 30,
    mountingType: "Móc ngói inox 304 + Rail nhôm chuyên dụng",
    costPerKwp: 20800000
  },
  {
    id: "concrete_steel",
    name: "Mái bằng / bê tông (dựng khung sắt)",
    defaultTilt: 10,
    mountingType: "Khung sắt hộp mạ kẽm 30×60×1.4, chân đổ bê tông",
    costPerKwp: 21500000
  }
];

// Danh mục Hãng tấm pin chuẩn xác theo ảnh cung cấp (Ảnh 5)
export const PANEL_CATALOG = [
  {
    brand: "CAS_Energy tự chọn",
    fullName: "CAS_Energy tự chọn",
    model: "CAS-BiHiKu-635",
    powerWp: 635,
    spec: "635Wp · N-TOPCon · 2 mặt kính · hiệu suất ~23.5%",
    areaPerPanel: 2.701
  },
  {
    brand: "Aiko",
    fullName: "Aiko Solar",
    model: "Neostar 2S+ 620W",
    powerWp: 620,
    spec: "620Wp · Công nghệ ABC độc quyền · hiệu suất 23.8% đỉnh cao",
    areaPerPanel: 2.65
  },
  {
    brand: "Astronergy",
    fullName: "Astronergy",
    model: "CHSM72N-HC-635",
    powerWp: 635,
    spec: "635Wp · N-TOPCon · 2 mặt kính · hiệu suất ~23.4%",
    areaPerPanel: 2.70
  },
  {
    brand: "Canadian",
    fullName: "Canadian Solar",
    model: "CS6.2-66TB-635",
    powerWp: 635,
    spec: "635Wp · N-TOPCon · hiệu suất ~23.5% · 2.701m²/tấm · TOPBiHiKu6 CS6",
    areaPerPanel: 2.701
  },
  {
    brand: "Chint Astronergy",
    fullName: "Chint Astronergy",
    model: "ASTRO N5 580W",
    powerWp: 580,
    spec: "580Wp · N-type TOPCon · hiệu suất 22.8%",
    areaPerPanel: 2.58
  },
  {
    brand: "JA Solar",
    fullName: "JA Solar",
    model: "DeepBlue 4.0 Pro 630W",
    powerWp: 630,
    spec: "630Wp · N-type Bycium+ cell · hiệu suất 23.2%",
    areaPerPanel: 2.68
  },
  {
    brand: "Jinko",
    fullName: "Jinko Solar",
    model: "Tiger Neo 620",
    powerWp: 620,
    spec: "620Wp · N-Type TOPCon · SMBB Technology · hiệu suất 23.0%",
    areaPerPanel: 2.65
  },
  {
    brand: "LONGi",
    fullName: "LONGi Solar",
    model: "Hi-MO X6 630",
    powerWp: 630,
    spec: "630Wp · HPBC 2.0 thế hệ mới · hiệu suất ~23.2% · 2.68m²/tấm",
    areaPerPanel: 2.68
  },
  {
    brand: "Trina",
    fullName: "Trina Solar",
    model: "Vertex N 695W",
    powerWp: 695,
    spec: "695Wp · 210mm N-TOPCon · công suất siêu cao · hiệu suất 23.1%",
    areaPerPanel: 2.95
  }
];

// Danh mục Hãng Inverter chuẩn xác theo ảnh cung cấp (Ảnh 6)
export const INVERTER_CATALOG = [
  {
    brand: "CAS_Energy tự chọn",
    models: [
      { name: "Inverter CAS-Smart-5K", powerKw: 5, phase: 1, desc: "5kW · 1 pha · Chuẩn bảo hành 5 năm chính hãng" },
      { name: "Inverter CAS-Smart-5K3P", powerKw: 5, phase: 3, desc: "5kW · 3 pha · Chuẩn bảo hành 5 năm chính hãng" }
    ]
  },
  {
    brand: "SOLIS",
    models: [
      { name: "Inverter S6-EH1P5K-L-PLUS (SOLIS)", powerKw: 5, phase: 1, desc: "5.0kW · 1 pha · Hybrid áp thấp (LV) · 2 MPPT · Hybrid 1 pha — nhà" },
      { name: "Inverter S6-EH1P6K-L-PLUS (SOLIS)", powerKw: 6, phase: 1, desc: "6.0kW · 1 pha · Hybrid áp thấp (LV) · 2 MPPT" },
      { name: "Inverter S6-EH3P10K-H (SOLIS)", powerKw: 10, phase: 3, desc: "10kW · 3 pha · Hybrid áp cao (HV) · 2 MPPT" }
    ]
  },
  {
    brand: "DEYE",
    models: [
      { name: "Inverter Deye SUN-5K-SG03LP1", powerKw: 5, phase: 1, desc: "5kW · 1 pha · Hybrid áp thấp (LV) · Cổng máy phát thông minh" },
      { name: "Inverter Deye SUN-8K-SG04LP3", powerKw: 8, phase: 3, desc: "8kW · 3 pha · Hybrid áp thấp (LV)" },
      { name: "Inverter Deye SUN-10K-SG04LP3", powerKw: 10, phase: 3, desc: "10kW · 3 pha · Hybrid áp thấp (LV)" },
      { name: "Inverter Deye SUN-12K-SG04LP3", powerKw: 12, phase: 3, desc: "12kW · 3 pha · Hybrid áp thấp (LV)" }
    ]
  },
  {
    brand: "SOLAX",
    models: [
      { name: "Inverter SolaX X1-Hybrid-5.0-D", powerKw: 5, phase: 1, desc: "5kW · 1 pha · Hybrid cao cấp thế hệ 4 · Hiệu suất 97.6%" },
      { name: "Inverter SolaX X3-Hybrid-10.0-D", powerKw: 10, phase: 3, desc: "10kW · 3 pha · Hybrid áp cao 10kW · 2 MPPT" }
    ]
  },
  {
    brand: "SUNGROW",
    models: [
      { name: "Inverter Sungrow SH5.0RS", powerKw: 5, phase: 1, desc: "5kW · 1 pha · Hybrid gia đình cao cấp" },
      { name: "Inverter Sungrow SH10RT", powerKw: 10, phase: 3, desc: "10kW · 3 pha · Hybrid 3 pha dự phòng 100% mất điện" }
    ]
  },
  {
    brand: "HUAWEI",
    models: [
      { name: "Inverter SUN2000-5KTL-L1 (HUAWEI)", powerKw: 5, phase: 1, desc: "5kW · 1 pha · Sẵn sàng Hybrid (Battery Ready)" },
      { name: "Inverter SUN2000-5KTL-M1 (HUAWEI)", powerKw: 5, phase: 3, desc: "5kW · 3 pha · Hoà lưới (không lưu trữ) · 2 MPPT" },
      { name: "Inverter SUN2000-10KTL-M1 (HUAWEI)", powerKw: 10, phase: 3, desc: "10kW · 3 pha · Sẵn sàng lưu trữ LUNA2000" },
      { name: "Inverter SUN2000-30K-MC0 (HUAWEI)", powerKw: 30, phase: 3, desc: "30kW · 3 pha · Hoà lưới (không lưu trữ) · 4 MPPT · MC0 thay KTL-M3" }
    ]
  }
];
