# @dwalter/spider-hook

State management for React that just works.

`spider-hook` replaces `redux`, `react-redux`, `redux-thunk`, and `reselect` without all the bloat.

- `spider-hook` and its 2 dependencies are smaller than `react-redux` is alone.
- `spider-hook` exports only 8 members, and only half of those are frequently used.
- `spider-hook` is made to play nice with all your favorite tools including `typescript`, `prettier`, `eslint`/`tslint`, `vscode`, and `webpack`/`rollup`.
- `spider-hook` performs similarly to aggressively used `reselect`.

Under the hood, `spider-hook` uses `@dwalter/spider-store` to do the heavy lifting. This has one extra benefit: `spider-hook` automatically and safely handles state stores split up across multiple bundles. Your state will be unaffected by load order.

```javascript
// state reducer function
function counterReducer(state = 0, action) {
  switch (action.type) {
    case 'increment': {
      return state + 1
    }
    default: {
      return state
    }
  }
}

// action creator
// (note the reducers prop on the action)
function increment() {
  return {
    type: 'increment',
    reducers: [counterReducer],
  }
}

// boilerplate in App component
function App() {
  return (
    <SpiderRoot>
      <Counter />
    </SpiderRoot>
  )
}

// component consuming state
function Counter() {
  const count = useSelector(counterReducer)
  const actions = useActions({ increment })

  return <div onClick={actions.increment}>{count}</div>
}
```

## Exports

- [createSelector()](./docs/create-selector.md)
- [createSideEffect()](./docs/create-side-effect.md)
- [Fork](./docs/fork.md)
- [SpiderRoot](./docs/spider-root.md)
- [tuple()](./docs/tuple.md)
- [useDispatch()](./docs/use-dispatch.md)
- [useSelector()](./docs/use-selector.md)
- [useSideEffect()](./docs/use-side-effect.md)

## Other Concepts

- [dispatch()](./docs/dispatch.md)
- [resolve()](./docs/resolve.md)
