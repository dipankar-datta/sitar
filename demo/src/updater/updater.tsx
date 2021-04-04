import React, {Component} from 'react';
import { setShelf, ShelfData, subscribeShelf, ShelfSubscription } from 'sitar';

interface IUpdaterState {
    shelfText: string,
    localText: string
}

interface IUpdaterProps {
    shelfKey: string,
    initialText?: string
}

export default class Updater extends Component<IUpdaterProps, IUpdaterState>{

    private subscription?: ShelfSubscription;

    constructor(props: IUpdaterProps) {
        super(props);
        this.state = {
            shelfText: '', 
            localText: props.initialText 
                ? props.initialText 
                : 'Initial local text'
        };
    }

    componentDidMount() {
        if (!this.subscription) {
            this.subscription = subscribeShelf(this.props.shelfKey, (newData: ShelfData) => {
                this.setState({shelfText: newData.current});
            });
        }   
    }

    inputChangeHandler = (ev: any) => {
        this.setState({localText: ev.target.value});
    }

    updateShelf = () => {
        setShelf(this.props.shelfKey, this.state.localText);
    }

    doUnsubscribe = () => {
        if (this.subscription) {
            this.subscription.unsubscribeShelf();
        }
    }

    componentWillUnmount() {
        this.subscription?.unsubscribeShelf();
    }

    render() {
        return (
            <div style={{border: '1px solid red', padding: '15px'}}>
                <label>Store Value: </label>{this.state.shelfText}<br/>
                <input onChange={this.inputChangeHandler} value={this.state.localText} type="text"/> &nbsp;&nbsp;
                <button onClick={this.updateShelf} >Update</button> &nbsp;&nbsp;
                <button onClick={this.doUnsubscribe} >Unsubscribe</button>
            </div>
        );
    }
}