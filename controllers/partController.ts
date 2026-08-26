import { Part } from '../shared/types';
import * as partRepository from '../repositories/partRepository';
import {  SparepartSchema, validateData  } from '../src/utils/validators';

function getParts(searchQuery = '') {
    return partRepository.getParts(searchQuery);
}

function getPartById(id: number | string) {
    return partRepository.getPartById(id);
}

function addPart(data: Part) {
    const validData = validateData(SparepartSchema, data);
    return partRepository.addPart(validData);
}

function updatePart(id: number | string, data: Part) {
    const validData = validateData(SparepartSchema, data);
    return partRepository.updatePart(id, validData);
}

function updatePartStock(id: number | string, change: number) {
    return partRepository.updatePartStock(id, change);
}

function deletePart(id: number | string) {
    const hasServiceItems = partRepository.checkPartHasServiceItems(id);
    if (hasServiceItems) {
        throw new Error("Sparepart tidak bisa dihapus karena sudah tercatat dalam riwayat rincian biaya servis.");
    }
    return partRepository.deletePart(id);
}

function importParts(dataArray: Partial<Part>[]) {
    return partRepository.importParts(dataArray);
}

function getLowStockParts(threshold: number) {
    return partRepository.getLowStockParts(threshold);
}

export { 
    getParts,
    getPartById,
    addPart,
    updatePart,
    updatePartStock,
    deletePart,
    importParts,
    getLowStockParts
 };
