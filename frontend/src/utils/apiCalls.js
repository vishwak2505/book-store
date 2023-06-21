import { toast } from "../store";

toast.subscribe(()=>{});

export const callApi = async(url, method = 'GET', headers={}, body = null, successCode = 200, responseType = 'json' ) => {
    try{
        const response = await fetch(url,{
            method,
            headers,
            body,
            credentials: 'include'
        });

        let data, message;

        if(response.status !== successCode){
            message = await response.text();
            toastMessage(message);
        }

        if(method === 'GET'){
            if( responseType === 'json'){
                data = await response.json();
            }else if(responseType === 'blob'){
                data = await response.blob();
                data = URL.createObjectURL(data);
            }            
            return data;
        }else{
            return response.status;      
        }

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