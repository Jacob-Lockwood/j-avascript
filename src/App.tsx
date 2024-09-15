import { createSignal } from "solid-js";
import J from "./j-avascript";

export default function App() {
  const [header, setHeader] = createSignal("const f =");
  const [code, setCode] = createSignal("J`,join${' '}+${'!'}`");
  const [footer, setFooter] = createSignal("console.log(f('Hello', 'World'))");
  const program = () => header() + "\n" + code() + "\n" + footer();
  const [output, setOutput] = createSignal("");
  const [error, setError] = createSignal("");

  const example = (name: string, head: string, codez: string, foot: string) => (
    <button
      class="hover:bg-rose-800 underline underline-offset-2 w-max flex-shrink-0"
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
    <main class="flex flex-col gap-2 font-mono bg-neutral-900/50 md:w-3/4 p-10 mx-auto min-h-screen text-rose-200">
      <div class="border-2 border-solid border-rose-700 px-2 py-1 bg-neutral-900/50">
        <p>Load examples:</p>
        <div class="flex overflow-x-auto gap-x-10 pb-2">
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
        class="bg-stone-800/80 text-white p-5 w-full h-min focus:ring-0 focus:outline-none border-solid border-2 border-stone-900 focus:border-rose-600"
      >
        {header()}
      </textarea>
      <label for="code">Code: ({code().length} bytes)</label>
      <textarea
        name="code"
        id="code"
        onInput={({ target }) => setCode(target.value)}
        class="bg-stone-800/80 text-white p-5 w-full focus:ring-0 focus:outline-none border-solid border-2 border-stone-900 focus:border-rose-600"
      >
        {code()}
      </textarea>
      <label for="footer">Footer:</label>
      <textarea
        name="footer"
        id="footer"
        onInput={({ target }) => setFooter(target.value)}
        class="bg-stone-800/80 text-white p-5 w-full h-min focus:ring-0 focus:outline-none border-solid border-2 border-stone-900 focus:border-rose-600"
      >
        {footer()}
      </textarea>
      <button
        class="border-2 border-rose-500 bg-rose-700 w-max px-10 hover:bg-rose-600 hover:text-rose-100 hover:border-rose-400"
        onClick={() => {
          console.clear();
          try {
            setOutput("");
            new Function("J", "console", program())(J, {
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
      <pre class="bg-stone-800/80 text-white p-5 w-full border-solid border-2 border-stone-900">
        {output()}
      </pre>
      <p>Error:</p>
      <pre class="bg-stone-800/80 text-white p-5 w-full border-solid border-2 border-stone-900">
        {error()}
      </pre>
    </main>
  );
}
