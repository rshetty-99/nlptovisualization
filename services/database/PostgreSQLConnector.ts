import { Pool, PoolClient } from 'pg';
import { BaseConnector } from './BaseConnector';
import { DatabaseConfig } from './types';
import { processResultSet } from './dataTypeHandler';

export class PostgreSQLConnector extends BaseConnector {
  private pool: Pool | null = null;

  constructor(config: DatabaseConfig) {
    super(config);
  }

  async connect(): Promise<void> {
    this.pool = new Pool(this.config);
  }

  async executeQuery(query: string, params?: any[]): Promise<{ rows: any[], executionTime: number }> {
    if (!this.pool) {
      await this.connect();
    }

    const startTime = Date.now();
    const client = await this.pool!.connect();
    try {
      // Use prepared statements for better performance and security
      const preparedQuery = {
        name: `query_${Date.now()}`,
        text: query,
        values: params
      };
      const result = await client.query(preparedQuery);
      const executionTime = Date.now() - startTime;
      const processedRows = processResultSet(result.rows);
      return { rows: processedRows, executionTime };
    } finally {
      client.release();
    }
  }

  async executeBatch(queries: string[]): Promise<void> {
    if (!this.pool) {
      await this.connect();
    }

    const client = await this.pool!.connect();
    try {
      await client.query('BEGIN');
      for (const query of queries) {
        await client.query(query);
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async end(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}

