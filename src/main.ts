import './style.css';
import { Game } from './game';

const mount = document.querySelector<HTMLElement>('#wrap');
if (!mount) throw new Error('#wrap not found');
new Game(mount);
