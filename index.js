"use strict";

const AWS = require("aws-sdk");
const crypto = require("crypto");

const DYNAMO_TABLE = "ServerlessHashWebService-Digests-ECGMU7L4IYNA";

exports.handleHttpRequest = function (request, context, done) {
  try {

    let response = {
      headers: {},
      body: '',
      statusCode: 200
    };

    switch (request.httpMethod) {
      case 'GET': {
        if (!request.pathParameters.hash_id) {
          response.body = "Missing required parameter hashId";
          response.statusCode = 400;
          done(null, response);
          return;
        }
        const hash_id = request.pathParameters.hash_id;
        let dynamo = new AWS.DynamoDB();
        var params = {
          TableName: DYNAMO_TABLE,
          Key: { 'hash_id': { S: hash_id } },
          ProjectionExpression: 'message'
        };
        dynamo.getItem(params, function (err, data) {
          if (err) {
            const msg = `An error occurred while fetching item ${hash_id} from dynamodb`;
            console.log(msg, err);
            throw `${msg} (${err})`
          } else {
            if (data.Item) {
              response.body = JSON.stringify({ "message": data.Item.message["S"] });
              done(null, response);
            } else {
              response.body = JSON.stringify({ "err_msg": "Message not found" });
              response.statusCode = 404;
              done(null, response);
            }
          }
        });
        break;
      }
      case 'POST': {
        let bodyJSON = JSON.parse(request.body || '{}');
        if (!bodyJSON['message']) {
          response.body = "Missing message in payload";
          response.statusCode = 400;
          done(null, response);
          return;
        }
        let dynamo = new AWS.DynamoDB();
        const sha256Hash = crypto.createHash("sha256").update(bodyJSON["message"]).digest("hex");

        let params = {
          TableName: DYNAMO_TABLE,
          Item: {
            'hash_id': { S: sha256Hash },
            'message': { S: bodyJSON['message'] }
          }
        };
        dynamo.putItem(params, function (error, data) {
          if (error) throw `Error adding item to dynamodb (${error})`;
          else {
            response.body = JSON.stringify({ "digest": sha256Hash });
            response.statusCode = 201;
            done(null, response);
          }
        })
        break;
      }
    }
  } catch (e) {
    done(e, null);
  }
}
