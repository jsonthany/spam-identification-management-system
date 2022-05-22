import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Database } from '../../src/database/Database';

chai.use(chaiAsPromised); // Bind chai-as-promised extension

describe("Database Connector", () => {
  var db: Database;

  before(async () => {
    db = new Database()
  })

  after(() => {
    Database.close()
  })

  it("Should make basic 'SELECT *' query on emails", async () => {
    let res;
    res = await db.query("select * from emails;")
    expect(res.names.length).greaterThan(0)
  })
})