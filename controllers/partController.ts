import { Part } from '../shared/types';
import * as partRepository from '../repositories/partRepository';
import {  SparepartSchema, validateData  } from '../src/utils/validators';

function getParts(searchQuery = '') {
    return partRepository.getParts(searchQuery);
}

function getPartById(id: number | string) {
    return partRepository.getPartById(id);
}

function addPart(data: Omit<Part, 'id'>) {
    const validData = validateData(SparepartSchema, data);
    return partRepository.addPart(validData as Omit<Part, 'id'>);
}

function updatePart(id: number | string, data: Omit<Part, 'id'>) {
    const validData = validateData(SparepartSchema, data);
    return partRepository.updatePart(id, validData as Omit<Part, 'id'>);
}



function deletePart(id: number | string) {
    const hasServiceItems = partRepository.checkPartHasServiceItems(id);
    if (hasServiceItems) {
        throw new Error("Sparepart tidak bisa dihapus karena sudah tercatat dalam riwayat rincian biaya servis.");
    }
    return partRepository.deletePart(id);
}


export { 
    getParts,
    getPartById,
    addPart,
    updatePart,
    deletePart
 };
