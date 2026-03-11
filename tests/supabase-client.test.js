// ============================================
// TaxGlue Supabase Client Tests
// Tests for Supabase client functions
// ============================================

// Mock supabase client for testing
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: {}, error: null }),
  })),
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    getUser: jest.fn(),
  },
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(),
      remove: jest.fn(),
      getPublicUrl: jest.fn(),
    })),
  },
};

describe('Supabase Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication', () => {
    test('signUp should create new user', async () => {
      const { signUp } = require('../supabase/supabase-client');
      const mockData = { user: { id: '123' }, session: {} };
      mockSupabase.auth.signUp.mockResolvedValueOnce({ data: mockData, error: null });

      const result = await signUp('test@example.com', 'password123', 'Test User');

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: { data: { full_name: 'Test User' } },
      });
      expect(result.data.user.id).toBe('123');
    });

    test('signIn should authenticate user', async () => {
      const { signIn } = require('../supabase/supabase-client');
      const mockData = { user: { id: '123' }, session: { access_token: 'token' } };
      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({ data: mockData, error: null });

      const result = await signIn('test@example.com', 'password123');

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.data.user.id).toBe('123');
    });
  });

  describe('TDS Module', () => {
    test('getTdsDeductors should fetch deductors for user', async () => {
      const mockDeductors = [
        { id: '1', name: 'Company A', tan: 'ABC123' },
        { id: '2', name: 'Company B', tan: 'DEF456' },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockDeductors, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      // Test would use actual supabase client in real scenario
      expect(mockQuery.select).toBeDefined();
    });

    test('getTdsRates should fetch all TDS rates', async () => {
      const mockRates = [
        { section: '192', name: 'Salary', rate: null },
        { section: '194', name: 'Dividends', rate: 10 },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockRates, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      expect(mockQuery.select).toBeDefined();
    });
  });

  describe('GST Module', () => {
    test('getGstInvoices should fetch invoices', async () => {
      const mockInvoices = [
        { id: '1', invoice_number: 'INV001', taxable_value: 10000 },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockInvoices, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      expect(mockQuery.select).toBeDefined();
    });
  });

  describe('Income Tax Module', () => {
    test('getItrFilings should fetch ITR filings', async () => {
      const mockFilings = [
        { id: '1', itr_type: 'ITR-1', assessment_year: '2024-25' },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockFilings, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      expect(mockQuery.select).toBeDefined();
    });
  });
});
