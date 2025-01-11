require('dotenv').config();
const { ApolloServer } = require('apollo-server-express');
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const { graphqlUploadExpress } = require("graphql-upload-minimal");
const path = require("path");
const app = express();
app.use(cors());

// Import GraphQL schema and resolvers
const typeDefs = require('./graphql/typeDef');
const resolvers = require('./graphql/resolvers');

// MongoDB connection
mongoose
  .connect(
    'mongodb+srv://zainabubaker2002:qLPVFU.vLk2WBWe@villagemanagement.i6egh.mongodb.net/?retryWrites=true&w=majority&appName=VillageManagement',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));
  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Start Apollo Server with CORS enabled
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers.authorization || '';
    return { token };
  },
});

server.start().then(() => {
  server.applyMiddleware({ app });
  app.listen({ port: 4000 }, () => {
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
  });
});
