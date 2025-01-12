import DatabaseConnector from '../database/connector';
import { DatabaseType, DatabaseConfig } from '../database/types';
import { v4 as uuidv4 } from 'uuid';

interface AuditLogEntry {
  id: string;
  nlpText: string;
  validationStatus: boolean;
  generatedQuery: string;
  llmTokensUsed: number;
  queryResultCount: number;
  queryExecutionTime: number;
  resultSetStructure: string;
  updatedTime: Date;
}

export class AuditLogger {
  private dbConnector: DatabaseConnector;

  constructor() {
    const dbConfig: DatabaseConfig = {
      type: DatabaseType.SQLServer,
      user: process.env.MSSQL_USER || '',
      host: process.env.MSSQL_HOST || '',
      database: process.env.MSSQL_NAME || '',
      password: process.env.MSSQL_PASSWORD || '',
      port: parseInt(process.env.MSSQL_PORT || '1433', 10),
    };
    this.dbConnector = new DatabaseConnector(dbConfig);
  }

  async logQuery(entry: Omit<AuditLogEntry, 'id' | 'updatedTime'>): Promise<void> {
    const id = uuidv4();
    const updatedTime = new Date();

    const query = `
      INSERT INTO AuditLog (
        id, nlpText, validationStatus, generatedQuery, llmTokensUsed, 
        queryResultCount, queryExecutionTime, resultSetStructure, updatedTime
      ) VALUES (
        @id, @nlpText, @validationStatus, @generatedQuery, @llmTokensUsed, 
        @queryResultCount, @queryExecutionTime, @resultSetStructure, @updatedTime
      )
    `;

    const params = [
      id, entry.nlpText, entry.validationStatus, entry.generatedQuery, entry.llmTokensUsed,
      entry.queryResultCount, entry.queryExecutionTime, entry.resultSetStructure, updatedTime
    ];

    try {
      await this.dbConnector.executeQuery(query, params);
    } catch (error) {
      console.error('Error logging audit entry:', error);
      throw new Error('Failed to log audit entry');
    }
  }
}

