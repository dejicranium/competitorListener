const TwitterAPi = require("twitter-api-v2").TwitterApi;
const moment = require("moment");

// initialize CLient
const twitterClient = new TwitterAPi({
  appKey: process.env.TWITTER_CONSUMER_KEY,
  appSecret: process.env.TWITTER_CONSUMER_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  clientSecret: process.env.TWITTER_CLIENT_SECRET,
  clientId: process.env.TWITTER_CLIENT_ID,
});

async function storeBulkTweets(data) {
  // data is an array of arrays, for bulk insertion

  // instatiate our mysql client
  try {
    let db = require("./db");
    db = await db();

    const result = await db.execute(
      `INSERT INTO Tweets(competitor, tweet_text, tweet_id, engagements, createdAt) values ${db.escape(
        data
      )}`
    );
    db.end();
    return result && result[0];
  } catch (e) {
    console.log(e);
    db.end();
  }
}

// our entry point function
export default async function (params) {
  params.hours = params.hours || 1; // fetch tweets from a specified number of hours until now
  params.count = params.count || 20;

  const competitors = ["Shopify", "Squarespace"];

  const moment = require("moment");
  const url = "https://api.twitter.com/2/tweets/search/recent?";

  const start_time = moment()
    .subtract(params.hours, "hours")
    .format("YYYY-MM-DDTHH:mm:ssZ");

  const end_time = moment()
    .subtract(20, "seconds") // 20 seconds before request was made
    .format("YYYY-MM-DDTHH:mm:ssZ");

  const tweets = [];

  await Promise.all(
    competitors.map(async (competitor) => {
      // to build query string for Twitter's search API
      let query = {
        start_time,
        end_time,
        query: `"${competitor}" lang:en`,
        max_results: params.count,
        sort_order: "relevancy",
        "tweet.fields": "public_metrics",
      };
      query = new URLSearchParams(query).toString();

      let mentions = await twitterClient.get(url + query);
      mentions = mentions.data;
      for (let mention of mentions) {
        const {
          retweet_count,
          reply_count,
          like_count,
          quote_count,
          impression_count,
        } = mention.public_metrics;

        const engagements =
          retweet_count +
          reply_count +
          like_count +
          quote_count +
          impression_count;

        const row = [
          competitor,
          mention.text,
          mention.id,
          engagements,
          new Date(),
        ];
        tweets.push(row);
      }
    })
  );
  await storeBulkTweets(tweets);
  return tweets;
}
