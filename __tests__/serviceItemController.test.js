const db = require('../database/db').default;
const serviceItemController = require('../controllers/serviceItemController');
const partController = require('../controllers/partController');
const serviceController = require('../controllers/serviceController');
const customerController = require('../controllers/customerController');
const deviceController = require('../controllers/deviceController');

describe('serviceItemController (White-box testing)', () => {
    let testServiceId;
    let testPartId;

    beforeAll(() => {
        // Prepare dummy relational data
        const customerId = customerController.addCustomer({name: 'Test Customer', phone: '123'});
        const deviceId = deviceController.addDevice({customer_id: customerId, device_type: 'Laptop', brand: 'Asus'});
        
        // Add a service order
        testServiceId = serviceController.addService({
            customer_id: customerId,
            device_id: deviceId,
            customer_complaint: 'Rusak',

        });
    });

    beforeEach(() => {
        db.exec('DELETE FROM service_items');
        db.exec('DELETE FROM spare_parts');
        // Reset service total cost
        db.prepare('UPDATE service_orders SET total_cost = 0 WHERE id = ?').run(testServiceId);

        // Add a test sparepart
        testPartId = partController.addPart({
            part_code: 'P-TEST', name: 'Test Part', category: 'Sparepart', buy_price: 50000, sell_price: 100000, unit: 'Pcs', notes: ''     });
    });

    test('addServiceItem should insert an item and update total_cost of service_order', () => {
        const itemData = {
            service_order_id: testServiceId,
            item_type: 'Jasa',
            description: 'Instal Ulang OS',
            quantity: 1,
            price: 150000,
            spare_part_id: null
        };

        const result = serviceItemController.addServiceItem(itemData);
        expect(typeof result).toBe('number');

        // Check items
        const items = serviceItemController.getServiceItems(testServiceId);
        expect(items.length).toBe(1);
        expect(items[0].total).toBe(150000);

        // Check if total_cost in service_orders is updated
        const service = serviceController.getServiceById(testServiceId);
        expect(service.total_cost).toBe(150000);
    });

    test('addServiceItem of type Sparepart should reduce part stock', () => {
        const itemData = {
            service_order_id: testServiceId,
            item_type: 'Sparepart',
            description: 'Ganti Test Part',
            quantity: 2,
            price: 100000,
            spare_part_id: testPartId
        };

        serviceItemController.addServiceItem(itemData);

        // Check if total cost is updated (2 * 100000 = 200000)
        const service = serviceController.getServiceById(testServiceId);
        expect(service.total_cost).toBe(200000);
    });

    test('deleteServiceItem of type Sparepart should return stock', () => {
        const itemData = {
            service_order_id: testServiceId,
            item_type: 'Sparepart',
            description: 'Ganti Test Part',
            quantity: 3,
            price: 100000,
            spare_part_id: testPartId
        };

        const addResult = serviceItemController.addServiceItem(itemData);
        
        // Delete the item
        serviceItemController.deleteServiceItem(addResult);

        // Service total should be back to 0
        const service = serviceController.getServiceById(testServiceId);
        expect(service.total_cost).toBe(0);
    });
});
