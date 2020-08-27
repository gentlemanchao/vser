import './components/install';
import Main from './main/index';
const el = document.createElement('div');
el.setAttribute('id', 'app');
document.body.appendChild(el);
new Main({
    el
});