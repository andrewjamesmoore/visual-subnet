import { getState, setState, onStateChange } from "./state";

describe("state", () => {
  it("has default state", () => {
    const state = getState();
    expect(state.octets).toEqual([192, 168, 1, 0]);
    expect(state.prefix).toBe(24);
  });

  it("updates state with setState", () => {
    setState({ prefix: 16 });
    expect(getState().prefix).toBe(16);
    expect(getState().octets).toEqual([192, 168, 1, 0]);

    // reset
    setState({ prefix: 24 });
  });

  it("fires change callback on setState", () => {
    const callback = jest.fn();
    const cleanup = onStateChange(callback);

    setState({ prefix: 8 });
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({ prefix: 8 })
    );

    cleanup();
    setState({ prefix: 24 });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("cleanup removes listener", () => {
    const callback = jest.fn();
    const cleanup = onStateChange(callback);
    cleanup();

    setState({ prefix: 12 });
    expect(callback).not.toHaveBeenCalled();

    // reset
    setState({ prefix: 24 });
  });
});
