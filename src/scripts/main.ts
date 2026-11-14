import { initLang } from './lang';
import { initBar } from './bar';
import { initHero } from './hero';
import { initPlatform } from './platform';
import { initRelease } from './release';
import { initStars } from './stars';
import { initReels } from './reels';
import { initMotion } from './motion';

initLang();
initBar();
initHero();
initPlatform();
initRelease();
initStars();
const reels = initReels();
initMotion(reels);
