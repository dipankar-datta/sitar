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
                this.setState({displayData: setData.set.join(',')});
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
                <label style={{fontWeight: 'bold'}}>Main Set Data: </label> {this.state.displayData}
                <br/><br/>
                <div><SetUpdater/></div>
                <br/><br/>
                <div><SetUpdater/></div>
            </div>
        );
    }

}

interface ISetUpdaterState {
    displayData: string,
    setItem: string
}
export class SetUpdater extends Component<any, ISetUpdaterState> {

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
                console.log('Set Updated: ', setData);
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

        let target: any;

        if (this.state.setItem.indexOf('{') === 0 && this.state.setItem.indexOf('}') > -1) {
            target = JSON.parse(this.state.setItem);
        } else {
            target = this.state.setItem.indexOf(',') > -1 ? this.state.setItem.split(','): this.state.setItem;
        }
        
        setSet(SET_TARGET_KEY, target);
    }

    removeHandler = () => {
        const target = this.state.setItem.indexOf(',') > -1 ? this.state.setItem.split(','): this.state.setItem;
        removeFromSet(SET_TARGET_KEY, target);
    }

    unsubscribeHandler = () => {
            this.setSubs?.unsubscribeSet();
    }

    render() {
        return (
            <div style={{border: '1px solid red', padding: '10px'}}>
                <label style={{fontWeight: 'bold'}}>Set Data: </label> {this.state.displayData}
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