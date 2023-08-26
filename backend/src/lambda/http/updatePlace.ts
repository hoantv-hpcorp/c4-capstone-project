import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updatePlace } from '../../helpers/places'
import { UpdatePlaceRequest } from '../../requests/UpdatePlaceRequest'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const placeId = event.pathParameters.placeId
    const updatedPlace: UpdatePlaceRequest = JSON.parse(event.body)
    // TODO: Update a TODO item with the provided id using values in the "updatedPlace" object

    console.log('updatedPlace', updatedPlace)
    const userId = getUserId(event);
    console.log('userId', userId)
    const updateResult = await updatePlace(userId, placeId, updatedPlace);
    if (!updateResult) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
          error: 'Cannot update place' + placeId
        })
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
      })
    }
})


handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
