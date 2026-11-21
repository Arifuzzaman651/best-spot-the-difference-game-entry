// main.js — boot the game: find the canvas and hand it to the game module.
import { createGame } from './game.js';

const canvas = document.getElementById('game');
createGame(canvas);
