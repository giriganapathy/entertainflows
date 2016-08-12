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
        var soap = require("soap");
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
        });
    }
]);
//# sourceMappingURL=server.js.map
