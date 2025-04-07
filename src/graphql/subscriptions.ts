import { gql } from '@apollo/client';

export const POST_CREATED_SUBSCRIPTION = gql`
  subscription OnPostCreated {
    postCreated {
      id
      title
      content
      author
      date
      tags
      category
      createdAt
      updatedAt
    }
  }
`;

export const POST_UPDATED_SUBSCRIPTION = gql`
  subscription OnPostUpdated {
    postUpdated {
      id
      title
      content
      author
      date
      tags
      category
      createdAt
      updatedAt
    }
  }
`;

export const POST_DELETED_SUBSCRIPTION = gql`
  subscription OnPostDeleted {
    postDeleted
  }
`;

export const PING_SUBSCRIPTION = gql`
  subscription OnPing {
    _ping
  }
`; 