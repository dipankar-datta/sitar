import React, {Component} from 'react';
import { deleteMapEntry, MapData, MapSubscription, setMap, subscribeMap } from 'sitar';

const MAP_TARGET_KEY = 'MAP_TARGET_KEY';

interface IMapDemoState {
    displayData: string;
}

export class MapDemo extends Component<any, IMapDemoState> {

    constructor(props: any) {
        super(props);
        this.state = {
            displayData: ''
        };
    }

    private mapSubs?: MapSubscription;

    componentDidMount() {        
        if (!this.mapSubs) {
            this.mapSubs = subscribeMap(MAP_TARGET_KEY, (mapData: MapData) => {
                const displayData = JSON.stringify(mapToObject(mapData.map), null, 2);
                this.setState({displayData});
            });
        }
        setMap(MAP_TARGET_KEY, 'alfa', 100);
    }

    componentWillUnmount() {
        if (this.mapSubs) {
            this.mapSubs.unsubscribeMap();
        }
    }

    render() {       
        return (
            <div>
                <label style={{fontWeight: 'bold'}}>Main Map Data: </label> {this.state.displayData}
                <br/><br/>
                <div><MapUpdater/></div>
                <br/><br/>
                <div><MapUpdater/></div>
            </div>
        );
    }

}

interface IMapUpdaterState {
    displayData: string,
    key: string,
    value: any
}
export class MapUpdater extends Component<any, IMapUpdaterState> {

    private mapSubs?: MapSubscription;

    constructor(props: any) {
        super(props);
        this.state = {
            displayData: '',
            key: '',
            value: ''
        };
    }
    componentDidMount() {
        if (!this.mapSubs) {
            this.mapSubs = subscribeMap(MAP_TARGET_KEY, (mapData: MapData) => {
                console.log('Map Updated: ', mapData);
                this.setState({displayData: JSON.stringify(mapToObject(mapData.map), null, 2)});               
            });
        }
    }

    componentWillUnmount() {
        if (this.mapSubs) {
            this.mapSubs.unsubscribeMap();
        }
    }

    keyChangeHandler = (ev: any) => {
        this.setState({'key': ev.target.value});
    }

    valueChangeHandler = (ev: any) => {
        this.setState({'value': ev.target.value});
    }

    setHandler = () => {
        setMap(MAP_TARGET_KEY, this.state.key, this.state.value);
    }

    deleteHandler = () => {
        deleteMapEntry(MAP_TARGET_KEY, this.state.key);
    }

    unsubscribeHandler = () => {

    }

    render() {
        return (
            <div style={{border: '1px solid red', padding: '10px'}}>
                <label style={{fontWeight: 'bold'}}>Map Data: </label> {this.state.displayData}
                <br/><br/>
                <label>Key: </label><input onChange={this.keyChangeHandler} name='key' type="text"/>&nbsp;&nbsp;
                <label>Value: </label><input onChange={this.valueChangeHandler} name='value' type="text"/>
                <br/>&nbsp;<br/>
                <div style={{margin: 'auto', display: 'table'}}>
                    <button onClick={this.setHandler}>Set</button>
                    &nbsp;&nbsp;
                    <button onClick={this.deleteHandler} >Delete</button>
                </div>
            </div>
        );
    }

}

export const mapToObject = (map: Map<any, any>): any => {

    const obj: any = {};
    map.forEach((value, key) => {
        obj[key] = value
    })
    return obj;
}