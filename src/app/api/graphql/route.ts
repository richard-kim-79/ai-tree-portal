import { createYoga } from 'graphql-yoga';
import { schema } from '../../../graphql/schema';
import { resolvers } from '../../../graphql/resolvers';

const yoga = createYoga({
  schema,
  graphqlEndpoint: '/api/graphql',
  fetchAPI: { Response },
  cors: {
    origin: '*',
    credentials: true,
    methods: ['POST', 'GET', 'OPTIONS']
  }
});

export { yoga as GET, yoga as POST }; 