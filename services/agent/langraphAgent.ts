import { AgentGraph, AgentNode, type NodeSpec, type StateDefinition } from '@langchain/langgraph';
import { LLMService, LLMProvider } from '../llm/llmService';
import { InputValidator, ValidationResult } from '../validation/inputValidator';
import { QueryGenerator } from '../query/queryGenerator';
import DatabaseConnector from '../database/connector';
import { AuditLogger } from '../audit/auditLogger';
import { DatabaseType, DatabaseConfig } from '../database/types';

type ChartType = 'line' | 'bar' | 'pie';

export class LangraphAgent {
  private graph: AgentGraph;
  private llmService: LLMService;
  private inputValidator: InputValidator;
  private queryGenerator: QueryGenerator;
  private dbConnector: DatabaseConnector;
  private auditLogger: AuditLogger;

  constructor(llmProvider: LLMProvider, llmModel: string) {
    this.llmService = new LLMService({ provider: llmProvider, model: llmModel });
    this.inputValidator = new InputValidator();
    this.queryGenerator = new QueryGenerator(llmProvider, llmModel);
    
    const dbConfig: DatabaseConfig = {
      type: DatabaseType.SQLServer,
      user: process.env.MSSQL_USER || '',
      host: process.env.MSSQL_HOST || '',
      database: process.env.MSSQL_NAME || '',
      password: process.env.MSSQL_PASSWORD || '',
      port: parseInt(process.env.MSSQL_PORT || '1433', 10),
    };
    this.dbConnector = new DatabaseConnector(dbConfig);
    
    this.auditLogger = new AuditLogger();

    this.graph = new AgentGraph();
    this.setupGraph();
  }

  private setupGraph() {
    const validateNode = new AgentNode('validate', async (input: string) => {
      return await this.inputValidator.validateInput(input);
    });

    const generateQueryNode = new AgentNode('generateQuery', async (input: { text: string, validationResult: ValidationResult }) => {
      return await this.queryGenerator.generateQuery(
        input.text,
        DatabaseType.SQLServer,
        input.validationResult.schema,
        input.validationResult.primaryKeys,
        input.validationResult.foreignKeys
      );
    });

    const executeQueryNode = new AgentNode('executeQuery', async (query: string) => {
      return await this.dbConnector.executeQuery(query);
    });

    const processResultNode = new AgentNode('processResult', async (input: {
      queryResult: { rows: any[], executionTime: number },
      nlpText: string,
      validationResult: ValidationResult,
      generatedQuery: string
    }) => {
      const { queryResult, nlpText, validationResult, generatedQuery } = input;
      
      const processedResult = queryResult.rows;
      const resultSetStructure = this.getResultSetStructure(processedResult);

      // Suggest chart type
      const suggestedChartType = await this.suggestChartType(processedResult, resultSetStructure);

      // Log the audit entry
      await this.auditLogger.logQuery({
        nlpText,
        validationStatus: validationResult.isValid,
        generatedQuery,
        llmTokensUsed: 0, // This should be obtained from the LLM service
        queryResultCount: processedResult.length,
        queryExecutionTime: queryResult.executionTime,
        resultSetStructure: JSON.stringify(resultSetStructure)
      });

      return { processedResult, suggestedChartType };
    });

    this.graph.addNode(validateNode);
    this.graph.addNode(generateQueryNode);
    this.graph.addNode(executeQueryNode);
    this.graph.addNode(processResultNode);

    this.graph.addEdge(validateNode, generateQueryNode);
    this.graph.addEdge(generateQueryNode, executeQueryNode);
    this.graph.addEdge(executeQueryNode, processResultNode);
  }

  private getResultSetStructure(result: any[]): object {
    if (result.length === 0) return {};

    const sampleRow = result[0];
    const structure: { [key: string]: string } = {};

    for (const [key, value] of Object.entries(sampleRow)) {
      structure[key] = this.getValueType(value);
    }

    return structure;
  }

  private getValueType(value: any): string {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return typeof value;
  }

  private async suggestChartType(data: any[], structure: any): Promise<ChartType> {
    const prompt = `
      Given the following data structure and sample:
      Structure: ${JSON.stringify(structure)}
      Sample data: ${JSON.stringify(data.slice(0, 5))}

      Suggest the most appropriate chart type from the following options:
      1. Line Chart
      2. Bar Chart
      3. Pie Chart

      Provide your answer as a single word: 'line', 'bar', or 'pie'.
    `;

    const suggestion = await this.llmService.generateText(prompt);
    const cleanedSuggestion = suggestion.trim().toLowerCase();

    if (['line', 'bar', 'pie'].includes(cleanedSuggestion)) {
      return cleanedSuggestion as ChartType;
    }

    // Default to bar chart if the suggestion is not recognized
    return 'bar';
  }

  async process(input: string): Promise<{ result: any, suggestedChartType: ChartType, error?: string }> {
    try {
      const validationResult = await this.graph.getNode('validate').run(input);
      if (!validationResult.isValid) {
        throw new Error(validationResult.error || "The query cannot be satisfied by the current database schema.");
      }

      const generatedQuery = await this.graph.getNode('generateQuery').run({ text: input, validationResult });
      const queryResult = await this.graph.getNode('executeQuery').run(generatedQuery);

      const { processedResult, suggestedChartType } = await this.graph.getNode('processResult').run({
        queryResult,
        nlpText: input,
        validationResult,
        generatedQuery
      });

      return { result: processedResult, suggestedChartType };
    } catch (error) {
      if (error instanceof Error) {
        return { result: null, suggestedChartType: 'bar', error: error.message };
      } else {
        return { result: null, suggestedChartType: 'bar', error: 'An unknown error occurred' };
      }
    }
  }
}

