import React, {Component} from 'react';
import { removeFromSet, SetData, SetSubscription, setSet, subscribeSet } from 'sitar';

const SET_TARGET_KEY = 'SET_TARGET_KEY';

interface ISetDemoState {
    displayData: string;
}

export class SetDemo extends Component<any, ISetDemoState> {

    constructor(props: any) {
        super(props);
        this.state = {
            displayData: ''
        };
    }

    private setSubs?: SetSubscription;

    componentDidMount() {        
        if (!this.setSubs) {
            this.setSubs = subscribeSet(SET_TARGET_KEY, (setData: SetData) => {
                this.setState({displayData: JSON.stringify(setData.set, null, 2)});
            });
        }
        setSet(SET_TARGET_KEY, '100');
    }

    componentWillUnmount() {
        if (this.setSubs) {
            this.setSubs.unsubscribeSet();
        }
    }

    render() {       
        return (
            <div>
                <label style={{fontWeight: 'bold'}}>Set Data: </label> {this.state.displayData}
                <br/><br/>
                <div><SetUpdater componentName="Set Component One"/></div>
                <br/><br/>
                <div><SetUpdater componentName="Set Component Two"/></div>
            </div>
        );
    }

}

interface ISetUpdaterState {
    displayData: string,
    setItem: string
}
export class SetUpdater extends Component<{componentName: string}, ISetUpdaterState> {

    private setSubs?: SetSubscription;

    constructor(props: any) {
        super(props);
        this.state = {
            displayData: '',
            setItem: ''
        };
    }
    componentDidMount() {
        if (!this.setSubs) {
            this.setSubs = subscribeSet(SET_TARGET_KEY, (setData: SetData) => {
                console.log(`${this.props.componentName}: `, setData);
                this.setState({displayData: setData.set.join(',')});               
            });
        }
    }

    componentWillUnmount() {
        if (this.setSubs) {
            this.setSubs.unsubscribeSet();
        }
    }

    keyChangeHandler = (ev: any) => {
        this.setState({setItem: ev.target.value});
    }

    setHandler = () => {
        try {
            setSet(SET_TARGET_KEY, JSON.parse(this.state.setItem));
        } catch(err) {
            alert('Input is JSON incompatible. Please provide JSON compatible input.');
        }
    }

    removeHandler = () => {
        try {
            removeFromSet(SET_TARGET_KEY, JSON.parse(this.state.setItem));
        } catch(err) {
            alert('Input is JSON incompatible. Please provide JSON compatible input.');
        }
    }

    unsubscribeHandler = () => {
            this.setSubs?.unsubscribeSet();
    }

    render() {
        return (
            <div style={{border: '1px solid red', padding: '10px'}}>
                <label style={{fontWeight: 'bold'}}>{this.props.componentName} Data: </label> {this.state.displayData}
                <br/><br/>
                <label>Item: </label><input onChange={this.keyChangeHandler} value={this.state.setItem} name='key' type="text"/>&nbsp;&nbsp;
                <br/>&nbsp;<br/>
                <div style={{margin: 'auto', display: 'table'}}>
                    <button onClick={this.setHandler}>Set</button>
                    &nbsp;&nbsp;
                    <button onClick={this.removeHandler} >Delete</button>
                    &nbsp;&nbsp;
                    <button onClick={this.unsubscribeHandler} >Unsubscribe</button>
                </div>
            </div>
        );
    }

}