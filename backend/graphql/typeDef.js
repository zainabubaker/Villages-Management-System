const { gql } = require('apollo-server');

const typeDef = gql`

  type User {
    id: ID!
    fullName: String!
    username: String!
    password: String!
    role: String!
  }

  type Village {
    id: ID!
    name: String!
    region: String!
    landArea: Float!
    latitude: Float!
    longitude: Float!
    demographics: Demographics
  }

 type AgeDistribution {
  age_0_14: Int
  age_15_64: Int
  age_65_plus: Int
}

type GenderRatios {
  male: Int
  female: Int
}

input AgeDistributionInput {
  age_0_14: Int!
  age_15_64: Int!
  age_65_plus: Int!
}

input GenderRatiosInput {
  male: Int!
  female: Int!
}

input DemographicsInput {
  populationSize: Int!
  ageDistribution: AgeDistributionInput!
  genderRatios: GenderRatiosInput!
  growthRate: Float!
}

type Demographics {
  populationSize: Int
  ageDistribution: AgeDistribution
  genderRatios: GenderRatios
  growthRate: Float
}


  type Image {
    id: ID!
    url: String!
    description: String!
  }

  type Query {
    users(role: String): [User] 
    villages: [Village]
    gallery: [Image!]!
    getUser(token: String!): User
    messages(conversationId: String!): [Message]
  }
    scalar Upload
    type AuthPayload {
  token: String!
  role: String!
  
}
  

  type Mutation {
    signup(fullName: String!, username: String!, password: String!): User
     login(username: String!, password: String!): AuthPayload
    addVillage(name: String!, region: String!, landArea: Float!, latitude: Float!, longitude: Float!): Village
    updateVillage(id: ID!, name: String, region: String, landArea: Float, latitude: Float, longitude: Float): Village
    deleteVillage(id: ID!): String
     uploadImage(file: Upload!, description: String!): Image
    addDemographics(id: ID!, input: DemographicsInput!): Village
  }
   type Message {
  
  conversationId: String!
  senderId: String!
  receiverId: String!
  message: String!
  timestamp: String!
}
  
`;

module.exports = typeDef;
