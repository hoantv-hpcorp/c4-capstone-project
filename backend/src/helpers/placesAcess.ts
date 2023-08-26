import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
// import { createLogger } from '../utils/logger'
import { PlaceItem } from '../models/PlaceItem'
// import { PlaceUpdate } from '../models/PlaceUpdate';
// import { APIGatewayProxyEvent } from 'aws-lambda'
import * as uuid from 'uuid'
import { CreatePlaceRequest } from '../requests/CreatePlaceRequest'
import { UpdatePlaceRequest } from '../requests/UpdatePlaceRequest'
import { ItemList } from 'aws-sdk/clients/dynamodb'

// const logger = createLogger('PlacesAccess')

const docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient()
const placesTable = process.env.PLACES_TABLE
const placeIdIndex = process.env.PLACES_CREATED_AT_INDEX

// PLACE: Implement the dataLayer logic
export async function getPlaces(userId: string): Promise<ItemList> {
  
  const result = await docClient.query({
    TableName : placesTable,
    IndexName : placeIdIndex,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
        ':userId': userId
    }
  }).promise()

  return result.Items
}

export async function createPlaceItem(userId: string, createPlaceRequest: CreatePlaceRequest): Promise<PlaceItem> {
    const placeId = uuid.v4();
    const newItem = {
      placeId,
      name: createPlaceRequest.name,
      description: createPlaceRequest.description,
      createdAt: createPlaceRequest.createdAt || new Date().toString(),
      userId
    }
    console.log('Storing new item: ', newItem)

    await docClient
      .put({
        TableName: placesTable,
        Item: newItem
      })
      .promise()
    
    return newItem as PlaceItem
}

export async function updatePlaceItem(userId: string, placeId: string, updatedPlace: UpdatePlaceRequest): Promise<void> {
  console.log('Updating place', placeId, 'update value', updatedPlace)
  const params = {
    TableName: placesTable,
    Key: {
        "placeId": placeId,
        "userId": userId
    },
    UpdateExpression: 'set #name = :name, description = :description',
    ExpressionAttributeNames: {
      "#name": "name"
    },
    ExpressionAttributeValues: {
      ":name": updatedPlace.name,
      ":description": updatedPlace.description
    }
  };

  await docClient.update(params, function(err, data) {
      if (err) console.log(err);
      else console.log(data);
  });
  console.log('Updated place', placeId, 'update value', updatedPlace)
}

export async function updatePlaceAttachment(userId: string, placeId: string, attachmentUrl: string): Promise<void> {
  console.log('Updating place', placeId, 'attachmentUrl', attachmentUrl)
    const params = {
      TableName: placesTable,
      Key: {
          "placeId": placeId,
          "userId": userId
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ":attachmentUrl": attachmentUrl,
      }
    };

  await docClient.update(params, function(err, data) {
      if (err) console.log(err);
      else console.log(data);
  });
  console.log('Updating place', placeId, 'attachmentUrl', attachmentUrl)
}

export async function deletePlaceItem(userId: string, placeId: string): Promise<void> {
  const deleteParams = {
    TableName: placesTable,
    Key: {
      "placeId": placeId,
      "userId": userId
    },
   };
 
   await docClient.delete(deleteParams).promise();
}

export async function placeExists(userId: string, placeId: string) {
  const result = await docClient
    .get({
      TableName: placesTable,
      Key: {
        "placeId": placeId,
        "userId": userId
      }
    })
    .promise()

  console.log('placeId', placeId, 'userId', userId)
  console.log('Get place: ', result.Item)
  return !!result.Item
}