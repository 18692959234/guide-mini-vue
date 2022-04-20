import { ReactiveEffect } from "./effect";

class ComputedRefImpl {
  private _dirty: Boolean = true;
  private _value;
  public effect;
  constructor (getter) {
    this.effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true;
      }
    })
  }

  get value () {
    if (this._dirty) {
      this._dirty = false;
      this._value = this.effect.run()
    }
    return this._value
  }
}

export function computed (getter: any) {
  return new ComputedRefImpl(getter);
}