/**
 * MongoDB initialization script for Exam Alchemy
 * 
 * This script runs when the MongoDB container is first created.
 * It sets up indexes and initial collections for the application.
 * 
 * Usage: Mount this file to /docker-entrypoint-initdb.d/ in docker-compose.yml
 */

// Switch to the application database
db = db.getSiblingDB('examalchemy');

// Create indexes for better query performance
db.users.createIndex({ "email": 1 }, { unique: true });

// Log initialization
print('✅ ExamAlchemy database initialized successfully');
print('   - users collection: email unique index created');
