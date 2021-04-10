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
                <div><MapUpdater componentName="Map Component One"/></div>
                <br/><br/>
                <div><MapUpdater componentName="Map Component Two"/></div>
            </div>
        );
    }

}

interface IMapUpdaterState {
    displayData: string,
    key: string,
    value: any
}

interface IMapUpdaterProps {   
    componentName: string
}
export class MapUpdater extends Component<IMapUpdaterProps, IMapUpdaterState> {

    private mapSubs?: MapSubscription;

    constructor(props: IMapUpdaterProps) {
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
                console.log(`${this.props.componentName}: `, mapData);
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
        try {
            setMap(MAP_TARGET_KEY, this.state.key, JSON.parse(this.state.value));
        } catch(err) {
            alert('Input is JSON incompatible. Please provide JSON compatible input.');
        }
    }

    deleteHandler = () => {
        deleteMapEntry(MAP_TARGET_KEY, this.state.key);
    }

    unsubscribeHandler = () => {
        this.mapSubs?.unsubscribeMap();
    }

    render() {
        return (
            <div style={{border: '1px solid red', padding: '10px'}}>
                <label style={{fontWeight: 'bold'}}>{this.props.componentName} Data: </label> {this.state.displayData}
                <br/><br/>
                <label>Key: </label><input onChange={this.keyChangeHandler} name='key' type="text"/>&nbsp;&nbsp;
                <label>Value: </label><input onChange={this.valueChangeHandler} name='value' type="text"/>
                <br/>&nbsp;<br/>
                <div style={{margin: 'auto', display: 'table'}}>
                    <button onClick={this.setHandler}>Set</button>
                    &nbsp;&nbsp;
                    <button onClick={this.deleteHandler} >Delete</button>
                    &nbsp;&nbsp;
                    <button onClick={this.unsubscribeHandler} >Unsubscribe</button>
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