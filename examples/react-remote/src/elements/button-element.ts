import r2wc from '@r2wc/react-to-web-component'

import Button from '../components/Button'

// Opt-in Web Component: wrap the React component as a self-mounting custom
// element (parity with the Vue `./ButtonElement`). Any host can
// customElements.define(...) it and use <tag>; react / react-dom stay shared.
export default r2wc(Button, {
  shadow: 'open',
  props: { label: 'string' }
})
