const pool = require('../config/database');
const bcrypt = require('bcrypt');
const logger = require('../utils/logger');

class User {
  static async findByUsername(username) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      return rows.length ? rows[0] : null;
    } catch (error) {
      logger.error(`Error in findByUsername: ${error.message}`);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.query(
        'SELECT id, username, email, created_at FROM users WHERE id = ?',
        [id]
      );
      return rows.length ? rows[0] : null;
    } catch (error) {
      logger.error(`Error in findById: ${error.message}`);
      throw error;
    }
  }

  static async create(username, password, email) {
    try {
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      const [result] = await pool.query(
        'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
        [username, hashedPassword, email]
      );
      
      return result.insertId;
    } catch (error) {
      logger.error(`Error in create user: ${error.message}`);
      throw error;
    }
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      logger.error(`Error in verifyPassword: ${error.message}`);
      throw error;
    }
  }
}

module.exports = User;