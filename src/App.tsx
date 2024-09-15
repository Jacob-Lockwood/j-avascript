import { createEffect, createSignal } from "solid-js";
import J from "./j-avascript";

export default function App() {
  const { searchParams } = new URL(window.location.href);
  const [header, setHeader] = createSignal(
    searchParams.get("h") ?? "const f ="
  );
  const [code, setCode] = createSignal(searchParams.get("c") ?? "J``");
  const [footer, setFooter] = createSignal(
    searchParams.get("f") ?? "console.log(f())"
  );
  createEffect(() => {
    const pageURL = window.location.origin + window.location.pathname;
    window.history.replaceState(
      null,
      document.title,
      pageURL +
        `?h=${encodeURIComponent(header())}&c=${encodeURIComponent(code())}&f=${encodeURIComponent(footer())}`
    );
  });
  const byteCount = () => new TextEncoder().encode(code()).length;

  const [output, setOutput] = createSignal("");
  const [error, setError] = createSignal("");

  const block =
    "bg-stone-800/80 text-white p-5 w-full h-min focus:ring-0 focus:outline-none border-solid border-2 border-stone-900 focus:border-rose-600 overflow-x-scroll whitespace-pre";
  const btn =
    "border-2 border-rose-500 bg-rose-700 w-max px-10 hover:bg-rose-600 hover:text-rose-100 hover:border-rose-400";
  const link = "hover:bg-rose-900 text-pink-300 underline underline-offset-2";
  const example = (name: string, head: string, codez: string, foot: string) => (
    <button
      class={link + " flex-shrink-0"}
      onClick={() => {
        setHeader(head);
        setCode(codez);
        setFooter(foot);
      }}
    >
      {name}
    </button>
  );
  return (
    <main class="flex flex-col gap-2 font-mono bg-neutral-900/50 md:w-3/4 p-10 mx-auto my-10 text-rose-200">
      <h1 class="text-xl font-bold">J-avaScript</h1>
      <p class="italic">Write JavaScript tacitly with a J-like syntax</p>
      <p>
        <a
          href="https://github.com/Jacob-Lockwood/j-avascript?tab=readme-ov-file#j-avascript"
          class="underline text-pink-300"
        >
          Read about J-avaScript
        </a>{" "}
        (github.com)
      </p>
      <hr class="my-8 border-rose-500" />

      <div class="border-2 border-solid border-rose-700 px-2 py-1 bg-neutral-900/50">
        <p>Load examples:</p>
        <div class="flex overflow-x-auto gap-x-10 pb-2">
          {example(
            "Hello, World!",
            "(",
            'J`${["Hello", "World"]}join${", "}+${"!"};${x => console.log(x)}`',
            ")()"
          )}
          {example(
            "Average of a List",
            "const f =",
            "J`/.+/length`",
            "console.log(f([1, 2, 3, 4]))"
          )}
          {example(
            "Sum of Self-Exponentiation",
            "const f =",
            "J`*.~.**;/.+`",
            "console.log(f([4, 6, 7]))"
          )}
          {example(
            "Abbreviate a Username",
            "const f =",
            'J`slice##${[0,2]}+${"..."}+slice#${-2}`',
            'console.log(f("linus-torvalds"))'
          )}
        </div>
      </div>

      <label for="header">Header:</label>
      <textarea
        name="header"
        id="header"
        onInput={({ target }) => setHeader(target.value)}
        class={block}
      >
        {header()}
      </textarea>
      <label for="code">Code: ({byteCount()} bytes)</label>
      <textarea
        name="code"
        id="code"
        onInput={({ target }) => setCode(target.value)}
        class={block}
      >
        {code()}
      </textarea>
      <label for="footer">Footer:</label>
      <textarea
        name="footer"
        id="footer"
        onInput={({ target }) => setFooter(target.value)}
        class={block}
      >
        {footer()}
      </textarea>
      <button
        class={btn}
        onClick={() => {
          console.clear();
          try {
            setOutput("");
            new Function(
              "J",
              "console",
              header() + "\n" + code() + "\n" + footer()
            )(J, {
              log: (...vals: unknown[]) =>
                setOutput(output() + vals.join(" ") + "\n"),
            });
          } catch (e) {
            setError(String(e));
          }
        }}
      >
        Run
      </button>
      <p>Output:</p>
      <textarea class={block} readonly>
        {output()}
      </textarea>
      <p>Error:</p>
      <textarea class={block} readonly>
        {error()}
      </textarea>

      <p class="text-lg font-bold mt-16 mb-4">Share this program</p>
      <p>URL:</p>
      <textarea class={block} readonly rows={1}>
        {location.href}
      </textarea>
      <p>Markdown (CMC):</p>
      <textarea class={block} readonly rows={1}>
        {`J-avaScript, ${byteCount()} bytes - \`\` ${code()} \`\` [try it](${location.href})`}
      </textarea>
      <p>Markdown (CGCC):</p>
      <textarea class={block} readonly rows={8}>
        {`# [J-avaScript], ${byteCount()} bytes

${"```"}javascript
${code()}
${"```"}

[Try it!](${location.href})


  [J-avaScript]: https://github.com/Jacob-Lockwood/j-avascript
`}
      </textarea>
    </main>
  );
}
