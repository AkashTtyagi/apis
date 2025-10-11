'use strict';

/**
 * SqlString Utility
 * Provides SQL escaping and formatting functions
 */

class SqlString {
  /**
   * Escape a SQL identifier (table name, column name, etc.)
   * @param {string} val - Value to escape
   * @returns {string} - Escaped identifier
   */
  static escapeId(val) {
    if (val === '*') {
      return val;
    }

    if (Array.isArray(val)) {
      return val.map(v => SqlString.escapeId(v)).join(', ');
    }

    return '`' + String(val).replace(/`/g, '``') + '`';
  }

  /**
   * Escape a SQL value
   * @param {*} val - Value to escape
   * @returns {string} - Escaped value
   */
  static escape(val) {
    if (val === undefined || val === null) {
      return 'NULL';
    }

    switch (typeof val) {
      case 'boolean':
        return val ? 'true' : 'false';
      case 'number':
        return val + '';
      case 'object':
        if (val instanceof Date) {
          return SqlString.dateToString(val);
        } else if (Array.isArray(val)) {
          return SqlString.arrayToList(val);
        } else if (Buffer.isBuffer(val)) {
          return SqlString.bufferToString(val);
        } else {
          return SqlString.objectToValues(val);
        }
    }
    return SqlString.escapeString(val);
  }

  /**
   * Escape a string value
   * @param {string} val - String to escape
   * @returns {string} - Escaped string
   */
  static escapeString(val) {
    let chunkIndex = 0;
    let escapedVal = '';
    let match;

    const CHARS_GLOBAL_REGEXP = /[\0\b\t\n\r\x1a\"\'\\]/g;

    while ((match = CHARS_GLOBAL_REGEXP.exec(val))) {
      escapedVal += val.slice(chunkIndex, match.index);

      switch (match[0]) {
        case '\0':
          escapedVal += '\\0';
          break;
        case '\b':
          escapedVal += '\\b';
          break;
        case '\t':
          escapedVal += '\\t';
          break;
        case '\n':
          escapedVal += '\\n';
          break;
        case '\r':
          escapedVal += '\\r';
          break;
        case '\x1a':
          escapedVal += '\\Z';
          break;
        case '"':
          escapedVal += '\\"';
          break;
        case "'":
          escapedVal += "\\'";
          break;
        case '\\':
          escapedVal += '\\\\';
          break;
      }

      chunkIndex = CHARS_GLOBAL_REGEXP.lastIndex;
    }

    if (chunkIndex === 0) {
      return "'" + val + "'";
    }

    if (chunkIndex < val.length) {
      return "'" + escapedVal + val.slice(chunkIndex) + "'";
    }

    return "'" + escapedVal + "'";
  }

  /**
   * Convert Date to SQL string
   * @param {Date} date - Date to convert
   * @returns {string} - SQL date string
   */
  static dateToString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

    return `'${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}'`;
  }

  /**
   * Convert array to SQL list
   * @param {Array} array - Array to convert
   * @returns {string} - SQL list string
   */
  static arrayToList(array) {
    return array.map(v => SqlString.escape(v)).join(', ');
  }

  /**
   * Convert buffer to SQL string
   * @param {Buffer} buffer - Buffer to convert
   * @returns {string} - SQL hex string
   */
  static bufferToString(buffer) {
    return "X'" + buffer.toString('hex') + "'";
  }

  /**
   * Convert object to SQL key-value pairs
   * @param {Object} object - Object to convert
   * @returns {string} - SQL key-value pairs
   */
  static objectToValues(object) {
    const values = [];
    for (const key in object) {
      const val = object[key];
      if (typeof val === 'function') {
        continue;
      }
      values.push(SqlString.escapeId(key) + ' = ' + SqlString.escape(val));
    }
    return values.join(', ');
  }

  /**
   * Format a SQL string with values
   * @param {string} sql - SQL string with placeholders
   * @param {Array} values - Values to insert
   * @returns {string} - Formatted SQL string
   */
  static format(sql, values) {
    if (!values || !Array.isArray(values)) {
      return sql;
    }

    let index = 0;
    return sql.replace(/\?/g, () => {
      if (index >= values.length) {
        return '?';
      }
      return SqlString.escape(values[index++]);
    });
  }

  /**
   * Create a raw SQL fragment that won't be escaped
   * @param {string} sql - Raw SQL
   * @returns {Object} - Raw SQL object
   */
  static raw(sql) {
    return {
      toSqlString: () => sql
    };
  }
}

module.exports = SqlString;
