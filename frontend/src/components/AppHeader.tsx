import './AppHeader.css';
import logo from '../assets/logosite.png';

export const AppHeader = () => (
  <header className="app-header">
    <img src={logo} alt="Faculdade Guerra" className="logo-slot" />
  </header>
);
