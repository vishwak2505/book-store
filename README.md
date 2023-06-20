# book-store <br>
Overview

The book store has users in two modes => admin and customer.
Admin will be able to perform all the operations related to users and books in the store ex: add, delete, update the books and delete and update the users. Users will be soft removed from the DB and can be reactivated by the admin.
Customers will be able to rent a book and return the book rented. They can also update their profile.

Framework: FoalTS

Shell Scripts

Permissions to be added <br>
foal run create-perm name="Permission to update users" codeName="update-user" <br>
foal run create-perm name="Permission to remove users" codeName="remove-user" <br>
foal run create-perm name="Permission to view users" codeName="view-user" <br>
foal run create-perm name="Permission to add books" codeName="add-book" <br>
foal run create-perm name="Permission to remove books" codeName="remove-book" <br>
foal run create-perm name="Permission to update books" codeName="update-book" <br>
foal run create-perm name="Permission to view books" codeName="view-book" <br>
foal run create-perm name="Permission to view books user" codeName="view-book-user" <br>


Groups to be added <br>
foal run create-group name="Administrators" codeName="admin" permissions="[ \"view-user\", \"remove-user\", \"update-user\", \"view-book\", \"add-book\", \"remove-book\", \"update-book\" ]" <br>
foal run create-group name="Customers" codeName="customer" permissions="[ \"view-book-user\" ]"
