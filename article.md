Today we are going to discover a way to share components across React and Angular project using Nx. If you do not know about Nx and Monorepos, follow this introduction blog post : 
[Introduction to NX and Monorepos](https://crocsx.hashnode.dev/introduction-to-nx-and-monorepos).

Sharing component across Front-End Library in Nx require you to write your component in a "pseudo" language, that will be then converted to angular/react by Nx during build time.


to start, let's create an empty Nx workspace :

`npx --ignore-existing create-nx-workspace {workspace name} --preset=empty`

followed by an angular and react application, that you can name the way you want :

```
npm i -D @nrwl/angular
npx nx g @nrwl/angular:app {angular app name}
```

We install the angular "extension" for Nx then create a project

```
npm i -D @nrwl/react
npx nx g @nrwl/react:app {react app name}
```

Same here for react


You will now see in your apps folder 4 new applications, the angular + angular e2e and react + react e2e

Let's now dig into how to create a library containing components, and make those component usable by either Angular or React.

To create a library, you already know the command :

`npx nx g @nrwl/workspace:lib {library name}`

At this point in time, if you did all correctly, your work tree should looks something like this (using the name you choosed) :

```
{workspace name}/
├── apps/
│   ├── {angular app name}/
│   ├── {angular app name}-e2e/
│   ├── {react app name}/
│   └── {react app name}-e2e/
├── libs/
│   └── {library name}
│       ├── src/
│       │   ├── lib/
│       │   └── index.ts
│       ├── jest.conf.js
│       ├── tsconfig.lib.json
│       ├── tsconfig.json
│       ├── tsconfig.spec.json
│       └── tslint.json
├── README.md
├── angular.json
├── nx.json
├── package.json
├── tools/
├── tsconfig.base.json
└── tslint.json
```

Looking good ? Great ! Let's  code our shared component.
Add a new file inside the `lib` folder, or you can use the exemple one that is added during the library creation

`{component name}.element.ts`

And let's add some exemple code


```
export class DemoClassElement extends HTMLElement {
    public static observedAttributes = ['title'];
  
    attributeChangedCallback() {
      this.innerHTML = `<h1>Welcome From ${this.title}!</h1>`;
    }
}
  
customElements.define('demo-library-element', DemoClassElement);
```

`observedAttributes` define the name of the bindings properties. In the above case, `title` is a property that can be assigned when creating the component.

`attributeChangedCallback` is a method that is called everytime one of the observedAttributes property are changed

`customElements.define('demo-library-element', DemoClassElement);` Defines a new custom element, mapping the given name to the given constructor as an autonomous custom element.


Let's try this simple component before going further. To use it in Angular or React, you must NOT forget to add this component to your library exports.
Into your library folder, go to `index.ts` and add the export line :

`export * from './lib/{component name}.element';`

Great, now we need to import this component in our 2 apps. Let's start with Angular.
Inside your angular app, import the library, I will do it inside the `main.ts`

```
import '@{workspace name}/{library name}'; // <-- our library, rename with the name you choose

import { enableProdMode } from '@angular/core';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
```

we also need to register CUSTOM_ELEMENTS_SCHEMA in our app module

```
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

this will tell the Angular compiler not to error when seeing non-standard element tags in components' templates.

Finally use the component in our app. I added it to `app.component.html`. Remember, the component name is the one you chose previously inside the method `customElements.define`

In my case, it looks like this, and I put it on top of the Nx demo page :

```
<demo-library-element [title]="'Angular'"></demo-library-element>
```

you can start the app,

`npx nx serve {angular app name}`

and if all as been done correctly, you should see your component appearing on top !


Let's do the same with React :

Inside `main.tsx` let's again import our library :

```
import '@demo-shared/demo-library'; // <-- our library

import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom';

import App from './app/app';

ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.getElementById('root')
);
```

Also, same as angular, we need to register tell React to allow component that are not defined within it. to do this, you will need to create a type file on the root of the `src` react project `intrinsic.d.ts`

with 

```
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
```

And let's use the component in React :

```
export function App() {
  return (
    <div className={styles.app}>
      <demo-library-element title={"React"} />
    </div>
  );
}

export default App;
```

Let's run our react app 

/!\ If you have a warning about the webpack version, and your react app do not start, you can opt in to webpack 5  `npx nx g @nrwl/web:webpack5` and then serve the app again
more [Webpack 5 Migration](https://nx.dev/l/a/guides/webpack-5)
