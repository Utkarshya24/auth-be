import axios from "axios"
import dotenv from "dotenv";

dotenv.config();

const ZOHO_TOKEN_URL = 'https://accounts.zoho.com/oauth/v2/token';

async function getZohoAccessToken() {
    try {
        const response = await axios.post(ZOHO_TOKEN_URL, null, {
            params: {
                client_id: process.env.ZOHO_CLIENT_ID,
                client_secret: process.env.ZOHO_CLIENT_SECRET,
                refresh_token: process.env.ZOHO_REFRESH_TOKEN,
                grant_type: 'refresh_token',
            },
        });

        return response.data.access_token;
    } catch (error) {
        console.error('Error fetching Zoho Access Token:', error.response?.data || error.message);
        throw error;
    }
}

module.exports = { getZohoAccessToken };
