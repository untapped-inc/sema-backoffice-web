import { createStore, applyMiddleware, compose } from 'redux';
import persistedReducer from '../reducers/RootReducer';
import thunk from 'redux-thunk';
import { persistStore } from 'redux-persist';
import { axiosMiddleware } from '../services';

export default function configureStore() {
	const composeEnhancers =
		process.env.NODE_ENV !== 'production' &&
		typeof window === 'object' &&
		window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
		? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
		: compose;
	const enhancers = [applyMiddleware(thunk, axiosMiddleware)];
	const store = createStore(
		persistedReducer,
		composeEnhancers(...enhancers)
	);

	const persistor = persistStore(store);

	return { store, persistor };
}
