import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreatePlaceRequest } from '../../requests/CreatePlaceRequest'
import { getUserId } from '../utils';
import { createPlace } from '../../helpers/places'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newPlace: CreatePlaceRequest = JSON.parse(event.body)
    // TODO: Implement creating a new TODO item
    console.log('Caller event', event)
    const userId = getUserId(event);
    const newItem = await createPlace(userId, newPlace)

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: newItem
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)
