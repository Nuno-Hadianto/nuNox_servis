"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.getUsers = getUsers;
exports.getUserById = getUserById;
exports.addUser = addUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.init = init;
const userRepository = __importStar(require("../repositories/userRepository"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Inisialisasi: Cek apakah ada user, jika tidak buat default admin
function init() {
    const count = userRepository.getUserCount();
    if (count === 0) {
        console.log("No users found. Creating default admin...");
        const hash = bcryptjs_1.default.hashSync('admin123', 10);
        userRepository.createDefaultAdmin(hash);
    }
}
// Panggil inisialisasi secara manual setelah migrasi (export init)
function login(username, password) {
    const user = userRepository.getUserByUsername(username);
    if (!user) {
        throw new Error("Username atau password salah!");
    }
    // Check if password is a bcrypt hash (starts with $2a$, $2b$, or $2y$)
    if (user.password.startsWith('$2')) {
        if (!bcryptjs_1.default.compareSync(password, user.password)) {
            throw new Error("Username atau password salah!");
        }
    }
    else {
        // Legacy plain text comparison
        if (password !== user.password) {
            throw new Error("Username atau password salah!");
        }
        // Auto-migrate legacy plain text to bcrypt
        const hash = bcryptjs_1.default.hashSync(password, 10);
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
function getUserById(id) {
    return userRepository.getUserById(id);
}
function addUser(data) {
    const { username, password, role } = data;
    // Check if username exists
    const existing = userRepository.checkUsernameExists(username);
    if (existing) {
        throw new Error("Username sudah digunakan!");
    }
    if (!password) {
        throw new Error("Password wajib diisi!");
    }
    const hash = bcryptjs_1.default.hashSync(password, 10);
    return userRepository.addUser(username, hash, role);
}
function updateUser(id, data) {
    const { username, password, role } = data;
    // Check if username exists for OTHER users
    const existing = userRepository.checkUsernameExistsExceptId(username, id);
    if (existing) {
        throw new Error("Username sudah digunakan oleh akun lain!");
    }
    if (password && password.trim() !== '') {
        const hash = bcryptjs_1.default.hashSync(password, 10);
        userRepository.updateUserWithPassword(id, username, hash, role);
    }
    else {
        userRepository.updateUserWithoutPassword(id, username, role);
    }
    return true;
}
function deleteUser(id) {
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
