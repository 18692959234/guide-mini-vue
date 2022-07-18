export function createDataStore (data) {
  return defineReactive(data);
}

function defineReactive(data) {
  return new Proxy(data, Object.assign({}, {get: createGetter(), set: createSetter()}))
}


function createGetter () {
  return function get (target, key) {
    const res = Reflect.get(target, key);
    if (isShouldTrack()) {
      track(target, key)
    }
    return res;
  }
}

const targetDepMap = new Map();

function getDep (target, key) {
  let depsMap = targetDepMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetDepMap.set(target, depsMap);
  }
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep)
  }
  return dep;
}

function track (target, key) {
  const dep = getDep(target, key);
  dep.forEach(d => d.run());
}

function trigger (target, key) {
  const dep = getDep(target, key);
  if (!dep.has(activeWatchEffect)) {
    dep.add(activeWatchEffect);
  }
}

function createSetter () {
  return function set (target, key, val) {
    const res = Reflect.set(target, key, val);
    trigger(target, key);
    return res;
  }
}

let activeWatchEffect;

class WatchEffect {
  private _fn;
  constructor (fn) {
    this._fn = fn;
  }

  run () {
    activeWatchEffect = this;
    this._fn();
    activeWatchEffect = null;
  }
}

function isShouldTrack () {
  return !!activeWatchEffect;
}

export function watch (watcher, fn) {
  const effect = new WatchEffect(fn);
}
