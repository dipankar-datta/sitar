import React, {Component} from 'react';
import { deleteSessionStorage, SessionStorageData, SessionStorageSubscription, setSessionStorage, subscribeSessionStorage } from 'sitar';

const LOCAL_STORAGE_TARGET_KEY = 'LOCAL_STORAGE_TARGET_KEY';

interface ISessionStorageDemoState {
    displayData: string;
}

export class SessionStorageDemo extends Component<any, ISessionStorageDemoState> {

    constructor(props: any) {
        super(props);
        this.state = {
            displayData: ''
        };
    }

    private sessionSubs?: SessionStorageSubscription;

    componentDidMount() {        
        if (!this.sessionSubs) {
            this.sessionSubs = subscribeSessionStorage(LOCAL_STORAGE_TARGET_KEY, (mapData: SessionStorageData) => {
                const displayData = JSON.stringify(mapData.current, null, 2);
                this.setState({displayData});
            }, true);
        }
        setSessionStorage(LOCAL_STORAGE_TARGET_KEY, 100);
    }

    componentWillUnmount() {
        if (this.sessionSubs) {
            this.sessionSubs.unsubscribeSessionStorage();
        }
    }

    render() {       
        return (
            <div>
                <label style={{fontWeight: 'bold'}}>Main Session Storage Data: </label> {this.state.displayData}
                <br/><br/>
                <div><SessionStorageUpdater/></div>
                <br/><br/>
                <div><SessionStorageUpdater/></div>
            </div>
        );
    }

}

interface IMapUpdaterState {
    displayData: string,
    sessionData: string
}
export class SessionStorageUpdater extends Component<any, IMapUpdaterState> {

    private sessionSubs?: SessionStorageSubscription;

    constructor(props: any) {
        super(props);
        this.state = {
            displayData: '',
            sessionData: ''
        };
    }
    componentDidMount() {
        if (!this.sessionSubs) {
            this.sessionSubs = subscribeSessionStorage(LOCAL_STORAGE_TARGET_KEY, (sessionStorageData: SessionStorageData) => {
                console.log('Session Storage Updated: ', sessionStorageData);
                this.setState({displayData: JSON.stringify(sessionStorageData.current)});               
            });
        }
    }

    componentWillUnmount() {
        if (this.sessionSubs) {
            this.sessionSubs.unsubscribeSessionStorage();
        }
    }

    keyChangeHandler = (ev: any) => {
        this.setState({displayData: ev.target.value});
    }

    valueChangeHandler = (ev: any) => {
        this.setState({sessionData: ev.target.value});
    }

    setHandler = () => {
        setSessionStorage(LOCAL_STORAGE_TARGET_KEY, this.state.sessionData);
    }

    deleteHandler = () => {
        deleteSessionStorage(LOCAL_STORAGE_TARGET_KEY);
    }

    unsubscribeHandler = () => {
        this.sessionSubs?.unsubscribeSessionStorage();
    }

    render() {
        return (
            <div style={{border: '1px solid red', padding: '10px'}}>
                <label style={{fontWeight: 'bold'}}>Session Storage Data: </label> {this.state.displayData}
                <br/><br/>
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