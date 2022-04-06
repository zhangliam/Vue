// uid && Watch.js相关联
let uid = 0;

// 依赖类
class Dep() {

  constructor() {
    this.id = uid++;
    this.subs = [];
  }

  // addSub() {
  //   this.subs.push(window.target);
  // }

  depend() {
    // window.target && this.addSub(window.target);
    window.target && window.target.addDep(this);
  }

  notify() {
    const subs = this.subs.slice();
    subs.map((elem) => {
        elem.update();
    });
  }

  remove(sub) {
    if(this.subs.length) {
        const index = this.subs.indexOf(sub);
        return index > -1 && this.subs.splice(index, 1);
    }
  }

}


// 数组响应式操作(拦截器)
const arrayProto = Array.prototype;
const arrayMethods = Object.create(arrayProto);

['push','pop','shift','unshift','reverse','splice','sort'].map((method) => {
  // 缓存原始方法
  const original = arrayProto[method];
  def(arrayMethods, method, function mutator(...args) {
      const result = original.apply(this, args);
      const ob = this.__ob__;
      let inserted;
      switch (method) {
          case 'push':
          case 'unshift':
              inserted = args;
              break;
          case 'splice':
              inserted = args.slice(2);
              break;
      }
      // 侦测新增元素变化
      if(inserted) ob.observeArray(inserted);
      ob.dep.notify();
      return result;
  });

});


/*
    hasProto判断浏览器是否支持
    是 => 使用protoAugment来覆盖原型;
    否 => 使用copyAugment将拦截器中方法挂载value上;
*/
const hasProto = '__proto__' in {};
const arrayKeys = Object.keys(arrayMethods);

function def(obj, key, val, enumerable) {
    //enumerable 设置不可枚举防止暴露篡改
    Object.defineProperty(obj, key, {
        value: val,
        enumerable: !!enumerable,
        writable: true,
        configurable: true,
    });
}

function protoAugment(target, src, keys) {
    target.__proto__ = src;
}·

function copyAugment(target, src, keys) {
    keys.map( (elem) => {
        def(target, src, src[elem]);
    });
}


/*
    尝试为value创建Observer实例
    如创建成功, 直接返回新创建Observer实例
    如value已存在Observer实例则直接返回
    --
    tips: 避免重复侦测value变化的问题
*/
function checkObserve(value, asRootData) {
    if(!isObject(value)) {
      return;
    }
    let ob;
    if(hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
      ob = value.__ob__;
    } else {
      ob = new Observer(value);
    }
    return ob;
}


// 监测封装类
class Observer() {

    constructor(value) {
      this.value = value;
      this.dep = new Dep();

      /*
          '__ob__':
          1. 标记当前value是否被Observer转化成响应式数据
          2. 对应数组数据__ob__属性拿到Observer实例中dep操作
      */
      def(value, '__ob__', this);

      if(Array.isArray(value)){
          // const agument = hasProto ? protoAugment : copyAugment;
          // agument(value, arrayMethods, arrayKeys);

          this.observeArray(value);
      } else {
          this.walk(value);
      }
    }

    walk(obj) {
      const keys = Object.keys(obj);
      keys.map( (elem) => {
          defineReactive(obj, elem, obj[elem]);
      });
    }

    /* 侦测Array中每一项*/
    observeArray(items) {
      items.map( (elem) => {
          checkObserve(elem);
      });
    }

}


// 对象响应式操作
function defineReactive(data, key, val) {

    /*
        当value为数组时, 通过checkObserve函数设置__ob__属性获取Observer中dep实例
        为在数组拦截器中通过__ob__属性获得dep实例进行通知(为数组收集依赖)
    */
    let childOb = checkObserve(val);
    let dep = new Dep();

    Object.defineProperty(data, key, {
        enumerable: true,
        configurable: true,
        get: function() {
            dep.depend();
            if(childOb) {
                childOb.dep.depend();
            }
            return val;
        },
        set: function(newval) {
            if(val === newval) {
                return;
            }
            val = newval;
            dep.notify();
        }
    });

}
