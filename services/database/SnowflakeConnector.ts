import snowflake from 'snowflake-sdk';
import { BaseConnector } from './BaseConnector';
import { DatabaseConfig } from './types';
import { processResultSet } from './dataTypeHandler';

export class SnowflakeConnector extends BaseConnector {
  private connection: snowflake.Connection | null = null;

  constructor(config: DatabaseConfig) {
    super(config);
  }

  async connect(): Promise<void> {
    this.connection = snowflake.createConnection(this.config);
    await new Promise<void>((resolve, reject) => {
      this.connection!.connect((err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async executeQuery(query: string, params?: any[]): Promise<{ rows: any[], executionTime: number }> {
    if (!this.connection) {
      await this.connect();
    }

    const startTime = Date.now();
    const rows = await new Promise<any[]>((resolve, reject) => {
      this.connection!.execute({
        sqlText: query,
        binds: params,
        complete: (err: any, stmt: any, rows: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      });
    });
    const executionTime = Date.now() - startTime;
    const processedRows = processResultSet(rows);
    return { rows: processedRows, executionTime };
  }

  async end(): Promise<void> {
    if (this.connection) {
      await new Promise<void>((resolve, reject) => {
        this.connection!.destroy((err: any) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
      this.connection = null;
    }
  }
}

