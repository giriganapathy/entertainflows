/*-----------------------------------------------------------------------------
author: giri ganapathy
-----------------------------------------------------------------------------*/
var builder = require('botbuilder');
var restify = require("restify");
// Create LUIS Dialog that points at our model and add it as the root '/' dialog for our Cortana Bot.
//var model = process.env.model || 'https://api.projectoxford.ai/luis/v1/application?id=c413b2ef-382c-45bd-8ff0-f76d60e2a821&subscription-key=6d0966209c6e4f6b835ce34492f3e6d9&q=';
//var dialog = new builder.LuisDialog(model);
//var connector = new builder.ConsoleConnector().listen();
var connector = new builder.ChatConnector({
    "appId": process.env.MICROSOFT_APP_ID,
    "appPassword": process.env.MICROSOFT_APP_PASSWORD
});
//Setting up Restify Server.
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log("%s listening to %s", server.name, server.url);
});
var bot = new builder.UniversalBot(connector);
server.post("/api/messages", connector.listen());
//Bots Dialogs...
bot.dialog('/', [
    function (session) {
        builder.Prompts.text(session, "Hello... What's your name?");
    },
    function (session, results) {
        session.userData.name = results.response;
        
        //builder.Prompts.number(session, "Hi " + results.response + ", How many years have you been coding?");
        /*var soap = require("soap");
        var url = "https://www98.verizon.com/foryourhome/vzrepair/flowengine/UFDGateway.asmx?wsdl";
        soap.createClient(url, function (err, client) {
            try {
                client.GetFlowUrl(function (err, result) {
                    //console.log("gg:" + result);
                    session.send("UFD Response:", result);
                });
            }
            catch (e) {
                console.log("error: " + e);
            }
        });*/
        session.send("Here is entertainment tonight.");
        // Ask the user to select an item from a carousel.
        var msg = new builder.Message(session)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments([
            new builder.HeroCard(session)
                    .title("Bachelor in Paradise")
                    .subtitle("Bachelor in Paradise.")
                    .images([
                            builder.CardImage.create(session, "http://image.vam.synacor.com.edgesuite.net/21/8b/218bbf0516938edc170bc8509e5acc9b30717074/w=414,h=303,crop=auto/?sig=88c390c980d4fa53d37ef16fbdc53ec3dfbad7d9fa626949827b76ae37140ac3&app=powerplay")
                            .tap(builder.CardAction.showImage(session, "http://image.vam.synacor.com.edgesuite.net/21/8b/218bbf0516938edc170bc8509e5acc9b30717074/w=414,h=303,crop=auto/?sig=88c390c980d4fa53d37ef16fbdc53ec3dfbad7d9fa626949827b76ae37140ac3&app=powerplay")),
            ])
                    .buttons([
                builder.CardAction.openUrl(session, "https://m.verizon.com/myverizonmobile/router.aspx?token=tvlisting", "Record"),
                builder.CardAction.imBack(session, "select:100", "Watch Trailer"),
                builder.CardAction.playVideo(session, "http://progressive.totaleclips.com.edgesuite.net/382/e38285_302.mp4", "Play")
            ]),
            new builder.HeroCard(session)
                    .title("Game of Thrones")
                    .subtitle("Game of Thrones")
                    .images([
                builder.CardImage.create(session, "http://ia.media-imdb.com/images/M/MV5BMjM5OTQ1MTY5Nl5BMl5BanBnXkFtZTgwMjM3NzMxODE@._V1_UX182_CR0,0,182,268_AL_.jpg")
                            .tap(builder.CardAction.showImage(session, "http://ia.media-imdb.com/images/M/MV5BMjM5OTQ1MTY5Nl5BMl5BanBnXkFtZTgwMjM3NzMxODE@._V1_UX182_CR0,0,182,268_AL_.jpg")),
            ])
                    .buttons([
                builder.CardAction.openUrl(session, "https://m.verizon.com/myverizonmobile/router.aspx?token=tvlisting", "Record"),
                builder.CardAction.imBack(session, "select:101", "Watch Trailer"),
                builder.CardAction.playVideo(session, "http://progressive.totaleclips.com.edgesuite.net/382/e38285_302.mp4", "Play")
            ]),
            new builder.HeroCard(session)
                    .title("The Night Of")
                    .subtitle("The Night Of")
                    .images([
                builder.CardImage.create(session, "http://ia.media-imdb.com/images/M/MV5BMjQyOTgxMDI0Nl5BMl5BanBnXkFtZTgwOTE4MzczOTE@._V1_UX182_CR0,0,182,268_AL_.jpg")
                            .tap(builder.CardAction.showImage(session, "http://ia.media-imdb.com/images/M/MV5BMjQyOTgxMDI0Nl5BMl5BanBnXkFtZTgwOTE4MzczOTE@._V1_UX182_CR0,0,182,268_AL_.jpg"))
            ])
                    .buttons([
                builder.CardAction.openUrl(session, "https://m.verizon.com/myverizonmobile/router.aspx?token=tvlisting", "Record"),
                builder.CardAction.imBack(session, "select:102", "Watch Trailer"),
                builder.CardAction.playVideo(session,"http://progressive.totaleclips.com.edgesuite.net/382/e38285_302.mp4","Play")
            ]),
            new builder.HeroCard(session)
                    .title("Animal Kingdom")
                    .subtitle("Animal Kingdom.")
                    .images([
                builder.CardImage.create(session, "http://ia.media-imdb.com/images/M/MV5BMTYxODQ0MTA5MF5BMl5BanBnXkFtZTgwODM5MTY3NjE@._V1_UY268_CR1,0,182,268_AL_.jpg")
                            .tap(builder.CardAction.showImage(session, "http://ia.media-imdb.com/images/M/MV5BMTYxODQ0MTA5MF5BMl5BanBnXkFtZTgwODM5MTY3NjE@._V1_UY268_CR1,0,182,268_AL_.jpg"))
            ])
                    .buttons([
                builder.CardAction.openUrl(session, "https://m.verizon.com/myverizonmobile/router.aspx?token=tvlisting", "Record"),
                builder.CardAction.imBack(session, "select:103", "Watch Trailer"),
                builder.CardAction.playVideo(session, "http://progressive.totaleclips.com.edgesuite.net/382/e38285_302.mp4", "Play")
            ]),
            new builder.HeroCard(session)
                    .title("Preacher")
                    .subtitle("Preacher")
                    .images([
                builder.CardImage.create(session, "http://ia.media-imdb.com/images/M/MV5BMTYzMDE2MzI4MF5BMl5BanBnXkFtZTgwNTkxODgxOTE@._V1_UX182_CR0,0,182,268_AL_.jpg")
                            .tap(builder.CardAction.showImage(session, "http://ia.media-imdb.com/images/M/MV5BMTYzMDE2MzI4MF5BMl5BanBnXkFtZTgwNTkxODgxOTE@._V1_UX182_CR0,0,182,268_AL_.jpg"))
            ])
                    .buttons([
                builder.CardAction.openUrl(session, "https://m.verizon.com/myverizonmobile/router.aspx?token=tvlisting", "Record"),
                builder.CardAction.imBack(session, "select:104", "Watch Trailer"),
                builder.CardAction.playVideo(session, "http://progressive.totaleclips.com.edgesuite.net/382/e38285_302.mp4", "Play")
            ])
        ]);
        builder.Prompts.choice(session, msg, "select:100|select:101|select:102|select:103|select:104");
    },
    function (session, results) {
        session.endDialog("Thanks");
    }        
]);
//# sourceMappingURL=server.js.map
//# sourceMappingURL=server.js.map
