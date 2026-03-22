export interface IPv6State {
  address: string;
  prefix: number;
}

const STATE_CHANGED = "ipv6-state-changed";

let currentState: IPv6State = {
  address: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
  prefix: 64,
};

export function getIPv6State(): Readonly<IPv6State> {
  return currentState;
}

export function setIPv6State(partial: Partial<IPv6State>): void {
  currentState = { ...currentState, ...partial };
  document.dispatchEvent(
    new CustomEvent(STATE_CHANGED, { detail: currentState })
  );
}

export function onIPv6StateChange(
  callback: (state: IPv6State) => void
): () => void {
  const handler = (e: Event) =>
    callback((e as CustomEvent<IPv6State>).detail);
  document.addEventListener(STATE_CHANGED, handler);
  return () => document.removeEventListener(STATE_CHANGED, handler);
}
