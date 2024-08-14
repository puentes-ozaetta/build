public with sharing class ContactListController {

    @AuraEnabled(cacheable=true)
    public static List<Contact> getContacts(Integer pageSize, Integer pageNumber, String sortBy, String sortDirection, String searchKey) {
        system.debug(' Entró ContactListController.getContacts pageSize:' + pageSize + ', pageNumber:' + pageNumber + ', sortBy:' + sortBy + ', sortDirection:' + sortDirection + ', searchKey:' + searchKey);
        String query = 'SELECT Id, Name, Email, Phone FROM Contact ';
        if ( !string.isBlank( searchKey ) ) {
            query += ' WHERE Name LIKE \'%' + searchKey + '%\' ';
        }
        query += 'ORDER BY ' + sortBy + ' ' + sortDirection + ' LIMIT ' + pageSize + ' OFFSET ' + string.valueOf( pageSize*pageNumber );
        system.debug(' query ' + query );
        try {
            return Database.query(query);
        } catch (Exception error) {
            throw new AuraHandledException('Error fetching contacts: ' + error.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static Integer getContactsCount( String searchKey ) {
        system.debug('Entered ContactListController.getContactsCount searchKey: ' + searchKey);
        String query = 'SELECT Count() FROM Contact ';
        if ( !string.isBlank( searchKey ) ) {
            query += ' WHERE Name LIKE \'%' + searchKey + '%\' ';
        }
        try {
            return Database.countQuery( query );
        } catch (Exception error) {
            throw new AuraHandledException( error.getMessage() );
        }
    }
}
