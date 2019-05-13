import React, { ReactChild, useRef } from 'react'

import {
  createStore,
  Store as InnerStore,
  Slice,
  utils,
  WrapReducer,
} from '@dwalter/spider-store'
import { Source, Selector, Store, BindableAction } from './types'
import { useShouldUpdate, noop } from './utils'

function contextError(): any {
  throw new Error(
    'StoreContext referenced from outside the context of a SpiderRoot',
  )
}

export const StoreContext = React.createContext<Store>({
  wrapReducer: contextError,
  dispatch: contextError,
  resolve: contextError,
  getSlice: contextError,
})

export interface SpiderRootProps {
  children: ReactChild
  configureStore?: (storeFactory: typeof createStore) => InnerStore
}

/**
 * `SpiderRoot` provides state store access to its children via the
 * context API. Any app made using `spider-hook` will need to render
 * `SpiderRoot` as ancestor to all components using a state store.
 * A one-to-one mapping between instances of `SpiderRoot` in the React
 * component tree and state stores. `SpiderRoot` will never cause a
 * rerender of itself, but it is still safe to rerender an instance of
 * `SpiderRoot`.
 *
 * `SpiderRoot` accepts a single optional prop: `configureStore`.
 */
export function SpiderRoot({
  children,
  configureStore = () => createStore(),
}: SpiderRootProps) {
  const shouldUpdate = useShouldUpdate()

  const { current: store } = useRef<Store>(
    shouldUpdate ? createStoreContextContent(configureStore) : noop,
  )

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

function createStoreContextContent(
  configureStore: (storeFactory: typeof createStore) => InnerStore,
): Store {
  const { wrapReducer, dispatch, resolve } = configureStore(createStore)

  const getSlice = createGetSlice(wrapReducer)

  function hookResolve<T>(source: Source<T> | Slice<T>) {
    if (utils.isSlice(source)) {
      return resolve(source)
    } else {
      return resolve(getSlice(source as Source<T>))
    }
  }

  function hookDispatch(action: BindableAction) {
    if (typeof action === 'function') {
      return action(hookDispatch, hookResolve)
    } else {
      dispatch(action)
    }
  }

  return {
    wrapReducer,
    resolve: hookResolve,
    dispatch: hookDispatch,
    getSlice,
  }
}

function createGetSlice(wrapReducer: WrapReducer) {
  const selectorSlices = new WeakMap<Selector<any>, Slice>()

  function getSelectorSlice<T>(selector: Selector<T>): Slice<T> {
    const { sources, mapping } = selector
    if (selectorSlices.has(selector)) {
      return selectorSlices.get(selector)!
    } else {
      const parents = sources.map(getSourceSlice)
      const slice = mapping.apply(null, parents)
      selectorSlices.set(selector, slice)
      return slice
    }
  }

  function getSourceSlice<T>(source: Source<T>): Slice<T> {
    if (typeof source === 'function') {
      return wrapReducer(source)
    } else {
      return getSelectorSlice(source)
    }
  }

  return getSourceSlice
}
