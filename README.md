# BitBurner - My Build and Progress

I recently discovered BitBurner and quickly fell in love with it.

I wanted to take things a step further by integrating the game with **VS Code** and **TypeScript**, so I could build scripts in a more structured and scalable way. This repo documents my setup, issues I ran into, and how I solved them

Hopefully it helps other players too.

# Using VS Code and Typescript

## (New Method) WebSockets on MacOS Steam

[Link for Template Official Repo](https://github.com/shyguy1412/bb-external-editor#)

They do have all the instructions there, but I'll just sum up here.

### Getting ready

Start by cloning the repo and running npm install

```
https://github.com/shyguy1412/bb-external-editor#
```

```
npm install && npm install esbuild-bitburner-plugin@latest
```

### On Steam

go into the properties for Bitburner (little cogwheel to the right when viewing Bitburner in your library) and add the following launch option --remote-debugging-port=9222

```
--remote-debugging-port=9222
```

### Turning WS On and Connecting

On your terminal run

```
npm start
```

Open then game and go to the Remote API menu and add the settings:

Options > Remote API

```
Hostname: localhost
Port: 12525
Reconnection delay: 0
Use wss: off ( I believe is better on but for me only worked with it off)
```

Hit connect
You should see a `Status Online` and you are all set.

### Handling Erros

The WebSocket Model is way less prone to errors and won't stop your build.
But I like things clear so..

#### BaseURL Error on tsconfig

Add this line to your tsconfig file

```
"ignoreDeprecations": "6.0",
```

#### Importing NS from @ns Error

Copy the file [NetscriptDefinitions.d.ts](https://github.com/bitburner-official/bitburner-src/blob/dev/src/ScriptEditor/NetscriptDefinitions.d.ts) to your BitBurner folder

And add this line to your tsconfig paths `"@ns": ["./NetscriptDefinitions.d.ts"]`

```
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@ns": ["./NetscriptDefinitions.d.ts"]
    }
  }
}
```
