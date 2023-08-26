import { getPlaces, createPlaceItem, placeExists, updatePlaceItem, deletePlaceItem, updatePlaceAttachment } from './placesAcess'
// import { AttachmentUtils } from './attachmentUtils';
import { PlaceItem } from '../models/PlaceItem'
import { CreatePlaceRequest } from '../requests/CreatePlaceRequest'
import { UpdatePlaceRequest } from '../requests/UpdatePlaceRequest'
import { generatePreUrl } from './attachmentUtils';
import { ItemList } from 'aws-sdk/clients/dynamodb';
// import { createLogger } from '../utils/logger'
// import * as uuid from 'uuid'
// import * as createError from 'http-errors'

const bucketName = process.env.ATTACHMENT_S3_BUCKET

export async function getPlacesForUser(userId: string): Promise<ItemList> {
  return getPlaces(userId);
}

export async function createPlace(userId: string, createPlaceRequest: CreatePlaceRequest): Promise<PlaceItem> {
  return createPlaceItem(userId, createPlaceRequest)
}

export async function updatePlace(userId: string, placeId: string, updatedPlace: UpdatePlaceRequest): Promise<boolean> {
  const isPlaceValid = await placeExists(userId, placeId)

  if (!isPlaceValid) {
    return false;
  }

  await updatePlaceItem(userId, placeId, updatedPlace)
  return true
}

export async function deletePlace(userId: string, placeId: string): Promise<boolean>  {
  const isPlaceValid = await placeExists(userId, placeId)

  if (!isPlaceValid) {
    return false
  }

  await deletePlaceItem(userId, placeId)
  return true
}

export async function createAttachmentPresignedUrl(userId: string, placeId: string) {
  const isPlaceValid = await placeExists(userId, placeId)

  if (!isPlaceValid) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'Place does not exist'
      })
    }
  }

  const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${placeId}`
  await updatePlaceAttachment(userId, placeId, attachmentUrl);
  
  return generatePreUrl(placeId)
}

