/*-----------------------------------------------------------------------------
author: giri ganapathy
-----------------------------------------------------------------------------*/
var builder = require('botbuilder');
var restify = require("restify");
var ufd = require("./ufd-integration");
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
//middleware logging the request.
/*bot.use({
    botbuilder: function (session, next) {
        if (null != session.userData.prevRequest) {
            session.send(session.userData.prevRequest);
        }
        next();
    }
});*/
//Bots Dialogs...
bot.dialog('/', function (session) {
    var reqData = { "Flow": "TroubleShooting Flows\\Test\\GSTest.xml", "Request": { "ThisValue": "1" } };
    var prevRequest = null;
    if (null != session.userData.prevRequest) {
        prevRequest = session.userData.prevRequest;
        session.send("Sending to UFD:" + JSON.stringify(prevRequest));
    }
    else {
        session.send("Sending to UFD:" + JSON.stringify(reqData));
    }
    ufd.lookupQuestion(session.message.text, prevRequest, function (err, responseJSON) {
        if (null != err) {
            session.send("Error:" + err.description);
            session.send("Raw Data:" + err.data);
            if (null != session.userData.prevRequest) {
                delete session.userData.prevRequest;
            }
            session.endDialog();
            return;
        }
        var currRequest = {};
        if (null != responseJSON) {
            try {
                session.send("Response from UFD:" + JSON.stringify(responseJSON));
            }
            catch (ex) {
                console.log(ex);
            }
            currRequest["Platform"] = responseJSON["Inputs"]["newTemp"]["Section"]["Inputs"]["Platform"];
            currRequest["SessionID"] = responseJSON["Inputs"]["newTemp"]["Section"]["Inputs"]["SessionID"];
            currRequest["CurrentStep"] = responseJSON["CurrentStep"];
            currRequest["SubFlow"] = responseJSON["SubFlow"];
            currRequest["TID"] = responseJSON["TID"];
            currRequest["Level"] = responseJSON["Level"];
            currRequest["Flow"] = responseJSON["SubFlow"];
        }
        if (null != session.userData.prevRequest) {
            delete session.userData.prevRequest;
        }
        session.userData.prevRequest = currRequest;
        var response = responseJSON["Inputs"]["newTemp"]["Section"]["Inputs"];
        var questionType = response["user-response-type"];
        switch (questionType) {
            case "text":
                session.beginDialog("/processText", { "response": response });
                break;
            case "choice":
                session.beginDialog("/processChoice", { "response": response });
                break;
            case "carousel":
                session.beginDialog("/processCarousel", { "response": response });
                break;
            default:
                session.beginDialog("/processText", { "response": response });
                break;
        }
    });
});
bot.dialog("/processText", [
    function (session, args) {
        var response = args["response"];
        if (null != response) {
            var questionText = response["Response"]["text"];
            builder.Prompts.text(session, questionText);
        }
    },
    function (session, results) {
        if (results.response) {
            if (null != session.userData.prevRequest) {
                if (null != session.userData.prevRequest["Request"]) {
                    delete session.userData.prevRequest["Request"];
                }
                session.userData.prevRequest["Request"] = { "ThisValue": results.response };
            }
        }
        else {
            session.send("No response from Customer.2..");
        }
        session.replaceDialog("/");
    }
]);
bot.dialog("/processChoice", [
    function (session, args) {
        var response = args["response"];
        if (null != response) {
            var questionText = response["Response"]["text"];
            var choiceArr = response["Response"]["choice"];
            var sourceInfo = session.message.source;
            if ("webchat" == sourceInfo || "console" == sourceInfo) {
                builder.Prompts.choice(session, questionText, choiceArr);
            }
            else {
                var style = builder.ListStyle["button"];
                builder.Prompts.choice(session, questionText, choiceArr, { "listStyle": style });
            }
        }
        else {
            session.send("No response from UFD.1..");
        }
    },
    function (session, results) {
        if (results.response && results.response.entity) {
            var userChoice = results.response.entity;
            if (null != session.userData.prevRequest) {
                if (null != session.userData.prevRequest["Request"]) {
                    delete session.userData.prevRequest["Request"];
                }
                session.message.text = userChoice;
                session.userData.prevRequest["Request"] = { "ThisValue": userChoice };
            }
        }
        else {
            session.send("No response from Customer.3..");
        }
        session.replaceDialog("/");
    }
]);
bot.dialog("/processCarousel", [
    function (session, args) {
        var response = args["response"];
        if (null != response) {
            var selectIdArr = [];
            var heroCardArr = [];
            var carouselArr = response["Response"]["carousel-arr"];
            if (carouselArr != null) {
                var carousel = null;
                for (var idx = 0; idx < carouselArr.length; idx++) {
                    carousel = carouselArr[idx];
                    if (null != carousel) {
                        heroCardArr.push(new builder.HeroCard(session)
                            .title(carousel["title"])
                            .subtitle(carousel["sub-title"])
                            .images([
                            builder.CardImage.create(session, carousel["image-url"])
                                .tap(builder.CardAction.showImage(session, carousel["image-url"]))
                        ])
                            .buttons([
                            builder.CardAction.openUrl(session, carousel["image-click-url"], "test"),
                            builder.CardAction.imBack(session, carousel["id"], "Select")
                        ]));
                        selectIdArr.push("select:" + carousel["id"]);
                    }
                }
                var msg = new builder.Message(session)
                    .attachmentLayout(builder.AttachmentLayout.carousel)
                    .attachments(heroCardArr);
                builder.Prompts.choice(session, msg, selectIdArr);
            }
        }
        else {
            session.send("No response from UFD..2..");
        }
    },
    function (session, results) {
        if (results.response && results.response.entity) {
            var tempArr = results.response.entity.split(":");
            if (tempArr != null) {
                session.send("You have selected:" + tempArr[1]);
            }
            var userChoice = tempArr[1];
            if (null != session.userData.prevRequest) {
                if (null != session.userData.prevRequest["Request"]) {
                    delete session.userData.prevRequest["Request"];
                }
                session.message.text = userChoice;
                session.userData.prevRequest["Request"] = { "ThisValue": userChoice };
            }
        }
        else {
            session.send("No response from Customer..4..");
        }
        session.replaceDialog("/");
    }
]);
//# sourceMappingURL=server.js.map