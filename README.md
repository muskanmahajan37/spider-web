# TODO

- optimise `action.target` for fast setters?
- clean up enhancer API (`store.with(asyncActionsEnhancer()).with(wrapStateEnhancer())`)
- create those two enhancers
- get rid of the redundant render in useSlice (on first call)
- make hook track reducers individually to prevent duplication problems (what if reducer is loaded twice?)

- useAction needs to be useActions
- add a configure param to wrapReducers
- allow a configureStore prop for the root
- kill mergeStores

# Redux

- combineReducers
- applyMiddleware
- createStore
  - dispatch
  - getState
  - subscribe

# Spider

- createSettableReducer
- joinSlices
- createStore
  - wrapReducer
  - dispatch
- Slice
  - use
  - subscribe
