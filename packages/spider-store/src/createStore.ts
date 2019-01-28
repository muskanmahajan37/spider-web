import { Slice, createSlice, Shallow, didUpdate } from './slice'
import { propagateSlices } from './propagateSlices'
import { SliceSet } from './SliceSet'
import { resolveSlice } from './resolveSlice'

export interface StateSlice<V> extends Slice<V> {
  name: string
  updateState(action: Action, marks: SliceSet): void
}

type SliceValues<Slices extends Slice<any>[]> = {
  [K in keyof Slices]: Slices[K] extends Slice<infer T> ? T : never
}

export interface Dispatch {
  (action: Action | ActionList): void
  <Slices extends Slice<any>[], Result>(
    thunk: (dispatch: Dispatch, ...state: SliceValues<Slices>) => Result,
    ...slices: Slices
  ): Result
}

export interface Action {
  type: string
  reducer?: Reducer<any>
  schedule?(dispatch: Dispatch): any
}

export interface ActionList extends Array<ActionList | Action> {}

export interface Reducer<State, A extends Action = Action> {
  (state: State | undefined, action: A): State
  readonly shallow?: Shallow<State>
  readonly initialState?: State
  name: string
}

export interface Store {
  dispatch: Dispatch
  wrapReducer: <S>(
    reducer: Reducer<S, any>,
    initialState?: S,
    shallow?: boolean,
  ) => StateSlice<S>
  slices: Map<Reducer<any>, StateSlice<any>>
}

export function createStore(): Store {
  const slices = new Map<unknown, StateSlice<any>>()

  const store = { slices } as Store

  function dispatch(
    actionable: Action | ActionList,
    marks = new SliceSet(),
    root = true,
  ) {
    if (Array.isArray(actionable)) {
      for (let a of actionable) {
        dispatch(a, marks, false)
      }
    } else {
      if (actionable.reducer) {
        const slice =
          slices.get(actionable.reducer) ||
          store.wrapReducer(actionable.reducer)
        slice.updateState(actionable, marks)
      } else {
        slices.forEach(slice => slice.updateState(actionable, marks))
      }
    }

    if (root) {
      propagateSlices(marks)
    }
  }

  function safeDispatch<Slices extends Slice<any>[]>(
    actionable: Action | ActionList | Function,
    ...slices: Slices
  ): unknown {
    if (typeof actionable === 'function') {
      switch (slices.length) {
        case 0:
          return actionable(safeDispatch)
        case 1:
          return actionable(safeDispatch, resolveSlice(slices[0]))
        case 2:
          return actionable(
            safeDispatch,
            resolveSlice(slices[0]),
            resolveSlice(slices[1]),
          )
        default:
          return actionable(safeDispatch, ...slices.map(resolveSlice))
      }
    } else {
      dispatch(actionable)
    }
  }

  function wrapReducer<State>(
    reducer: Reducer<State>,
    {
      initialState = reducer.initialState || undefined,
      shallow = reducer.shallow || true,
      sliceName = reducer.name,
    } = {},
  ) {
    let state = initialState || reducer(undefined, { type: '@store/init' })

    const slice = createSlice(
      [] as Slice[],
      _ => state,
      state,
      shallow,
    ) as StateSlice<State>

    function updateState(action: Action, marks: SliceSet) {
      const oldState = state
      const newState = (state = reducer(state, action))
      if (didUpdate(shallow, oldState, newState)) {
        marks.add(slice)
      }
    }

    slice.name = sliceName
    slice.updateState = updateState

    slices.set(reducer, slice)

    return slice
  }

  store.dispatch = safeDispatch as Dispatch
  store.wrapReducer = wrapReducer
  return store
}
