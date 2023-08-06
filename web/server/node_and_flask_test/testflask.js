const axios = require('axios');
// Note: need to install npm axios

// aync request sent to python server script
async function sendRequest() {
    try {
        const response = await axios.get('http://127.0.0.1:5000/test');
        console.log(response.data);
    } catch (error) {
        console.error(error);
    }
}

sendRequest();