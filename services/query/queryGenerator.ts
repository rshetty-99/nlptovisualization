import { LLMService, LLMProvider } from '../llm/llmService';
import { DatabaseType, TableSchema, PrimaryKeyInfo, ForeignKeyInfo } from '../database/types';

export class QueryGenerator {
  private llmService: LLMService;

  constructor(provider: LLMProvider, model: string) {
    this.llmService = new LLMService({ provider, model });
  }

  async generateQuery(
    input: string,
    dbType: DatabaseType,
    schema: TableSchema,
    primaryKeys: PrimaryKeyInfo,
    foreignKeys: ForeignKeyInfo
  ): Promise<string> {
    const schemaInfo = JSON.stringify({ schema, primaryKeys, foreignKeys });
    const prompt = `
      Given the following ${dbType} database schema:
      ${schemaInfo}

      And the following user input:
      "${input}"

      Generate a ${dbType} compatible SQL query that satisfies the user's request.
      Only return the SQL query, without any additional explanation.
    `;

    const query = await this.llmService.generateText(prompt);
    return query.trim();
  }
}

