import { defineCustomElement } from 'vue'

import FedButton from './FedButton.ce.vue'

// Opt-in Web Component: the exposed module is a self-mounting custom element.
// Any host (Angular, React, plain HTML) can `customElements.define(...)` it and
// drop in `<tag>` with no framework-mount glue, while `vue` stays shared via
// the import map.
export default defineCustomElement(FedButton)
