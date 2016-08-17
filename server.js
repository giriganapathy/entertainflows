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
        var reqData = { "Flow": "TroubleShooting Flows\\Test\\GSTest.xml", "Request": { "ThisValue": "1" } };
        if (null != session.userData.prevRequest && null != session.userData.prevRequest["Request"]) {
            reqData = session.userData.prevRequest;
        }
        var Client = require('node-rest-client').Client;
        var client = new Client();
        // set content-type header and data as json in args parameter 
        //session.send("Client created...");
        var args = {
            "headers": { "Content-Type": "application/json" },
            "data": reqData
        };
        //session.send("Sending request...");
        var req = client.post("https://www98.verizon.com/Icaddatasvcprivate/restapi.ashx", args, function (data, response) {
            try {
                //session.send("got the data:" + data);                
                // parsed response body as js object 
                var parsedData = "";
                if (null != data) {
                    parsedData = JSON.parse(data);
                    session.userData.prevRequest = parsedData;
                    var ques = parsedData["Response"];
                    if (null != ques) {
                        builder.Prompts.text(session, ques);
                    }
                }
                else {
                    session.send("Response is Empty!");
                    session.endDialog();
                }
            }
            catch (ex) {
                session.send("Error:" + ex);
            }
        });
        req.on("error", function (err) {
            session.send("Error:" + err);
            session.endDialog();
        });
    },
    function (session, results) {
        if (results.response) {
            //session.send("Your choice is:" + results.response);
            if (null != session.userData.prevRequest) {
                delete session.userData.prevRequest["Response"];
                if (null != session.userData.prevRequest["Request"]) {
                    delete session.userData.prevRequest["Request"];
                }
                session.userData.prevRequest["Request"] = { "ThisValue": results.response };
            }
            //session.endDialog();
            session.beginDialog("/");
        }
    }
]);
//# sourceMappingURL=server.js.map