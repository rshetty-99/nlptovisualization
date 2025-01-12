import sql from 'mssql';
import { BaseConnector } from './BaseConnector';
import { DatabaseConfig } from './types';
import { processResultSet } from './dataTypeHandler';

export class SQLServerConnector extends BaseConnector {
  private pool: sql.ConnectionPool | null = null;

  constructor(config: DatabaseConfig) {
    super(config);
  }

  async connect(): Promise<void> {
    this.pool = await new sql.ConnectionPool(this.config).connect();
  }

  async executeQuery(query: string, params?: any[]): Promise<{ rows: any[], executionTime: number }> {
    if (!this.pool) {
      await this.connect();
    }

    const startTime = Date.now();
    const request = this.pool!.request();
    
    if (params) {
      params.forEach((param, index) => {
        request.input(`param${index}`, param);
      });
    }

    const result = await request.query(query);
    const executionTime = Date.now() - startTime;
    const processedRows = processResultSet(result.recordset);
    return { rows: processedRows, executionTime };
  }

  async executeBatch(queries: string[]): Promise<void> {
    if (!this.pool) {
      await this.connect();
    }

    const transaction = new sql.Transaction(this.pool!);
    try {
      await transaction.begin();
      for (const query of queries) {
        await transaction.request().query(query);
      }
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async end(): Promise<void> {
    if (this.pool) {
      await this.pool.close();
      this.pool = null;
    }
  }
}

