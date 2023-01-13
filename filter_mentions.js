export default async function (params) {
  try {
    var db = require("./db");
    db = await db();
    // fetch the stored tweets
    const results = await db.execute(
      `SELECT competitor, classification, tweet_text as tweet, tweet_id, engagements FROM Tweets 
	  WHERE classification = '${params.classification}' AND competitor='${params.competitor}' ORDER by engagements DESC`
    );
    db.end();
    return results && results[0];
  } catch (e) {
    console.log(e);
    db.end();
  }
}
