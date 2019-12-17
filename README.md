# Xero "So Fictitious Pub" Project

[Assignment details](https://docs.google.com/document/d/16hj_zqOK9DcH1zOXeDfVg_bQxdxDN178E_bM5zjUnxA/edit)

# Getting started

## Pre-Requisites

Node `>=10.13` is required due to some of the project's dependencies. Additionally, you will need a Xero app along with its Client ID and Client Secret. You must include the id and secret to a `.env` file in this project's root directory. For example, a `.env` might look like this:

```
CLIENT_ID=1234asdf5678qwer
CLIENT_SECRET=a1b2c3d4e5f6g7h8i9j0-a1b2c3d4e5f6g7h8i9j0
```

## Get running

Install dependencies:

```
npm i
```

Run the server:

```
npm start
```

The server is hosted and can be visited at the following url: http://localhost:5000/

Run the tests:

```
npm test
```

# Backend and Data

This application uses [Xero](https://www.xero.com/ca/) as the backend. This application makes a request to get a list of "accounts" and "contacts" (or "Accounts" and "Vendors" as described in the assignment doc above). This data is then stored locally in json files in the `/tmp` directory. Two such files are created:

- `/tmp/accounts.json`
- `/tmp/contacts.json`

Any accounts and contacts in your Xero app will be added to the above files when you connect to this project's server at http://localhost:5000/ (you will need to click "Connect to Xero" link and follow the steps).
