const app = require("../app.js");
const chai = require("chai");
const chaiHttp = require("chai-http");
const proxyquire = require("proxyquire");

chai.use(chaiHttp);
const expect = chai.expect;

class XeroStub {
  constructor() {
    this.tenantIds = ["1a2b3c4d"];
    this.accountingApi = {
      getAccounts: () => ({ body: { accounts: {} } }),
      getContacts: () => ({ body: { contacts: {} } })
    };
  }
}

describe("The homepage", function() {
  this.timeout(5000);

  it("should load", done => {
    chai
      .request(app)
      .get("/")
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.html;
      })
      .catch(err => {
        throw err;
      })
      .then(() => done());
  });
});

describe("The connect route", () => {
  it("should redirect xero's login page", done => {
    chai
      .request(app)
      .get("/connect")
      .then(res => {
        expect(res).to.redirectTo(/login\.xero\.com/);
      })
      .catch(err => {
        throw err;
      })
      .then(() => done());
  });
});

describe("The callback route", () => {
  it("should 404 when NOT yet authenticated by Xero", done => {
    chai
      .request(app)
      .get("/callback")
      .then(res => {
        expect(res).to.have.status(500);
        expect(res).to.be.html;
      })
      .catch(err => {
        throw err;
      })
      .then(() => done());
  });

  it("should redirect when authenticated via Xero", done => {
    done(); // @TODO: implement this
  });
});

describe("The organization route", () => {
  it("should 404 when NOT yet authenticated via Xero", done => {
    chai
      .request(app)
      .get("/organization")
      .then(res => {
        expect(res).to.have.status(500);
        expect(res).to.be.html;
      })
      .catch(err => {
        throw err;
      })
      .then(() => done());
  });

  it("should render a page when authenticated via Xero", done => {
    const appWithMock = proxyquire("../app.js", {
      "xero-node": { XeroClient: XeroStub }
    });

    chai
      .request(appWithMock)
      .get("/organization")
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.html;
      })
      .catch(err => {
        throw err;
      })
      .then(() => done());
  });

  it("should write files for accounts and contacts", done => {
    done(); // @TODO: implement this
  });
});
