# gatsby-source-stamped

<details>
<summary><strong>Table of contents</strong></summary>

- [gatsby-source-stamped](#gatsby-source-stamped)
    - [Install](#install)
    - [Setup Instructions](#setup-instructions)
        - [Configuration](#configuration)
        - [Configuration options](#configuration-options)
    - [How to query for reviews](#how-to-query-for-reviews)
        - [Reviews](#reviews)
        - [Product rating summary](#product-rating-summary)
    - [Credits](#credits)
</details>

## Install

```shell
npm install gatsby-source-stamped
```

## Setup Instructions

### Configuration

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-stamped`,
      options: {
        publicKey: `your_stamped_public_key`,
        privateKey: `your_stamped_private_key`,
        storeHash: `your_stamped_store_hash`,
      },
    }
  ],
}
```

### Configuration options

Your keys and store hash can be downloaded from your [Stamped](https://stamped.io/) dashboard.

Stamped public key

**`publicKey`** [string][required]

Stamped private key

**`privateKey`** [string][required]

Stamped store hash

**`storeHash`** [string][required]

Disable plugin cache (optional)

**`disableCache`** [boolean][optional]

## How to query for reviews

The source plugin exposes two main node types available from Stamped API: `Review` and `Products Ratings Summary`.

`Review` nodes will be available in your site's GraphQL schema under `stampedReview` and `allStampedReview`.

`Products Ratings Summary` nodes will be available in your site's GraphQL schema under `stampedRatingSummary` and `allStampedRatingSummary`.

### Reviews

To query for all reviews:

```graphql
{
  allStampedReview {
    nodes {
      id
      rating
      body
      author
      date: dateCreated(formatString: "MM/DD/YYYY")
    }
  }
}
```

To query for all reviews associated to a product:

```graphql
{
  allStampedReview(filter: {review: {productId: {eq: productId}}}) {
    edges {
      node {
        id
        review {
          id
          rating
          title
          body
          author
          date: dateCreated(formatString: "MM/DD/YYYY")
        }
      }
    }
  }
}
```

### Product rating summary

To query for a single `stampedRatingSummary` node for a product:

```graphql
  {
    stampedRatingSummary(productId: {eq: "productId"}) {
      id
      badge
      rating
      count
    }
  }
```

## Credits

Plugin created and maintained [YYT](https://yyt.dev) eCommerce development team.
