#!/usr/bin/env node

/**
 * Schema Cleanup Script for Mobile App
 * 
 * This script cleans up the GraphQL schema and operations files by:
 * 1. Removing placeholder "_: Boolean" fields from schema types
 * 2. Removing placeholder "_" operations from GraphQL files
 * 
 * Run with: npm run schema:clean
 */

const fs = require('fs');
const path = require('path');

const SCHEMA_FILE = path.join(__dirname, '../schema.graphql');
const GRAPHQL_DIR = path.join(__dirname, '../lib/graphql');

console.log('🧹 Cleaning GraphQL schema and operations...');

// Clean schema.graphql file
function cleanSchemaFile() {
  console.log('📄 Cleaning schema.graphql...');
  
  if (!fs.existsSync(SCHEMA_FILE)) {
    console.log('⚠️  schema.graphql not found, skipping schema cleanup');
    return;
  }

  let schemaContent = fs.readFileSync(SCHEMA_FILE, 'utf8');
  const originalContent = schemaContent;
  
  // Remove AWS scalar definitions (codegen.yml handles the type mapping)
  const scalarLines = [
    'scalar AWSDate',
    'scalar AWSTime',
    'scalar AWSDateTime',
    'scalar AWSTimestamp',
    'scalar AWSEmail',
    'scalar AWSJSON',
    'scalar AWSURL',
    'scalar AWSPhone',
    'scalar AWSIPAddress'
  ];
  
  scalarLines.forEach(scalarLine => {
    const regex = new RegExp(`^${scalarLine}\\s*$`, 'gm');
    schemaContent = schemaContent.replace(regex, '');
  });
  
  // Remove "_: Boolean" placeholder fields from Query, Mutation, and Subscription types
  const placeholderRegex = /^(\s*)_:\s*Boolean\s*$/gm;
  schemaContent = schemaContent.replace(placeholderRegex, '');
  
  // Clean up any multiple newlines that might result from removing lines
  schemaContent = schemaContent.replace(/\n\n\n+/g, '\n\n');
  // Clean up leading newlines
  schemaContent = schemaContent.replace(/^\n+/, '');
  
  if (originalContent !== schemaContent) {
    fs.writeFileSync(SCHEMA_FILE, schemaContent);
    console.log('✅ Schema cleaned successfully');
  } else {
    console.log('✅ Schema is already clean');
  }
}

// Clean GraphQL operations files
function cleanGraphQLOperations() {
  console.log('📁 Cleaning GraphQL operations...');
  
  if (!fs.existsSync(GRAPHQL_DIR)) {
    console.log('⚠️  GraphQL directory not found, skipping operations cleanup');
    return;
  }

  const files = ['queries.ts', 'mutations.ts', 'subscriptions.ts'];
  
  files.forEach(filename => {
    const filePath = path.join(GRAPHQL_DIR, filename);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  ${filename} not found, skipping`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Remove placeholder "_" operations
    // Pattern matches: export const _ = /* GraphQL */ `operation _ { _ }` as GeneratedType<...>;
    const placeholderOperationRegex = /export const _ = \/\* GraphQL \*\/ `(?:query|mutation|subscription) _ \{\s*_\s*\}\s*`[^;]*;?\s*/g;
    content = content.replace(placeholderOperationRegex, '');
    
    // Clean up any extra newlines
    content = content.replace(/\n\n\n+/g, '\n\n');
    
    if (originalContent !== content) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Cleaned placeholder operations from ${filename}`);
    } else {
      console.log(`✅ No placeholder operations found in ${filename}`);
    }
  });
}

// Main execution
try {
  cleanSchemaFile();
  cleanGraphQLOperations();
  console.log('🎉 Schema cleanup completed successfully!');
} catch (error) {
  console.error('❌ Error during schema cleanup:', error.message);
  process.exit(1);
}
