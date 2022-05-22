import { Client, ResultIterator } from 'ts-postgres';
import { config } from 'dotenv';

config()  // Read .env file

export class Database {
    static DB_HOSTNAME: string | undefined = process.env.DB_HOSTNAME;
    static DB_USERNM: string | undefined = process.env.DB_USERNM;
    static DB_PASSWD: string | undefined = process.env.DB_PASSWD;
    static DB_NAME: string | undefined = process.env.DB_NAME;

    static client: Client | null

    constructor() {
        this.connect()
    }

    async query(query: string): Promise<ResultIterator> {
        try {
            if (!Database.client) {
                Database.client = this.connect()
            }
            // Querying the client returns a query result promise
            // which is also an asynchronous result iterator.
            const result: ResultIterator = Database.client.query(
                query
            );

            return Promise.resolve(result)
        } catch (error) {
            let errMsg = `An error occurred: ${error}`
            return Promise.reject(new Error(errMsg))
        } finally {
        }
    }

    static close(): void {
        if (Database.client)
            Database.client.end()
        Database.client = null
    }

    connect(): Client {
        // Connect to Database 
        if (Database.client == null) {
            Database.client = new Client({
                "host": Database.DB_HOSTNAME,
                "password": Database.DB_PASSWD,
                "user": Database.DB_USERNM,
                "database": Database.DB_NAME
            })
            Database.client.connect()
                .catch(err => {
                    let errMsg = `Error: ${err}`
                    Database.client = null
                    throw new Error(errMsg)
                })
        }
        return Database.client
    }
}
