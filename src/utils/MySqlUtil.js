'use strict';

const SqlString = require('./SqlString');

/**
 * Custom error class for Sequelize connection errors
 */
class SequelizeConnectionError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * MySqlUtil Class
 * Utility class for handling MySQL queries with Sequelize connection
 * Provides both sync and async methods for database operations
 */
class MySqlUtil {
  /**
   * Initialize connection and map to MySQL functions
   * @param {Object} connection - Sequelize connection instance
   * @param {Object|null} trans_id - Sequelize transaction instance
   * @returns {MySqlUtil} - MySqlUtil instance
   */
  constructor(connection, trans_id) {
    this.connection = connection;
    this.trans_id = trans_id || null;
    return this;
  }

  /**
   * Escape SQL identifier (table name, column name, etc.)
   * @param {...any} params - Parameters to escape
   * @returns {string} - Escaped identifier
   */
  escapeId(...params) {
    return SqlString.escapeId(...params);
  }

  /**
   * Escape SQL value
   * @param {...any} params - Parameters to escape
   * @returns {string} - Escaped value
   */
  escape(...params) {
    return SqlString.escape(...params);
  }

  /**
   * Format SQL string with values
   * @param {...any} params - SQL string and values
   * @returns {string} - Formatted SQL string
   */
  format(...params) {
    return SqlString.format(...params);
  }

  /**
   * Create raw SQL fragment
   * @param {string} sql - Raw SQL
   * @returns {Object} - Raw SQL object
   */
  raw(sql) {
    return SqlString.raw(sql);
  }

  /**
   * Execute query (async/await style)
   * @param {string|Object} sql - SQL query or query object
   * @param {...any} params - Query parameters
   * @returns {Promise<any>} - Query results
   */
  async execute(sql, ...params) {
    try {
      if (!this.connection) {
        throw new SequelizeConnectionError('Connection not established.');
      }

      const { sqlQuery, options, sqlType } = this._createQuery(sql, params);

      if (this.trans_id) {
        options.transaction = this.trans_id;
      }

      let [results] = await this.connection.query(sqlQuery, options);

      // Handle non-SELECT queries (INSERT, UPDATE, DELETE)
      if (sqlType) {
        [, ...results] = results;
        if (results.length === 1) {
          results = results.pop();
        }
      }

      // Format datetime fields to ISO format (with 'T')
      results = this._formatDatetimeFields(results);

      return results;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Begin a new transaction
   * @param {string} isolationLevel - Transaction isolation level
   * @returns {Promise<MySqlUtil>} - New MySqlUtil instance with transaction
   */
  async beginTransaction(isolationLevel = 'READ COMMITTED') {
    try {
      const transId = await this.connection.transaction({
        isolationLevel: isolationLevel
      });
      return new MySqlUtil(this.connection, transId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Commit current transaction
   * @returns {Promise<void>}
   */
  async commit() {
    try {
      if (!this.trans_id) {
        throw new SequelizeConnectionError(
          'Transaction not initiated. Use beginTransaction before commit.'
        );
      }
      return await this.trans_id.commit();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Rollback current transaction
   * @returns {Promise<void>}
   */
  async rollback() {
    try {
      if (!this.trans_id) {
        throw new SequelizeConnectionError(
          'Transaction not initiated. Use beginTransaction before rollback.'
        );
      }
      return await this.trans_id.rollback();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Execute query with callback style
   * @param {string|Object} sql - SQL query or query object
   * @param {...any} params - Query parameters and callback
   */
  query(sql, ...params) {
    const callback = params.pop();
    (async (sql, params, next) => {
      try {
        const results = await this.execute(sql, ...params);
        next(false, results);
      } catch (error) {
        next(error);
      }
    })(sql, params, (err, result) => {
      callback(err, result);
    });
  }

  /**
   * Begin transaction with callback style
   * @param {Function} callback - Callback function
   */
  beginTransactionCallback(callback) {
    (async next => {
      try {
        const trans_conn = await this.beginTransaction();
        next(false, trans_conn);
      } catch (error) {
        next(error);
      }
    })((err, trans_conn) => {
      callback(err, trans_conn);
    });
  }

  /**
   * Commit transaction with callback style
   * @param {Function} callback - Callback function
   */
  commitCallback(callback) {
    (async next => {
      try {
        await this.commit();
        next();
      } catch (error) {
        next(error);
      }
    })(err => {
      callback(err);
    });
  }

  /**
   * Rollback transaction with callback style
   * @param {Function} callback - Callback function
   */
  rollbackCallback(callback) {
    (async next => {
      try {
        await this.rollback();
        next();
      } catch (error) {
        next(error);
      }
    })(err => {
      callback(err);
    });
  }

  /**
   * Create query object with options
   * @private
   * @param {string|Object} sql - SQL query or query object
   * @param {Array} values - Query values
   * @returns {Object} - Query configuration
   */
  _createQuery(sql, values) {
    const options = {};

    if (typeof sql === 'string') {
      options.sql = sql;
    } else if (typeof sql === 'object') {
      for (const prop in sql) {
        options[prop] = sql[prop];
      }
    }

    let select_query = true;
    if (options.sql && options.sql.trim().substr(0, 6).toUpperCase() !== 'SELECT') {
      select_query = false;
      options.sql = `SELECT 1;${options.sql}`;
    }

    return {
      sqlQuery: this.format(
        options.sql,
        ...(options.values ? [options.values] : values)
      ),
      options: {
        raw: true,
        nest: options.nestTables || false,
        transaction: options.transaction || null
      },
      sqlType: !select_query
    };
  }

  /**
   * Format datetime fields to ISO format (with 'T' separator)
   * Converts MySQL datetime strings to ISO 8601 format
   * @private
   * @param {Array|Object} results - Query results
   * @returns {Array|Object} - Formatted results
   */
  _formatDatetimeFields(results) {
    if (!results) {
      return results;
    }

    // Helper function to format a single row
    const formatRow = (row) => {
      if (!row || typeof row !== 'object') {
        return row;
      }

      const formattedRow = {};
      for (const key in row) {
        const value = row[key];

        // Check if the field name suggests it's a datetime field
        const isDateTimeField =
          key.includes('_at') ||
          key.includes('date') ||
          key.includes('time') ||
          key === 'created' ||
          key === 'updated' ||
          key === 'deleted';

        // Check if value looks like a MySQL datetime string (YYYY-MM-DD HH:MM:SS)
        if (
          isDateTimeField &&
          typeof value === 'string' &&
          /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(value)
        ) {
          // Convert MySQL datetime format to ISO format (with 'T')
          formattedRow[key] = value.replace(' ', 'T') + '.000Z';
        } else {
          formattedRow[key] = value;
        }
      }
      return formattedRow;
    };

    // Format array of results or single result
    if (Array.isArray(results)) {
      return results.map(formatRow);
    } else {
      return formatRow(results);
    }
  }
}

module.exports = MySqlUtil;
