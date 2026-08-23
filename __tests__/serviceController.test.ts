const serviceController = require('../controllers/serviceController');
const customerController = require('../controllers/customerController');
const deviceController = require('../controllers/deviceController');

describe('Service Controller', () => {
    let customerId = 0;
    let deviceId = 0;

    beforeAll(() => {
        const customer = customerController.addCustomer({
            name: 'Test Customer',
            phone: '08123456789'
        });
        customerId = customer.lastInsertRowid;

        const device = deviceController.addDevice({
            customer_id: customerId,
            device_type: 'Laptop',
            brand: 'TestBrand',
            model: 'TestModel'
        });
        deviceId = device.lastInsertRowid;
    });

    test('dummy test to clear IDE error', () => {
        expect(customerId).toBeDefined();
        expect(deviceId).toBeDefined();
    });
});
