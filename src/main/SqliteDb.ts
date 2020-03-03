import {Database, OPEN_READWRITE} from "sqlite3";

export const openDatabase = async (filename: string, mode: number = OPEN_READWRITE): Promise<SqliteDb> => {
    return new Promise((resolve, reject) => {
        const db: Database = new Database(filename, mode, err => {
            if (err) {
                return reject(err);
            }
            return resolve(new SqliteDb(db));
        });
    });
};

export default class SqliteDb {
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    async findFirst(sql: string, params: any = []): Promise<any> {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    return reject(err);
                }
                return resolve(row);
            });
        });
    }

    async findAll(sql: string, params: any = []): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    return reject(err);
                }
                return resolve(rows);
            });
        });
    }

    async run(sql: string, params: any = []): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, err => {
                if (err) {
                    return reject(err);
                }
                return resolve();
            });
        });
    }

    async dispose(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.close(err => {
                if (err) {
                    return reject(err);
                }
                return resolve();
            });
        });
    }
}
