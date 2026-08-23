"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db = require('../database/db');
const { users } = require('../database/drizzleSchema');
const { eq, ne, and, desc, sql } = require('drizzle-orm');
function getUserCount() {
    const result = db.drizzle.select({ count: sql `count(*)` }).from(users).get();
    return result.count;
}
function createDefaultAdmin(hash) {
    db.drizzle.insert(users).values({ username: 'admin', password: hash, role: 'admin' }).run();
}
function getUserByUsername(username) {
    return db.drizzle.select({ id: users.id, username: users.username, password: users.password, role: users.role })
        .from(users).where(eq(users.username, username)).get();
}
function getUsers() {
    return db.drizzle.select({ id: users.id, username: users.username, role: users.role, created_at: users.created_at })
        .from(users).orderBy(desc(users.created_at)).all();
}
function getUserById(id) {
    return db.drizzle.select({ id: users.id, username: users.username, role: users.role })
        .from(users).where(eq(users.id, Number(id))).get();
}
function checkUsernameExists(username) {
    return db.drizzle.select({ id: users.id }).from(users).where(eq(users.username, username)).get();
}
function checkUsernameExistsExceptId(username, id) {
    return db.drizzle.select({ id: users.id }).from(users).where(and(eq(users.username, username), ne(users.id, Number(id)))).get();
}
function addUser(username, hash, role) {
    const result = db.drizzle.insert(users).values({ username, password: hash, role }).run();
    return result.lastInsertRowid;
}
function updateUserWithPassword(id, username, hash, role) {
    db.drizzle.update(users).set({ username, password: hash, role }).where(eq(users.id, Number(id))).run();
    return true;
}
function updateUserWithoutPassword(id, username, role) {
    db.drizzle.update(users).set({ username, role }).where(eq(users.id, Number(id))).run();
    return true;
}
function getUserRole(id) {
    return db.drizzle.select({ role: users.role }).from(users).where(eq(users.id, Number(id))).get();
}
function getAdminCount() {
    const result = db.drizzle.select({ count: sql `count(*)` }).from(users).where(eq(users.role, 'admin')).get();
    return result.count;
}
function deleteUser(id) {
    db.drizzle.delete(users).where(eq(users.id, Number(id))).run();
    return true;
}
module.exports = {
    getUserCount,
    createDefaultAdmin,
    getUserByUsername,
    getUsers,
    getUserById,
    checkUsernameExists,
    checkUsernameExistsExceptId,
    addUser,
    updateUserWithPassword,
    updateUserWithoutPassword,
    getUserRole,
    getAdminCount,
    deleteUser
};
