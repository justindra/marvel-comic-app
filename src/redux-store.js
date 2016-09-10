function  buildStore() {
    "use strict";

    function data (state, action) {
        return action.data || '';
    }

    var rootReducer = Redux.combineReducers({
        data: data
    });

    var middleware = Redux.applyMiddleware(ReduxThunk.default);

    var MarvelStore = Redux.createStore(rootReducer, undefined, 
        Redux.compose(
            middleware, window.devToolsExtension && window.devToolsExtension() || function (a) { return a; }
        )
    );

    return MarvelStore;
}