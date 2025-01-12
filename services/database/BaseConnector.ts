import { DatabaseConfig } from './types';

export abstract class BaseConnector {
  protected config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  abstract connect(): Promise<void>;
  abstract executeQuery(query: string, params?: any[]): Promise<{ rows: any[], executionTime: number }>;
  abstract end(): Promise<void>;
}

