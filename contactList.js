import { LightningElement, track, wire } from 'lwc';
import getContacts from '@salesforce/apex/ContactListController.getContacts';
import getContactsCount from '@salesforce/apex/ContactListController.getContactsCount';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ContactList extends LightningElement {
    @track contacts;
    @track pageSize = 10;
    @track pageNumber = 0;
    @track sortBy = 'Name';
    @track sortDirection = 'asc';
    @track searchKey = '';
    @track totalContacts = 0;
    @track loading = false;
    @track totalPages;
    @track totalPagesShown = 1;
    @track pageNumberShown = 1;
    @track hasContacts = true;

    columns = [
        { label: 'Name', fieldName: 'nameUrl',  type: 'url', typeAttributes: { label: { fieldName: 'Name' }, target: '_blank' }, sortable: true},
        { label: 'Email', fieldName: 'Email', type: 'email', sortable: true },
        { label: 'Phone', fieldName: 'Phone', type: 'phone', sortable: true }
    ];

    din_URL;

    connectedCallback(){
        this.din_URL = window.location.origin;
    }

    @wire(getContacts, { pageSize: '$pageSize', pageNumber: '$pageNumber', sortBy: '$sortBy', sortDirection: '$sortDirection', searchKey: '$searchKey' })
    wiredContacts({ error, data }) {
        this.loading = true;
        if (data) {
            this.contacts = data;
            this.contacts = data.map(contact => {
                return {
                    ...contact,
                    nameUrl: `${this.din_URL}/${contact.Id}`
                };
            });
            this.loading = false;
        } else if (error) {
            this.contacts = undefined;
            this.loading = false;
            this.showToast('Error', `${error.body.message}`, 'error');
        }
    }

    @wire(getContactsCount, { searchKey: '$searchKey' })
    wiredContactsCount({ error, data }) {            
        if (data) {
            this.totalContacts = data;
            this.totalPages = Math.floor( this.totalContacts / 10);
            this.totalPagesShown = Math.floor( this.totalContacts / 10)+1;
            this.hasContacts = true;
        } else if (error) {
            this.showToast('Error', `Error counting contacts: ${error.body.message}`, 'error');
        } else {             
            this.hasContacts = false;
            this.totalContacts = 0;
            this.totalPages = 1;
            this.totalPagesShown = 1;
        }
    }

    handleSearch(event) {
        this.searchKey = event.target.value;
        this.pageNumber = 0;
        this.pageNumberShown = 1;
    }

    handleSort(event) {            
        const { fieldName, sortDirection } = event.detail; 
        if( fieldName=='nameUrl' ){                
            this.sortBy = 'Name';
            if( this.sortDirection == 'asc'){
                this.sortDirection = 'desc'
            } else if ( this.sortDirection == 'desc') {
                this.sortDirection = 'asc' }
        }  else {
            this.sortBy = fieldName;  
            this.sortDirection = sortDirection;          
        }
        this.pageNumber = 0;
        this.pageNumberShown = 1;
    }

    handleNextPage() {
        this.pageNumber++;
        this.pageNumberShown++;
    }

    handlePrevPage() {
        this.pageNumber--;
        this.pageNumberShown--;
    }

    handleLastPage() {
        this.pageNumber = this.totalPages ;
        this.pageNumberShown = this.totalPages+1;
    }

    handleFirstPage() {
        this.pageNumber = 0;
        this.pageNumberShown = 1;
    }

    get isFirstPage() {
        return this.pageNumber === 0;
    }

    get isLastPage() {
        return (this.pageNumber + 1) * this.pageSize >= this.totalContacts;
    }

    handleFirst() {
        this.pageNumber = 0;
        this.pageNumberShown = 1;
    }

    get showBar() {
        return this.totalPages > 1; 
    } 
    

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(event);
    }
}



