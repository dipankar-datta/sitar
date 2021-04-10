import React, {Component} from 'react';
import { deleteLocalStorage, LocalStorageData, LocalStorageSubscription, setLocalStorage, subscribeLocalStorage } from 'sitar';

const LOCAL_STORAGE_TARGET_KEY = 'LOCAL_STORAGE_TARGET_KEY';

interface ILocalStorageDemoState {
    displayData: string;
}

export class LocalStorageDemo extends Component<any, ILocalStorageDemoState> {

    constructor(props: any) {
        super(props);
        this.state = {
            displayData: ''
        };
    }

    private localSubs?: LocalStorageSubscription;

    componentDidMount() {        
        if (!this.localSubs) {
            this.localSubs = subscribeLocalStorage(LOCAL_STORAGE_TARGET_KEY, (localStorageData: LocalStorageData) => {
                const displayData = JSON.stringify(localStorageData.current, null, 2);
                this.setState({displayData});
            }, true);
        }
        setLocalStorage(LOCAL_STORAGE_TARGET_KEY, 100);
    }

    componentWillUnmount() {
        this.localSubs?.unsubscribeLocalStorage();
    }

    render() {       
        return (
            <div>
                <label style={{fontWeight: 'bold'}}>Main Local Storage Data: </label> {this.state.displayData}
                <br/><br/>
                <div><LocalStorageUpdater componentName="Local Storage Component One"/></div>
                <br/><br/>
                <div><LocalStorageUpdater componentName="Local Storage Component Two"/></div>
            </div>
        );
    }

}

interface ILocalStorageUpdaterState {
    displayData: string,
    localData: string
}
export class LocalStorageUpdater extends Component<{componentName: string}, ILocalStorageUpdaterState> {

    private localSubs?: LocalStorageSubscription;

    constructor(props: any) {
        super(props);
        this.state = {
            displayData: '',
            localData: ''
        };
    }
    componentDidMount() {
        if (!this.localSubs) {
            this.localSubs = subscribeLocalStorage(LOCAL_STORAGE_TARGET_KEY, (localStorageData: LocalStorageData) => {
                console.log(`${this.props.componentName}: `, localStorageData);
                this.setState({displayData: JSON.stringify(localStorageData.current)});               
            });
        }
    }

    componentWillUnmount() {
        if (this.localSubs) {
            this.localSubs.unsubscribeLocalStorage();
        }
    }

    keyChangeHandler = (ev: any) => {
        this.setState({displayData: ev.target.value});
    }

    valueChangeHandler = (ev: any) => {        
        this.setState({localData: ev.target.value});
    }

    setHandler = () => {
        try {
            setLocalStorage(LOCAL_STORAGE_TARGET_KEY, JSON.parse(this.state.localData));
        } catch(err) {
            alert('Input is JSON incompatible. Please provide JSON compatible input.');
        }
    }

    deleteHandler = () => {
        deleteLocalStorage(LOCAL_STORAGE_TARGET_KEY);
    }

    unsubscribeHandler = () => {
        this.localSubs?.unsubscribeLocalStorage();
    }

    render() {
        return (
            <div style={{border: '1px solid red', padding: '10px'}}>
                <label style={{fontWeight: 'bold'}}>{this.props.componentName} Data: </label> {this.state.displayData}
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