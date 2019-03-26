import * as allActions from './ActionTypes';
import { axiosService } from '../services';

export const fetchSettings = () => {
    return dispatch => {
        axiosService
            .get('/sema/settings')
            .then(response => {
                dispatch({
                    type: allActions.SET_SETTINGS,
                    data: response.data
                });
            })
            .catch(err => {
                throw err;
            });
    }
}

export const updateSettings = settings => {
    return async dispatch => {
        return axiosService
            .put('/sema/settings', {
                settings
            })
            .then(response => {
                return response.data;
            })
    }
}
