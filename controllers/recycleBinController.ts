import * as recycleBinRepository from '../repositories/recycleBinRepository';

class RecycleBinController {
    getDeletedItems() {
        try {
            return { success: true, data: recycleBinRepository.getDeletedItems() };
        } catch (error) {
            console.error('Error in getDeletedItems:', error);
            return { success: false, error: 'Failed to fetch deleted items' };
        }
    }

    restoreItem(id: number, type: 'customer' | 'device' | 'service' | 'part') {
        try {
            recycleBinRepository.restoreItem(id, type);
            return { success: true, message: 'Item restored successfully' };
        } catch (error) {
            console.error('Error in restoreItem:', error);
            return { success: false, error: 'Failed to restore item' };
        }
    }

    hardDeleteItem(id: number, type: 'customer' | 'device' | 'service' | 'part') {
        try {
            recycleBinRepository.hardDeleteItem(id, type);
            return { success: true, message: 'Item deleted permanently' };
        } catch (error) {
            console.error('Error in hardDeleteItem:', error);
            return { success: false, error: 'Failed to delete item permanently' };
        }
    }
}

export default new RecycleBinController();
