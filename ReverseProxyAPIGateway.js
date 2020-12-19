const express = require("express");
const util = require("util");
var cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
var beautify = require("json-beautify");
const port = 9090;
const serviceUrl = "https://questaapp.herokuapp.com";

app.use(cors());
app.use(bodyParser.json());
const debugMode = true;
app.post("/api/*", async (request, response) => {
	var authtoken = request.headers.authorization;
	console.log("Incoming : " + request.url);
	try {
		authtoken = authtoken.replace("Bearer", "").trim();
	} catch (e) {}
	var result = await forwardRequestTo(request.body, authtoken, request.url);
	let responseCode = result.code || 200;
	response.status(responseCode).json(result);
});

forwardRequestTo = (reqdata, authToken, requrl) => {
	return new Promise(function (resolve, reject) {
		const axios = require("axios");
		var data = JSON.stringify(reqdata);
		var config = {
			method: "post",
			url: serviceUrl + requrl,
			headers: {
				"Content-Type": "application/json",
				Authorization: "Bearer " + authToken,
			},
			data: data,
		};
		axios(config)
			.then(function (response) {
				resolve(response.data);
			})
			.catch(function (error) {
				reject(error.response.data);
			});
	}).then(
		(result) => {
			return result;
		},
		(error) => {
			return error;
		}
	);
};

// in below line process.env.PORT will take port from environment, because
// if we use heroku, then it uses the env var to bind the port.
// so, our specified port can not be used for that.
app.listen(process.env.PORT || port, () => {
	console.log("API Gateway (Reverse proxy) is ready to serve on : " + port);
});
