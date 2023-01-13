// This is your task's entrypoint. When your task is executed, this
// function will be called.
const { Configuration, OpenAIApi } = require("openai");
const { connect } = require("http2");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function classifyTweet(tweet) {
  const classifier = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Classify sentiment in text: ${tweet}`,
    temperature: 0,
    max_tokens: 60,
    top_p: 1.0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
  });
  return classifier?.data?.choices[0]?.text?.replace("\n", "").trim();
}

export default async function (params) {
  try {
    var db = require("./db");
    db = await db();

    const data = []; // to store array of arrays used for bulk update

    // fetch the stored tweets
    const results = await db.execute(
      `SELECT * FROM Tweets WHERE classification is NULL LIMIT 20`
    );

    for (tweet of results[0]) {
      let classification = await classifyTweet(tweet.tweet_text);
      data.push([tweet.id, classification]);
    }

    // update

    await db.execute(
      `INSERT INTO Tweets (id, classification) VALUES ${db.escape(
        data
      )} ON DUPLICATE KEY UPDATE classification = VALUES(classification)`
    );
    db.end();

    //
  } catch (e) {
    console.log(e);
    db.end();
  }
}
