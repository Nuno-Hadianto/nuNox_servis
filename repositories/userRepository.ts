import { User } from '../shared/types';
const db = require('../database/db');
const { users } = require('../database/drizzleSchema');
const { eq, ne, and, desc, sql } = require('drizzle-orm');

function getUserCount() {
    const result = db.drizzle.select({ count: sql`count(*)` }).from(users).get();
    return result.count;
}

function createDefaultAdmin(hash: string) {
    db.drizzle.insert(users).values({ username: 'admin', password: hash, role: 'admin' }).run();
}

function getUserByUsername(username: string) {
    return db.drizzle.select({ id: users.id, username: users.username, password: users.password, role: users.role })
        .from(users).where(eq(users.username, username)).get();
}

function getUsers() {
    return db.drizzle.select({ id: users.id, username: users.username, role: users.role, created_at: users.created_at })
        .from(users).orderBy(desc(users.created_at)).all();
}

function getUserById(id: number | string) {
    return db.drizzle.select({ id: users.id, username: users.username, role: users.role })
        .from(users).where(eq(users.id, Number(id))).get();
}

function checkUsernameExists(username: string) {
    return db.drizzle.select({ id: users.id }).from(users).where(eq(users.username, username)).get();
}

function checkUsernameExistsExceptId(username: string, id: number | string) {
    return db.drizzle.select({ id: users.id }).from(users).where(and(eq(users.username, username), ne(users.id, Number(id)))).get();
}

function addUser(username: string, hash: string, role: string) {
    const result = db.drizzle.insert(users).values({ username, password: hash, role }).run();
    return result.lastInsertRowid;
}

function updateUserWithPassword(id: number | string, username: string, hash: string, role: string) {
    db.drizzle.update(users).set({ username, password: hash, role }).where(eq(users.id, Number(id))).run();
    return true;
}

function updateUserWithoutPassword(id: number | string, username: string, role: string) {
    db.drizzle.update(users).set({ username, role }).where(eq(users.id, Number(id))).run();
    return true;
}

function getUserRole(id: number | string) {
    return db.drizzle.select({ role: users.role }).from(users).where(eq(users.id, Number(id))).get();
}

function getAdminCount() {
    const result = db.drizzle.select({ count: sql`count(*)` }).from(users).where(eq(users.role, 'admin')).get();
    return result.count;
}

function deleteUser(id: number | string) {
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
