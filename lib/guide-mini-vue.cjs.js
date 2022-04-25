'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var extend = Object.assign;
var isObject = function (value) { return value != null && typeof value === 'object'; };
var isString = function (value) { return typeof value === 'string'; };
var hasOwn = function (val, key) {
    return Object.prototype.hasOwnProperty.call(val, key);
};

function createVNode(type, props, children) {
    var vnode = {
        type: type,
        props: props,
        children: children,
        el: null,
        shapeFlag: getShapeFlag(type),
    };
    if (isString(children)) {
        vnode.shapeFlag |= 4 /* TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ARRAY_CHILDREN */;
    }
    return vnode;
}
function getShapeFlag(type) {
    return isString(type) ? 1 /* ELEMENT */ : 2 /* STATEFUL_COMPONENT */;
}

var targetMap = new Map();
function trigger(target, key) {
    var depsMap = targetMap.get(target);
    var deps = depsMap.get(key);
    triggerEffect(deps);
}
function triggerEffect(deps) {
    deps.forEach(function (dep) {
        if (dep.scheduler) {
            dep.scheduler();
        }
        else {
            dep.run();
        }
    });
}

var get = createGetter();
var set = createSetter();
var readonlyGet = createGetter(true);
var shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly, shallow) {
    if (isReadonly === void 0) { isReadonly = false; }
    if (shallow === void 0) { shallow = false; }
    return function get(target, key) {
        if (key === "__v_isReactive" /* IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadOnly" /* IS_READONLY */) {
            return isReadonly;
        }
        var res = Reflect.get(target, key);
        if (shallow) {
            return res;
        }
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        var result = Reflect.set(target, key, value);
        trigger(target, key);
        return result;
    };
}
var mutableHandlers = {
    get: get,
    set: set
};
var readonlyHandlers = {
    get: readonlyGet,
    set: function (target, key, value) {
        console.warn("set\u5931\u8D25\uFF0Ckey".concat(key, "\u662F\u4E0D\u53EF\u5199\u7684"));
        return true;
    },
};
var shallowReadonlyHandlers = extend({}, readonlyHandlers, { get: shallowReadonlyGet });

function reactive(raw) {
    return createReactiveObject(raw, mutableHandlers);
}
function readonly(raw) {
    return createReactiveObject(raw, readonlyHandlers);
}
function shallowReadonly(raw) {
    return createReactiveObject(raw, shallowReadonlyHandlers);
}
function createReactiveObject(target, baseHandlers) {
    if (!isObject(target)) {
        console.warn("target ".concat(target, " \u5FC5\u987B\u662F\u4E00\u4E2A\u5BF9\u8C61"));
        return target;
    }
    return new Proxy(target, baseHandlers);
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

var publicPropertiesMap = {
    $el: function (i) { return i.vnode.el; },
};
var PublicInstanceProxyHandlers = {
    get: function (_a, key) {
        var instance = _a._;
        var setupState = instance.setupState, props = instance.props;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        var publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

function createComponentInstance(vnode) {
    var component = {
        vnode: vnode,
        type: vnode.type,
        setupState: {},
        props: {},
    };
    return component;
}
// 初始化组件需要做的事情
// initProps
// initSlots
// setupStatefulComponent
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    var component = instance.type;
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    var setup = component.setup;
    if (setup) {
        var setupResult = setup(shallowReadonly(instance.props));
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    var component = instance.type;
    if (component.render) {
        instance.render = component.render;
    }
}

function render(vnode, container) {
    patch(vnode, container);
}
function patch(vnode, container) {
    var shapeFlag = vnode.shapeFlag;
    if (shapeFlag & 1 /* ELEMENT */) {
        processElement(vnode, container);
    }
    else if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    var props = vnode.props, children = vnode.children, type = vnode.type, shapeFlag = vnode.shapeFlag;
    var el = (vnode.el = document.createElement(type));
    // children
    if (shapeFlag & 8 /* ARRAY_CHILDREN */) {
        mountChildren(vnode, el);
    }
    else if (shapeFlag & 4 /* TEXT_CHILDREN */) {
        el.innerText = children;
    }
    var isOn = function (key) { return /^on[A-Z]/.test(key); };
    // props
    Object.keys(props).forEach(function (key) {
        var val = props[key];
        if (isOn(key)) {
            var event_1 = key.slice(2).toLowerCase();
            el.addEventListener(event_1, props[key]);
        }
        else {
            el.setAttribute(key, val);
        }
    });
    container.append(el);
}
function mountChildren(vnode, container) {
    vnode.children.forEach(function (ele) {
        patch(ele, container);
    });
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(initialVNode, container) {
    // 创建组件实例
    var instance = createComponentInstance(initialVNode);
    // 初始化组件
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container);
}
function setupRenderEffect(instance, initialVNode, container) {
    var proxy = instance.proxy;
    var subTree = instance.render.call(proxy);
    patch(subTree, container);
    initialVNode.el = subTree.el;
}

function createApp(rootComponent) {
    return {
        mount: function (rootContainer) {
            // rootComponent -> vNode
            var vNode = createVNode(rootComponent);
            render(vNode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}
// 流程
// 调用createApp初始化 返回一个对象
// 执行mount方法
// mount方法里首先 拿到根实例去初始化一个vnode， 然后调用render
// render里直接调用patch
// patch里面需要判断vnode是否为组件或者是element 分别调用processComponent和processElement 去走一遍流程
// processComponent里面需要去挂载组件既mountComponent
// mountComponent 首先创建一个组件实例，然后去初始化组件既： setupComponent
// setupComponent需要做的事情 1、初始化props 2、 初始化 slot 3、初始化有状态的组件 setupfulStateComponent
// setupfulStateComponent 里主要是把有setup与render的vnode 给绑定到组件实例上
// 最后执行setupRenderEffect 主要是把调用render 并把render返回的结果丢给patch 再次执行

exports.createApp = createApp;
exports.h = h;
