import botkit from 'botkit';
// Request API access: http://www.yelp.com/developers/getting_started/api_access
const Yelp = require('yelp');

const yelp = new Yelp({
  consumer_key: '-_1KpAEOaNwru8fE66TbcQ',
  consumer_secret: 'bFkWcgL0_03XeMdBPmd4_suW5Ck',
  token: 'wEHDFLc4Mw9OUYgG9CoA1NH2Q4hLyjN_',
  token_secret: 'uuUPP1-W01p0igV0NngEBNMd8qU',
});
// See http://www.yelp.com/developers/documentation/v2/search_api
// yelp.search({ term: 'food', location: '03755' })
// .then((data) => {
//   data.businesses.forEach(business => {
//     // do something with business
//   });
// });

console.log('starting bot');
// botkit controller
const controller = botkit.slackbot({
  debug: false,
});

// initialize slackbot
const slackbot = controller.spawn({
  token: process.env.SLACK_BOT_TOKEN,
  // this grabs the slack token we exported earlier
}).startRTM(err => {
  // start the real time message client
  if (err) { throw new Error(err); }
});

// prepare webhook
// for now we won't use this but feel free to look up slack webhooks
controller.setupWebserver(process.env.PORT || 3001, (err, webserver) => {
  controller.createWebhookEndpoints(webserver, slackbot, () => {
    if (err) { throw new Error(err); }
  });
});
// example hello response
controller.hears(['hungry'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  yelp.search({ term: 'food', location: '03755' })
      .then((data) => {
        bot.reply(message, 'Here are some options!');
        data.businesses.forEach(business => {
          // do something with business
          // bot.reply(message, `Hello, ${business.name}!`);
          bot.reply(message, {
            'attachments': [
              {
                'title': business.name,
                'image_url': business.image_url,
                'text': business.snippet_text,
                'color': '#7CD197',
              },
            ],
            //'icon_url': 'http://lorempixel.com/48/48',
          });
        });
      });
});
controller.hears(['hello', 'hi', 'howdy'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  bot.api.users.info({ user: message.user }, (err, res) => {
    if (res) {
      bot.reply(message, `Hello, ${res.user.name}!`);
    } else {
      bot.reply(message, 'Hello there!');
    }
  });
});


controller.hears('open the (.*) doors', ['message_received'], (bot, message) => {
  const doorType = message.match[1]; // match[1] is the (.*) group. match[0] is the entire group (open the (.*) doors).
  if (doorType === 'pod bay') {
    bot.reply(message, 'I\'m sorry, Dave. I\'m afraid I can\'t do that.');
  }
  return bot.reply(message, 'Okay');
});
// reply to a direct mention - @bot hello
controller.on('direct_mention', (bot, message) => {
  // reply to _message_ by using the _bot_ object
  bot.reply(message, 'I heard you mention me!');
});
// reply to a direct message
controller.on('direct_message', (bot, message) => {
  // reply to _message_ by using the _bot_ object
  bot.reply(message, 'You are talking directly to me');
});
// controller.on('message_received', (bot, message) => {
//   bot.reply(message, 'I heard... something!');
// });
controller.on('outgoing_webhook', (bot, message) => {
  bot.replyPublic(message, 'yeah yeah');
});
