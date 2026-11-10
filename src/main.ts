import './styles/tokens.css';
import './styles/base.css';
import './styles/widgets.css';

import { mountChrome } from './ui/chrome';
import { mountLayerStack } from './widgets/layerStack';
import { mountScopeMatrix } from './widgets/scopeMatrix';
import { mountLifecycle } from './widgets/lifecycle';
import { mountContextFlow } from './widgets/contextFlow';

mountChrome();

document.querySelectorAll<HTMLElement>('[data-widget]').forEach((host) => {
  switch (host.dataset.widget) {
    case 'layer-stack':
      mountLayerStack(host);
      break;
    case 'scope-matrix':
      mountScopeMatrix(host);
      break;
    case 'lifecycle':
      mountLifecycle(host);
      break;
    case 'context-flow':
      mountContextFlow(host);
      break;
    default:
      break;
  }
});
