export default async function (params) {
  try {
    var db = require("./db");
    db = await db();

    // fetch the stored tweets
    const results = await db.execute(
      `SELECT competitor, classification, count(classification) as count FROM Tweets WHERE classification is NOT NULL GROUP BY classification`
    );

    db.end();
    return results && results[0];

    //
  } catch (e) {
    console.log(e);
    db.end();
  }
}
