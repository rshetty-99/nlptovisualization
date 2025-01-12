import mysql from 'mysql2/promise';
import { BaseConnector } from './BaseConnector';
import { DatabaseConfig } from './types';
import { processResultSet } from './dataTypeHandler';

export class MySQLConnector extends BaseConnector {
  private pool: mysql.Pool | null = null;

  constructor(config: DatabaseConfig) {
    super(config);
  }

  async connect(): Promise<void> {
    this.pool = mysql.createPool({
      ...this.config,
      connectionLimit: 10,
      queueLimit: 0
    });
  }

  async executeQuery(query: string, params?: any[]): Promise<{ rows: any[], executionTime: number }> {
    if (!this.pool) {
      await this.connect();
    }

    const startTime = Date.now();
    const [rows] = await this.pool!.execute(query, params);
    const executionTime = Date.now() - startTime;
    const processedRows = processResultSet(rows as any[]);
    return { rows: processedRows, executionTime };
  }

  async executeBatch(queries: string[]): Promise<void> {
    if (!this.pool) {
      await this.connect();
    }

    const connection = await this.pool!.getConnection();
    try {
      await connection.beginTransaction();
      for (const query of queries) {
        await connection.query(query);
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async end(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}

