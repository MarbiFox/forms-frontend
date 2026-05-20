import { buildPostTestAnswers } from '../shared/build-payload';
import { bootstrapFormApp } from '../shared/form-app';
import { POSTTEST_CONFIG } from './data';

import '../shared/styles/variables.css';
import '../shared/styles/base.css';
import '../shared/styles/components.css';
import './styles.css';

const apiBaseUrl = import.meta.env.VITE_API_URL;

const mount = document.getElementById('root');
if (!mount) {
  throw new Error('No se encontró el elemento #root');
}

bootstrapFormApp(mount, {
  config: POSTTEST_CONFIG,
  apiBaseUrl,
  buildAnswers: buildPostTestAnswers,
});
