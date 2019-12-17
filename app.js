const dotenv = require("dotenv");
const express = require("express");
const fs = require("fs");
const session = require("express-session");
const xero_node = require("xero-node");

dotenv.config();

function write_to_file(path, content) {
  fs.mkdirSync("tmp", { recursive: true });
  fs.writeFileSync(path, content, { encoding: "utf8" });
}

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
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUris: redirectUri,
  scopes
});

const app = express();

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
  const url = "http://localhost:5000" + req.originalUrl;

  try {
    await xero.setAccessTokenFromRedirectUri(url);
    const tokenClaims = await xero.readIdTokenClaims();
    const accessToken = await xero.readTokenSet();

    req.session.tokenClaims = tokenClaims;
    req.session.accessToken = accessToken;
    req.session.xeroTenantId = xero.tenantIds[0];

    res.redirect("/organization");
  } catch (err) {
    res.status(500).send(`Sorry, something went wrong`);
  }
});

app.get("/organization", async function(req, res) {
  try {
    // If there are no ids, we are unauthenticated
    const tenantId = xero.tenantIds[0];

    // Accounts
    let accounts = await xero.accountingApi.getAccounts(tenantId);
    accounts = accounts.body.accounts;
    write_to_file("tmp/accounts.json", JSON.stringify(accounts));

    // Contacts
    let contacts = await xero.accountingApi.getContacts(tenantId);
    contacts = contacts.body.contacts;
    write_to_file("tmp/contacts.json", JSON.stringify(contacts));

    res.send("Accounts and Contacts saved to disk in <code>/tmp</code>");
  } catch (err) {
    res.status(500).send(`Sorry, something went wrong`);
  }
});

module.exports = app;
