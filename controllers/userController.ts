import { User } from '../shared/types';
import * as userRepository from '../repositories/userRepository';
import bcrypt from 'bcryptjs';

// Inisialisasi: Cek apakah ada user, jika tidak buat default admin
function init() {
    const count = userRepository.getUserCount();
    
    if (count === 0) {
        console.log("No users found. Creating default admin...");
        const hash = bcrypt.hashSync('admin123', 10);
        userRepository.createDefaultAdmin(hash);
    }
}

// Panggil inisialisasi secara manual setelah migrasi (export init)

function login(username: string, password: string) {
    const user = userRepository.getUserByUsername(username);
    if (!user) {
        throw new Error("Username atau password salah!");
    }

    // Check if password is a bcrypt hash (starts with $2a$, $2b$, or $2y$)
    if (user.password.startsWith('$2')) {
        if (!bcrypt.compareSync(password, user.password)) {
            throw new Error("Username atau password salah!");
        }
    } else {
        // Legacy plain text comparison
        if (password !== user.password) {
            throw new Error("Username atau password salah!");
        }
        
        // Auto-migrate legacy plain text to bcrypt
        const hash = bcrypt.hashSync(password, 10);
        userRepository.updateUserWithPassword(user.id, user.username, hash, user.role);
    }
    
    // Remove password from user object before returning
    const safeUser = { ...user };
    Reflect.deleteProperty(safeUser, 'password');
    return safeUser;
}

function getUsers() {
    return userRepository.getUsers();
}

function getUserById(id: number | string) {
    return userRepository.getUserById(id);
}

function addUser(data: User) {
    const { username, password, role } = data;
    
    // Check if username exists
    const existing = userRepository.checkUsernameExists(username);
    if (existing) {
        throw new Error("Username sudah digunakan!");
    }

    if (!password) {
        throw new Error("Password wajib diisi!");
    }

    const hash = bcrypt.hashSync(password, 10);
    return userRepository.addUser(username, hash, role);
}

function updateUser(id: number | string, data: User) {
    const { username, password, role } = data;
    
    // Check if username exists for OTHER users
    const existing = userRepository.checkUsernameExistsExceptId(username, id);
    if (existing) {
        throw new Error("Username sudah digunakan oleh akun lain!");
    }

    if (password && password.trim() !== '') {
        const hash = bcrypt.hashSync(password, 10);
        userRepository.updateUserWithPassword(id, username, hash, role);
    } else {
        userRepository.updateUserWithoutPassword(id, username, role);
    }
    return true;
}

function deleteUser(id: number | string) {
    // Prevent deleting the last admin
    const user = userRepository.getUserRole(id);
    if (user && user.role === 'admin') {
        const adminCount = userRepository.getAdminCount();
        if (adminCount <= 1) {
            throw new Error("Tidak dapat menghapus Admin terakhir!");
        }
    }

    return userRepository.deleteUser(id);
}

export { 
    login,
    getUsers,
    getUserById,
    addUser,
    updateUser,
    deleteUser,
    init
 };

