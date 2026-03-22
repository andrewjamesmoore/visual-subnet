export interface SubnetState {
  octets: number[];
  prefix: number;
  parentPrefix: number | null;
}

const STATE_CHANGED = "subnet-state-changed";

let currentState: SubnetState = {
  octets: [192, 168, 1, 0],
  prefix: 24,
  parentPrefix: null,
};

export function getState(): Readonly<SubnetState> {
  return currentState;
}

export function setState(partial: Partial<SubnetState>): void {
  currentState = { ...currentState, ...partial };
  document.dispatchEvent(
    new CustomEvent(STATE_CHANGED, { detail: currentState })
  );
}

export function onStateChange(
  callback: (state: SubnetState) => void
): () => void {
  const handler = (e: Event) =>
    callback((e as CustomEvent<SubnetState>).detail);
  document.addEventListener(STATE_CHANGED, handler);
  return () => document.removeEventListener(STATE_CHANGED, handler);
}
