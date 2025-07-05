
import ky, {type KyRequest, type NormalizedOptions} from 'ky';

const api = ky.create({
    prefixUrl: 'http://localhost:8080/',
    credentials: 'include',
    hooks: {
        beforeRequest: [
            request => {
                console.log('Request:', request.method, request.url);
            }
        ],
        afterResponse: [
            (request: KyRequest, options: NormalizedOptions, response) => {
                console.log('Response:', response.status);
                return response;
            }
        ]
    }
});

export default api;
