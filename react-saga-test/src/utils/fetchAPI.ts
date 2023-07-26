import axios from 'axios'

type I_FetchParams = { url: string; req?: any };

async function fetchAPI({ url, req }: I_FetchParams) {
    const params  = req ? req : {};
    try {
        const { data } = await axios.get(url, params );

        return data;
    } catch (error) {
        console.log(`${url} Exception =>`, error);
    }
}


export default fetchAPI