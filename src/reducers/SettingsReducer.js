import {
    SET_SETTINGS
} from '../actions';

const initialState = {
    generalSettings: null
}

export default function sales(state=initialState, action) {
    let newState = {};

	switch (action.type) {
		case SET_SETTINGS:
			console.log(`SET_SETTINGS Action`);
			newState.generalSettings = action.data;
			return newState;
		default:
			return state;
	}
}