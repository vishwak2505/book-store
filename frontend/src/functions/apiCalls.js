    import { toast } from "../store";

    toast.subscribe(()=>{});

    export const getBooksApi = async() => {
        try{
            const response = await fetch('http://localhost:3001/api/getbooks/');
            const books = await response.json();

            if(response.status != 200){
                const message = await response.text();
                toastMessage(message)
            }

            return books;
        }catch(e){
            console.log(e);
            toastMessage('Server is down');
        }
    }

    export const getUserProfileApi = async() => {
        try{
            const response = await fetch('http://localhost:3001/api/profile/viewProfile', 
              {credentials: 'include'}
            );
            const userProfile = await response.json();
            
            if(response.status != 200){
                const message = await response.text();
                toastMessage(message);
            }

            return userProfile;            
        }catch(e){
            console.log(e);
            toastMessage('Server is down');
        }
    }

    export const borrowBookApi = async(bookName) => {
        try{
            const response = await fetch(`http://localhost:3001/api/user/borrow/{bookName}?bookName=${bookName}`,{
                method:'POST',
                credentials:'include'
            });
            const message = await response.text();
            ( response.status === 200 ) ? toastMessage('Successfully borrowed') : toastMessage(message);

            return response.status;

        }catch(e){
            console.log(e);
            toastMessage('Server is down');
        }
    }

    export const returnBookApi = async(bookId) => {
        try{
            const response = await fetch(`http://localhost:3001/api/user/return/${bookId}`,{
                method:'POST',
                credentials:'include'
            });
            const message = await response.text();
            ( response.status === 200 ) ? toastMessage('Successfully returned') : toastMessage(message);

            return response.status;
        }catch(e){
            console.log(e);
            toastMessage('Server is down');
        }
    }

    export const updateApi = async(formData) => {
        try{
            const response = await fetch("http://localhost:3001/api/profile/updateProfile", {
                method:"PATCH",
                body: formData,
                credentials: 'include'
            });
            const message = await response.text();
            ( response.status === 204 ) ? toastMessage('Successfully Updated') : toastMessage(message);

            return response.status;
        }catch(e){
            console.log(e);
            toastMessage('Server is down');
        }        
    }

    export const getProfilePicApi = async() => {
        try{
            const response = await fetch('http://localhost:3001/api/profile/avatar', {
                credentials:'include'
            })

            const imageBlob = await response.blob();
            const imageUrl = URL.createObjectURL(imageBlob); 

            if(response.status != 200){
                const message = await response.text();
                toastMessage(message)
            }

            return response.status === 200 ? imageUrl : '';           
        }catch(e){
            console.log(e);
            toastMessage('Server is down');
        }
    }

    export const getAdminBooks = async() => {
        try{
            const response = await fetch('http://localhost:3001/api/admin/books/', {
                credentials:'include'
            })

            const books = await response.json();
            
            if(response.status != 200){
                const message = await response.text();
                toastMessage(message)
            }

            return books;            
        }catch(e){
            console.log(e);
            toastMessage('Server is down');
        }
    }

    export const addBookApi = async(formData) => {
        try{
            const response = await fetch('http://localhost:3001/api/admin/books/add', {
                method:'POST',
                body:formData,
                credentials:'include'
            })

            if(response.status === 201){
                toastMessage('Successfully added');
            }else{
                const message = await response.text();
                toastMessage(message)
            }

            return response.status;

        }catch(e){
            console.log(e);
            toastMessage('Server is down');
        }
    }

    export const deleteBookApi = async(bookName) =>{
        try{
            const response = await fetch(`http://localhost:3001/api/admin/books/deleteByName/{bookName}?bookName=${bookName}`, {
                method:'DELETE',
                credentials:'include'
            })
              
            if(response.status === 201){
                toastMessage('Successfully added');
            }else{
                const message = await response.text();
                toastMessage(message)
            }

            return response.status;
            
        }catch(e){
            console.log(e);
            toastMessage('Server is down');
        }
    }

    export const getRentedBooksApi = async() => {
        try{
            const response = await fetch('http://localhost:3001/api/admin/rentedBooks', 
                {credentials:'include'}
            );

            const books = await response.json();

            if(response.status !== 200){
                const message = await response.text();
                toastMessage(message)
            }

            return books;          
        }catch(e){
            console.log(e);
            toastMessage('Server is down');
        }
    }

    export const deleteByIdApi = async(bookId) => {
        try{
            const response = await fetch(`http://localhost:3001/api/admin/books/deleteById/${bookId}`, {
                method:'DELETE',
                credentials:'include'
            })
              
            if(response.status === 201){
                toastMessage('Successfully added');
            }else{
                const message = await response.text();
                toastMessage(message)
            }

            return response.status;
            
        }catch(e){
            console.log(e);
            toastMessage('Server is down');
        }
    }

    export const getAllUsersApi = async() =>{
        try{
            const response = await fetch('http://localhost:3001/api/admin/allUsers',
             { credentials:'include' }
            )

            const users = await response.json();
            if(response.status !== 200){
                const message = await response.text();
                toastMessage(message);
            }

            return users;
        }catch(e){
            console.log(e);
            toastMessage('Server is down');
        }
    }

    const toastMessage = ( message ) => {
        toast.set({
            showToast: true,
            message
        })
    }