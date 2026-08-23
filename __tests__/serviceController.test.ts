const serviceController = require('../controllers/serviceController');
const customerController = require('../controllers/customerController');
const deviceController = require('../controllers/deviceController');

describe('Service Controller', () => {
    let customerId;
    let deviceId;

    beforeAll(() => {
        // Create a dummy customer and device to use in service orders
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

    test('should create a new service ticket', () => {
        const result = serviceController.addService({
            customer_id: customerId,
            device_id: deviceId,
            customer_complaint: 'Mati total',
            estimated_cost: 150000,
        });

        expect(result).toBeDefined();
        expect(result.lastInsertRowid).toBeGreaterThan(0);
        
        const service = serviceController.getServiceById(result.lastInsertRowid);
        expect(service).toBeDefined();
        expect(service.customer_complaint).toBe('Mati total');
        expect(service.service_status).toBe('Diterima');
    });

    test('should update service status', () => {
        // Create another one
        const result = serviceController.addService({
            customer_id: customerId,
            device_id: deviceId,
            customer_complaint: 'Layar retak'
        });
        
        const serviceId = result.lastInsertRowid;
        
        serviceController.updateServiceStatus(serviceId, 'Proses Perbaikan', 'Sedang dicek teknisi', 0);
        
        const service = serviceController.getServiceById(serviceId);
        expect(service.service_status).toBe('Proses Perbaikan');
    });
});
