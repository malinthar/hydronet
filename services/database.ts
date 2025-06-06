// import * as SQLite from 'expo-sqlite';

// export interface ObservationRecord {
//   id?: string;
//   userId: string;
//   location: string;
//   latitude: number;
//   longitude: number;
//   depth: number;
//   notes?: string;
//   timestamp: string;
//   photos?: string;
//   synced: boolean;
//   createdAt: string;
// }

// export interface PredictionRecord {
//   id?: string;
//   userId: string;
//   location: string;
//   latitude: number;
//   longitude: number;
//   predictionData: string; // JSON stringified
//   timestamp: string;
//   createdAt: string;
// }

// export class DatabaseService {
//   private static db: SQLite.SQLiteDatabase | null = null;

//   static async initialize(): Promise<void> {
//     try {
//       this.db = await SQLite.openDatabaseAsync('hydronet.db');
//       await this.createTables();
//     } catch (error) {
//       console.error('Database initialization error:', error);
//       throw error;
//     }
//   }

//   private static async createTables(): Promise<void> {
//     if (!this.db) throw new Error('Database not initialized');

//     await this.db.execAsync(`
//       CREATE TABLE IF NOT EXISTS observations (
//         id TEXT PRIMARY KEY,
//         userId TEXT NOT NULL,
//         location TEXT NOT NULL,
//         latitude REAL NOT NULL,
//         longitude REAL NOT NULL,
//         depth REAL NOT NULL,
//         notes TEXT,
//         timestamp TEXT NOT NULL,
//         photos TEXT,
//         synced INTEGER DEFAULT 0,
//         createdAt TEXT NOT NULL
//       );
//     `);

//     await this.db.execAsync(`
//       CREATE TABLE IF NOT EXISTS predictions (
//         id TEXT PRIMARY KEY,
//         userId TEXT NOT NULL,
//         location TEXT NOT NULL,
//         latitude REAL NOT NULL,
//         longitude REAL NOT NULL,
//         predictionData TEXT NOT NULL,
//         timestamp TEXT NOT NULL,
//         createdAt TEXT NOT NULL
//       );
//     `);
//   }

//   static async saveObservation(observation: ObservationRecord): Promise<string> {
//     if (!this.db) throw new Error('Database not initialized');

//     const id = observation.id || this.generateId();
//     await this.db.runAsync(
//       `INSERT OR REPLACE INTO observations 
//        (id, userId, location, latitude, longitude, depth, notes, timestamp, photos, synced, createdAt) 
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         id,
//         observation.userId,
//         observation.location,
//         observation.latitude,
//         observation.longitude,
//         observation.depth,
//         observation.notes || '',
//         observation.timestamp,
//         observation.photos || '',
//         observation.synced ? 1 : 0,
//         observation.createdAt
//       ]
//     );

//     return id;
//   }

//   static async getObservations(userId: string): Promise<ObservationRecord[]> {
//     if (!this.db) throw new Error('Database not initialized');

//     const result = await this.db.getAllAsync(
//       'SELECT * FROM observations WHERE userId = ? ORDER BY createdAt DESC',
//       [userId]
//     );

//     return result.map(row => ({
//       ...row as any,
//       synced: Boolean(row.synced)
//     }));
//   }

//   static async getUnsyncedObservations(): Promise<ObservationRecord[]> {
//     if (!this.db) throw new Error('Database not initialized');

//     const result = await this.db.getAllAsync(
//       'SELECT * FROM observations WHERE synced = 0'
//     );

//     return result.map(row => ({
//       ...row as any,
//       synced: false
//     }));
//   }

//   static async markObservationSynced(id: string): Promise<void> {
//     if (!this.db) throw new Error('Database not initialized');

//     await this.db.runAsync(
//       'UPDATE observations SET synced = 1 WHERE id = ?',
//       [id]
//     );
//   }

//   static async savePrediction(prediction: PredictionRecord): Promise<string> {
//     if (!this.db) throw new Error('Database not initialized');

//     const id = prediction.id || this.generateId();
//     await this.db.runAsync(
//       `INSERT OR REPLACE INTO predictions 
//        (id, userId, location, latitude, longitude, predictionData, timestamp, createdAt) 
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         id,
//         prediction.userId,
//         prediction.location,
//         prediction.latitude,
//         prediction.longitude,
//         prediction.predictionData,
//         prediction.timestamp,
//         prediction.createdAt
//       ]
//     );

//     return id;
//   }

//   static async getPredictions(userId: string): Promise<PredictionRecord[]> {
//     if (!this.db) throw new Error('Database not initialized');

//     const result = await this.db.getAllAsync(
//       'SELECT * FROM predictions WHERE userId = ? ORDER BY createdAt DESC',
//       [userId]
//     );

//     return result as PredictionRecord[];
//   }

//   private static generateId(): string {
//     return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
//   }
// }
