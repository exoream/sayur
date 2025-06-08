const bcrypt = require("bcrypt");

// Fungsi untuk meng-generate hash dari password
async function generatePasswordHash(password) {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
}

async function comparePasswordHash(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
}

module.exports = { generatePasswordHash, comparePasswordHash };