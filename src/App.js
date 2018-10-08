import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  click=()=>{
    //开始推送
    fetch('/push')
    .then((res) => {
      console.log(res) 
    }).catch(err=>{
      console.error(err) 
    })
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            target="_blank"
            rel="noopener noreferrer"
            onClick={this.click}
          >
            点击进行pwa推送
          </a>
        </header>
      </div>
    );
  }
}

export default App;
