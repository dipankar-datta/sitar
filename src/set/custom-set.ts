import {sha1} from 'object-hash';


export class CustomSet {

    private map: Map<string, any>;

    constructor(elem?: any | any[]) {
        this.map = new Map();
        if (elem) {
            this.add(elem);
        }
    }

    add = (elem: any | any[]) => {
        return this.addElements(Array.isArray(elem) ? elem : [elem]);
    }

    private addElements = (elems: any[]): any[] => {
        const addedElements: any[] = [];

        elems.forEach((elem: any) => {
            const elemHash = sha1(elem);
            if (!this.map.has(elemHash)) {
                this.map.set(elemHash, elem);
                addedElements.push(elem);
            }
        });

        return addedElements;

    }

    remove = (elem: any | any[]) => {
        return this.removeElements(Array.isArray(elem) ? elem : [elem]);      
    }

    private removeElements = (elems: any[]): any[] => {
        const removedElems: any[] = [];
        elems.forEach((elem: any) => {
            const elemHash = sha1(elem);
            if (this.map.delete(elemHash)) {
                removedElems.push(elem);
            }
        });
        return removedElems;
    }

    get
    list(){
        return Array.from(this.map, ([name, value]) => (value))
    }
}