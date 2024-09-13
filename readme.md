# J-avaScript

Write JavaScript tacitly with J-like trains

This project is heavily inspired by @cyoce's [J-uby](https://github.com/cyoce/J-uby) project, which extends Ruby's Symbol objects with operator overloads allowing the composition of tacit functions. I created J-avaScript partly because I know JavaScript much better than I know Ruby, and partly because I thought it would be funny to do the `J-` thing for a language whose name already starts with J.

In JavaScript, operators cannot be overloaded, and functions cannot be referenced as concisely as using Symbols is in Ruby, so I opted to use a tagged-template based syntax which is parsed from a string to a function. This also allows J-avaScript to support fork-trains, which are very useful and fun.

Something which may be surprising to those familiar with J/APL is that J-avaScript's trains execute from left-to-right, rather than right-to-left. This is because JavaScript itself runs left-to-right, and makes sense if you consider that in J, writing `x F y` means you are using `x` as the argument to `F` in order to modify `y`, while in JavaScript writing `x.F(y)` means you are using `y` as the argument to `F` in order to modify `x`.

Here's an outline of J-avaScript's syntax:

```
conjunctions
    F#G     y.F(G)
    v#F     v.F(y)
    F##v    y.F(...v)
    F@G     F(x).G(F(y))

adverbs
    /.F     y.reduce(F)
    \.F     y."scan"(F)
    *.F     y.map(F1)
    '.F     y.map(F2)
    ~.F     y.F(y) or y.F(x)

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

And here are some examples of functions written first in plain JS, and then with their tacit J-uby counterparts, sometimes with multiple options of how to write the same expression.

As you can see, J-avaScript often makes the code much shorter, but in some instances can actually result in longer code, so if you're using this library for code-golf purposes, keep in mind what scenarios tend to be shorter when written explicitly rather than tacitly.

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

x=>x.map(z=>z**z)
    .reduce((a,c)=>c+a)
x=>x.map(z=>t+=z**z,t=0)&&t
J`*.~.**;/.+`
e(a("*",a("~",o("**"))),a("/",o("+")))

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
