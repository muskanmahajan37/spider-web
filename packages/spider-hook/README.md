# spider-web

Yet another state store implementation. `spider-web` brings together the best features of `redux`, `redux-thunk`, `reselect`, `rxjs`/`mobx`, and in some sense `ngrx`. Contributions are welcome.

`spider-web` is:

- small: similar in size to vanilla `redux`
- efficient: never duplicates work like `reselect`
- lazy: never does work that won't be used like `reselect` and `mobx`
- strongly typed: complete type coverage with `typescript`
- dynamic: code-split and tree-shake friendly
- declarative: functional graph structure resembling observables
- diamond-proof: properly handles diamond cases (unlike observables)
- tolerant: supports mutable state slices for edge cases
- extensible: support for custom operators
- agnostic: framework and library agnostic

## How does it work?

Here's a contrived counter app example. In order to demonstrate important features, this counter app tracks two counters.

```javascript
import { createStore } from '@dwalter/spider-web'

// create a universal store
const { dispatch, wrapReducer } = createStore()

// add reducers to the store when and where you need
const leftCounter = wrapReducer((state = 0, action) => {
  switch (action.type /* reducer logic */) {
  }
})

const rightCounter = wrapReducer((state = 0, action) => {
  switch (action.type /* reducer logic */) {
  }
})

// interpret and combine slices similarly to
// how you would with observables
const arbitraryStateSlice = leftCounter
  .use(map, join)
  .map(left => 2 * left)
  .join(rightCounter, (left, right) => left * right)

// comes with subscription support baked in
arbitraryStateSlice.subscribe(console.log)

// > 0

dispatch({ type: 'increment-left' })

// does not print because state is unchanged

dispatch({ type: 'increment-right' })

// > 2
```

## How is this different from observables?

In blog-speak, there are 3 main differences between `spider-web` state slices and `rxjs`-style observables.

1. `spider-web` state slices always have a single, valid state that can be synchronously retrieved. This is somewhat similar to `rxjs` behavior-subjects. However, behavior-subjects' values are only updated when subscribed. `spider-web` state slices compute their content only when requested and then cache; this saves computations while allowing all state slices to have a valid state.

2. `rxjs` is not designed to solve what is sometimes called the 'diamond' problem. The diamond problem occurs in observables when a destination observable subscribes to multiple observables which in turn subscribe to the same root observable. When the shared root pushes a new value, the destination observable will push two new values in quick succession. The first value pushed will not be valid. This is sometimes called 'glitching.' Glitching is fine for many use cases of observables, but problematic for observing state from a 'single source of truth.' Because all `spider-web` state slices are tied to a store, `spider-web` is able to efficiently handle the diamond problem; the destination state slice in all diamond cases will only push a single, valid value.

3. `spider-web` state slices never 'complete' in the sense that an `rxjs` observable can. State never runs out or ends, so there is no need for a state slice to either.

## TODO

- make fork forget unused slices
- add time travel hooks to `dispatch()`
- add store middleware
- assert `Just` types for all Slices
- make a list of viable, safe operators
  - ~~map~~
  - ~~fork~~
  - ~~thru~~
  - ~~dedup~~
  - keyFork (???)
  - convolve (???)
- make a list of viable, unsafe operators
  - filter (seeded?)
  - scan (seeded)
  - debounce (seeded)
  - throttle
  - await (seeded)
- move operator tests to the operator directory
- kill either joinSlices or createSlice (???)