export enum DatabaseType {
  PostgreSQL = 'postgresql',
  MySQL = 'mysql',
  SQLServer = 'sqlserver',
  Snowflake = 'snowflake'
}

export interface DatabaseConfig {
  type: DatabaseType;
  user: string;
  host: string;
  database: string;
  password: string;
  port: number;
  [key: string]: any; // For additional database-specific options
}

export interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
}

export interface TableSchema {
  [tableName: string]: ColumnInfo[];
}

export interface PrimaryKeyInfo {
  [tableName: string]: string[];
}

export interface ForeignKeyInfo {
  [tableName: string]: {
    [columnName: string]: {
      referencedTable: string;
      referencedColumn: string;
    };
  };
}

