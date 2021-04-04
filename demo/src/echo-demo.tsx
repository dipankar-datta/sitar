import { echo, EchoSubscription, subscribeEcho } from "sitar";
import React, {Component} from 'react';
import { handleJsonStringify } from "sitar";

const ECHO_TARGET_KEY = 'ECHO_TARGET_KEY';


interface IEchoDemoState {
    displayData: string;
}

export class EchoDemo extends Component<any, IEchoDemoState> {

    constructor(props: any) {
        super(props);
        this.state = {
            displayData: ''
        };
    }

    private sessionSubs?: EchoSubscription;

    componentDidMount() {        
        if (!this.sessionSubs) {
            this.sessionSubs = subscribeEcho(ECHO_TARGET_KEY, (echoData: any) => {
                const displayData = JSON.stringify(echoData);
                this.setState({displayData});
            });
        }
        echo(ECHO_TARGET_KEY, 100);
    }

    componentWillUnmount() {
        if (this.sessionSubs) {
            this.sessionSubs.unsubscribeEcho();
        }
    }

    render() {       
        return (
            <div>
                <label style={{fontWeight: 'bold'}}>Main Echo Data: </label> {this.state.displayData}
                <br/><br/>
                <div><EchoUpdater/></div>
                <br/><br/>
                <div><EchoUpdater/></div>
            </div>
        );
    }

}



interface IEchoUpdaterState {
    displayData: string,
    localData: string
}
class EchoUpdater extends Component<any, IEchoUpdaterState> {

    private echoSubs?: EchoSubscription;

    constructor(props: any) {
        super(props);
        this.state = {
            displayData: '',
            localData: ''
        };
    }
    componentDidMount() {
        if (!this.echoSubs) {
            this.echoSubs = subscribeEcho(ECHO_TARGET_KEY, (sessionStorageData: any) => {
                console.log('Echo fired: ', sessionStorageData);
                if (sessionStorageData) {
                    this.setState({displayData: ''+handleJsonStringify(sessionStorageData)});   
                }                            
            });
        }
    }

    componentWillUnmount() {
        if (this.echoSubs) {
            this.echoSubs.unsubscribeEcho();
        }
    }

    keyChangeHandler = (ev: any) => {
        this.setState({displayData: ev.target.value});
    }

    valueChangeHandler = (ev: any) => {
        this.setState({localData: ev.target.value});
    }

    setHandler = () => {
        echo(ECHO_TARGET_KEY, this.state.localData);
    }

    unsubscribeHandler = () => {
        this.echoSubs?.unsubscribeEcho();
    }

    render() {
        return (
            <div style={{border: '1px solid red', padding: '10px'}}>
                <label style={{fontWeight: 'bold'}}>Echo Data: </label> {this.state.displayData}
                <br/><br/>
                <label>Value: </label><input onChange={this.valueChangeHandler} name='value' type="text"/>
                <br/>&nbsp;<br/>
                <div style={{margin: 'auto', display: 'table'}}>
                    <button onClick={this.setHandler}>Set</button>
                    &nbsp;&nbsp;
                    <button onClick={this.unsubscribeHandler} >Unsubscribe</button>
                </div>
            </div>
        );
    }
}