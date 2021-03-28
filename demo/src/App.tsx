import React, { Component } from 'react';
import ApiShelfDemo from './api-shelf-demo';
import { LocalStorageDemo } from './local-storage-demo';
import { MapDemo } from './map-demo';
import { SessionStorageDemo } from './session-storage-demo';
import { SetDemo } from './set-demo';
import { InvokerDemo} from './invoker-demo';
import ShelfDemo from './shelf-demo';

interface IAppState {
  category: 'shelf' | 'map' | 'apishelf' | 'set' | 'local' | 'session' | 'invoker';
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
      case 'invoker' : return <InvokerDemo/>;
      default: return <></>;
    }
  }

  loadRadioButtons = () => {
    const options = [
      {name: 'shelf', desc: 'Shelf'},
      {name: 'map', desc: 'Map'},
      {name: 'apishelf', desc: 'Api Shelf'},
      {name: 'set', desc: 'Set'},
      {name: 'local', desc: 'Local Storage'},
      {name: 'session', desc: 'Session Storage'},
      {name: 'invoker', desc: 'Invoker'}
    ];

    return options.map((item, index) => {
      return (
      <span key={index}>
        <input 
          name={item.name} 
          onChange={this.onCategoryClickHandler} 
          checked={this.state.category === item.name} 
          value={item.name} type="radio"/> 
        <label style={{paddingRight: '15px'}}>{item.desc}</label>
      </span>
      );
    })
  }

  render() {
    return (      
      <div style={{display: 'table', margin: 'auto', width: '90%'}}>
        <h2>Jatayu Demo</h2> 
        <div>
          {this.loadRadioButtons()}
        </div>        
        <div style={{padding: '20px'}}>
          {this.loadComponent()}
        </div>        
      </div>
    );
  }
}
