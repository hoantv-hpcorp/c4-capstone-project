import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  Form
} from 'semantic-ui-react'

import { createPlace, deletePlace, getPlaces, patchPlace } from '../api/places-api'
import Auth from '../auth/Auth'
import { Place } from '../types/Place'
import { FormEvent } from 'react'

interface PlacesProps {
  auth: Auth
  history: History
}

interface PlacesState {
  places: Place[]
  newPlaceName: string
  newPlaceDescription: string
  loadingPlaces: boolean
}

export class Places extends React.PureComponent<PlacesProps, PlacesState> {
  state: PlacesState = {
    places: [],
    newPlaceName: '',
    newPlaceDescription: "",
    loadingPlaces: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newPlaceName: event.target.value })
  }
  
  handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newPlaceDescription: event.target.value })
  }

  onEditButtonClick = (placeId: string) => {
    this.props.history.push(`/places/${placeId}/edit`)
  }

  onPlaceCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newPlace = await createPlace(this.props.auth.getIdToken(), {
        name: this.state.newPlaceName,
        description: this.state.newPlaceDescription
      })
      this.setState({
        places: [...this.state.places, newPlace],
        newPlaceName: '',
        newPlaceDescription: ''
      })
    } catch {
      alert('Place creation failed')
    }
  }

  onPlaceFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newPlace = await createPlace(this.props.auth.getIdToken(), {
        name: this.state.newPlaceName,
        description: this.state.newPlaceDescription
      })
      this.setState({
        places: [...this.state.places, newPlace],
        newPlaceName: '',
        newPlaceDescription: ''
      })
    } catch {
      alert('Place creation failed')
    }
  }

  onPlaceDelete = async (placeId: string) => {
    try {
      await deletePlace(this.props.auth.getIdToken(), placeId)
      this.setState({
        places: this.state.places.filter(place => place.placeId !== placeId)
      })
    } catch {
      alert('Place deletion failed')
    }
  }

  // onPlaceCheck = async (pos: number) => {
  //   try {
  //     const place = this.state.places[pos]
  //     await patchPlace(this.props.auth.getIdToken(), place.placeId, {
  //       name: place.name,
  //       description: place.description,
  //       done: !place.done
  //     })
  //     this.setState({
  //       places: update(this.state.places, {
  //         [pos]: { done: { $set: !place.done } }
  //       })
  //     })
  //   } catch {
  //     alert('Place deletion failed')
  //   }
  // }

  async componentDidMount() {
    try {
      const places = await getPlaces(this.props.auth.getIdToken())
      this.setState({
        places,
        loadingPlaces: false
      })
    } catch (e) {
      alert(`Failed to fetch places: ${(e as Error).message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">My Favorite Places:</Header>

        {this.renderCreatePlaceInput()}

        {this.renderPlaces()}
      </div>
    )
  }

  renderCreatePlaceInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Form onSubmit={ this.onPlaceFormSubmit }>
            <Form.Field>
              <label>Place Name</label>
              <Input placeholder="Input place name" onChange={this.handleNameChange}  />
            </Form.Field>
            <Form.Field>
              <label>Place Description</label>
              <Input placeholder="Input place description" onChange={this.handleDescriptionChange} />
            </Form.Field>
            <Button type='submit'>Submit</Button>
          </Form>
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderPlaces() {
    if (this.state.loadingPlaces) {
      return this.renderLoading()
    }

    return this.renderPlacesList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading TODOs
        </Loader>
      </Grid.Row>
    )
  }

  renderPlacesList() {
    return (
      <Grid padded>
        {this.state.places.map((place, pos) => {
          return (
            <Grid.Row key={place.placeId}>
              {/* <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onPlaceCheck(pos)}
                  checked={place.done}
                />
              </Grid.Column> */}
              <Grid.Column width={5} verticalAlign="middle">
                <b>Name: </b>{place.name}
              </Grid.Column>
              <Grid.Column width={8} verticalAlign="middle" floated="right">
                <b>Description: </b>{place.description}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(place.placeId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onPlaceDelete(place.placeId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {place.attachmentUrl && (
                <Image src={place.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
