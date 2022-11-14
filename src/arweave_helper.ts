const gql = require("graphql-request").gql;

export = {
  argoraQuery: (addresses: [String], minBlockHeight: number) => gql`
  query {
    transactions(
      sort: HEIGHT_DESC
      tags: [
        { name: "App-Name", values: ["argora"] }
        { name: "reply-to", values: ["world", "profile"] }
        { name: "App-Version", values: ["1.0", "1.1"] }
      ]
      block: {min: ${minBlockHeight}, max: 1000000000}
      owners: ${JSON.stringify(addresses)}
    ) {
      edges {
        node {
          id
          block {
            timestamp
          }
          owner {
            address
            key
          }
  
          tags {
            name
            value
          }
        }
      }
    }
  }
  
  `,
  ARWEAVE_GQL_ENDPOINT: "https://arweave.net/graphql",
  ARWEAVE_GATEWAY: "https://arweave.net",
};
