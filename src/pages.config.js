import Analyzer from './pages/Analyzer';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Trading from './pages/Trading';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Analyzer": Analyzer,
    "Home": Home,
    "Admin": Admin,
    "Trading": Trading,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};