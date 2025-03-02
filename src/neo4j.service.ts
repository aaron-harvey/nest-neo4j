import { Injectable, Inject, OnApplicationShutdown } from '@nestjs/common';
import neo4j, { Driver, Result, int, Transaction } from 'neo4j-driver'
import { Neo4jConfig } from './interfaces/neo4j-config.interface';
import { NEO4J_OPTIONS, NEO4J_DRIVER } from './neo4j.constants';

@Injectable()
export class Neo4jService implements OnApplicationShutdown  {

    private readonly driver: Driver;
    private readonly config: Neo4jConfig;

    constructor(
        @Inject(NEO4J_OPTIONS) config: Neo4jConfig,
        @Inject(NEO4J_DRIVER) driver: Driver
    ) {
        this.driver = driver
        this.config = config
    }

    getDriver(): Driver {
        return this.driver;
    }

    getConfig(): Neo4jConfig {
        return this.config;
    }

    int(value: number) {
        return int(value)
    }

    beginTransaction(database?: string): Transaction {
        const session = this.getWriteSession(database)

        return session.beginTransaction()
    }

    getReadSession(database?: string) {
        return this.driver.session({
            database: database || this.config.database,
            defaultAccessMode: neo4j.session.READ,
        })
    }

    getWriteSession(database?: string) {
        return this.driver.session({
            database: database || this.config.database,
            defaultAccessMode: neo4j.session.WRITE,
        })
    }

    read(cypher: string, params?: Record<string, any>, databaseOrTransaction?: string | Transaction): Result {
        if ( databaseOrTransaction instanceof Transaction ) {
            return (<Transaction> databaseOrTransaction).run(cypher, params)
        }

        const session = this.getReadSession(<string> databaseOrTransaction)
        return session.run(cypher, params)
    }

    write(cypher: string, params?: Record<string, any>,  databaseOrTransaction?: string | Transaction): Result {
        if ( databaseOrTransaction instanceof Transaction ) {
            return (<Transaction> databaseOrTransaction).run(cypher, params)
        }

        const session = this.getWriteSession(<string> databaseOrTransaction)
        return session.run(cypher, params)
    }

    onApplicationShutdown() {
        return this.driver.close()
    }
}