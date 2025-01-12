import { DatabaseType, DatabaseConfig } from './types';
import { BaseConnector } from './BaseConnector';
import { PostgreSQLConnector } from './PostgreSQLConnector';
import { MySQLConnector } from './MySQLConnector';
import { SQLServerConnector } from './SQLServerConnector';
import { SnowflakeConnector } from './SnowflakeConnector';

class DatabaseConnector {
  private connector: BaseConnector;

  constructor(config?: Partial<DatabaseConfig>) {
    const fullConfig: DatabaseConfig = {
      type: DatabaseType.SQLServer,
      user: process.env.MSSQL_USER || '',
      host: process.env.MSSQL_HOST || '',
      database: process.env.MSSQL_NAME || '',
      password: process.env.MSSQL_PASSWORD || '',
      port: parseInt(process.env.MSSQL_PORT || '1433', 10),
      ...config
    };

    switch (fullConfig.type) {
      case DatabaseType.PostgreSQL:
        this.connector = new PostgreSQLConnector(fullConfig);
        break;
      case DatabaseType.MySQL:
        this.connector = new MySQLConnector(fullConfig);
        break;
      case DatabaseType.SQLServer:
        this.connector = new SQLServerConnector(fullConfig);
        break;
      case DatabaseType.Snowflake:
        this.connector = new SnowflakeConnector(fullConfig);
        break;
      default:
        throw new Error(`Unsupported database type: ${fullConfig.type}`);
    }
  }

  async connect(): Promise<void> {
    await this.connector.connect();
  }

  async executeQuery(query: string, params?: any[]): Promise<{ rows: any[], executionTime: number }> {
    return await this.connector.executeQuery(query, params);
  }

  async end(): Promise<void> {
    await this.connector.end();
  }
}

export default DatabaseConnector;

