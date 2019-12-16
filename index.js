"use strict";

const express = require("express");
const session = require("express-session");
const xero_node = require("xero-node");

const to_names_only = (acc, { name }) => {
  return acc + `<li>${name}</li>`;
};

// How shall I handle secret keys?
const CLIENT_ID = "040C0252E5A14F27A635BD5860B070FB";
const CLIENT_SECRET = "5UeJnayOig7i2R6O4oC2_thAL-ZBd7r2jXV0dtsxHDOZjcpM";

const redirectUri = ["http://localhost:5000/callback"];
const scopes = [
  "openid",
  "profile",
  "email",
  "accounting.contacts.read",
  "accounting.transactions",
  "accounting.settings",
  "offline_access"
];

const xero = new xero_node.XeroClient({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  redirectUris: redirectUri,
  scopes
});

let app = express();

app.set("port", process.env.PORT || 3000);
app.use(express.static(__dirname + "/public"));
app.use(
  session({
    secret: "something crazy",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  })
);

app.get("/", function(req, res) {
  res.send('<a href="/connect">Connect to Xero</a>');
});

app.get("/connect", async function(req, res) {
  try {
    let consentUrl = await xero.buildConsentUrl();
    res.redirect(consentUrl);
  } catch (err) {
    res.send("Sorry, something went wrong");
  }
});

app.get("/callback", async function(req, res) {
  const url = "http://localhost:5000/" + req.originalUrl;
  await xero.setAccessTokenFromRedirectUri(url);

  // Optional: read user info from the id token
  let tokenClaims = await xero.readIdTokenClaims();
  const accessToken = await xero.readTokenSet();

  req.session.tokenClaims = tokenClaims;
  req.session.accessToken = accessToken;
  req.session.xeroTenantId = xero.tenantIds[0];
  res.redirect("/organisation");
});

app.get("/organisation", async function(req, res) {
  try {
    let body = "";
    let response;

    // Accounts
    response = await xero.accountingApi.getAccounts(xero.tenantIds[0]);
    let { accounts } = response.body;
    accounts = accounts.reduce(to_names_only, "");
    body += `<h1>Accounts</h1> <ul>${accounts}</ul>`;

    // Contacts
    response = await xero.accountingApi.getContacts(xero.tenantIds[0]);
    let { contacts } = response.body;
    contacts = contacts.reduce(to_names_only, "");
    body += `<h1>Contacts</h1> <ul>${contacts}</ul>`;

    res.send(body);
  } catch (err) {
    res.send(`Sorry, something went wrong: ${err}`);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, function() {
  console.log("Your Xero basic public app is running at localhost:" + PORT);
});
