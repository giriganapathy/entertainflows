var lookupQuestion = function (responseText, prevRequest, fnCallback) {
	var reqData = { "Flow": "TroubleShooting Flows\\Test\\GSTest.xml", "Request": { "ThisValue": "1" } };
	if (null != prevRequest && null != prevRequest["Request"]) {
		reqData = prevRequest;
	}
	
	var Client = require('node-rest-client').Client;
	var client = new Client();
	var args = {
		"headers": { "Content-Type": "application/json" },
		"data": reqData
	};
	var req = client.post("https://www98.verizon.com/Icaddatasvcprivate/restapi.ashx", args, function (data, response) {
		try {
			
			// parsed response body as js object 
			var parsedData = "";
			if (null != data) {
				parsedData = JSON.parse(data);
				//Get the relevant fields from the parsedData and send them 
				//during subsequent request.
				
				var inputsJSON = parsedData[0]["Inputs"]["newTemp"]["Section"]["Inputs"];
				if (null != fnCallback && typeof fnCallback == "function") {
					fnCallback(null, inputsJSON);
				}
			}
			else {
				var err = {
					"description" : "Response data is empty!"
				};
				if (null != fnCallback && typeof fnCallback == "function") {
					fnCallback(err, null);
				}
			}
		}
        catch (ex) {
			var err = {
				"description" : "Exception occurred:" + ex
			};
			if (null != fnCallback && typeof fnCallback == "function") {
				fnCallback(err, null);
			}
		}
	});
	req.on("error", function (errInfo) {
		var err = {
			"description" : "Exception occurred:" + errInfo
		};
		if (null != fnCallback && typeof fnCallback == "function") {
			fnCallback(err, null);
		}
	});
};
module.exports = lookupQuestion;
