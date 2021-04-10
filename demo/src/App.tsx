import React, { Component } from 'react';
import ApiShelfDemo from './api-shelf-demo';
import { LocalStorageDemo } from './local-storage-demo';
import { MapDemo } from './map-demo';
import { SessionStorageDemo } from './session-storage-demo';
import { SetDemo } from './set-demo';
import { EchoDemo} from './echo-demo';
import ShelfDemo from './shelf-demo';
import { Route, Switch, Link, Redirect } from 'react-router-dom';
import './App.css';

interface IAppState {
  category: 'shelf' | 'map' | 'apishelf' | 'set' | 'local' | 'session' | 'echo';
}

export default class App extends Component<any, IAppState> {

  constructor(props: any) {
    super(props);
    this.state = {category: 'shelf'};
  }

  onCategoryClickHandler = (ev: any) => {
    this.setState({category: ev.target.value});
  }

  loadComponent = () => {
    switch(this.state.category) {
      case 'shelf' : return <ShelfDemo/>;
      case 'map' : return <MapDemo/>;
      case 'apishelf' : return <ApiShelfDemo/>;
      case 'set' : return <SetDemo/>;
      case 'local' : return <LocalStorageDemo/>;
      case 'session' : return <SessionStorageDemo/>;
      case 'echo' : return <EchoDemo/>;
      default: return <></>;
    }
  }

  loadNavigationRoutes = () => {
    const options = [
      {name: 'shelf', desc: 'Shelf'},
      {name: 'apishelf', desc: 'Api Shelf'},
      {name: 'map', desc: 'Map'},
      {name: 'set', desc: 'Set'},
      {name: 'local', desc: 'Local Storage'},
      {name: 'session', desc: 'Session Storage'},
      {name: 'echo', desc: 'Echo'}
    ];

    return options.map((item, index) => {
      return (   
          <li style={{"display": "inline-block", "margin": "0 10px"}} key={index}>            
            <Link activeClassName="active-router-link " to={item.name}>{item.desc}</Link>
          </li>
      );
    })
  }


  render() {
    return (      
      <div style={{display: 'table', margin: 'auto', width: '90%'}}>
        <h2>Sitar Demo</h2> 
        <h4>Please open browser console to see emitted data.</h4>
        <h4>Also please provide JSON compatible input.</h4>
        <div>
          <ul>{this.loadNavigationRoutes()}</ul>
            <Switch>
                <Route exact path="/">
                    <Redirect to="/shelf" />
                </Route>
                <Route path="/shelf" component={ShelfDemo}/>
                <Route path="/apishelf" component={ApiShelfDemo}/>
                <Route path="/map" component={MapDemo} />
                <Route path="/set" component={SetDemo} />
                <Route path="/local" component={LocalStorageDemo} />
                <Route path="/session" component={SessionStorageDemo} />
                <Route path="/echo" component={EchoDemo} />
            </Switch>
        </div>
      </div>    
    );
  }
}
