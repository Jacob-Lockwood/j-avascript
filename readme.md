# J-avaScript

Write JavaScript tacitly with J-like trains

This project is heavily inspired by @cyoce's [J-uby](https://github.com/cyoce/J-uby) project, which extends Ruby's Symbol objects with operator overloads allowing the composition of tacit functions. I created J-avaScript partly because I know JavaScript much better than I know Ruby, and partly because I thought it would be funny to do the `J-` thing for a language whose name already starts with J.

In JavaScript, operators cannot be overloaded, and functions cannot be referenced as concisely as using Symbols is in Ruby, so I opted to use a tagged-template based syntax which is parsed from a string to a function. This also allows J-avaScript to support fork-trains, which are very useful and fun.

Something which may be surprising to those familiar with J/APL is that J-S's trains execute from left-to-right, rather than right-to-left. This is because JS itself runs left-to-right, and makes sense if you consider that in J, writing `x F y` means you are using `x` as the argument to `F` in order to modify `y`, while in JS writing `x.F(y)` means you are using `y` as the argument to `F` in order to modify `x`.

J-S optimizes the referencing of functions to be very concise. Writing the word `split` is equivalent to writing `(x,y)=>x.split(y)`, writing the operator `+` is equivalent to writing `(x,y)=>x+y`, writing the word `length` is equivalent to writing `(x)=>x.length`, writing `:console.log` is equivalent to writing `(x)=>console.log(x)`, and so on. Constants and anonymous functions can be referenced using the template-interpolation `${val}`. If the value is a constant, it is treated how a constant-function would be treated in trains in J.

Here's an outline of J-S's components for tacit composition:

```
conjunctions
    F#G     x.F(G)
    v#F     v.F(x)
    F##v    x.F(...v)
    F@G     F(x).G(F(y))

adverbs
    /.F     x.reduce(F)
    \.F     x."scan"(F)
    *.F     x.map(F1)
    '.F     x.map(F2)
    ~.F     x.F(x) or y.F(x)

extra ops
    x[y     x
    x]y     y
    x\y     floor(x/y)
    x,y     [x, y]
    x'y     range(x)

other syntax
    F;G     pipe (think [: in J)
    F G     hook
    F G H   fork
```

And here are some examples of functions written first in plain JS, and then with their tacit J-S counterparts, sometimes with multiple options of how to write the same expression.

As you can see, J-S often makes the code much shorter, but in some instances can actually result in longer code, so if you're using this library for code-golf purposes, keep in mind what scenarios tend to be shorter when written explicitly rather than tacitly.

```javascript
x=>x+1
J`+#${1}`
J`${1}+]`
J`+${1}`

x=>x.reduce((a,c)=>a+c)/y.length
J`(reduce#+)/length`
J`/.+/length`

x=>"Hello, World!".indexOf(x)
J`${"Hello, World!"}#indexOf`
J`${"Hello, World!"}indexOf]`

x=>x.map(z=>z**z).reduce((a,c)=>c+a)
x=>x.map(z=>t+=z**z,t=0)&&t
J`*.~.**;/.+`

(x,y)=>(x+y)*(x-y)
J`+*-`

x=>x.map(v=>v.toString(2).replace(/0/g,"").length)
J`*.(toString#${2};replace##${[/0/g,""]};length)`

x=>x.map(v=>v.toString(2).split(1).length)
J`*.(toString${2}split${1};length)`
// Notice how constants are treated in trains.

x=>x.slice(0,2)+"..."+x.slice(-2)
J`slice##${[0,2]}+${"..."}+slice#${-2}`
```
