"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserCount = getUserCount;
exports.createDefaultAdmin = createDefaultAdmin;
exports.getUserByUsername = getUserByUsername;
exports.getUsers = getUsers;
exports.getUserById = getUserById;
exports.checkUsernameExists = checkUsernameExists;
exports.checkUsernameExistsExceptId = checkUsernameExistsExceptId;
exports.addUser = addUser;
exports.updateUserWithPassword = updateUserWithPassword;
exports.updateUserWithoutPassword = updateUserWithoutPassword;
exports.getUserRole = getUserRole;
exports.getAdminCount = getAdminCount;
exports.deleteUser = deleteUser;
const db_1 = __importDefault(require("../database/db"));
const drizzleSchema_1 = require("../database/drizzleSchema");
const drizzle_orm_1 = require("drizzle-orm");
function getUserCount() {
    const result = db_1.default.drizzle.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(drizzleSchema_1.users).get();
    return result.count;
}
function createDefaultAdmin(hash) {
    db_1.default.drizzle.insert(drizzleSchema_1.users).values({ username: 'admin', password: hash, role: 'admin' }).run();
}
function getUserByUsername(username) {
    return db_1.default.drizzle.select({ id: drizzleSchema_1.users.id, username: drizzleSchema_1.users.username, password: drizzleSchema_1.users.password, role: drizzleSchema_1.users.role })
        .from(drizzleSchema_1.users).where((0, drizzle_orm_1.eq)(drizzleSchema_1.users.username, username)).get();
}
function getUsers() {
    return db_1.default.drizzle.select({ id: drizzleSchema_1.users.id, username: drizzleSchema_1.users.username, role: drizzleSchema_1.users.role, created_at: drizzleSchema_1.users.created_at })
        .from(drizzleSchema_1.users).orderBy((0, drizzle_orm_1.desc)(drizzleSchema_1.users.created_at)).all();
}
function getUserById(id) {
    return db_1.default.drizzle.select({ id: drizzleSchema_1.users.id, username: drizzleSchema_1.users.username, role: drizzleSchema_1.users.role })
        .from(drizzleSchema_1.users).where((0, drizzle_orm_1.eq)(drizzleSchema_1.users.id, Number(id))).get();
}
function checkUsernameExists(username) {
    return db_1.default.drizzle.select({ id: drizzleSchema_1.users.id }).from(drizzleSchema_1.users).where((0, drizzle_orm_1.eq)(drizzleSchema_1.users.username, username)).get();
}
function checkUsernameExistsExceptId(username, id) {
    return db_1.default.drizzle.select({ id: drizzleSchema_1.users.id }).from(drizzleSchema_1.users).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(drizzleSchema_1.users.username, username), (0, drizzle_orm_1.ne)(drizzleSchema_1.users.id, Number(id)))).get();
}
function addUser(username, hash, role) {
    const result = db_1.default.drizzle.insert(drizzleSchema_1.users).values({ username, password: hash, role }).run();
    return result.lastInsertRowid;
}
function updateUserWithPassword(id, username, hash, role) {
    db_1.default.drizzle.update(drizzleSchema_1.users).set({ username, password: hash, role }).where((0, drizzle_orm_1.eq)(drizzleSchema_1.users.id, Number(id))).run();
    return true;
}
function updateUserWithoutPassword(id, username, role) {
    db_1.default.drizzle.update(drizzleSchema_1.users).set({ username, role }).where((0, drizzle_orm_1.eq)(drizzleSchema_1.users.id, Number(id))).run();
    return true;
}
function getUserRole(id) {
    return db_1.default.drizzle.select({ role: drizzleSchema_1.users.role }).from(drizzleSchema_1.users).where((0, drizzle_orm_1.eq)(drizzleSchema_1.users.id, Number(id))).get();
}
function getAdminCount() {
    const result = db_1.default.drizzle.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(drizzleSchema_1.users).where((0, drizzle_orm_1.eq)(drizzleSchema_1.users.role, 'admin')).get();
    return result.count;
}
function deleteUser(id) {
    db_1.default.drizzle.delete(drizzleSchema_1.users).where((0, drizzle_orm_1.eq)(drizzleSchema_1.users.id, Number(id))).run();
    return true;
}
