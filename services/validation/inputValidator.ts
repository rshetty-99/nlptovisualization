import { LLMService, LLMProvider } from '../llm/llmService';
import DatabaseConnector from '../database/connector';
import SchemaExtractor from '../database/schemaExtractor';
import { DatabaseType, DatabaseConfig, TableSchema, PrimaryKeyInfo, ForeignKeyInfo } from '../database/types';

export interface ValidationResult {
  isValid: boolean;
  schema: TableSchema;
  primaryKeys: PrimaryKeyInfo;
  foreignKeys: ForeignKeyInfo;
  error?: string;
}

export class InputValidator {
  private llmService: LLMService;
  private schemaExtractor: SchemaExtractor;

  constructor() {
    const dbConfig: DatabaseConfig = {
      type: DatabaseType.SQLServer,
      user: process.env.MSSQL_USER || '',
      host: process.env.MSSQL_HOST || '',
      database: process.env.MSSQL_NAME || '',
      password: process.env.MSSQL_PASSWORD || '',
      port: parseInt(process.env.MSSQL_PORT || '1433', 10),
    };
    
    this.llmService = new LLMService({
      provider: LLMProvider.Ollama,
      model: 'llama2',
    });
    
    this.schemaExtractor = new SchemaExtractor(dbConfig);
  }

  async validateInput(input: string): Promise<ValidationResult> {
    try {
      const schema = await this.schemaExtractor.extractSchema();
      const primaryKeys = await this.schemaExtractor.getPrimaryKeys();
      const foreignKeys = await this.schemaExtractor.getForeignKeys();

      const schemaInfo = JSON.stringify({ schema, primaryKeys, foreignKeys });

      const prompt = `
        Given the following SQL Server database schema:
        ${schemaInfo}

        And the following user input:
        "${input}"

        Determine if the user's query can be satisfied by the given database schema.
        Respond with only "YES" if the query can be satisfied, or "NO" if it cannot.
        If responding with "NO", briefly explain why in a separate line.
      `;

      const response = await this.llmService.generateText(prompt);
      const lines = response.trim().split('\n');
      const isValid = lines[0].toUpperCase() === 'YES';

      if (!isValid && lines.length > 1) {
        return {
          isValid,
          schema,
          primaryKeys,
          foreignKeys,
          error: lines.slice(1).join(' ').trim()
        };
      }

      return { isValid, schema, primaryKeys, foreignKeys };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Validation failed: ${error.message}`);
      } else {
        throw new Error('Validation failed due to an unknown error');
      }
    }
  }
}

