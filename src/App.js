import React, { Component } from 'react';
import './App.css';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Rank from './components/Rank/Rank';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';

const app = new Clarifai.App({
 apiKey: '8cebe6e687e843c5a0338128940e53b7'
});

const particlesOptions ={
      "particles": {
          "number": {
              "value": 50
          },
          "size": {
              "value": 3
          }
      },
      "interactivity": {
          "events": {
              "onhover": {
                  "enable": true,
                  "mode": "repulse"
              }
          }
      }
  }

class App extends Component {
  constructor(){
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    }
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({box: box});
  }

  onInputChange = (event) =>{
    console.log(event.target.value);
    this.setState({input : event.target.value})
  }

  onButtonSubmit = () => {
    //console.log('click');
    this.setState({imageUrl: this.state.input});
    app.models
    .predict(
        Clarifai.FACE_DETECT_MODEL,
        this.state.input)
    .then(response => {
      if (response) {
        fetch('http://localhost:3000/image', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            id: this.state.user.id
          })
        })
          .then(response => response.json())
          .then(count => {
            this.setState(Object.assign(this.state.user, {entries: count}))
          })
      }
      this.displayFaceBox(this.calculateFaceLocation(response))
    })
    .catch (err => console.log(err));
  }

  onRouteChange = (route) => {
    if (route === 'signin'){
      this.setState({isSignedIn: false})
    } else if (route === 'home') {
       this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }

  render(){
    return (
      <div className="App">
        <Particles className='particles'
          params={ particlesOptions}
        />
        <Navigation onRouteChange={this.onRouteChange} isSignedIn= {this.state.isSignedIn}/>
        { this.state.route === 'home'
        ? <div>
            <Logo />
            <Rank
               name={this.state.user.name}
               entries={this.state.user.entries} />
            <ImageLinkForm onInputChange={this.onInputChange}
                            onButtonSubmit={this.onButtonSubmit}/>
            <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl}/>
        </div>
        : (
            this.state.route === 'signin'
            ? <SignIn loadUser={this.loadUser} onRouteChange= {this.onRouteChange}/>
            : <Register loadUser={this.loadUser} onRouteChange= {this.onRouteChange}/>
          )
      }
    </div>
    );
  }
}

export default App;
