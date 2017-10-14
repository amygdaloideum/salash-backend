import { v1 as neo4j } from 'neo4j-driver';

export default neo4j.driver(
    process.env.GRAPHENEDB_BOLT_URL,
    neo4j.auth.basic(process.env.GRAPHENEDB_BOLT_USER, process.env.GRAPHENEDB_BOLT_PASSWORD)
);
