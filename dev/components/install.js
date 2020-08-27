import Vser from '../../index';
import Page from './page/index';
import Footer from './footer/index';
import Header from './header/index';

const components = {
    Page,
    Footer,
    Header
}

for (let name in components) {
    Vser.component(name, components[name]);
}