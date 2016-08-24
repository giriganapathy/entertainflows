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
//Bots Dialogs...
bot.dialog('/', function (session) {
    var reqData = { "Flow": "TroubleShooting Flows\\Test\\GSTest.xml", "Request": { "ThisValue": "1" } };
    var prevRequest = null;
    if (null != session.userData.prevRequest) {
        prevRequest = session.userData.prevRequest;
        var temp = "";
        for (var k in prevRequest) {
            if (k == "Request") {
                temp = temp + (k + ":" + prevRequest[k]["ThisValue"]);
            }
            else {
                temp = temp + (k + ":" + prevRequest[k]);
            }
            temp = temp + ", ";
        }
        session.send(temp);
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
        //session.send("2:" + responseJSON);
        var currRequest = {};
        if (null != responseJSON) {
            currRequest["Platform"] = responseJSON["Platform"];
            currRequest["SessionID"] = responseJSON["SessionID"];
            currRequest["CurrentStep"] = responseJSON["CurrentStep"];
            currRequest["SubFlow"] = responseJSON["SubFlow"];
            currRequest["TID"] = responseJSON["TID"];
            currRequest["Level"] = responseJSON["Level"];
        }
        session.userData.prevRequest = currRequest;
        var questionType = responseJSON["user-response-type"];
        switch (questionType) {
            case "text":
                session.beginDialog("/processText", { "response": responseJSON });
                break;
            case "choice":
                session.beginDialog("/processChoice", { "response": responseJSON });
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
            if ("webchat" == sourceInfo) {
                builder.Prompts.choice(session, questionText, choiceArr);
            }
            else {
                var style = builder.ListStyle["button"];
                builder.Prompts.choice(session, questionText, choiceArr, { "listStyle": style });
            }
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
        session.replaceDialog("/");
    }
]);
//# sourceMappingURL=server.js.map