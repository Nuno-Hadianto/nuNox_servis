const saleController = require('../controllers/saleController');
const saleRepository = require('../repositories/saleRepository');
const partRepository = require('../repositories/partRepository');

jest.mock('../repositories/saleRepository');
jest.mock('../repositories/partRepository');

describe('Sale Controller (POS)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should throw error if cart is empty', () => {
        expect(() => {
            saleController.createSale({ customer_name: 'John' }, []);
        }).toThrow("Keranjang belanja kosong");
        
        expect(() => {
            saleController.createSale({ customer_name: 'John' }, null);
        }).toThrow("Keranjang belanja kosong");
    });

    test('should throw error if part not found', () => {
        partRepository.getPartById.mockReturnValue(null);
        
        expect(() => {
            saleController.createSale({}, [{ spare_part_id: 1, quantity: 1, price: 100 }]);
        }).toThrow("Sparepart ID 1 tidak ditemukan");
    });

    test('should throw error if stock is insufficient', () => {
        partRepository.getPartById.mockReturnValue({ id: 1, name: 'Baterai', stock: 2 });
        
        expect(() => {
            saleController.createSale({}, [{ spare_part_id: 1, quantity: 3, price: 100 }]);
        }).toThrow("Stok tidak cukup untuk Baterai. Sisa stok: 2");
    });

    test('should calculate total and create sale successfully', () => {
        partRepository.getPartById.mockReturnValue({ id: 1, name: 'Baterai', stock: 10 });
        saleRepository.createSale.mockReturnValue(123);

        const saleData = { customer_name: 'Jane', payment_method: 'Tunai' };
        const items = [{ spare_part_id: 1, quantity: 2, price: 50000 }];

        const result = saleController.createSale(saleData, items);

        expect(result).toBe(123);
        
        expect(saleRepository.createSale).toHaveBeenCalledWith(
            expect.objectContaining({
                customer_name: 'Jane',
                total_amount: 100000,
                invoice_number: expect.stringMatching(/^INV-\d{8}-\d{4}$/)
            }),
            items
        );
    });
});
