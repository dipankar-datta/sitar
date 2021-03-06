import React, {Component} from 'react';
import { setShelf, ShelfData, subscribeShelf, ShelfSubscription } from 'sitar';

interface IUpdaterState {
    shelfText: any,
    localText: any
}

interface IUpdaterProps {
    shelfKey: string,
    initialText?: string,
    componentName: string
}

export default class Updater extends Component<IUpdaterProps, IUpdaterState>{

    private subscription?: ShelfSubscription;

    constructor(props: IUpdaterProps) {
        super(props);
        this.state = {
            shelfText: '', 
            localText: props.initialText 
                ? props.initialText 
                : '100'
        };
    }

    componentDidMount() {
        if (!this.subscription) {
            this.subscription = subscribeShelf(this.props.shelfKey, (newData: ShelfData) => {
                console.log(`${this.props.componentName} : `, newData);
                this.setState({shelfText: newData.current});
            });
        }   
    }

    inputChangeHandler = (ev: any) => {
        this.setState({localText: ev.target.value});
    }

    updateShelf = () => {      
        try {
            setShelf(this.props.shelfKey, JSON.parse(this.state.localText));
        }catch(err) {
            alert('Input is JSON incompatible. Please provide JSON compatible input.');
        }
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
                <div style={{fontWeight: 'bold', paddingBottom: '10px'}}>
                    <label >{this.props.componentName}</label>
                </div>                
                <label>Store Value: </label>{JSON.stringify(this.state.shelfText)}<br/><br/>
                <input onChange={this.inputChangeHandler} value={this.state.localText} type="text"/> &nbsp;&nbsp;
                <button onClick={this.updateShelf} >Update</button> &nbsp;&nbsp;
                <button onClick={this.doUnsubscribe} >Unsubscribe</button>
            </div>
        );
    }
}