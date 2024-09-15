export type Fn<T = unknown, K = unknown> = (x?: T, y?: T) => K;
function range(a: number, b: number) {
  const arr = [];
  while (a < b) {
    arr.push(a++);
  }
  return arr;
}
const operators = new Map<string, Fn<any>>([
  ["[", (x, _y) => x],
  ["]", (x, y = x) => y],
  ["\\", (x: number, y: number) => Math.floor(x / y)],
  [",", (x, y) => [x, y]],
  ["'", (x: number, y: number) => range(x, y)],
]);
const conjunctions = new Map<string, Fn<unknown, Fn>>([
  [
    "#",
    (f, g) => {
      if (typeof f === "function") {
        return (x) => f(x, g);
      } else if (typeof g === "function") {
        return (y) => g(f, y);
      }
      throw new Error("At least one argument to # must be a function");
    },
  ],
  [
    "##",
    (f, g) => {
      if (typeof f !== "function") {
        throw new Error("Left argument to ## must be a function");
      }
      if (typeof g === "function") {
        return (x, y = x) => f(x, g(...(y as Iterable<unknown>)));
      } else {
        return (x) => f(x, ...(g as Iterable<unknown>));
      }
    },
  ],
  [
    "@",
    (f, g) => (x, y) => {
      if (typeof f !== "function" || typeof g !== "function") {
        throw new Error("Both arguments to @ must be functions");
      }
      return g(f(x), f(y));
    },
  ],
]);

const adverbs = new Map<string, (f: Fn) => Fn<any>>([
  ["/", (f) => (a: unknown[]) => a.reduce(f)],
  [
    "\\",
    (f) =>
      (a: unknown[], out: unknown[] = []) =>
        a.reduce((acc, cur, i) => (out[i] = f(acc, cur))),
  ],
  ["*", (f) => (a: unknown[]) => a.map((x) => f(x))],
  ["'", (f) => (a: unknown[]) => a.map((x, y) => f(x, y))],
  ["~", (f) => (x, y) => (typeof y === "undefined" ? f(x, x) : f(y, x))],
]);

const REG = {
  ident: /^[a-zA-Z_$][0-9a-zA-Z_$]*/,
  op: /^[+\-/%~^\[\]\\,'!]|[&|<>*=]{1,2}/,
  conj: /^##?|@/,
} satisfies Record<string, RegExp>;

function J({ raw }: TemplateStringsArray, ...vals: unknown[]) {
  let code = raw.join("($)");

  function or(fns: (() => unknown)[]) {
    for (const fn of fns) {
      const codeBackup = code;
      const valsBackup = vals.slice();
      try {
        return fn();
      } catch (_) {
        code = codeBackup;
        vals = valsBackup;
      }
    }
    throw new SyntaxError(`No option found near ${code.slice(0, 10)}`);
  }
  function many<T>(fn: () => T) {
    const out: T[] = [];
    while (code.length) {
      const backup = code;
      try {
        out.push(fn());
      } catch (_) {
        code = backup;
        break;
      }
    }
    return out;
  }
  function t(re: RegExp) {
    code = code.slice(code.search(/\S/));
    const match = code.match(re)![0]; // throws if no match
    code = code.slice(match.length);
    return match;
  }
  function c(v: TemplateStringsArray | string) {
    const s = Array.isArray(v) ? v[0] : v;
    return t(new RegExp("^" + s.replace(/./g, "\\$&")));
  }

  function unit() {
    return or([
      () => {
        c`($)`;
        return vals.shift();
      },
      () => [c`(`, expr(), c`)`][1],
      ref,
    ]);
  }
  function ref() {
    return or([
      function op() {
        const name = t(REG.op);
        return (x: unknown, y: unknown) => {
          if (operators.has(name)) {
            return operators.get(name)!(x, y);
          }
          try {
            return eval(`x ${name} y`);
          } catch (_) {
            throw new Error(`Operator \`${name}\` does not exist`);
          }
        };
      },
      function method() {
        const name = t(REG.ident);
        return (x: any, ...y: unknown[]) => {
          const val = x[name];
          return typeof val === "function" ? val.apply(x, y) : val;
        };
      },
    ]);
  }
  function conj() {
    const [f, c, g] = [unit(), t(REG.conj), unit()];
    if (!conjunctions.has(c)) {
      throw new Error(`Conjunction \`${c}\` does not exist`);
    }
    return conjunctions.get(c)!(f, g);
  }
  function adv() {
    const [a, _, f] = [t(REG.op), c`.`, fn() as Fn];
    if (!adverbs.has(a)) {
      throw new Error(`Adverb \`${a}\` does not exist`);
    }
    return adverbs.get(a)!(f);
  }
  function fn(): unknown {
    return or([adv, unit]);
  }
  function train(): Fn {
    const fns = many(() => or([conj, fn]));
    return (x, y = x) => {
      const app = (v: unknown, ifM: unknown) => {
        if (typeof v !== "function") return v;
        const f = v as Fn;
        return f.length === 1 ? f(ifM) : f(x, y);
      };
      const l = fns.length;
      if (l === 1) {
        return app(fns[0], x);
      }
      let v = l % 2 ? app(fns[0], x) : x;
      for (let i = l % 2; i < l; i += 2) {
        const [g, h] = fns.slice(i, i + 2) as [Fn, unknown];
        v = g(v, app(h, y));
      }
      return v;
    };
  }
  function expr(): Fn {
    const ts = [train(), ...many(() => (c(";"), train()))];
    return (x, y = x) => ts.reduce((a, t) => t(a, y), x);
  }

  return expr();
}
export default J;
