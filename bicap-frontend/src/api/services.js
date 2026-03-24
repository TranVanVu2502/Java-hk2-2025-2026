// Giả lập độ trễ mạng (500ms)
const sleep = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

const mockData = {
  user: { id: 1, name: 'Admin Test', role: 'ADMIN' },
  farm: { id: 'f1', name: 'Nông trại Xanh', location: 'Đà Lạt' },
  season: { id: 's1', name: 'Vụ mùa Xuân 2024', status: 'ACTIVE' }
};

export const authService = {
  login: async (data) => {
    await sleep();
    console.log('Mock Login:', data);
    return { data: { token: 'fake-jwt-token', user: { ...mockData.user, email: data.email } } };
  },
  register: async (data) => {
    await sleep();
    return { data: { message: 'Đăng ký thành công!' } };
  },
  logout: async () => await sleep(),
};

export const adminService = {
  getStats: async () => {
    await sleep();
    return { data: { users: 10, farms: 5, orders: 100 } };
  },
  getAllUsers: async () => {
    await sleep();
    return { data: [mockData.user] };
  },
  toggleLock: async (userId) => {
    await sleep();
    return { data: { message: `Đã thay đổi trạng thái user ${userId}` } };
  },
  getAllFarms: async (status) => {
    await sleep();
    return { data: [mockData.farm] };
  },
  approveFarm: async (id) => await sleep(),
  rejectFarm: async (id, reason) => await sleep(),
};

// FARM
export const farmService = {
  create: async (data) => {
    await sleep();
    return { data: { ...mockData.farm, ...data } };
  },
  getMyFarms: async () => {
    await sleep();
    return { data: [mockData.farm] };
  },
  getById: async (id) => {
    await sleep();
    return { data: mockData.farm };
  },
  update: async (id, data) => await sleep(),
  delete: async (id) => await sleep(),
};

// SEASON
export const seasonService = {
  create: async (farmId, data) => {
    await sleep();
    return { data: { ...mockData.season, ...data, farmId } };
  },
  getByFarm: async (farmId) => {
    await sleep();
    return { data: [mockData.season] };
  },
  getById: async (id) => {
    await sleep();
    return { data: mockData.season };
  },
  update: async (id, data) => await sleep(),
  export: async (id) => {
    await sleep();
    return { data: { downloadUrl: '#' } };
  },
};

// PRODUCT
export const productService = {
  create: async (data) => {
    await sleep();
    return { data: { id: 'p1', ...data } };
  },
  getAll: async (name, page = 0, size = 10) => {
    await sleep();
    return { data: { content: [{ id: 'p1', name: 'Cà chua' }], totalPages: 1 } };
  },
  getById: async (id) => {
    await sleep();
    return { data: { id, name: 'Sản phẩm mẫu' } };
  },
};

// QR
export const qrService = {
  generate: async (productId) => {
    await sleep();
    return { data: { qrCode: `QR-${productId}-${Date.now()}` } };
  },
  lookup: async (code) => {
    await sleep();
    return { data: { product: { name: 'Sản phẩm từ QR' }, origin: 'Nông trại A' } };
  },
};

// ORDER
export const orderService = {
  create: async (data) => {
    await sleep();
return { data: { id: 'ord-123', ...data } };
  },
  getAll: async () => {
    await sleep();
    return { data: [{ id: 'ord-1', total: 500000, status: 'PENDING' }] };
  },
  getById: async (id) => {
    await sleep();
    return { data: { id, status: 'CONFIRMED' } };
  },
  cancel: async (id) => await sleep(),
  confirm: async (id) => await sleep(),
};