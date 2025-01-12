import DatabaseConnector from './connector';
import { DatabaseType, DatabaseConfig, TableSchema, PrimaryKeyInfo, ForeignKeyInfo } from './types';

export class SchemaExtractor {
  private connector: DatabaseConnector;
  private dbType: DatabaseType;

  constructor(config: DatabaseConfig) {
    this.connector = new DatabaseConnector(config);
    this.dbType = config.type;
  }

  async extractSchema(): Promise<TableSchema> {
    const schema: TableSchema = {};

    try {
      const tables = await this.getTables();

      for (const table of tables) {
        const tableName = table.table_name;
        const columns = await this.getColumns(tableName);
        schema[tableName] = columns;
      }

      return schema;
    } catch (error) {
      console.error('Error extracting schema:', error);
      throw error;
    }
  }

  private async getTables(): Promise<any[]> {
    let query = '';
    switch (this.dbType) {
      case DatabaseType.PostgreSQL:
      case DatabaseType.MySQL:
        query = `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
        `;
        break;
      case DatabaseType.SQLServer:
        query = `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_type = 'BASE TABLE'
        `;
        break;
      case DatabaseType.Snowflake:
        query = `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = CURRENT_SCHEMA()
          AND table_type = 'BASE TABLE'
        `;
        break;
    }
    return await this.connector.query(query);
  }

  private async getColumns(tableName: string): Promise<any[]> {
    let query = '';
    switch (this.dbType) {
      case DatabaseType.PostgreSQL:
      case DatabaseType.MySQL:
      case DatabaseType.SQLServer:
        query = `
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_name = ?
          ORDER BY ordinal_position
        `;
        break;
      case DatabaseType.Snowflake:
        query = `
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_name = ?
          AND table_schema = CURRENT_SCHEMA()
          ORDER BY ordinal_position
        `;
        break;
    }
    return await this.connector.query(query, [tableName]);
  }

  async getPrimaryKeys(): Promise<PrimaryKeyInfo> {
    const primaryKeys: PrimaryKeyInfo = {};

    let query = '';
    switch (this.dbType) {
      case DatabaseType.PostgreSQL:
      case DatabaseType.MySQL:
        query = `
          SELECT tc.table_name, kcu.column_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          WHERE tc.constraint_type = 'PRIMARY KEY'
            AND tc.table_schema = 'public'
          ORDER BY tc.table_name, kcu.ordinal_position
        `;
        break;
      case DatabaseType.SQLServer:
        query = `
          SELECT t.name AS table_name, c.name AS column_name
          FROM sys.tables t
          INNER JOIN sys.indexes i ON t.object_id = i.object_id
          INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
          INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
          WHERE i.is_primary_key = 1
          ORDER BY t.name, ic.key_ordinal
        `;
        break;
      case DatabaseType.Snowflake:
        query = `
          SELECT t.table_name, kcu.column_name
          FROM information_schema.table_constraints t
          JOIN information_schema.key_column_usage kcu
            ON t.constraint_name = kcu.constraint_name
            AND t.table_schema = kcu.table_schema
          WHERE t.constraint_type = 'PRIMARY KEY'
            AND t.table_schema = CURRENT_SCHEMA()
          ORDER BY t.table_name, kcu.ordinal_position
        `;
        break;
    }

    const result = await this.connector.query(query);

    for (const row of result) {
      if (!primaryKeys[row.table_name]) {
        primaryKeys[row.table_name] = [];
      }
      primaryKeys[row.table_name].push(row.column_name);
    }

    return primaryKeys;
  }

  async getForeignKeys(): Promise<ForeignKeyInfo> {
    const foreignKeys: ForeignKeyInfo = {};

    let query = '';
    switch (this.dbType) {
      case DatabaseType.PostgreSQL:
      case DatabaseType.MySQL:
        query = `
          SELECT
            tc.table_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
          FROM information_schema.table_constraints AS tc
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
          WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = 'public'
        `;
        break;
      case DatabaseType.SQLServer:
        query = `
          SELECT
            OBJECT_NAME(f.parent_object_id) AS table_name,
            COL_NAME(fc.parent_object_id, fc.parent_column_id) AS column_name,
            OBJECT_NAME(f.referenced_object_id) AS foreign_table_name,
            COL_NAME(fc.referenced_object_id, fc.referenced_column_id) AS foreign_column_name
          FROM sys.foreign_keys AS f
          INNER JOIN sys.foreign_key_columns AS fc
            ON f.object_id = fc.constraint_object_id
        `;
        break;
      case DatabaseType.Snowflake:
        query = `
          SELECT
            tc.table_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
          JOIN information_schema.constraint_column_usage ccu
            ON ccu.constraint_name = tc.constraint_name
          WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = CURRENT_SCHEMA()
        `;
        break;
    }

    const result = await this.connector.query(query);

    for (const row of result) {
      if (!foreignKeys[row.table_name]) {
        foreignKeys[row.table_name] = {};
      }
      foreignKeys[row.table_name][row.column_name] = {
        referencedTable: row.foreign_table_name,
        referencedColumn: row.foreign_column_name,
      };
    }

    return foreignKeys;
  }
}

export default SchemaExtractor;

