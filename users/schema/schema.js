const graphql = require("graphql");
const axios = require("axios");
const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLSchema, GraphQLList, GraphQLNonNull } = graphql;

const CompanyType = new GraphQLObjectType({
  name: "Company",
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    users: {
      type: new GraphQLList(UserType),
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/companies/${parentValue.id}/users`).then(res => res.data);
      }
    }
  })
});

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: {
      type: CompanyType,
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/companies/${parentValue.companyId}`).then(res => res.data);
      }
    }
  })
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/users/${args.id}`).then(resp => resp.data);
      }

      // query {
      //   user(id:"41"){
      //     firstName
      //     age
      //     company
      //   }
      // }
    },
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/companies/${args.id}`).then(resp => resp.data);
      }
      // query {
      //   company(id:"1"){
      //     id
      //     name
      //     description
      //   }
      // }
    },
    users: {
      type: new GraphQLList(UserType),
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/users`).then(resp => resp.data);
      }
      //  query {
      //   users{
      //     firstName
      //     age
      //     company {
      //       id
      //     }
      //   }
      // }
    }
  }
});

const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addUser: {
      type: UserType,
      args: {
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: GraphQLInt },
        companyId: { type: GraphQLString }
      },
      resolve(parentValue, { firstName, age, companyId }) {
        return axios.post("http://localhost:3000/users", { firstName, age, companyId }).then(res => res.data);
      }

      //  Example
      //  mutation {
      //   addUser(firstName: "Boss", age: 8, companyId: "1"){
      //     firstName
      //     age,
      //     company {
      //       id
      //     }
      //   }
      // }
    },
    deleteUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve(parentValue, { id }) {
        return axios.delete(`http://localhost:3000/users/${id}`).then(res => res.data);
      }

      //  Example
      //  mutation {
      //   deleteUser(){
      //     firstName
      //     age,
      //     company {
      //       id
      //     }
      //   }
      // }
    }
  }
});

module.exports = new GraphQLSchema({
  mutation,
  query: RootQuery
});
