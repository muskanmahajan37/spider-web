import { createContext, useContext } from 'react'
import { Dispatch } from '@dwalter/spider-store'
import { Reducer } from '@dwalter/spider-store/src/createStore'

export const DispatchContext = createContext<
  Dispatch<{ type: string; reducer?: Reducer<unknown, {}> }>
>(() => {
  throw new Error(
    'DispatchContext referenced from outside the context of a SpiderRoot',
  )
})

interface Action {
  type: string
  reducer?: Reducer<unknown, {}>
}
interface ThunkAction<Result = unknown> {
  (dispatch: Dispatch<Action>): Result
}
interface ActionCreator<Args extends any[]> {
  (...args: Args): Action
}
interface ActionScheduler<Args extends any[], Result> {
  (...args: Args): ThunkAction<Result>
}

export interface UseAction {
  (action: Action): () => void
  <Args extends any[]>(actionCreator: ActionCreator<Args>): (
    ...args: Args
  ) => void
  <Args extends any[], Result>(actionCreator: ActionScheduler<Args, Result>): (
    ...args: Args
  ) => Result
}

export const useAction: UseAction = function useAction(
  action: Action | Function,
) {
  const dispatch = useContext(DispatchContext)
  if (typeof action === 'function') {
    return (...args: unknown[]) => dispatch(action(args))
  } else {
    return () => dispatch(action)
  }
}
