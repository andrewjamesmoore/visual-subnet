const handler: ProxyHandler<Record<string, string>> = {
  get(_target, prop: string) {
    return prop;
  },
};

export default new Proxy({} as Record<string, string>, handler);
