export type Fn = (x?: unknown, y?: unknown) => unknown;
const operators = new Map<string, Fn>();
const conjunctions = new Map<string, (F: unknown, G: unknown) => Fn>();
const adverbs = new Map<string, (F: Fn) => Fn>([
  ["*", (f) => (a) => !Array.isArray(a) || a.map((x) => f(x))],
]);

const REG = {
  ident: /^[a-zA-Z_$][0-9a-zA-Z_$]*/,
  op: /^[+\-/%~^\[\]\\,'!]|[&|<>*=]{1,2}/,
  conj: /^##?|@/,
} satisfies Record<string, RegExp>;

export default function J({ raw }: TemplateStringsArray, ...vals: unknown[]) {
  let code = raw.join("($)");

  function or(fns: (() => unknown)[]) {
    for (const fn of fns) {
      const backup = code;
      try {
        return fn();
      } catch (_) {
        code = backup;
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
      () => (c("($)"), vals.shift()),
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
        // deno-lint-ignore no-explicit-any
        return (x: any, y: unknown) => {
          const val = x[name];
          return typeof val === "function" ? val.call(x, y) : val;
        };
      },
    ]);
  }
  function conj() {
    const [f, c, g] = [unit(), t(REG.conj), fn()];
    // return `c(${f},"${c}",${g})`;
    if (!conjunctions.has(c)) {
      throw new Error(`Conjunction \`${c}\` does not exist`);
    }
    return conjunctions.get(c)!(f, g);
  }
  function adv() {
    const [a, _, f] = [t(REG.op), c`.`, fn() as Fn];
    // return `a("${a}",${f})`;
    if (!adverbs.has(a)) {
      throw new Error(`Adverb \`${a}\` does not exist`);
    }
    return adverbs.get(a)!(f);
  }
  function fn(): unknown {
    return or([adv, unit]);
  }
  function train(): Fn {
    const fns = many(() => or([fn, conj]));
    return (x, y = x) => {
      const app = (v: unknown, ifM: unknown) => {
        if (typeof v !== "function") return v;
        const f = v as Fn;
        return f.length === 1 ? f(ifM) : f(x, y);
      };
      const l = fns.length;
      // console.log(l);
      if (l === 1) {
        return app(fns[0], x);
      }
      let v = l % 2 ? app(fns[0], x) : x;
      for (let i = l % 2; i < l; i += 2) {
        const [g, h] = fns.slice(i, i + 2) as [Fn, unknown];
        // console.log(v, g, h);
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
