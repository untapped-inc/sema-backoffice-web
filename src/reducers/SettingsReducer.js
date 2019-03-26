import {
    SET_SETTINGS
} from '../actions';

const initialState = null;

export default function sales(state=initialState, action) {
    let newState = {};

	switch (action.type) {
		case SET_SETTINGS:
			console.log(`SET_SETTINGS Action`);
			newState = action.data;
			return newState;
		default:
			return state;
	}
}