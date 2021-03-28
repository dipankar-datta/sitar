import { invoke, InvokerSubscription, subscribeInvoker } from "sitar";
import React, {Component} from 'react';
import { handleJsonStringify } from "sitar";

const INVOKER_TARGET_KEY = 'INVOKER_TARGET_KEY';


interface IInvokerDemoState {
    displayData: string;
}

export class InvokerDemo extends Component<any, IInvokerDemoState> {

    constructor(props: any) {
        super(props);
        this.state = {
            displayData: ''
        };
    }

    private sessionSubs?: InvokerSubscription;

    componentDidMount() {        
        if (!this.sessionSubs) {
            this.sessionSubs = subscribeInvoker(INVOKER_TARGET_KEY, (invokerData: any) => {
                const displayData = JSON.stringify(invokerData);
                this.setState({displayData});
            });
        }
        invoke(INVOKER_TARGET_KEY, 100);
    }

    componentWillUnmount() {
        if (this.sessionSubs) {
            this.sessionSubs.unsubscribeInvoker();
        }
    }

    render() {       
        return (
            <div>
                <label style={{fontWeight: 'bold'}}>Main Invoker Data: </label> {this.state.displayData}
                <br/><br/>
                <div><InvokerUpdater/></div>
                <br/><br/>
                <div><InvokerUpdater/></div>
            </div>
        );
    }

}



interface IInvokerUpdaterState {
    displayData: string,
    localData: string
}
class InvokerUpdater extends Component<any, IInvokerUpdaterState> {

    private invokerSubs?: InvokerSubscription;

    constructor(props: any) {
        super(props);
        this.state = {
            displayData: '',
            localData: ''
        };
    }
    componentDidMount() {
        if (!this.invokerSubs) {
            this.invokerSubs = subscribeInvoker(INVOKER_TARGET_KEY, (sessionStorageData: any) => {
                console.log('Invoker fired: ', sessionStorageData);
                if (sessionStorageData) {
                    this.setState({displayData: ''+handleJsonStringify(sessionStorageData)});   
                }                            
            });
        }
    }

    componentWillUnmount() {
        if (this.invokerSubs) {
            this.invokerSubs.unsubscribeInvoker();
        }
    }

    keyChangeHandler = (ev: any) => {
        this.setState({displayData: ev.target.value});
    }

    valueChangeHandler = (ev: any) => {
        this.setState({localData: ev.target.value});
    }

    setHandler = () => {
        // invoke(INVOKER_TARGET_KEY, this.state.localData);
        invoke(INVOKER_TARGET_KEY);
    }

    unsubscribeHandler = () => {
        this.invokerSubs?.unsubscribeInvoker();
    }

    render() {
        return (
            <div style={{border: '1px solid red', padding: '10px'}}>
                <label style={{fontWeight: 'bold'}}>Invoker Data: </label> {this.state.displayData}
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