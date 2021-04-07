import React, {Component} from 'react';
import { getShelfData , setShelf, ShelfData, subscribeShelf, ShelfSubscription } from 'sitar';
import Updater from './updater/updater';

export const SHELF_DEMO_KEY = 'SHELF_DEMO_KEY';

interface IRowsState {
    text: string,
    latestData: string
}

export default class ShelfDemo extends Component<any, IRowsState> {

    private subscription?: ShelfSubscription;

    constructor(props: any) {
        super(props);
        this.state = {text: 'Initial Text', latestData: ''};
    }

    componentDidMount() {        
        setShelf(SHELF_DEMO_KEY, 'Hello Sitar');

        if (!this.subscription) {
            this.subscription = subscribeShelf(SHELF_DEMO_KEY, (newData: ShelfData) => {
                this.setState({text: newData.current});
            }, true);
        }        
    }

    fetchLatestData = () => {
        this.setState({latestData: getShelfData(SHELF_DEMO_KEY).current});
    }


    componentWillUnmount() {
        if (this.subscription) {
            this.subscription.unsubscribeShelf();
        }
    }

    render() {
        const tdStyle = { marginTop:'20px'};
        const updateProps = {
            shelfKey: SHELF_DEMO_KEY,
            initialText: 'Initi local text'
        };
        return (
            <div>
                <label style={{fontWeight: 'bold'}}>Target data: </label>{this.state.text}
                <div style={tdStyle} >
                    <Updater {...Object.assign({}, updateProps, {componentName: 'Shelf Component One'})}/>
                </div>
                <div style={tdStyle} >
                <Updater {...Object.assign({}, updateProps, {componentName: 'Shelf Component Two'})}/>
                </div>
                <div style={{marginTop: '15px'}}>
                    <button onClick={this.fetchLatestData} >Get latest data</button>
                    <br/>
                    <label>{this.state.latestData}</label>
                </div>
            </div>
        );
    }
}