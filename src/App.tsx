import { createSignal } from "solid-js";
import J from "./J";

export default function App() {
  const [header, setHeader] = createSignal("const f =");
  const [code, setCode] = createSignal("J``");
  const [footer, setFooter] = createSignal("");
  const program = () => header() + "\n" + code() + "\n" + footer();
  const [output, setOutput] = createSignal("");
  const [error, setError] = createSignal("");
  return (
    <main class="flex flex-col gap-2 font-mono bg-neutral-900/50 w-3/4 p-10 mx-auto min-h-screen text-rose-200">
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
          try {
            new Function("J", "console", program())(J, {
              log: (...vals: unknown[]) => setOutput(vals.join(" ")),
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
