export class DemoClassElement extends HTMLElement {
    public static observedAttributes = ['title'];
  
    attributeChangedCallback() {
      this.innerHTML = `<h1>Welcome From ${this.title}!</h1>`;
    }
}
  
customElements.define('demo-library-element', DemoClassElement);