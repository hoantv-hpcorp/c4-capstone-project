/**
 * Fields in a request to create a single TODO item.
 */
export interface CreatePlaceRequest {
  name: string
  description: string
  createdAt: string
  attachmentUrl: string
}
