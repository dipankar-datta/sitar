import React, { Component } from 'react';
import { ShelfData } from 'sitar';
import { ApiShelfSubscription, setApiShelf, subscribeApiShelf } from 'sitar';

export const OLYMPIC_WINNERS = 'https://jsonplaceholder.typicode.com/users';
export const API_SHELF_KEY = 'API_SHELF_KEY';

interface IApiShelfDemoState {
    data: any;
}

export default class ApiShelfDemo extends Component<any, IApiShelfDemoState> {

    constructor(props: any) {
        super(props);
        this.state = {
            data: []
        };
    }

    componentDidMount() {
        setApiShelf(API_SHELF_KEY, OLYMPIC_WINNERS);        
    }

    render() {
        return (
            <div>
                <label>Api Shelf</label>
                <ApiTable/>
                <br/>
                <ApiTable/>       
            </div>
        );
    }
}

class ApiTable extends Component<any, IApiShelfDemoState> {

    subscription?: ApiShelfSubscription;

    constructor(props: any) {
        super(props);
        this.state = {
            data: []
        };
    }

    componentDidMount() {
        if (!this.subscription) {
            this.subscription = subscribeApiShelf(API_SHELF_KEY, (shelfData: ShelfData) => {
                console.log('API Shelf data: ', shelfData);
                this.setState({data: shelfData.current ? shelfData.current : []});
            }); 
        }  
    }

    componentWillUnmount() {
        if (this.subscription) {
            this.subscription.unsubscribeApiShelf();
        }  
    }

    printTableRow = (row: any, index: number) => {
        return (
            <tr key={index}>
                <td>{index + 1}</td>
                <td>{row.id}</td>
                <td>{row.name}</td>
                <td>{row.username}</td>
                <td>{row.email}</td>
            </tr>
        );
    }

    render() {
        return (
            <div style={{border: '1px solid red'}}>
                <table>
                    <tbody>
                        <tr>
                            <th>#</th>
                            <th>Id</th>
                            <th>Name</th>
                            <th>User</th>
                            <th>Email</th>
                        </tr>     
                        {this.state.data.map(this.printTableRow)}                   
                    </tbody>
                </table>        
            </div>
        );
    }
}